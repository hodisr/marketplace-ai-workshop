# PRD: Checkout Flow Enhancement

## Overview

Replace the current single-item "Buy Now" flow with a full cart-based checkout. Buyers can add multiple items to a persistent cart, manage shipping addresses, see a detailed order summary with shipping costs, pay via Stripe, and receive a confirmation email. The system is designed to support future multi-seller checkout, though v1 handles orders as single-seller per checkout.

## Goals

1. **Reduce purchase friction** — multi-item cart eliminates the need for separate checkouts per product
2. **Increase average order value** — cart encourages buyers to add more items
3. **Improve repeat buyer experience** — saved addresses and persistent cart reduce checkout time
4. **Build reliable order pipeline** — idempotent payments, proper failure handling, email confirmations

## User Stories

1. As a buyer, I want to add products to a cart so I can purchase multiple items at once.
2. As a buyer, I want my cart to persist across sessions so I don't lose items if I close the browser.
3. As a guest who just created an account, I want my guest cart items to merge into my account cart.
4. As a buyer, I want to save multiple shipping addresses so I don't have to re-enter them every time.
5. As a buyer, I want to see shipping cost before paying so there are no surprises.
6. As a buyer, I want to see a clear order summary with per-item subtotals, shipping, tax, and total.
7. As a buyer, I want to pay securely and see a confirmation page with my order number.
8. As a buyer, I want to receive an order confirmation email with all the details.
9. As a buyer, I want clear error messages if my payment fails so I know what to do next.

## Technical Requirements

### Backend

#### API Contracts

**Cart Operations**

```
GET    /api/v1/cart                     # Get current cart
POST   /api/v1/cart/items               # Add item to cart
PUT    /api/v1/cart/items/{item_id}     # Update quantity
DELETE /api/v1/cart/items/{item_id}     # Remove item
POST   /api/v1/cart/merge               # Merge guest cart into user cart
```

Add item request:
```json
{
  "product_id": "prod_abc",
  "quantity": 2
}
```

Cart response:
```json
{
  "id": "cart_xyz",
  "items": [
    {
      "id": "cart_item_1",
      "product": {
        "id": "prod_abc",
        "title": "Wireless Headphones",
        "price": 149.99,
        "image_url": "https://cdn.example.com/products/abc.jpg",
        "seller_id": "seller_1",
        "stock_available": 15
      },
      "quantity": 2,
      "subtotal": 299.98
    }
  ],
  "item_count": 2,
  "subtotal": 299.98,
  "created_at": "2025-12-01T10:00:00Z",
  "updated_at": "2025-12-01T10:05:00Z"
}
```

**Address Management**

```
GET    /api/v1/addresses                # List saved addresses
POST   /api/v1/addresses                # Add address
PUT    /api/v1/addresses/{id}           # Update address
DELETE /api/v1/addresses/{id}           # Delete address
POST   /api/v1/addresses/validate       # Validate address
```

Address request:
```json
{
  "label": "Home",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "US",
  "is_default": true
}
```

**Checkout**

```
POST /api/v1/checkout
```

```json
{
  "cart_id": "cart_xyz",
  "shipping_address_id": "addr_123",
  "idempotency_key": "idk_uuid_here"
}
```

Response:
```json
{
  "order_id": "order_abc",
  "payment_intent_client_secret": "pi_xxx_secret_yyy",
  "order_summary": {
    "items_subtotal": 299.98,
    "shipping_cost": 12.50,
    "tax": 24.75,
    "total": 337.23
  }
}
```

**Confirm Payment**

```
POST /api/v1/checkout/{order_id}/confirm
```

```json
{
  "payment_intent_id": "pi_xxx"
}
```

Response:
```json
{
  "order_id": "order_abc",
  "status": "confirmed",
  "confirmation_number": "ORD-20251201-ABC123",
  "estimated_delivery": "2025-12-08"
}
```

#### Data Models

**SQL Tables:**

```sql
CREATE TABLE carts (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),          -- null for guests
  session_id VARCHAR,                              -- for guest carts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id VARCHAR PRIMARY KEY,
  cart_id VARCHAR NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id VARCHAR NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE TABLE shipping_addresses (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  label VARCHAR(50),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  confirmation_number VARCHAR UNIQUE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending_payment',
  shipping_address_snapshot TEXT NOT NULL,          -- JSON snapshot
  items_subtotal REAL NOT NULL,
  shipping_cost REAL NOT NULL,
  tax REAL NOT NULL,
  total REAL NOT NULL,
  stripe_payment_intent_id VARCHAR,
  idempotency_key VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id VARCHAR PRIMARY KEY,
  order_id VARCHAR NOT NULL REFERENCES orders(id),
  product_id VARCHAR NOT NULL REFERENCES products(id),
  seller_id VARCHAR NOT NULL REFERENCES sellers(id),
  product_title VARCHAR NOT NULL,                  -- snapshot at time of order
  unit_price REAL NOT NULL,                        -- snapshot at time of order
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL
);
```

**TypeScript Interfaces (`src/types.ts`):**

```typescript
enum OrderStatus {
  PENDING_PAYMENT = "pending_payment",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

interface CartRow {
  id: string;
  userId: string | null;   // null for guests
  sessionId: string | null; // for guest carts
  createdAt: Date;
  updatedAt: Date;
}

interface CartItemRow {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  addedAt: Date;
}

interface ShippingAddressRow {
  id: string;
  userId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: number;
  createdAt: Date;
}

interface OrderRow {
  id: string;
  userId: string;
  confirmationNumber: string;
  status: OrderStatus;
  shippingAddressSnapshot: string; // JSON
  itemsSubtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  stripePaymentIntentId: string | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemRow {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  productTitle: string;  // snapshot at time of order
  unitPrice: number;     // snapshot at time of order
  quantity: number;
  totalPrice: number;
}
```

#### Checkout Service

```typescript
import { randomUUID } from "crypto";
import { Pool, PoolClient } from "pg";
import { createPaymentIntent } from "./services/stripeClient";

const SHIPPING_RATE_PER_KG = 5.0;
const BASE_SHIPPING = 4.99;

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: { price: number; weightKg: number | null; title: string; sellerId: string; stock: number };
}

function calculateShippingCost(items: CartItemWithProduct[]): number {
  // Simple weight-based shipping calculation for v1
  const totalWeight = items.reduce(
    (sum, item) => sum + (item.product.weightKg ?? 0.5) * item.quantity,
    0
  );
  return Math.round((BASE_SHIPPING + totalWeight * SHIPPING_RATE_PER_KG) * 100) / 100;
}

async function validateStock(
  client: PoolClient,
  cartItems: CartItemWithProduct[]
): Promise<string[]> {
  // Return list of error messages for out-of-stock items
  const errors: string[] = [];
  for (const item of cartItems) {
    const result = await client.query(
      "SELECT id, title, stock FROM products WHERE id = $1 FOR UPDATE",
      [item.productId]
    );
    if (result.rows.length === 0) {
      errors.push(`Product '${item.productId}' is no longer available`);
    } else if (result.rows[0].stock < item.quantity) {
      errors.push(
        `'${result.rows[0].title}' only has ${result.rows[0].stock} units available ` +
        `(requested ${item.quantity})`
      );
    }
  }
  return errors;
}

async function createOrderFromCart(
  pool: Pool,
  cart: { id: string; userId: string; items: CartItemWithProduct[]; subtotal: number },
  shippingAddressId: string,
  idempotencyKey: string
): Promise<OrderRow> {
  // Idempotent — returns existing order if idempotency_key was already used
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM orders WHERE idempotency_key = $1",
      [idempotencyKey]
    );
    if (existing.rows.length > 0) {
      await client.query("COMMIT");
      return existing.rows[0];
    }

    const stockErrors = await validateStock(client, cart.items);
    if (stockErrors.length > 0) {
      await client.query("ROLLBACK");
      throw new Error(JSON.stringify(stockErrors));
    }

    const itemsSubtotal = cart.subtotal;
    const shippingCost = calculateShippingCost(cart.items);
    const tax = Math.round(itemsSubtotal * 0.0825 * 100) / 100; // simplified tax for v1
    const total = Math.round((itemsSubtotal + shippingCost + tax) * 100) / 100;

    const orderId = `order_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const confirmationNumber = generateConfirmationNumber();
    const addressSnapshot = await serializeAddress(client, shippingAddressId);

    await client.query(
      `INSERT INTO orders
         (id, user_id, confirmation_number, status, shipping_address_snapshot,
          items_subtotal, shipping_cost, tax, total, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [orderId, cart.userId, confirmationNumber, "pending_payment",
       addressSnapshot, itemsSubtotal, shippingCost, tax, total, idempotencyKey]
    );

    for (const cartItem of cart.items) {
      const orderItemId = `oi_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
      await client.query(
        `INSERT INTO order_items
           (id, order_id, product_id, seller_id, product_title, unit_price, quantity, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [orderItemId, orderId, cartItem.productId, cartItem.product.sellerId,
         cartItem.product.title, cartItem.product.price, cartItem.quantity,
         cartItem.product.price * cartItem.quantity]
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(total * 100), // cents
      currency: "usd",
      metadata: { order_id: orderId },
      idempotencyKey: `pi_${idempotencyKey}`,
    });

    await client.query(
      "UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2",
      [paymentIntent.id, orderId]
    );

    await client.query("COMMIT");

    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    return orderResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

function generateConfirmationNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}
```

### Frontend

#### TypeScript Interfaces

```typescript
interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
  subtotal: number;
}

interface CartProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  stockAvailable: number;
}

interface ShippingAddress {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface OrderSummary {
  itemsSubtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

interface CheckoutResponse {
  orderId: string;
  paymentIntentClientSecret: string;
  orderSummary: OrderSummary;
}

interface OrderConfirmation {
  orderId: string;
  status: string;
  confirmationNumber: string;
  estimatedDelivery: string;
}
```

#### Cart State Management

```typescript
// stores/cart.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);

  async function addItem(productId: string, quantity: number) {
    isLoading.value = true;
    try {
      const response = await $fetch<{ items: CartItem[] }>("/api/v1/cart/items", {
        method: "POST",
        body: { product_id: productId, quantity },
      });
      items.value = response.items;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    const response = await $fetch<{ items: CartItem[] }>(`/api/v1/cart/items/${itemId}`, {
      method: "PUT",
      body: { quantity },
    });
    items.value = response.items;
  }

  async function removeItem(itemId: string) {
    await $fetch(`/api/v1/cart/items/${itemId}`, { method: "DELETE" });
    items.value = items.value.filter((i) => i.id !== itemId);
  }

  async function mergeGuestCart() {
    if (items.value.length === 0) return;
    await $fetch("/api/v1/cart/merge", {
      method: "POST",
      body: {
        guest_items: items.value.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      },
    });
  }

  function clearCart() {
    items.value = [];
  }

  return { items, isLoading, addItem, updateQuantity, removeItem, mergeGuestCart, clearCart };
}, {
  persist: { key: "marketplace-cart" },
});
```

## Edge Cases

1. **Product removed from marketplace while in cart** — show "This item is no longer available" in cart, exclude from checkout total, allow removal
2. **Stock reduced below cart quantity** — at checkout time, show "Only X units available" and offer to adjust quantity
3. **Price changed between add-to-cart and checkout** — always use current price at checkout. Show notice if price differs from what was displayed at add time
4. **Payment failure (card declined)** — show error message, retain order in `pending_payment` status, allow retry
5. **3D Secure required** — handle Stripe's `requires_action` status, redirect to 3D Secure flow, return to confirmation
6. **Double-submit on checkout** — idempotency key prevents duplicate orders. Second request returns the same order
7. **Session expiry during checkout** — save checkout progress server-side, resume on re-auth
8. **Cart at max capacity (50 items)** — show "Cart is full" when adding item #51
9. **Guest cart merge conflicts** — if guest cart has item X (qty 2) and user cart has item X (qty 1), merge to qty 3 (sum, capped at stock)
10. **Address validation failure** — show specific field errors ("Invalid ZIP code for state CA"), don't block save but warn
11. **Email delivery failure** — log the failure, don't fail the order. Retry via background job.
12. **Concurrent stock reservation** — use `SELECT FOR UPDATE` on product stock during checkout to prevent overselling

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Average items per order | 1.0 | 2.5 | Order analytics |
| Average order value | $45 | $85 | Order analytics |
| Checkout completion rate | ~60% | >80% | Funnel tracking |
| Repeat buyer checkout time | ~4 min | <1.5 min | Session analytics |
| Payment failure rate | 5% | <3% | Stripe dashboard |

## Out of Scope

- Multi-seller split payments (design for it, don't implement)
- Coupon/promo code system
- Wishlist / "save for later"
- Gift wrapping or gift messages
- Subscription / recurring orders
- Buy now, pay later (Affirm, Klarna)
- Real carrier API integration (FedEx, UPS, USPS)
- International shipping and customs

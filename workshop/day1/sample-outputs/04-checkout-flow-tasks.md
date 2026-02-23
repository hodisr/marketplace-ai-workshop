# Task List: Checkout Flow Enhancement

**PRD**: tasks/prd-checkout-flow.md
**Generated**: 2025-02-21

## Relevant Files
- backend/product-service/src/database.ts (modify — add carts, cart_items, orders, order_items, shipping_addresses tables)
- backend/product-service/src/types.ts (modify — add cart/order/address interfaces)
- backend/product-service/src/routes/cart.ts (create)
- backend/product-service/src/routes/checkout.ts (create)
- backend/product-service/src/routes/addresses.ts (create)
- backend/product-service/src/services/shipping.ts (create)
- backend/product-service/src/services/email.ts (create)
- backend/product-service/src/templates/order_confirmation.html (create)
- backend/product-service/src/__tests__/cart.test.ts (create)
- backend/product-service/src/__tests__/checkout.test.ts (create)
- backend/product-service/src/__tests__/addresses.test.ts (create)
- frontend/pages/cart.vue (create)
- frontend/pages/checkout.vue (create)
- frontend/pages/orders/[id]/confirmation.vue (create)
- frontend/components/CartIcon.vue (create)
- frontend/components/AddressSelector.vue (create)
- frontend/components/OrderSummary.vue (create)
- frontend/__tests__/CartIcon.test.ts (create)

## Tasks

- [ ] 0.0 - Create feature branch from main
- [ ] 1.0 - Cart backend
  - [ ] 1.1 - Cart and CartItem database tables and TypeScript interfaces
    **Type**: database
    **Depends on**: none
    **Files**: backend/product-service/src/database.ts, backend/product-service/src/types.ts
    **Description**: SQL CREATE TABLE for carts (id, user_id nullable, session_id nullable, timestamps) and cart_items (cart_id, product_id, quantity, added_at). UNIQUE constraint on (cart_id, product_id). TypeScript interfaces for each table.
    **Acceptance Criteria**:
    - Tables created with correct constraints
    - Unique constraint on cart+product enforced
    - Tests pass: table creation, duplicate constraint

  - [ ] 1.2 - Cart CRUD endpoints
    **Type**: backend
    **Depends on**: 1.1
    **Files**: backend/product-service/src/routes/cart.ts, backend/product-service/src/types.ts, backend/product-service/src/__tests__/cart.test.ts
    **Description**: GET /api/v1/cart, POST /api/v1/cart/items, PUT /api/v1/cart/items/{id}, DELETE /api/v1/cart/items/{id}. Stock validated on add. Guest carts by session ID.
    **Acceptance Criteria**:
    - Full CRUD cycle works
    - Out-of-stock → 422, nonexistent product → 404
    - Response includes computed subtotals
    - Guest vs authenticated cart isolation
    - Tests pass: CRUD, stock validation, guest/auth

  - [ ] 1.3 - Cart merge endpoint
    **Type**: backend
    **Depends on**: 1.2
    **Files**: backend/product-service/src/routes/cart.ts
    **Description**: POST /api/v1/cart/merge. Overlapping products sum quantities (capped at stock). Guest items cleared after merge.
    **Acceptance Criteria**:
    - No overlap → all items combined
    - Overlap → quantities summed, capped at stock
    - Guest items cleared after merge
    - Tests pass: no overlap, overlap, stock cap, cleanup

- [ ] 2.0 - Address management and shipping
  - [ ] 2.1 - ShippingAddress table and CRUD endpoints
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/addresses.ts, backend/product-service/src/database.ts, backend/product-service/src/__tests__/addresses.test.ts
    **Description**: ShippingAddress model. CRUD endpoints. Max 10 per user. Setting is_default un-defaults others. Deleting default doesn't auto-assign.
    **Acceptance Criteria**:
    - Full CRUD works
    - Default toggle works correctly
    - Max 10 limit enforced (422 on 11th)
    - Tests pass: CRUD, default toggle, max limit

  - [ ] 2.2 - Address validation endpoint (stub)
    **Type**: backend
    **Depends on**: 2.1
    **Files**: backend/product-service/src/routes/addresses.ts
    **Description**: POST /api/v1/addresses/validate. Stub: always returns valid. Interface ready for future real provider.
    **Acceptance Criteria**:
    - Stub returns valid for any address
    - Interface matches expected contract
    - Tests pass: stub response, contract shape

  - [ ] 2.3 - Shipping cost calculation
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/services/shipping.ts
    **Description**: $4.99 base + $5.00/kg. Products without weight default to 0.5kg. Returns number rounded to 2 decimal places.
    **Acceptance Criteria**:
    - Correct calculation for single and multiple items
    - Default weight applied for missing weight
    - Result is properly rounded number
    - Tests pass: single item, multiple items, missing weight, rounding check

- [ ] 3.0 - Checkout and payment processing
  - [ ] 3.1 - Order and OrderItem database tables and TypeScript interfaces
    **Type**: database
    **Depends on**: none
    **Files**: backend/product-service/src/database.ts, backend/product-service/src/types.ts
    **Description**: Order model with confirmation_number (unique), shipping_address_snapshot (JSON), price fields, stripe_payment_intent_id, idempotency_key (unique). OrderItem with price/title snapshots. OrderStatus enum.
    **Acceptance Criteria**:
    - idempotency_key uniqueness enforced
    - confirmation_number uniqueness enforced
    - Tests pass: model creation, uniqueness constraints

  - [ ] 3.2 - Checkout endpoint with stock validation
    **Type**: backend
    **Depends on**: 1.2, 2.1, 2.3, 3.1
    **Files**: backend/product-service/src/routes/checkout.ts, backend/product-service/src/__tests__/checkout.test.ts
    **Description**: POST /api/v1/checkout. Validates cart, address, stock (SELECT FOR UPDATE). Calculates totals (items + shipping + 8.25% tax). Creates Order with price snapshots. Creates Stripe PaymentIntent. Idempotent via idempotency_key.
    **Acceptance Criteria**:
    - Successful checkout creates order with correct totals
    - Empty cart → 422, invalid address → 404
    - Out-of-stock at checkout → 422 with specific items
    - Idempotent: same key returns same order
    - Tests pass: happy path, validation errors, idempotency, totals math

  - [ ] 3.3 - Payment confirmation endpoint
    **Type**: backend
    **Depends on**: 3.2
    **Files**: backend/product-service/src/routes/checkout.ts
    **Description**: POST /api/v1/checkout/{order_id}/confirm. Verifies PaymentIntent with Stripe. Success → confirm order, decrement stock, clear cart. Failure → cancel order. Handles 3D Secure.
    **Acceptance Criteria**:
    - Success → order confirmed, stock decremented, cart cleared
    - Failure → order cancelled, stock unchanged
    - 3D Secure → returns requires_action status
    - Already-confirmed → idempotent success
    - Tests pass: success, failure, 3D Secure, idempotency, wrong user

- [ ] 4.0 - Order confirmation email
  - [ ] 4.1 - Email template system setup
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/templates/order_confirmation.html, backend/product-service/src/services/email.ts
    **Description**: Handlebars/EJS template for order confirmation. Includes header, order summary table, shipping address, total breakdown, footer. Plain text fallback.
    **Acceptance Criteria**:
    - Template renders without errors for valid data
    - Handles edge cases (long names, many items)
    - Both HTML and plain text versions
    - Tests pass: rendering, edge cases, both formats

  - [ ] 4.2 - Async email sending with retry
    **Type**: backend
    **Depends on**: 4.1, 3.3
    **Files**: backend/product-service/src/services/email.ts
    **Description**: Background task sends email after payment confirmation. Retry with exponential backoff (3 attempts at 1s, 10s, 60s). Email service abstracted behind interface.
    **Acceptance Criteria**:
    - Email queued after confirmation
    - Retry on failure, succeeds on second attempt
    - All retries fail → error logged
    - API response not delayed by email
    - Tests pass: queuing, retry success, retry exhaustion, non-blocking

- [ ] 5.0 - Frontend cart and checkout UI
  - [ ] 5.1 - Cart page and cart icon component
    **Type**: frontend
    **Depends on**: 1.2
    **Files**: frontend/pages/cart.vue, frontend/components/CartIcon.vue, frontend/__tests__/CartIcon.test.ts
    **Description**: Cart icon with badge in header. Cart page with items, quantity controls, remove. Pinia store with localStorage persistence for guests. Empty state.
    **Acceptance Criteria**:
    - Badge updates with item count
    - Quantity increase/decrease, remove work
    - Out-of-stock items shown with overlay
    - Empty cart state with "Continue Shopping" CTA
    - Tests pass: badge, quantity, remove, out-of-stock, empty, localStorage

  - [ ] 5.2 - Address selection step
    **Type**: frontend
    **Depends on**: 2.1
    **Files**: frontend/components/AddressSelector.vue, frontend/pages/checkout.vue
    **Description**: List of saved addresses as selectable cards. Default pre-selected. "Add new address" inline form with validation. Navigation forward/back.
    **Acceptance Criteria**:
    - Saved addresses rendered, default pre-selected
    - New address form validates required fields
    - Navigation between cart and order summary
    - Tests pass: list, default, new address, navigation

  - [ ] 5.3 - Order summary and payment step
    **Type**: frontend
    **Depends on**: 2.3, 3.2
    **Files**: frontend/components/OrderSummary.vue, frontend/pages/checkout.vue
    **Description**: Summary with items, subtotal, shipping, tax, total. Stripe Elements card input. "Pay $XX.XX" button. Handle 3D Secure, payment failures, double-click prevention.
    **Acceptance Criteria**:
    - Summary calculation displayed correctly
    - Stripe Elements mounted
    - Successful payment → redirect to confirmation
    - Failed payment → error with retry
    - Tests pass: summary, Stripe mock, success, failure, double-click

  - [ ] 5.4 - Order confirmation page
    **Type**: frontend
    **Depends on**: 3.3
    **Files**: frontend/pages/orders/[id]/confirmation.vue
    **Description**: Green checkmark, confirmation number, order summary, shipping address, estimated delivery. "Continue Shopping" and "View Order" links. Cart cleared.
    **Acceptance Criteria**:
    - Renders with order data
    - Cart cleared on reaching page
    - Navigation links work
    - Tests pass: rendering, cart cleared, links

---

## Common Mistakes

### PRD Mistakes
- **Forgetting idempotency**: Without idempotency keys, network retries double-charge customers.
- **Not snapshotting prices and addresses**: Price changes would retroactively modify order history.
- **Ignoring guest-to-auth cart merge**: Brief explicitly calls this out.
- **Specifying multi-seller split payments**: Brief says "design for it, don't implement."
- **Missing stock validation at checkout**: Add-to-cart validation alone is insufficient.
- **No payment failure recovery plan**: What happens to the order, cart, and user experience?

### Task Breakdown Mistakes
- **Checkout as single task**: Spans cart, address, shipping, order creation, payment, email — minimum 3-4 parents.
- **Email in same task as payment**: Async with its own failure modes. Separate parent.
- **Cart merge not called out**: Own endpoint with own edge cases. Separate subtask.
- **Frontend as one giant task**: Cart page, address step, payment step, confirmation = 4 subtasks minimum.
- **Missing idempotency key task**: Requires DB constraint, record checking, and Stripe idempotency.
- **Wrong dependency chain**: Address and cart management are independent — should be parallel.

### Red Flags for Instructors
- No idempotency_key in data model
- Stock validation only at add-to-cart time
- Order stores product_id reference without unit_price snapshot
- shipping_address_id foreign key instead of JSON snapshot
- Cart merge not mentioned
- Email sending synchronous in checkout endpoint
- No Stripe 3D Secure handling
- Single "Checkout" task with no subtasks
- No max 50 items cart limit
- Tax calculation missing entirely

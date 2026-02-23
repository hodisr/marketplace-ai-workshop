# PRD: Product Search with Filters

## Overview

Add search and filtering capabilities to the existing product listing page. Buyers can search by text, filter by category/price/seller rating, and sort results. Filters are reflected in URL query parameters for shareability. The feature extends the existing `/api/v1/products` endpoint and integrates into the current `/products` page.

## Goals

1. **Reduce time-to-purchase** — buyers can find relevant products in under 30 seconds
2. **Increase product discoverability** — especially for niche/long-tail products that get buried in pagination
3. **Improve conversion rate** — targeted browsing leads to higher purchase intent
4. **Enable shareable searches** — filter state persisted in URL for bookmarking and sharing

## User Stories

1. As a buyer, I want to search for products by name or description so I can quickly find what I'm looking for.
2. As a buyer, I want to filter products by category so I can browse within a specific product type.
3. As a buyer, I want to set a price range so I only see products within my budget.
4. As a buyer, I want to sort results by price, relevance, or recency so I can prioritize what matters to me.
5. As a buyer, I want to filter by seller rating so I can buy from trusted sellers.
6. As a buyer, I want to share a filtered search URL with a friend so they see the same results.
7. As a buyer, I want to see how many products match my current filters so I know if I need to broaden my search.

## Technical Requirements

### Backend

#### API Contract

Extend the existing `GET /api/v1/products` endpoint:

```
GET /api/v1/products?q=wireless+headphones&categories=electronics,audio&price_min=20&price_max=200&sort=price_asc&seller_rating_min=4&page=1&page_size=20
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | null | Full-text search query |
| `categories` | string | No | null | Comma-separated category slugs |
| `price_min` | number | No | null | Minimum price (inclusive) |
| `price_max` | number | No | null | Maximum price (inclusive) |
| `sort` | enum | No | `relevance` | One of: `relevance`, `price_asc`, `price_desc`, `newest`, `best_selling`, `highest_rated` |
| `seller_rating_min` | number | No | null | Minimum seller average rating (1-5) |
| `page` | int | No | 1 | Page number |
| `page_size` | int | No | 20 | Items per page (max 50) |

**Response:**

```json
{
  "items": [
    {
      "id": "prod_abc123",
      "title": "Wireless Headphones Pro",
      "description": "Premium noise-canceling headphones...",
      "price": 149.99,
      "currency": "USD",
      "category": {
        "slug": "electronics",
        "name": "Electronics"
      },
      "seller": {
        "id": "seller_xyz",
        "name": "AudioTech Store",
        "average_rating": 4.7
      },
      "image_url": "https://cdn.example.com/products/abc123.jpg",
      "created_at": "2025-11-15T10:30:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

#### Data Models

**SQL Tables:**

```sql
CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  seller_id VARCHAR NOT NULL REFERENCES sellers(id),
  created_at VARCHAR NOT NULL
);

CREATE INDEX ix_products_title ON products(title);
CREATE INDEX ix_products_price ON products(price);
CREATE INDEX ix_products_category_price ON products(category_id, price);
```

**TypeScript Interfaces (`src/types.ts`):**

```typescript
enum SortOption {
  RELEVANCE = "relevance",
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NEWEST = "newest",
  BEST_SELLING = "best_selling",
  HIGHEST_RATED = "highest_rated",
}

interface ProductSearchParams {
  q?: string;            // max 200 chars
  categories?: string[];
  priceMin?: number;     // >= 0
  priceMax?: number;     // >= 0
  sort: SortOption;      // default: RELEVANCE
  sellerRatingMin?: number; // 1-5
  page: number;          // default: 1, >= 1
  pageSize: number;      // default: 20, 1-50
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  categoryId: number;
  sellerId: string;
  createdAt: string;
}
```

#### Search Query Builder

```typescript
import { Pool } from "pg";

const SORT_MAPPING: Record<string, string> = {
  price_asc: "p.price ASC",
  price_desc: "p.price DESC",
  newest: "p.created_at DESC",
};

async function buildProductSearchQuery(
  pool: Pool,
  params: ProductSearchParams
): Promise<{ items: Product[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.q) {
    const searchTerm = `%${params.q}%`;
    conditions.push(
      `(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
    );
    values.push(searchTerm);
    paramIndex++;
  }

  if (params.categories && params.categories.length > 0) {
    conditions.push(`c.slug = ANY($${paramIndex})`);
    values.push(params.categories);
    paramIndex++;
  }

  if (params.priceMin !== undefined) {
    conditions.push(`p.price >= $${paramIndex}`);
    values.push(params.priceMin);
    paramIndex++;
  }

  if (params.priceMax !== undefined) {
    conditions.push(`p.price <= $${paramIndex}`);
    values.push(params.priceMax);
    paramIndex++;
  }

  if (params.sellerRatingMin !== undefined) {
    conditions.push(`s.average_rating >= $${paramIndex}`);
    values.push(params.sellerRatingMin);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortClause = SORT_MAPPING[params.sort] ?? (
    params.sort === "relevance" && params.q
      ? `CASE WHEN p.title ILIKE $${paramIndex} THEN 0 ELSE 1 END`
      : "p.created_at DESC"
  );
  if (params.sort === "relevance" && params.q) {
    values.push(`%${params.q}%`);
    paramIndex++;
  }

  const offset = (params.page - 1) * params.pageSize;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN sellers s ON p.seller_id = s.id
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const dataQuery = `
    SELECT p.*
    FROM products p
    JOIN sellers s ON p.seller_id = s.id
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${sortClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const dataResult = await pool.query(dataQuery, [
    ...values,
    params.pageSize,
    offset,
  ]);

  return { items: dataResult.rows, total };
}
```

### Frontend

#### TypeScript Interfaces

```typescript
interface ProductSearchFilters {
  q?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
  sellerRatingMin?: number;
  page?: number;
  pageSize?: number;
}

enum SortOption {
  Relevance = "relevance",
  PriceAsc = "price_asc",
  PriceDesc = "price_desc",
  Newest = "newest",
  BestSelling = "best_selling",
  HighestRated = "highest_rated",
}

interface ProductSearchResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: {
    slug: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    averageRating: number;
  };
  imageUrl: string;
  createdAt: string;
}
```

#### URL Sync Composable

```typescript
// composables/useProductFilters.ts
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useProductFilters() {
  const route = useRoute();
  const router = useRouter();

  const filters = computed((): ProductSearchFilters => {
    const query = route.query;
    const categories = query.categories as string | undefined;
    return {
      q: (query.q as string) ?? undefined,
      categories: categories ? categories.split(",") : undefined,
      priceMin: query.price_min ? Number(query.price_min) : undefined,
      priceMax: query.price_max ? Number(query.price_max) : undefined,
      sort: (query.sort as SortOption) ?? undefined,
      sellerRatingMin: query.seller_rating_min
        ? Number(query.seller_rating_min)
        : undefined,
      page: query.page ? Number(query.page) : undefined,
    };
  });

  function setFilters(newFilters: Partial<ProductSearchFilters>) {
    const params = new URLSearchParams(route.fullPath.split("?")[1] || "");
    Object.entries(newFilters).forEach(([key, value]) => {
      const paramKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (value === undefined || value === null) {
        params.delete(paramKey);
      } else if (Array.isArray(value)) {
        params.set(paramKey, value.join(","));
      } else {
        params.set(paramKey, String(value));
      }
    });
    // Reset to page 1 when filters change
    if (!("page" in newFilters)) {
      params.delete("page");
    }
    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/products");
  }

  return { filters, setFilters, clearFilters };
}
```

## Edge Cases

1. **Empty search query** — return all products (same as no `q` param), don't error
2. **No results** — show "No products found" with a suggestion to broaden filters, include a "Clear filters" button
3. **Invalid price range** — if `price_min > price_max`, return a 422 validation error with a clear message
4. **Invalid category slug** — ignore unknown categories, don't error (they may have been removed)
5. **Very long search query** — cap at 200 characters, truncate silently
6. **Special characters in search** — sanitize against SQL injection (parameterized queries), allow common chars like hyphens and apostrophes
7. **Concurrent filter changes** — debounce search input (300ms), cancel in-flight requests when new ones are made
8. **Page beyond total pages** — return empty results with correct `total` and `total_pages`, don't 404

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to first meaningful product view | ~45s (manual scrolling) | <15s | Analytics event timing |
| Search usage rate | 0% (doesn't exist) | >40% of sessions | Event tracking |
| Products page bounce rate | 35% | <20% | Analytics |
| API p95 response time | N/A | <200ms | Server metrics |

## Out of Scope

- Autocomplete/typeahead suggestions in the search box
- Faceted search with counts per filter option
- Elasticsearch migration (future project)
- Saved searches / search alerts
- Search analytics dashboard for sellers
- Voice search
- Visual/image-based search

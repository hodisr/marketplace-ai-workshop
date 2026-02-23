# Feature Brief: Product Search with Filters

## Product Context

Our marketplace currently lists products in a simple paginated grid. Buyers have no way to find specific products beyond scrolling through pages. As our catalog grows past 500 products, this is becoming a real pain point — buyers are bouncing before finding what they need, and sellers with niche products get buried. We need search and filtering that makes the catalog navigable.

## What We're Building

- **Text search** across product titles and descriptions with relevance ranking
- **Category filter** — multi-select from existing category taxonomy (flat, not nested)
- **Price range filter** — min/max inputs with a slider
- **Sort options** — relevance, price (asc/desc), newest, best selling, highest rated
- **Seller rating filter** — minimum seller rating threshold (e.g., "4+ stars only")
- **Filter persistence** — filters reflected in URL query params (shareable/bookmarkable)
- **Result count** — show total matching products
- **Responsive filter panel** — sidebar on desktop, bottom sheet on mobile

## Constraints & Considerations

- Must integrate with the existing product listing page (`/products`) — not a separate search page
- API response time must be under 200ms at p95 for typical queries
- Must work with the current PostgreSQL database (no Elasticsearch yet — that's a future migration)
- Product catalog is currently ~2,000 products, expected to grow to ~50,000 in the next year
- Category list is managed in the admin panel and changes infrequently (~20 categories)
- The existing `GET /api/v1/products` endpoint returns paginated products — extend it, don't replace it
- Mobile traffic is ~60% of total — filter UX on mobile matters

## Personas Affected

- **Buyers** — primary users. They need to find products quickly, especially repeat buyers who know what they want.
- **Sellers** — indirect benefit. Better search means their products are more discoverable, especially niche/long-tail items.

---

*Exercise: Generate a PRD from this brief, then break it into implementable tasks.*

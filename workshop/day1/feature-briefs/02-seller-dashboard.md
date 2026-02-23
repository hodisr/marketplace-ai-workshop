# Feature Brief: Seller Dashboard with Analytics

## Product Context

Sellers on our marketplace currently have a basic "My Products" page where they can list and edit products. They have zero visibility into how their store is performing — no sales data, no trends, nothing. Sellers are asking for this constantly, and some are manually tracking sales in spreadsheets. A proper dashboard will help sellers make better decisions about pricing, inventory, and which products to promote.

## What We're Building

- **Sales overview cards** — total revenue, total orders, average order value, units sold (with period comparison, e.g., "vs. last month")
- **Revenue trend chart** — line chart showing revenue over time, with configurable time granularity (daily/weekly/monthly)
- **Top products table** — ranked by revenue or units sold, showing product name, units, revenue, and trend arrow
- **Date range picker** — preset ranges (7d, 30d, 90d, YTD, custom) that control all dashboard data
- **Export to CSV** — download the currently visible data as a CSV file
- **Order status breakdown** — pie or donut chart showing orders by status (pending, shipped, delivered, returned)

## Constraints & Considerations

- Must handle the "empty state" gracefully — new sellers with 0 products and 0 sales should see helpful onboarding guidance, not empty charts
- Data should be near-real-time (acceptable lag: up to 5 minutes)
- Dashboard must be responsive — usable on tablet, functional on mobile (charts can simplify on small screens)
- Sellers can have between 1 and ~5,000 products — the top products table needs pagination or "show top N"
- Date range queries over 1 year of data should still be performant
- We use Chart.js on the frontend already — stick with it for consistency
- The backend should return pre-aggregated data — don't send raw order rows to the frontend

## Personas Affected

- **Sellers** — primary users. They need actionable insights to run their stores effectively.
- **Marketplace admins** — may eventually want a similar dashboard with platform-wide metrics (design with reusability in mind, but don't build the admin version now).

---

*Exercise: Generate a PRD from this brief, then break it into implementable tasks.*

# Task List: Seller Dashboard with Analytics

**PRD**: tasks/prd-seller-dashboard.md
**Generated**: 2025-02-21

## Relevant Files
- backend/product-service/src/routes/dashboard.ts (create)
- backend/product-service/src/types.ts (modify)
- backend/product-service/src/__tests__/dashboard.test.ts (create)
- frontend/pages/dashboard.vue (create)
- frontend/components/MetricCard.vue (create)
- frontend/components/RevenueChart.vue (create)
- frontend/components/OrderStatusChart.vue (create)
- frontend/components/DateRangePicker.vue (create)
- frontend/components/EmptyDashboard.vue (create)
- frontend/__tests__/MetricCard.test.ts (create)
- frontend/__tests__/DateRangePicker.test.ts (create)

## Tasks

- [ ] 0.0 - Create feature branch from main
- [ ] 1.0 - Backend analytics aggregation endpoints
  - [ ] 1.1 - Dashboard summary endpoint with period comparison
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/dashboard.ts, backend/product-service/src/types.ts
    **Description**: GET /api/v1/seller/dashboard/summary returns revenue, orders, AOV, units sold with comparison to previous period of equal length.
    **Acceptance Criteria**:
    - Returns current and previous period metrics with change_pct
    - Handles zero previous values (no division by zero)
    - Cancelled orders excluded
    - Tests pass: known data, zero previous, zero both periods

  - [ ] 1.2 - Revenue trend endpoint with configurable granularity
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/dashboard.ts
    **Description**: GET /api/v1/seller/dashboard/revenue-trend with granularity param (daily/weekly/monthly). Zero-fills gaps. Auto-selects granularity based on range length.
    **Acceptance Criteria**:
    - Returns array of data points with date, revenue, order count
    - Zero-fill: 30-day range with 5 days of sales has 30 data points
    - Tests pass: daily with gaps, weekly boundaries, monthly across year

  - [ ] 1.3 - Top products endpoint
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/dashboard.ts
    **Description**: GET /api/v1/seller/dashboard/top-products with sort_by (revenue/units) and limit (default 10, max 50). Includes trend indicator.
    **Acceptance Criteria**:
    - Sorting by revenue vs units produces different rankings
    - Trend calculated by comparing current to previous period
    - Tests pass: different sort orders, trend calculation, 0 products

  - [ ] 1.4 - Order status breakdown endpoint
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/dashboard.ts
    **Description**: GET /api/v1/seller/dashboard/order-status returns count and percentage per status. Percentages sum to 100%.
    **Acceptance Criteria**:
    - Only includes statuses with at least 1 order
    - Percentage rounding sums to 100%
    - Tests pass: all statuses, single status, rounding

- [ ] 2.0 - Summary cards and metrics display
  - [ ] 2.1 - Build MetricCard component
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/MetricCard.vue, frontend/__tests__/MetricCard.test.ts
    **Description**: Reusable card accepting label, value, previous value, format type (currency/number). Green up arrow for positive change, red down for negative.
    **Acceptance Criteria**:
    - Displays percentage change with color-coded arrow
    - Supports currency and number formatting
    - Responsive: 4-across desktop, 2x2 tablet, stacked mobile
    - Tests pass: positive/negative/zero change, currency vs number

  - [ ] 2.2 - Wire summary cards to API
    **Type**: frontend
    **Depends on**: 1.1, 2.1
    **Files**: frontend/pages/dashboard.vue
    **Description**: Fetch summary data when date range changes. Loading skeletons during fetch. Error handling with retry.
    **Acceptance Criteria**:
    - Re-fetches on date range change
    - Loading and error states handled
    - Tests pass: mocked API, loading state, error state

- [ ] 3.0 - Charts and data visualizations
  - [ ] 3.1 - Revenue trend line chart
    **Type**: frontend
    **Depends on**: 1.2
    **Files**: frontend/components/RevenueChart.vue
    **Description**: Line chart (Chart.js) with revenue on Y-axis, dates on X-axis. Optional second Y-axis for order count. X-axis labels adapt to granularity.
    **Acceptance Criteria**:
    - Renders daily, weekly, and monthly data
    - Dual-axis toggle for order count
    - Tooltips show "$X,XXX.XX revenue, N orders"
    - Tests pass: each granularity, dual-axis toggle, single data point

  - [ ] 3.2 - Order status donut chart
    **Type**: frontend
    **Depends on**: 1.4
    **Files**: frontend/components/OrderStatusChart.vue
    **Description**: Donut chart with one segment per status. Color-coded (green=delivered, blue=shipped, yellow=pending, red=returned). Center text shows total.
    **Acceptance Criteria**:
    - All statuses rendered with correct colors
    - Legend with counts and percentages
    - Tests pass: all 4 statuses, single status

- [ ] 4.0 - Date range picker and data controls
  - [ ] 4.1 - Build DateRangePicker component
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/DateRangePicker.vue, frontend/__tests__/DateRangePicker.test.ts
    **Description**: Preset buttons (7d, 30d, 90d, YTD, Custom). Custom range shows two date pickers. Date range stored in URL query params.
    **Acceptance Criteria**:
    - Each preset calculates correct date range
    - Custom date input with validation (end >= start, end <= today)
    - URL persistence for bookmarkability
    - Tests pass: presets, custom range, validation, URL persistence

  - [ ] 4.2 - Build CSV export functionality
    **Type**: frontend
    **Depends on**: 1.3
    **Files**: frontend/pages/dashboard.vue
    **Description**: "Export CSV" button on top products section. Downloads currently visible data. Filename includes date range.
    **Acceptance Criteria**:
    - CSV matches displayed data
    - Filename format: top-products-YYYY-MM-DD-to-YYYY-MM-DD.csv
    - Special characters in product names properly quoted
    - Tests pass: CSV content, filename format, special chars

- [ ] 5.0 - Empty states and edge cases
  - [ ] 5.1 - Build empty state components
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/EmptyDashboard.vue
    **Description**: EmptyDashboard variant for new sellers (no products). NoSalesYet variant for sellers with products but no orders. Each includes CTA.
    **Acceptance Criteria**:
    - Each variant renders with illustration, message, CTA
    - CTAs point to correct destinations
    - Tests pass: snapshots, CTA click handlers

  - [ ] 5.2 - Add error boundary and loading states
    **Type**: frontend
    **Depends on**: 2.0, 3.0, 4.0
    **Files**: frontend/pages/dashboard.vue
    **Description**: Error boundary wraps dashboard. Individual section errors don't crash the whole page. Each section has its own loading skeleton and retry.
    **Acceptance Criteria**:
    - Error boundary catches render errors
    - Section errors are isolated
    - Retry buttons re-fetch data
    - Tests pass: error boundary, section isolation, retry

---

## Common Mistakes

### PRD Mistakes
- **Sending raw order data to frontend**: Brief says "pre-aggregated data." Frontend computing totals won't scale.
- **Ignoring comparison period**: Metrics without context are useless. Show change vs previous period.
- **No empty state design**: Jumping to charts without considering new seller experience.
- **Specifying WebSocket updates**: Brief says "near-real-time (up to 5 min lag)." Polling is sufficient.
- **Missing reusability note**: Brief mentions future admin dashboard. Note aggregation patterns should be reusable.

### Task Breakdown Mistakes
- **All charts in one task**: Revenue trend and order status donut are different chart types with different data.
- **Backend as single monolith**: Four distinct endpoints should be four subtasks.
- **Missing date range picker task**: It's the primary control for the entire dashboard.
- **No empty state task**: Engineers build happy path and "add empty states later" — which often means never.
- **CSV export bundled with charts**: Export has its own edge cases and should be separate.
- **Dependencies all sequential**: Summary cards, charts, and date picker can be built in parallel with mock data.

### Red Flags for Instructors
- PRD specifies WebSocket for real-time updates
- No timezone handling
- No empty state or error handling tasks
- All frontend tasks depend on backend completion
- Charts task doesn't mention Chart.js
- No CSV export task
- Aggregation logic placed in frontend

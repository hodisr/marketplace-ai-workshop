# PRD: Seller Dashboard with Analytics

## Overview

Build an analytics dashboard for sellers that provides visibility into sales performance, revenue trends, and product rankings. The dashboard replaces the current blank "Dashboard" tab in the seller portal with actionable data visualizations. All data is pre-aggregated on the backend and served via dedicated analytics endpoints. Charts use the existing Chart.js library.

## Goals

1. **Give sellers actionable data** — sellers should be able to identify their top products, track revenue trends, and spot issues without external tools
2. **Reduce support load** — sellers currently email support asking for sales data; self-service eliminates this
3. **Increase seller retention** — engaged sellers who understand their performance are less likely to churn
4. **Lay groundwork for platform analytics** — design reusable aggregation patterns for future admin dashboard

## User Stories

1. As a seller, I want to see my total revenue, order count, and average order value at a glance so I can quickly assess business health.
2. As a seller, I want to compare current metrics to the previous period so I can see if I'm trending up or down.
3. As a seller, I want to see a revenue chart over time so I can identify patterns and seasonality.
4. As a seller, I want to see my top products ranked by revenue so I know what's driving my business.
5. As a seller, I want to pick a date range so I can analyze specific time periods.
6. As a seller, I want to export my data to CSV so I can do custom analysis or share with my accountant.
7. As a seller, I want to see order status breakdown so I can track fulfillment health.
8. As a new seller with no sales, I want to see helpful guidance instead of empty charts so I don't feel lost.

## Technical Requirements

### Backend

#### API Contracts

**Dashboard Summary**

```
GET /api/v1/seller/dashboard/summary?start_date=2025-01-01&end_date=2025-01-31
```

```json
{
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  },
  "metrics": {
    "total_revenue": 12450.00,
    "total_orders": 187,
    "average_order_value": 66.58,
    "units_sold": 312
  },
  "comparison": {
    "total_revenue": { "previous": 10200.00, "change_pct": 22.06 },
    "total_orders": { "previous": 156, "change_pct": 19.87 },
    "average_order_value": { "previous": 65.38, "change_pct": 1.84 },
    "units_sold": { "previous": 267, "change_pct": 16.85 }
  }
}
```

**Revenue Trend**

```
GET /api/v1/seller/dashboard/revenue-trend?start_date=2025-01-01&end_date=2025-01-31&granularity=daily
```

```json
{
  "granularity": "daily",
  "data_points": [
    { "date": "2025-01-01", "revenue": 402.50, "orders": 6 },
    { "date": "2025-01-02", "revenue": 315.00, "orders": 5 }
  ]
}
```

**Top Products**

```
GET /api/v1/seller/dashboard/top-products?start_date=2025-01-01&end_date=2025-01-31&sort_by=revenue&limit=10
```

```json
{
  "products": [
    {
      "id": "prod_abc",
      "title": "Wireless Headphones",
      "image_url": "https://cdn.example.com/products/abc.jpg",
      "units_sold": 45,
      "revenue": 2250.00,
      "trend": "up"
    }
  ]
}
```

**Order Status Breakdown**

```
GET /api/v1/seller/dashboard/order-status?start_date=2025-01-01&end_date=2025-01-31
```

```json
{
  "statuses": [
    { "status": "delivered", "count": 120, "percentage": 64.2 },
    { "status": "shipped", "count": 35, "percentage": 18.7 },
    { "status": "pending", "count": 22, "percentage": 11.8 },
    { "status": "returned", "count": 10, "percentage": 5.3 }
  ]
}
```

#### Data Models

**TypeScript Interfaces (`src/types.ts`):**

```typescript
enum Granularity {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

enum TopProductSort {
  REVENUE = "revenue",
  UNITS = "units",
}

interface DashboardDateRange {
  startDate: string; // ISO date string
  endDate: string;
}

function previousPeriod(range: DashboardDateRange): DashboardDateRange {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const delta = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 86400000); // minus 1 day
  const prevStart = new Date(prevEnd.getTime() - delta);
  return {
    startDate: prevStart.toISOString().split("T")[0],
    endDate: prevEnd.toISOString().split("T")[0],
  };
}

interface MetricComparison {
  previous: number;
  changePct: number;
}

interface DashboardSummaryData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  unitsSold: number;
}

interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

interface OrderStatusEntry {
  status: string;
  count: number;
  percentage: number;
}
```

#### Aggregation Service

```typescript
import { Pool } from "pg";

async function getSellerSummary(
  pool: Pool,
  sellerId: string,
  startDate: string,
  endDate: string
): Promise<DashboardSummaryData> {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(oi.total_price), 0) AS revenue,
       COUNT(DISTINCT o.id) AS order_count,
       COALESCE(SUM(oi.quantity), 0) AS units
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE oi.seller_id = $1
       AND o.created_at >= $2
       AND o.created_at <= $3
       AND o.status != 'cancelled'`,
    [sellerId, startDate, endDate]
  );

  const row = result.rows[0];
  const revenue = parseFloat(row.revenue);
  const orderCount = parseInt(row.order_count, 10);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  return {
    totalRevenue: revenue,
    totalOrders: orderCount,
    averageOrderValue: Math.round(avgOrderValue * 100) / 100,
    unitsSold: parseInt(row.units, 10),
  };
}

async function getRevenueTrend(
  pool: Pool,
  sellerId: string,
  startDate: string,
  endDate: string,
  granularity: Granularity
): Promise<RevenueTrendPoint[]> {
  let dateTrunc: string;
  if (granularity === Granularity.DAILY) {
    dateTrunc = "DATE(o.created_at)";
  } else if (granularity === Granularity.WEEKLY) {
    dateTrunc = "DATE_TRUNC('week', o.created_at)";
  } else {
    dateTrunc = "DATE_TRUNC('month', o.created_at)";
  }

  const result = await pool.query(
    `SELECT
       ${dateTrunc} AS period,
       SUM(oi.total_price) AS revenue,
       COUNT(DISTINCT o.id) AS orders
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE oi.seller_id = $1
       AND o.created_at >= $2
       AND o.created_at <= $3
       AND o.status != 'cancelled'
     GROUP BY period
     ORDER BY period`,
    [sellerId, startDate, endDate]
  );

  return result.rows.map((row) => ({
    date: String(row.period),
    revenue: parseFloat(row.revenue),
    orders: parseInt(row.orders, 10),
  }));
}
```

### Frontend

#### TypeScript Interfaces

```typescript
interface DashboardSummary {
  period: { startDate: string; endDate: string };
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    unitsSold: number;
  };
  comparison: {
    totalRevenue: MetricComparison;
    totalOrders: MetricComparison;
    averageOrderValue: MetricComparison;
    unitsSold: MetricComparison;
  };
}

interface MetricComparison {
  previous: number;
  changePct: number;
}

interface RevenueTrendData {
  granularity: "daily" | "weekly" | "monthly";
  dataPoints: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface TopProductEntry {
  id: string;
  title: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

interface OrderStatusData {
  statuses: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

type DatePreset = "7d" | "30d" | "90d" | "ytd" | "custom";
```

#### CSV Export Utility

```typescript
function exportToCSV(data: TopProductEntry[], filename: string): void {
  const headers = ["Product", "Units Sold", "Revenue", "Trend"];
  const rows = data.map((p) => [
    `"${p.title.replace(/"/g, '""')}"`,
    p.unitsSold,
    p.revenue.toFixed(2),
    p.trend,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

## Edge Cases

1. **New seller with 0 orders** — show empty state with onboarding CTA ("List your first product to start seeing analytics here")
2. **Seller with products but 0 orders** — show zero-value metrics, not empty state. Include "Your products are listed, sales data will appear once you get your first order"
3. **Single day date range** — granularity auto-set to daily, comparison is to the previous day
4. **Future date range** — reject with 422, end date must be <= today
5. **Very large date range (>1 year)** — auto-switch granularity to monthly, warn user
6. **Division by zero** — when calculating average order value with 0 orders, display as $0.00, not NaN
7. **Revenue trend gaps** — if no sales on a given day, include it in the chart as $0 (don't skip days)
8. **Timezone handling** — all dates are in UTC on the backend, displayed in the seller's local timezone on the frontend

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Seller dashboard visits per week | 0 | >3 per active seller | Analytics |
| Support tickets asking for sales data | ~15/month | <3/month | Support tracking |
| Seller retention (30d) | 72% | 80% | Cohort analysis |
| Dashboard page load time | N/A | <2s | Performance monitoring |

## Out of Scope

- Admin-level platform-wide dashboard (reuse patterns, don't build now)
- Real-time WebSocket updates (near-real-time polling is sufficient)
- Custom report builder
- Profit margin calculations (we don't track cost of goods)
- Competitor benchmarking / marketplace averages
- Push notifications for milestone events (e.g., "You hit 100 sales!")

# PRD: Review and Rating System

## Overview

Implement a review and rating system that allows buyers to rate products (1-5 stars), write text reviews with optional photos, and enables sellers to respond. Reviews are gated to verified purchasers only (one review per buyer per product). An automated moderation layer flags suspicious content, and marketplace admins can review flagged items in a moderation queue. Product average ratings are aggregated and factor into search ranking.

## Goals

1. **Build buyer trust** — social proof from real purchasers reduces hesitation, especially with unfamiliar sellers
2. **Incentivize quality** — sellers with poor reviews are motivated to improve products and service
3. **Improve search relevance** — ratings as a ranking signal surfaces better products
4. **Reduce return rates** — detailed reviews help buyers set accurate expectations

## User Stories

1. As a buyer who purchased a product, I want to leave a star rating and text review so other buyers benefit from my experience.
2. As a buyer, I want to upload photos with my review so I can show the actual product I received.
3. As a buyer, I want to edit my review within 48 hours so I can fix mistakes or update my opinion after using the product more.
4. As a buyer, I want to delete my review at any time if I change my mind about sharing it.
5. As a buyer browsing products, I want to see the average rating and rating distribution so I can quickly assess product quality.
6. As a buyer, I want to filter reviews by star count so I can read the most critical or most positive feedback.
7. As a seller, I want to respond to reviews so I can address concerns or thank satisfied customers.
8. As a marketplace admin, I want to see flagged reviews in a moderation queue so I can remove abusive content.

## Technical Requirements

### Backend

#### API Contracts

**Create Review**

```
POST /api/v1/products/{product_id}/reviews
Authorization: Bearer <token>
```

```json
{
  "rating": 4,
  "text": "Great quality headphones. Sound is crisp and clear. Battery lasts about 20 hours.",
  "photos": ["upload_id_1", "upload_id_2"]
}
```

Response: `201 Created`
```json
{
  "id": "review_abc123",
  "product_id": "prod_xyz",
  "buyer": {
    "id": "user_123",
    "display_name": "Jane D."
  },
  "rating": 4,
  "text": "Great quality headphones. Sound is crisp and clear. Battery lasts about 20 hours.",
  "photos": [
    { "id": "photo_1", "url": "https://cdn.example.com/reviews/photo_1.jpg", "thumbnail_url": "https://cdn.example.com/reviews/photo_1_thumb.jpg" }
  ],
  "seller_response": null,
  "created_at": "2025-12-01T14:30:00Z",
  "updated_at": "2025-12-01T14:30:00Z",
  "is_editable": true
}
```

**List Reviews for Product**

```
GET /api/v1/products/{product_id}/reviews?sort=newest&rating=5&page=1&page_size=10
```

Response: `200 OK`
```json
{
  "items": [ /* review objects */ ],
  "total": 47,
  "page": 1,
  "page_size": 10,
  "rating_summary": {
    "average": 4.2,
    "count": 47,
    "distribution": {
      "5": 22,
      "4": 12,
      "3": 8,
      "2": 3,
      "1": 2
    }
  }
}
```

**Update Review** (within 48h)

```
PUT /api/v1/products/{product_id}/reviews/{review_id}
```

**Delete Review**

```
DELETE /api/v1/products/{product_id}/reviews/{review_id}
```

**Seller Response**

```
POST /api/v1/products/{product_id}/reviews/{review_id}/response
Authorization: Bearer <seller_token>
```

```json
{
  "text": "Thank you for the kind review! Glad you're enjoying the headphones."
}
```

**Photo Upload** (pre-signed URL flow)

```
POST /api/v1/uploads/review-photo
```

```json
{
  "filename": "headphones_photo.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 2048000
}
```

Response:
```json
{
  "upload_id": "upload_abc",
  "upload_url": "https://s3.amazonaws.com/bucket/reviews/upload_abc?...",
  "expires_at": "2025-12-01T15:00:00Z"
}
```

#### Data Models

**SQL Tables:**

```sql
CREATE TABLE reviews (
  id VARCHAR PRIMARY KEY,
  product_id VARCHAR NOT NULL REFERENCES products(id),
  buyer_id VARCHAR NOT NULL REFERENCES users(id),
  order_id VARCHAR NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL,
  text TEXT,
  moderation_status VARCHAR NOT NULL DEFAULT 'pending',
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_review_buyer_product UNIQUE (product_id, buyer_id),
  CONSTRAINT ck_review_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE review_photos (
  id VARCHAR PRIMARY KEY,
  review_id VARCHAR NOT NULL REFERENCES reviews(id),
  url VARCHAR NOT NULL,
  thumbnail_url VARCHAR NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE seller_responses (
  id VARCHAR PRIMARY KEY,
  review_id VARCHAR NOT NULL UNIQUE REFERENCES reviews(id),
  seller_id VARCHAR NOT NULL REFERENCES sellers(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE product_rating_cache (
  product_id VARCHAR PRIMARY KEY REFERENCES products(id),
  average_rating REAL NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  rating_1 INTEGER DEFAULT 0,
  rating_2 INTEGER DEFAULT 0,
  rating_3 INTEGER DEFAULT 0,
  rating_4 INTEGER DEFAULT 0,
  rating_5 INTEGER DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**TypeScript Interfaces (`src/types.ts`):**

```typescript
enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  FLAGGED = "flagged",
  REJECTED = "rejected",
}

interface ReviewRow {
  id: string;
  productId: string;
  buyerId: string;
  orderId: string;
  rating: number;
  text: string | null;
  moderationStatus: ModerationStatus;
  isDeleted: number; // soft delete
  createdAt: Date;
  updatedAt: Date;
}

function isEditable(review: ReviewRow): boolean {
  const hoursSinceCreation =
    (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation < 48;
}

interface ReviewPhotoRow {
  id: string;
  reviewId: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
}

interface SellerResponseRow {
  id: string;
  reviewId: string;
  sellerId: string;
  text: string;
  createdAt: Date;
}

interface ProductRatingCacheRow {
  productId: string;
  averageRating: number;
  reviewCount: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  updatedAt: Date;
}
```

#### Rating Aggregation Service

```typescript
import { Pool } from "pg";

async function updateProductRatingCache(
  pool: Pool,
  productId: string
): Promise<void> {
  // Recalculate and upsert the product rating cache
  const statsResult = await pool.query(
    `SELECT
       COUNT(id) AS count,
       COALESCE(AVG(rating), 0) AS avg,
       SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS r1,
       SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS r2,
       SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS r3,
       SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS r4,
       SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS r5
     FROM reviews
     WHERE product_id = $1
       AND is_deleted = 0
       AND moderation_status != 'rejected'`,
    [productId]
  );

  const stats = statsResult.rows[0];

  await pool.query(
    `INSERT INTO product_rating_cache
       (product_id, review_count, average_rating, rating_1, rating_2, rating_3, rating_4, rating_5, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (product_id) DO UPDATE SET
       review_count = $2,
       average_rating = $3,
       rating_1 = $4,
       rating_2 = $5,
       rating_3 = $6,
       rating_4 = $7,
       rating_5 = $8,
       updated_at = NOW()`,
    [
      productId,
      parseInt(stats.count, 10),
      Math.round(parseFloat(stats.avg) * 100) / 100,
      parseInt(stats.r1, 10) || 0,
      parseInt(stats.r2, 10) || 0,
      parseInt(stats.r3, 10) || 0,
      parseInt(stats.r4, 10) || 0,
      parseInt(stats.r5, 10) || 0,
    ]
  );
}
```

### Frontend

#### TypeScript Interfaces

```typescript
interface Review {
  id: string;
  productId: string;
  buyer: {
    id: string;
    displayName: string;
  };
  rating: number;
  text: string | null;
  photos: ReviewPhoto[];
  sellerResponse: SellerResponse | null;
  createdAt: string;
  updatedAt: string;
  isEditable: boolean;
}

interface ReviewPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
}

interface SellerResponse {
  text: string;
  createdAt: string;
}

interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface ReviewFormData {
  rating: number;
  text: string;
  photos: File[];
}

interface ReviewListResponse {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  ratingSummary: RatingSummary;
}
```

#### Star Rating Component Interface

```typescript
interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
}
```

## Edge Cases

1. **Buyer tries to review without purchasing** — API returns 403 with message "You must purchase this product before reviewing"
2. **Buyer tries to submit second review** — API returns 409 with message "You have already reviewed this product"
3. **Edit after 48 hours** — API returns 403 with message "Review can only be edited within 48 hours of posting"
4. **Seller responds to their own product's review** — verify seller owns the product, not just any seller
5. **Seller responds twice** — API returns 409, only one response per review
6. **Review on a deleted/unlisted product** — still visible on order history, but not on product page
7. **Photo upload exceeds 5MB** — reject at the pre-signed URL generation step with 413
8. **Profanity in review text** — auto-flag for moderation, still show to the buyer as "pending review"
9. **Rating cache drift** — if cache somehow gets out of sync, the aggregation service should be idempotent and recalculate from source
10. **Product with 0 reviews** — display "No reviews yet. Be the first to review!" — never show 0.0 stars
11. **Bulk review spam** — rate limit review creation to 5 reviews per user per hour
12. **Unicode/emoji in review text** — allow it, ensure proper encoding throughout the stack

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Products with at least 1 review | 0% | >30% within 6 months | Database query |
| Review submission rate (of eligible buyers) | 0% | >15% | Funnel analysis |
| Average time on product page | 45s | 90s (reading reviews) | Analytics |
| Return rate | 8% | <6% | Order tracking |
| Flagged reviews requiring manual moderation | N/A | <5% of total | Moderation queue metrics |

## Out of Scope

- Review voting (helpful/not helpful)
- Review rewards or incentive programs
- Video reviews
- AI-generated review summaries
- Q&A section (separate from reviews)
- Seller-to-seller reviews
- Anonymous reviews (all reviews are tied to verified buyers)

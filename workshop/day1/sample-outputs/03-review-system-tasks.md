# Task List: Review and Rating System

**PRD**: tasks/prd-review-system.md
**Generated**: 2025-02-21

## Relevant Files
- backend/product-service/src/database.ts (modify — add reviews, review_photos, seller_responses, product_rating_cache tables)
- backend/product-service/src/types.ts (modify — add review interfaces)
- backend/product-service/src/routes/reviews.ts (create)
- backend/product-service/src/routes/admin.ts (create)
- backend/product-service/src/services/moderation.ts (create)
- backend/product-service/src/services/ratingAggregation.ts (create)
- backend/product-service/src/__tests__/reviews.test.ts (create)
- backend/product-service/src/__tests__/moderation.test.ts (create)
- frontend/components/RatingSummary.vue (create)
- frontend/components/ReviewCard.vue (create)
- frontend/components/StarRating.vue (create)
- frontend/components/ReviewForm.vue (create)
- frontend/__tests__/ReviewCard.test.ts (create)
- frontend/__tests__/StarRating.test.ts (create)
- frontend/__tests__/ReviewForm.test.ts (create)

## Tasks

- [ ] 0.0 - Create feature branch from main
- [ ] 1.0 - Review data layer and core API
  - [ ] 1.1 - Create database tables and TypeScript interfaces
    **Type**: database
    **Depends on**: none
    **Files**: backend/product-service/src/database.ts, backend/product-service/src/types.ts
    **Description**: SQL CREATE TABLE for reviews (id, product_id, buyer_id, order_id, rating, text, moderation_status, is_deleted, timestamps), review_photos, seller_responses (one-to-one), product_rating_cache. UNIQUE constraint on (product_id, buyer_id). CHECK constraint on rating (1-5). TypeScript interfaces for each table.
    **Acceptance Criteria**:
    - All tables created with correct constraints
    - Unique constraint on (product_id, buyer_id) enforced
    - Rating check constraint rejects 0 and 6
    - Tests pass: table creation, constraint enforcement

  - [ ] 1.2 - Implement review CRUD endpoints
    **Type**: backend
    **Depends on**: 1.1
    **Files**: backend/product-service/src/routes/reviews.ts, backend/product-service/src/types.ts, backend/product-service/src/__tests__/reviews.test.ts
    **Description**: POST/GET/PUT/DELETE for reviews. Create requires purchase verification. Update within 48h only. Delete is soft delete. List excludes deleted and rejected reviews.
    **Acceptance Criteria**:
    - Create with valid purchase → 201
    - Create without purchase → 403
    - Duplicate review → 409
    - Update within 48h → 200, after 48h → 403
    - Delete sets is_deleted, doesn't remove row
    - Tests pass: all CRUD operations, edge cases

  - [ ] 1.3 - Implement seller response endpoint
    **Type**: backend
    **Depends on**: 1.1
    **Files**: backend/product-service/src/routes/reviews.ts
    **Description**: POST /api/v1/products/{product_id}/reviews/{review_id}/response. Verify seller owns the product. One response per review. Text 10-2000 chars.
    **Acceptance Criteria**:
    - Seller responds to own product review → 201
    - Non-owner → 403
    - Duplicate response → 409
    - Tests pass: happy path, auth, duplicate, validation

  - [ ] 1.4 - Implement rating aggregation service
    **Type**: backend
    **Depends on**: 1.1
    **Files**: backend/product-service/src/services/ratingAggregation.ts
    **Description**: Recalculates ProductRatingCache from source reviews. Called after create, update, delete, moderation change. Idempotent. Handles 0 reviews.
    **Acceptance Criteria**:
    - Correct average and distribution for varying ratings
    - Aggregation correct after deletion and edit
    - Rejected reviews excluded
    - Tests pass: 5 reviews, after deletion, after edit, 0 reviews, idempotency

- [ ] 2.0 - Photo upload system
  - [ ] 2.1 - Pre-signed URL endpoint for photo upload
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/routes/reviews.ts
    **Description**: POST /api/v1/uploads/review-photo. Validates content_type (JPEG/PNG only) and size (<= 5MB). Returns upload_id, upload_url, expires_at.
    **Acceptance Criteria**:
    - Valid JPEG → 200 with URL
    - Invalid content type → 422
    - Oversized file → 413
    - Tests pass: valid upload, invalid type, oversized

  - [ ] 2.2 - Link photos to review on creation
    **Type**: backend
    **Depends on**: 1.2, 2.1
    **Files**: backend/product-service/src/routes/reviews.ts
    **Description**: Review creation accepts array of upload_ids. Max 3. Validates IDs exist and belong to current user. Creates ReviewPhoto records.
    **Acceptance Criteria**:
    - 1-3 photos linked successfully
    - 4 photos → 422
    - Invalid upload_id → 404
    - Tests pass: 1/2/3 photos, 4 photos, invalid ID

- [ ] 3.0 - Review moderation system
  - [ ] 3.1 - Automated moderation checks
    **Type**: backend
    **Depends on**: 1.2
    **Files**: backend/product-service/src/services/moderation.ts, backend/product-service/src/__tests__/moderation.test.ts
    **Description**: Profanity filter (configurable word list), spam detection (all caps, URLs, repeated chars). Pass → "approved", fail → "flagged" with reason.
    **Acceptance Criteria**:
    - Profane text flagged
    - All-caps and URL-containing text flagged
    - Clean text approved
    - Tests pass: profanity, all-caps, URLs, clean text

  - [ ] 3.2 - Admin moderation queue endpoints
    **Type**: backend
    **Depends on**: 3.1
    **Files**: backend/product-service/src/routes/admin.ts
    **Description**: GET /api/v1/admin/reviews/flagged (paginated), POST approve, POST reject with reason. Admin-only. Approve/reject triggers rating cache update.
    **Acceptance Criteria**:
    - List returns only flagged reviews
    - Approve/reject updates status and rating cache
    - Non-admin → 403
    - Tests pass: list, approve, reject, auth

- [ ] 4.0 - Frontend review display
  - [ ] 4.1 - Build RatingSummary component
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/RatingSummary.vue
    **Description**: Large average rating with star visualization. Horizontal bar chart per star level (clickable to filter). Total count. Responsive.
    **Acceptance Criteria**:
    - Renders various rating distributions
    - Bar click filters reviews
    - 0 reviews shows "No reviews yet"
    - Tests pass: distributions, click filter, empty state

  - [ ] 4.2 - Build ReviewCard component
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/ReviewCard.vue, frontend/__tests__/ReviewCard.test.ts
    **Description**: Buyer name, star rating, date (relative), text with "Read more" truncation, photo thumbnails with lightbox, seller response in nested block. Edit/Delete buttons for author only.
    **Acceptance Criteria**:
    - Renders with/without text, photos, seller response
    - Read more truncation at 300 chars
    - Author-only buttons visible, edit only within 48h
    - Tests pass: all content variations, truncation, button visibility

  - [ ] 4.3 - Build review list with pagination and filtering
    **Type**: frontend
    **Depends on**: 4.1, 4.2
    **Files**: frontend/pages/products/[id].vue
    **Description**: List of ReviewCards with pagination. Sort (Most Recent, Highest Rated, Lowest Rated). Star filter from RatingSummary click. Loading skeleton.
    **Acceptance Criteria**:
    - Pagination navigation works
    - Sort change re-fetches
    - Star filter from bar click
    - Tests pass: pagination, sort, filter, loading state

- [ ] 5.0 - Frontend review submission
  - [ ] 5.1 - Build StarRating input component
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/StarRating.vue, frontend/__tests__/StarRating.test.ts
    **Description**: 5 stars, clickable and hoverable. Hover preview. Readonly mode for display. Sizes: sm/md/lg. Keyboard navigable with ARIA labels.
    **Acceptance Criteria**:
    - Click sets value, hover shows preview
    - Readonly mode doesn't respond to interaction
    - Keyboard navigation (arrow keys)
    - Tests pass: click, hover, readonly, keyboard, accessibility

  - [ ] 5.2 - Build ReviewForm component with photo upload
    **Type**: frontend
    **Depends on**: 2.1, 5.1
    **Files**: frontend/components/ReviewForm.vue, frontend/__tests__/ReviewForm.test.ts
    **Description**: Star rating (required), text area with char count (10-2000), photo upload zone (drag-and-drop, preview, max 3). Submit validates locally, uploads photos first, then creates review. Edit mode loads existing data.
    **Acceptance Criteria**:
    - Validation: no rating → error, text too short → error
    - Photo upload flow: select → preview → upload → attach
    - Submit success and error handling
    - Edit mode pre-populates form
    - Tests pass: validation, photo flow, submit, edit mode

---

## Common Mistakes

### PRD Mistakes
- **Forgetting purchase verification**: Only buyers with completed orders can review. Missing this breaks trust.
- **Not defining rating aggregation strategy**: When is it calculated? What about edits/deletes/moderation?
- **Missing 48-hour edit window**: Specific constraint from the brief.
- **No moderation plan**: "Moderate reviews" without specifying automated vs manual.
- **Ignoring seller response model**: It's a core feature, not optional.

### Task Breakdown Mistakes
- **Photo upload not separated**: S3 integration is a distinct subsystem.
- **Moderation as afterthought**: Automated check affects review creation flow.
- **Display and submission in one task**: Very different UX concerns.
- **Missing rating aggregation as explicit task**: Called from multiple places, needs own tests.
- **No dependency between backend photo upload and frontend**: Frontend needs pre-signed URL flow first.

### Red Flags for Instructors
- No unique constraint on (product_id, buyer_id)
- Rating stored as float instead of integer
- No soft delete — hard deleting loses audit trail
- Photo upload as multipart to API server instead of direct-to-S3
- Aggregation computed on-read (performance disaster)
- No moderation task at all
- All parent tasks sequential (missed parallelization)

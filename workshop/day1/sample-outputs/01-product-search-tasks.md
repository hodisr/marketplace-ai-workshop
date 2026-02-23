# Task List: Product Search with Filters

**PRD**: tasks/prd-product-search.md
**Generated**: 2025-02-21

## Relevant Files
- backend/product-service/src/types.ts (modify)
- backend/product-service/src/routes/products.ts (modify)
- backend/product-service/src/database.ts (modify — add indexes)
- backend/product-service/src/__tests__/search.test.ts (create)
- frontend/components/SearchInput.vue (create)
- frontend/components/CategoryFilter.vue (create)
- frontend/components/PriceRangeFilter.vue (create)
- frontend/components/SortDropdown.vue (create)
- frontend/composables/useProductFilters.ts (create)
- frontend/pages/products.vue (modify)
- frontend/__tests__/SearchInput.test.ts (create)
- frontend/__tests__/useProductFilters.test.ts (create)

## Tasks

- [ ] 0.0 - Create feature branch from main
- [ ] 1.0 - Backend search API
  - [ ] 1.1 - Define TypeScript interfaces for search parameters and response
    **Type**: backend
    **Depends on**: none
    **Files**: backend/product-service/src/types.ts
    **Description**: Add `ProductSearchParams` interface with all query parameters (q, categories, price_min, price_max, sort, seller_rating_min, page, page_size) and a validation function for constraints. Add `SortOption` enum with all 6 sort options.
    **Acceptance Criteria**:
    - ProductSearchParams validation checks page >= 1, page_size between 1 and 50, price_min >= 0
    - SortOption enum covers: relevance, price_asc, price_desc, newest, rating, best_selling
    - Tests pass: validation constraints reject invalid values, defaults applied when omitted

  - [ ] 1.2 - Implement search query builder
    **Type**: backend
    **Depends on**: 1.1
    **Files**: backend/product-service/src/routes/products.ts, backend/product-service/src/__tests__/search.test.ts
    **Description**: Function takes ProductSearchParams and builds parameterized SQL query returning filtered, sorted, paginated results via pg (node-postgres). Text search uses ILIKE on title and description. Category filter supports multiple categories (ANY array). Price range is inclusive.
    **Acceptance Criteria**:
    - Each filter works in isolation and in combination
    - Sort by relevance prioritizes title matches over description matches
    - Returns both items and total count for pagination
    - Tests pass: each filter isolated, combined filters, empty results

  - [ ] 1.3 - Wire up Express.js route handler
    **Type**: backend
    **Depends on**: 1.1, 1.2
    **Files**: backend/product-service/src/routes/products.ts
    **Description**: GET /api/products Express route handler parses and validates query params. Backward compatible — existing calls without search params work as before.
    **Acceptance Criteria**:
    - Existing behavior preserved when no search params passed
    - Response includes total, page, page_size, total_pages
    - Tests pass: backward compatibility, full integration test

  - [ ] 1.4 - Add database indexes for search performance
    **Type**: database
    **Depends on**: 1.2
    **Files**: backend/product-service/src/database.ts
    **Description**: Add CREATE INDEX statements for products.title (text search), composite (category_id, price), and products.price (range queries).
    **Acceptance Criteria**:
    - Indexes created in migration
    - Query plan shows index usage for common patterns
    - Tests pass: p95 response under 200ms with 2K products

- [ ] 2.0 - Frontend filter components
  - [ ] 2.1 - Build search text input with debounce
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/SearchInput.vue, frontend/__tests__/SearchInput.test.ts
    **Description**: Text input with search icon and clear button. 300ms debounce before triggering search. Accessible with proper aria-label.
    **Acceptance Criteria**:
    - 300ms debounce fires after no input
    - Clear button resets input and triggers search
    - Tests pass: debounce timing, clear button, accessibility

  - [ ] 2.2 - Build category multi-select filter
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/CategoryFilter.vue
    **Description**: Dropdown with checkboxes for each category. Selected count shown on collapsed state. Categories fetched from API.
    **Acceptance Criteria**:
    - Renders categories as checkboxes
    - Shows selected count (e.g. "Categories (3)")
    - Tests pass: selection/deselection, empty category list

  - [ ] 2.3 - Build price range filter
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/PriceRangeFilter.vue
    **Description**: Two number inputs (min/max). Client-side validation: min <= max, no negatives. Visual error state if min > max.
    **Acceptance Criteria**:
    - Valid range accepted
    - Invalid range (min > max) shows error state
    - Tests pass: valid range, invalid range, negative prevention

  - [ ] 2.4 - Build sort dropdown and seller rating filter
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/components/SortDropdown.vue
    **Description**: Sort single-select with all 6 options (default: Relevance). Seller rating star-based selector (1-5). Both trigger immediate re-fetch.
    **Acceptance Criteria**:
    - Sort defaults to Relevance
    - Rating selector sets minimum threshold
    - Tests pass: sort changes, rating selection

- [ ] 3.0 - URL sync and state management
  - [ ] 3.1 - Implement useProductFilters composable
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/composables/useProductFilters.ts, frontend/__tests__/useProductFilters.test.ts
    **Description**: Composable reads filters from useRoute query params, setFilters updates URL via useRouter. clearFilters removes all. Handles camelCase-to-snake_case conversion.
    **Acceptance Criteria**:
    - Reads and writes all filter types (string, number, array, enum)
    - clearFilters resets all params
    - Tests pass: each param type, mocked router

  - [ ] 3.2 - Connect filter components to URL state
    **Type**: frontend
    **Depends on**: 2.1, 2.2, 2.3, 2.4, 3.1
    **Files**: frontend/pages/products.vue
    **Description**: Each filter reads initial value from URL and calls setFilters on change. URL is single source of truth — no duplicate state.
    **Acceptance Criteria**:
    - Filters populated from URL on page load
    - Filter changes update URL
    - Tests pass: URL → filters, filters → URL

- [ ] 4.0 - Product list integration
  - [ ] 4.1 - Wire product grid to search API
    **Type**: frontend
    **Depends on**: 1.3, 3.1
    **Files**: frontend/pages/products.vue
    **Description**: Fetch from /api/products with current filters using useFetch or $fetch. Auto re-fetch on URL param change via watch. AbortController cancels previous request on param change.
    **Acceptance Criteria**:
    - Fetches with current filter params
    - Stale requests cancelled on rapid filter changes
    - Tests pass: mocked API, request cancellation, error state

  - [ ] 4.2 - Build empty and loading states
    **Type**: frontend
    **Depends on**: none
    **Files**: frontend/pages/products.vue
    **Description**: Loading skeleton matching product card layout. Empty state with "No products found" and "Clear filters" CTA. Error state with retry.
    **Acceptance Criteria**:
    - Loading skeleton visible during fetch
    - Empty state includes clear filters CTA
    - Tests pass: snapshot for each state, clear CTA calls clearFilters

- [ ] 5.0 - Responsive layout and polish
  - [ ] 5.1 - Desktop and tablet filter layout
    **Type**: frontend
    **Depends on**: 2.0, 4.0
    **Files**: frontend/pages/products.vue
    **Description**: Desktop (>1024px): sticky sidebar 280px. Tablet (768-1024px): collapsible panel with toggle.
    **Acceptance Criteria**:
    - Sidebar sticky on desktop
    - Collapsible on tablet
    - Tests pass: visual at desktop and tablet widths

  - [ ] 5.2 - Mobile filter bottom sheet
    **Type**: frontend
    **Depends on**: 2.0
    **Files**: frontend/pages/products.vue
    **Description**: "Filters" button with active count badge. Bottom sheet with all filter controls. "Apply" closes and updates URL. "Reset" clears all.
    **Acceptance Criteria**:
    - Sheet opens/closes
    - Apply updates URL
    - Reset clears all filters
    - Tests pass: open/close, apply, reset

---

## Common Mistakes

### PRD Mistakes
- **Over-engineering search**: Specifying Elasticsearch when PostgreSQL ILIKE is sufficient for 2K-50K products.
- **Missing backward compatibility**: Not preserving existing GET /api/products behavior when no search params passed.
- **Ignoring mobile**: Writing PRD from desktop perspective only. 60% of traffic is mobile.
- **Vague performance requirements**: "Should be fast" instead of p95 < 200ms.
- **Missing edge cases for filter combinations**: Only considering filters individually.

### Task Breakdown Mistakes
- **Backend as one giant task**: Search API needs separate subtasks for models, query builder, endpoint wiring, and indexing.
- **Frontend too coupled to backend**: Filter components can be built with mock data while backend is in progress.
- **Missing URL sync task**: URL synchronization is its own concern with its own edge cases.
- **No performance task**: Database indexing often gets forgotten until QA.
- **Wrong dependency ordering**: Responsive layout doesn't depend on API.

### Red Flags for Instructors
- Engineer specifies Elasticsearch (scope creep)
- Task breakdown has fewer than 3 parent tasks (too coarse)
- No mention of debouncing or request cancellation
- Filter components are a single task (needs decomposition)
- No test requirements anywhere
- Backend tasks don't mention database indexes
- All tasks listed as "low complexity" (underestimation)

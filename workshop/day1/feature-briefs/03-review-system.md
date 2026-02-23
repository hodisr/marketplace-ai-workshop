# Feature Brief: Review and Rating System

## Product Context

Our marketplace has no way for buyers to share feedback on products or sellers. This is a trust problem — buyers hesitate to purchase from unknown sellers, and good sellers have no way to build reputation. A review system is one of the highest-impact features we can build for marketplace health. It needs to be trustworthy (only verified buyers can review), fair (sellers can respond), and useful (reviews affect search ranking).

## What We're Building

- **Star rating** — 1-5 stars, required with every review
- **Text review** — optional written review (min 10 chars, max 2000 chars)
- **Photo upload** — buyers can attach up to 3 photos to a review
- **Seller response** — sellers can post one response per review (text only, no rating)
- **Review moderation** — basic automated checks (profanity filter, spam detection) + manual moderation queue for flagged reviews
- **Product rating aggregation** — average rating and rating distribution displayed on product pages
- **Review display** — sorted by most recent, with option to filter by star count
- **Review impact on search** — products with higher average ratings should rank higher in search results (ties broken by review count)

## Constraints & Considerations

- One review per buyer per product (based on completed orders only — must have purchased the product)
- Buyers can edit their review within 48 hours of posting, after that it's locked
- Deleting a review is always allowed (soft delete — data retained for moderation)
- Reviews must display the buyer's display name (not email) — if no display name, show "Verified Buyer"
- Photo uploads: max 5MB per image, JPEG/PNG only, stored in existing S3 bucket
- Rating aggregation must update when reviews are added/edited/deleted — don't let it drift
- A product with 0 reviews should show "No reviews yet" — not 0 stars
- The moderation queue is for marketplace admins, not sellers

## Personas Affected

- **Buyers** — can now make informed purchase decisions based on community feedback. Can share their experience.
- **Sellers** — build reputation through positive reviews. Can respond to negative feedback constructively.
- **Marketplace admins** — responsible for moderating flagged reviews, resolving disputes.

---

*Exercise: Generate a PRD from this brief, then break it into implementable tasks.*

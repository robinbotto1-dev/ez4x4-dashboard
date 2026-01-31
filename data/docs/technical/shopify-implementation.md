# EZ4X4 Shopify Implementation Guide

*Apps and settings to implement the strategy*

---

## Priority 1: Must-Have Apps

### 1. YMM Vehicle Selector (CRITICAL)

**Why:** Every competitor has this. Biggest conversion opportunity.

**Recommended Apps:**

**Option A: Searchanise** ⭐ Recommended
- Price: $19-59/mo
- Features: Smart search + filtering by year/make/model
- Pros: Clean UI, fast, good support
- Setup: 1-2 hours

**Option B: Instant Search+**
- Price: $19-99/mo
- Features: Autocomplete, filters, analytics
- Pros: More customization
- Setup: 2-3 hours

**Option C: Custom Development**
- Price: $500-2,000 one-time
- Pros: Exact fit for your needs
- Cons: More expensive, needs maintenance

**Implementation Steps:**
1. Export product catalog with vehicle compatibility data
2. Install app and configure filters
3. Add vehicle selector to homepage hero
4. Test all vehicle combinations
5. Monitor search analytics

---

### 2. Reviews App

**Why:** Social proof on product pages and homepage

**Recommended Apps:**

**Option A: Judge.me** ⭐ Recommended
- Price: Free - $15/mo
- Features: Review collection, display, photos, Q&A
- Pros: Great free tier, easy setup
- Setup: 30 minutes

**Option B: Loox**
- Price: $9.99-299/mo
- Features: Photo reviews, referral program
- Pros: Beautiful visual reviews
- Setup: 30 minutes

**Option C: Stamped.io**
- Price: $19-149/mo
- Features: Reviews, loyalty, referrals
- Pros: All-in-one platform
- Setup: 1 hour

**Implementation Steps:**
1. Install app
2. Configure review request emails (send 7 days after delivery)
3. Import any existing reviews
4. Add review widget to product pages
5. Add review carousel to homepage
6. Set up review incentive (discount for photo reviews)

---

### 3. Email Marketing (Klaviyo)

**Why:** Already industry standard for Shopify. Powers all email templates I created.

**App: Klaviyo**
- Price: Free up to 250 contacts, then ~$20-45/mo
- Features: Flows, segments, SMS, analytics

**Implementation Steps:**
1. Install Klaviyo
2. Connect to Shopify (automatic sync)
3. Import email templates from `/ez4x4-assets/email-templates.md`
4. Set up flows:
   - Welcome series (3 emails)
   - Abandoned cart (2 emails)
   - Post-purchase (3 emails)
   - Win-back (90 days inactive)
5. Create signup popup (10% off first order)
6. Test all flows

---

## Priority 2: Conversion Optimization

### 4. Announcement Bar

**Why:** Sitewide discount code visibility

**Options:**

**Free Option: Theme Settings**
- Most Shopify themes have built-in announcement bar
- Go to: Online Store > Themes > Customize > Header

**App Option: Essential Free Shipping Bar**
- Price: Free
- Features: Progress bar, multiple messages, targeting

**Implementation:**
1. Create discount code in Shopify Admin > Discounts
2. Add to announcement bar: "10% OFF - CODE: WELCOME10 | FREE SHIPPING OVER $150"
3. Make it sticky (stays on scroll)

---

### 5. Live Chat

**Why:** Captures leads, answers questions, reduces cart abandonment

**Recommended Apps:**

**Option A: Tidio** ⭐ Recommended
- Price: Free - $29/mo
- Features: Live chat, chatbots, email
- Pros: Great free tier, mobile app
- Setup: 15 minutes

**Option B: Gorgias**
- Price: $10-750/mo
- Features: Help desk, chat, social
- Pros: Full customer service platform
- Cons: More expensive

**Implementation:**
1. Install Tidio
2. Set business hours (when you'll respond live)
3. Create automated responses for common questions:
   - "What's your return policy?"
   - "How long does shipping take?"
   - "Will this fit my [vehicle]?"
4. Download mobile app for notifications

---

### 6. Bundles App

**Why:** Increase AOV with product bundles

**Recommended Apps:**

**Option A: Bundler** ⭐ Recommended
- Price: Free - $9.99/mo
- Features: Classic bundles, mix & match
- Pros: Simple, effective
- Setup: 30 minutes

**Option B: Bold Bundles**
- Price: $19.99/mo
- Features: More customization
- Pros: More features
- Setup: 1 hour

**Implementation:**
1. Create bundles based on sales data:
   - "Bronco 4D Starter Kit" (Panel carrier + tie-downs)
   - "Overlander Pack" (Bed rack + cargo net)
   - "Jeep Essential Kit" (Based on top Jeep sellers)
2. Set bundle discount (10-15% off)
3. Add bundles to homepage
4. Create "Bundle Deals" collection

---

## Priority 3: Growth & Retention

### 7. Affiliate/Referral Program

**Why:** You have affiliates but need better management

**Recommended Apps:**

**Option A: Refersion**
- Price: $89-249/mo
- Features: Full affiliate management, tracking, payouts
- Pros: Industry standard
- Setup: 2-3 hours

**Option B: UpPromote**
- Price: Free - $21.99/mo
- Features: Affiliate + referral
- Pros: More affordable
- Setup: 1-2 hours

**Implementation:**
1. Install app
2. Set commission structure (10-15% suggested)
3. Create affiliate signup page
4. Import existing affiliates
5. Provide marketing materials
6. Set up monthly payout process

---

### 8. Loyalty/Rewards

**Why:** Increase repeat purchases

**Recommended Apps:**

**Option A: Smile.io** ⭐ Recommended
- Price: Free - $49/mo
- Features: Points, referrals, VIP tiers
- Pros: Easy setup, customer-facing
- Setup: 1 hour

**Option B: LoyaltyLion**
- Price: $159-399/mo
- Features: More customization
- Pros: More features
- Cons: Expensive

**Implementation (if pursue):**
1. Points system: $1 spent = 1 point, 100 points = $5 off
2. Bonus points for reviews, referrals
3. VIP tiers for repeat customers

---

## Priority 4: Operations

### 9. Order Tracking

**Why:** Reduces "where's my order" support tickets

**Recommended Apps:**

**Option A: AfterShip**
- Price: Free - $9/mo
- Features: Tracking page, notifications
- Pros: Industry standard
- Setup: 30 minutes

**Implementation:**
1. Install AfterShip
2. Create branded tracking page
3. Add tracking link to order confirmation emails
4. Add "Track Order" to site header/footer

---

### 10. Returns Management

**Why:** Professional returns process

**Recommended Apps:**

**Option A: Loop Returns**
- Price: $29-179/mo
- Features: Self-service returns, exchanges
- Pros: Great customer experience

**Option B: Return Magic**
- Price: Free - $10/mo
- Features: Automated returns
- Pros: Affordable

**Implementation:**
1. Install app
2. Set return policy (30 days suggested)
3. Create self-service return portal
4. Link from footer and order emails

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Install Klaviyo, set up email flows
- [ ] Add announcement bar with discount code
- [ ] Install Judge.me, configure reviews

### Week 2: Conversion
- [ ] Install YMM selector app
- [ ] Set up vehicle filtering
- [ ] Add review carousel to homepage

### Week 3: Growth
- [ ] Install Tidio live chat
- [ ] Create bundles in Bundler
- [ ] Add "Bundle Deals" section

### Week 4: Optimization
- [ ] Install AfterShip tracking
- [ ] Review analytics
- [ ] Iterate based on data

---

## Shopify Settings to Update

### General Settings
- [ ] Update store policies (returns, shipping, privacy)
- [ ] Configure shipping rates (free over $150)
- [ ] Set up tax settings

### Checkout Settings
- [ ] Enable guest checkout
- [ ] Add trust badges
- [ ] Configure order confirmation emails

### Theme Settings
- [ ] Add announcement bar
- [ ] Enable sticky header
- [ ] Add related products to product pages
- [ ] Configure homepage sections

---

## Budget Summary

| App | Monthly Cost | Priority |
|-----|--------------|----------|
| Klaviyo | $0-45 | Must-have |
| Judge.me | $0-15 | Must-have |
| Searchanise (YMM) | $19-59 | Must-have |
| Tidio | $0-29 | High |
| Bundler | $0-10 | High |
| AfterShip | $0-9 | Medium |
| **Total** | **$19-167/mo** | |

Most core functionality can be achieved for ~$50-75/month.

---

*Implementation guide ready for execution*

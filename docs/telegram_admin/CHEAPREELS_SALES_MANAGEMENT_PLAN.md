# CHEAPREELS.IN — SALES COMMAND CENTER & REVENUE INTELLIGENCE PLAN
**Document ID:** CHEAPREELS-SALES-005  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. SALES METRICS FORMULATION & STRICT CALCULATION RULES

All metrics operate strictly on the authoritative database records (`store_config.json` -> `orders` array). No simulated, estimated, or fabricated numbers are ever permitted.

### 1.1 Revenue Calculations
* **Gross Revenue:**
  $$\text{Gross Revenue} = \sum_{o \in \text{Orders}_{\text{verified}}} \text{order.total}$$
* **Net Revenue:**
  $$\text{Net Revenue} = \text{Gross Revenue} - \sum \text{Refunds}$$
  *(Note: Since digital reel downloads have a standard no-refund policy unless disputed, Net Revenue equals Gross Revenue unless a specific refund status is recorded).*
* **International Dollar Revenue (PayPal):**
  $$\text{USD Revenue} = \sum_{o \in \text{Orders}_{\text{verified, gateway=PayPal}}} (\text{order.usdAmount} \lor \text{order.total})$$
* **Domestic Rupee Revenue (Cashfree / UPI / Razorpay):**
  $$\text{INR Revenue} = \sum_{o \in \text{Orders}_{\text{verified, gateway}\neq\text{PayPal}}} \text{order.total}$$

### 1.2 Event Deduplication Rules
To prevent duplicate sales counts from client network retries or repeated webhook pings:
1. Every order has a primary key: `order.id` (e.g. `CR-XXXXXX`).
2. Every transaction has a unique gateway reference: `order.utr` / `order.paymentId`.
3. If an incoming transaction matches an existing `id` or `utr`, it is merged and never counted as an additional sale.
4. Demo/test orders matching IDs in `['CR-588086', 'CR-166465', 'CRS-979962', 'CR-137840']` or test names (`'Test User'`, `'Rohan Verma'`) are filtered out from all financial analytics.

### 1.3 Key Performance Indicators (KPIs)
* **Average Order Value (AOV):**
  $$\text{AOV} = \frac{\text{Total Verified Revenue}}{\text{Total Verified Orders}}$$
* **Checkout Conversion Rate:**
  $$\text{Conversion Rate} = \frac{\text{Total Verified Orders}}{\text{Total Checkout Visits (Leads)}} \times 100$$
* **Payment Gateway Success Rate:**
  $$\text{PG Success Rate} = \frac{\text{Total Paid Orders}}{\text{Total Checkout Sessions Created}} \times 100$$

---

## 2. SALES REPORTING TIME WINDOWS

The Telegram Sales Command Center provides on-demand time slices:

1. **Today (`/today`):** 12:00 AM IST to Current Time IST.
2. **Yesterday:** Previous calendar day (12:00 AM to 11:59 PM IST).
3. **Last 7 Days:** Trailing 7 consecutive 24-hour periods with day-by-day comparison.
4. **This Month:** 1st day of current month to today.
5. **Last Month:** Full prior calendar month.
6. **All-Time:** Entire ledger history since store inception.

---

## 3. HOURLY SALES TREND VISUALIZATION

For high-volume sale days (e.g., ad campaigns), Telegram renders ASCII bar graphs directly in chat:

```
📊 TODAY'S HOURLY SALES DISTRIBUTION (IST)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10 AM - 12 PM: █░░░░░░░░░ ₹145 (5)
12 PM - 02 PM: ████░░░░░░ ₹380 (11)
02 PM - 04 PM: ████████░░ ₹780 (24)
04 PM - 06 PM: ██████████ ₹980 (31)
06 PM - 08 PM: ██████░░░░ ₹590 (18)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Peak Hour: 04:00 PM – 05:00 PM (19 Sales)
```

---

## 4. BEST-SELLING PRODUCTS LEADERBOARD

Telegram command `/top` extracts item frequencies from all verified orders:
1. Rank #1: Title, Total Units Sold, Total Revenue Generated, % of Store Sales.
2. Rank #2: Title, Units, Revenue.
3. Rank #3: Title, Units, Revenue.
...down to lowest 5 performing bundles (for clearance or bundling opportunities).

---

## 5. CSV EXPORT ENGINE

Admin can tap `[📥 Download Sales CSV]` to receive an on-the-fly generated `.csv` file sent directly into their Telegram chat:
* Columns: `Order_ID`, `Date_IST`, `Customer_Name`, `Phone`, `Email`, `State`, `City`, `Gateway`, `Amount_INR`, `Amount_USD`, `Payment_Ref`, `Status`, `Bundles_Count`.
* Compatible with Excel, Google Sheets, and accounting software.

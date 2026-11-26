# CHEAPREELS.IN — EXISTING ADMIN PANEL & CODEBASE AUDIT REPORT
**Document ID:** CHEAPREELS-AUDIT-001  
**Project:** CheapReels.in E-Commerce Storefront  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer  
**Status:** COMPLETE & VERIFIED

---

## 1. ARCHITECTURAL OVERVIEW

### 1.1 Technology Stack
* **Frontend:** React 19 SPA, Tailwind CSS v4, Lucide React Icons, Canvas Confetti, QRCodeSVG.
* **Build System:** Rolldown-powered Vite 8 with automated XML sitemap generation.
* **Serverless Backend:** Vercel Node.js Serverless Functions (`/api/sync`, `/api/cashfree`, `/api/paypal`, `/api/video`, `/api/indexnow`).
* **Database & Single Source of Truth:** GitHub Repository-backed persistent central JSON vault (`public/data/store_config.json`) with dual-repository mirroring (`diamondplus07xyz-lab/cheapreels` and `diamondplus07xyz-lab/digibundle`).
* **State Management & Caching:** Browser LocalStorage caches (`cheap_reels_bundles_v8`, `cheap_reels_orders`, `cheap_reels_activity_logs`, `cheap_reels_real_visitors_v3`) synchronized reactively via `realtimeSync.js` with exponential backoff and central SHA-256 authenticated synchronization.
* **Payment Gateways:**
  1. Cashfree PG v2023-08-01 (API App ID & Secret Key with redirect and modal support).
  2. PayPal v2 REST API (Client ID `BAAL...` & Secret `ED0O...` with direct 1:1 USD pricing).
  3. Direct UPI QR Code (Dynamic URI generation with UTR verification).
  4. Razorpay (Infrastructure configured).
* **Notification System:** Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/sendMessage`) sending instant alerts for new customer sales and high-intent checkout visits.

---

## 2. EXISTING ADMIN PANEL INVENTORY

The existing Admin Panel is implemented in `src/components/AdminModal.jsx` (5,384 lines of production code) protected by Cryptographic Zero-Knowledge Route Vault (SHA-256 passcode hash check with decoy route on `/admin`).

### Tab 1: Products & Reels Bundles (`bundles`)
* **Data Source:** `bundles` array (126 production bundles, indexed by unique ID e.g., `bundle-1`, `bundle-mot-1`, `bundle-fitness-1`).
* **Operations & Buttons:**
  1. *Add New Bundle:* Full modal creating bundle title, category, clipCount, price, originalPrice, thumbnail URL, demo video preview URL, Google Drive folder URL.
  2. *Edit Bundle:* In-place editing of title, price, original price, clip count, category, thumbnail, video preview, Drive link.
  3. *Delete Bundle:* Removes bundle from catalog with confirmation.
  4. *Clone Bundle:* Instant duplicate generator for fast variants.
  5. *Category Filtering:* Filter 126 bundles across 14 categories (AI Avatars, Motivation, Fitness, Sanatan, Gym, Memes, Tech, Anime, Stock Market, Luxury Cars, Luxury Lifestyle, Islamic Status, Gaming Edits, Devotional).
  6. *Search Bar:* Real-time title and ID search filter.
  7. *Export JSON:* Downloads `bundles_backup.json` to local disk.
  8. *Import / Bulk Upload JSON:* Validates schema and overwrites or merges bundles catalog.
  9. *Reorder / Sort:* Drag or index sorting by popularity, price, or recency.

### Tab 2: Orders Management (`orders`)
* **Data Source:** `orders` array stored centrally in `store_config.json` and mirrored in client `cheap_reels_orders`.
* **Fields Captured:**
  * Order ID (`CR-XXXXXX` / `CRS-XXXXXX`)
  * Customer Name (`name`)
  * WhatsApp Phone (`whatsapp` 10 digits)
  * Email Address (`email`)
  * State (`state`) & City (`city`)
  * Total Amount (`total` in INR & USD for PayPal)
  * Gateway (`Cashfree`, `PayPal`, `upi_qr`, `Razorpay`)
  * Payment Identifier / UTR Reference (`utr`, `paymentId`)
  * Verification Status (`VERIFIED` vs `PENDING_VERIFICATION`)
  * Drive Link Unlock Status (`driveLinkUnlocked: true|false`)
  * Timestamp (`date`)
  * Purchased Bundle Items list (`items` with titles, prices, and drive links)
* **Operations & Buttons:**
  1. *Verify & Unlock Drive Link:* Toggles pending UPI QR order into verified and unlocks Drive link instantly.
  2. *Revoke / Lock Access:* Toggles order to pending if fraud or chargeback occurs.
  3. *Delete Order:* Removes test or disputed records.
  4. *Filter by Gateway:* All, Cashfree, PayPal, UPI QR, Razorpay.
  5. *Filter by Status:* Verified vs Pending.
  6. *Search Orders:* Search by customer name, phone, email, UTR, or order ID.
  7. *Export Orders CSV / JSON:* Export entire customer and sales ledger.

### Tab 3: Announcement Bar (`announcement`)
* **Fields:**
  * Enabled toggle (`announcement.enabled`)
  * Banner Text (`announcement.text`)
  * Highlight Badge Text (`announcement.badge`)
  * Target Link URL (`announcement.link`)
  * Background Color / Gradient Theme (`announcement.bg`)
* **Operations:** Live save to central database, instant frontend broadcast.

### Tab 4: Special Deal / Mega Bundle Offer (`offer`)
* **Fields:**
  * Enabled toggle (`specialOffer.enabled`)
  * Badge Text (`specialOffer.badge`, e.g. "EXCLUSIVE DEAL")
  * Offer Title (`specialOffer.title`)
  * Subtitle (`specialOffer.subtitle`)
  * Offer Price (`specialOffer.price`) & Original Price (`specialOffer.originalPrice`)
  * Thumbnail URL (`specialOffer.thumbnail`)
  * Feature Bullets (`specialOffer.features` array)
  * Dedicated Drive Links (`specialOffer.driveLinks` multi-part Google Drive URLs)
* **Operations:** Live toggle on homepage below header.

### Tab 5: Maintenance Mode (`maintenance`)
* **Fields:**
  * Active toggle (`maintenanceMode: true|false`)
  * Maintenance Message (`maintenanceMessage`)
  * Estimated Uptime / Countdown
  * Emergency Admin Passcode Bypass
* **Operations:** Locks customer storefront with high-converting countdown screen while admin retains full access.

### Tab 6: Google Analytics 4 (`analytics`)
* **Fields:** `googleAnalyticsId` (e.g. `G-XXXXXXXXXX`).
* **Operations:** Injects Google Analytics script dynamically into `<head>` without rebuild.

### Tab 7: Telegram Alerts Configuration (`telegram`)
* **Fields:**
  * Enabled toggle (`telegramAlerts.enabled`)
  * Bot Token (`telegramAlerts.botToken`) — Currently active BotFather token
  * Chat ID (`telegramAlerts.chatId`) — Currently authorized numeric Chat ID (`5151255259`)
  * Notify on New Sale toggle (`telegramAlerts.notifyOnSale`)
  * Notify on Checkout Intent Lead toggle (`telegramAlerts.notifyOnCheckout`)
* **Operations:** Live connection test button ("Send Test Alert"), instant configuration update.

### Tab 8: Traffic Analytics & Real Visitors (`visitors`)
* **Data Captured:**
  * `totalViews`, `uniqueVisitors`, `mobileVisits`, `desktopVisits`
  * `knownIps` array (deduplication)
  * `recentVisits` list (IP, Device, Location, Page, Timestamp, repeat visit status)
* **Operations:** Real-time visual traffic graph, device distribution pie chart, clear visitor logs.

### Tab 9: Store Branding & Security (`branding`)
* **Fields:**
  * Store Name (`storeName`)
  * Customer Support WhatsApp Number (`whatsappNumber`)
  * Support Email Address (`supportEmail`)
  * Store Logo URL (`logo`)
  * Store Favicon URL (`favicon`)
  * Admin Passcode SHA-256 Vault (`adminPasscodeHash`)
* **Operations:** Updates brand identity across all customer footers, invoices, and modals.

### Tab 10: Payment Gateways Settings (`gateways`)
* **Fields:**
  * Gateway Mode: `single` (one active at a time) vs `multiple` (multi-gateway selector)
  * Active Gateway: `cashfree` | `paypal` | `upi_qr` | `razorpay`
  * Enabled Gateways list: `["cashfree", "paypal", "upi_qr"]`
  * Cashfree App ID, Secret Key, Environment (`production` vs `sandbox`)
  * PayPal Client ID, Secret Key, Mode (`live` vs `sandbox`), 1:1 Dollar Mode
  * UPI ID, Payee Name
  * Razorpay Key ID, Key Secret
* **Operations:** Instant gateway failover and credential updating.

### Tab 11: System Activity Audit Logs (`logs`)
* **Data Captured:**
  * Log ID, Timestamp, Category (`PRODUCT`, `ORDER`, `GATEWAYS`, `SETTINGS`, `SECURITY`)
  * Actor Type (`Admin`, `Customer`, `System`)
  * Event Name, Action Title, Detailed Description
  * Target Entity ID, Status (`Success`, `Warning`, `Error`)
* **Operations:** Search logs, filter by category, export audit trail, clear historical logs.

### Tab 12: Google Play Console Publisher (`playstore`)
* **Fields:** Package Name, App Version, SHA-256 AssetLinks fingerprints for TWA deployment.

### Tab 13: Google Search Console & SEO Manager (`searchconsole`)
* **Fields:** Verification Meta Tag (`52iB3jq7O_...`), Sitemap XML URL, IndexNow Ping status.

### Tab 14: Active Sessions & Security Guard (`sessions`)
* **Data Captured:** Current Device Session, IP, Browser Fingerprint, Active Token.
* **Operations:** Revoke session, force logout remote devices.

---

## 3. IDENTIFIED TELEGRAM CONTROL INTEGRATION POINTS

| Admin Tab | Backend Data Location | Telegram Command / Interface | Technical Readiness |
| :--- | :--- | :--- | :--- |
| **Bundles** | `public/data/store_config.json` -> `bundles` | `/bundles`, `/bundle_edit`, `/bundle_add` | 100% Ready (via `/api/sync`) |
| **Orders** | `public/data/store_config.json` -> `orders` | `/orders`, `/order_verify`, `/order_search` | 100% Ready (via `/api/sync`) |
| **Sales** | Real-time aggregate on `orders` array | `/sales`, `/today`, `/analytics` | 100% Ready (Calculated in Serverless Webhook) |
| **Customers** | Extracted from `orders` customer fields | `/customers`, `/customer_search` | 100% Ready |
| **Announcement**| `store_config.json` -> `announcement` | `/announcement`, `/banner_toggle` | 100% Ready |
| **Special Offer**| `store_config.json` -> `specialOffer` | `/offer`, `/offer_toggle`, `/offer_price` | 100% Ready |
| **Maintenance** | `store_config.json` -> `maintenanceMode`| `/maintenance_on`, `/maintenance_off` | 100% Ready (Emergency killswitch) |
| **Gateways** | `store_config.json` -> payment configs | `/gateways`, `/gateway_toggle` | 100% Ready |
| **Visitors** | `store_config.json` -> `visitorStats` | `/traffic`, `/live_visitors` | 100% Ready |
| **Audit Logs** | `store_config.json` -> `activityLogs` | `/audit_logs`, `/recent_activity` | 100% Ready |
| **Security** | Numeric Telegram ID `5151255259` check | Auth Gatekeeper Middleware | 100% Ready |

---

## 4. ARCHITECTURAL CONCLUSION
CheapReels.in is already architected with a centralized, decoupled JSON database (`store_config.json`) and atomic Serverless APIs. The Telegram Admin Operating System can be built seamlessly as a **Vercel Serverless Webhook function (`/api/telegram-webhook.js`)** without any separate database, zero third-party paid APIs, and zero disruption to the live storefront.

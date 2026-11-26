# CHEAPREELS.IN — FEATURE PARITY MATRIX
## Existing Web Admin Panel vs. Telegram Admin Operating System
**Document ID:** CHEAPREELS-PARITY-002  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. COMPREHENSIVE FEATURE-BY-FEATURE PARITY TABLE

| # | Existing Admin Panel Feature | Telegram Interface Equivalent | Backend API / Endpoint | Database Mutation Target | Synchronization Behaviour | Complexity |
|---|-----------------------------|------------------------------|------------------------|--------------------------|---------------------------|------------|
| **1.1** | View All 126 Bundles | Inline Keyboard Paginated List (`/bundles`) | `GET /api/sync` | `bundles` array | Reads cached central JSON | Low |
| **1.2** | Search Bundles by Title | Quick Search (`/search <query>`) | `GET /api/sync` | `bundles` search filter | In-memory search & return cards | Low |
| **1.3** | View Bundle Details & Drive Link | Telegram Info Card with Direct Link Button | `GET /api/sync` | `bundles[id]` | Immediate display with preview | Low |
| **1.4** | Edit Bundle Price | Guided Bot Step: Enter New Price | `POST /api/sync` | `bundles[id].price` | Commits to GitHub, invalidates cache | Medium |
| **1.5** | Edit Bundle Title & Description | Guided Bot Step: Enter New Title | `POST /api/sync` | `bundles[id].title` | Commits to GitHub, invalidates cache | Medium |
| **1.6** | Edit Bundle Google Drive Link | Guided Bot Step: Send New Drive Link | `POST /api/sync` | `bundles[id].driveLink` | Real-time update to customer delivery | Medium |
| **1.7** | Edit Bundle Demo Video Preview | Guided Bot Step: Send Video Link | `POST /api/sync` | `bundles[id].videoPreview`| Immediately updates video modal | Medium |
| **1.8** | Edit Bundle Thumbnail Image | Send Photo in Telegram or Image URL | `POST /api/sync` | `bundles[id].thumbnail` | Updates catalog image on website | Medium |
| **1.9** | Add New Bundle | Multi-step interactive bot conversation | `POST /api/sync` | `bundles.push(newBundle)` | Validates schema, pushes to GitHub | High |
| **1.10**| Delete / Archive Bundle | Action Button with confirmation dialog | `POST /api/sync` | `bundles.filter(b => b.id !== id)` | Removes from catalog with undo | Medium |
| **2.1** | View All Recent Orders | Paginated Orders Feed (`/orders`) | `GET /api/sync` | `orders` array | Real-time query | Low |
| **2.2** | Search Orders (Name/Phone/UTR) | Command search (`/order <query>`) | `GET /api/sync` | `orders` filter | Instant order match card | Low |
| **2.3** | View Full Order & Customer Details | Telegram Rich Order Card | `GET /api/sync` | `orders[id]` | Displays items, total, UTR, location | Low |
| **2.4** | Manually Verify UPI Payment | Inline Button: `[✅ Verify & Unlock]` | `POST /api/sync` | `orders[id].status = 'VERIFIED'` | Unlocks Drive link for customer live | Medium |
| **2.5** | Revoke / Lock Order Access | Inline Button: `[🔒 Revoke Access]` | `POST /api/sync` | `orders[id].driveLinkUnlocked = false`| Blocks Drive access immediately | Medium |
| **2.6** | Delete / Discard Test Order | Inline Button: `[🗑 Delete Order]` | `POST /api/sync` | `orders.filter(o => o.id !== id)` | Removes from sales ledger | Medium |
| **2.7** | Filter Orders by Gateway | Inline Filters: `[UPI]` `[Cashfree]` `[PayPal]` | `GET /api/sync` | In-memory filter on `orders` | Filters list by gateway type | Low |
| **3.1** | View Today's Real-Time Sales | Command: `/today` or `/sales` | `GET /api/sync` | Sum of today's verified orders | Dynamic aggregate calculated in API | Low |
| **3.2** | View 7-Day & 30-Day Revenue | Inline Analytics Menu | `GET /api/sync` | Sum of date-window orders | Real-time breakdown & comparisons | Low |
| **3.3** | Average Order Value (AOV) | Auto-calculated metric on `/sales` | `GET /api/sync` | `totalRevenue / totalOrders` | Displayed on sales dashboard | Low |
| **3.4** | Payment Gateway Distribution | Gateway Breakdown Graph / Bar text | `GET /api/sync` | Percentage split by gateway | Cashfree vs PayPal vs UPI share | Low |
| **3.5** | Top Selling Bundles | Ranked list of popular bundles | `GET /api/sync` | Frequency count from `order.items` | Top 5 bundles by units & revenue | Low |
| **4.1** | Customer Directory & Search | Search customer by phone/email/name | `GET /api/sync` | Extracted from `orders` records | Unique customer profile card | Medium |
| **4.2** | Customer Purchase History | View all orders made by specific customer | `GET /api/sync` | `orders.filter(o => o.whatsapp === phone)`| List of past bundles & spend | Medium |
| **4.3** | 1-Click WhatsApp Support Link | Direct button: `[💬 Open WhatsApp Chat]` | N/A (Client-side URL)| `https://wa.me/91XXXXXXXXXX` | Opens customer WhatsApp directly | Low |
| **5.1** | Toggle Announcement Bar | Toggle Button: `[📢 Turn Banner ON/OFF]` | `POST /api/sync` | `announcement.enabled` | Instant banner toggle on live storefront | Low |
| **5.2** | Edit Announcement Text & Link | Guided step: Send new banner copy | `POST /api/sync` | `announcement.text`, `.link` | Pushes to GitHub, updates immediately | Medium |
| **6.1** | Toggle Special Offer Mega Deal | Toggle Button: `[🔥 Offer ON/OFF]` | `POST /api/sync` | `specialOffer.enabled` | Shows/hides hero deal banner | Low |
| **6.2** | Edit Special Offer Price | Enter new promo price (e.g., 199) | `POST /api/sync` | `specialOffer.price` | Updates special offer price | Medium |
| **6.3** | Edit Special Offer Drive Links | Enter new multi-part Drive URLs | `POST /api/sync` | `specialOffer.driveLinks` | Updates instant delivery folders | Medium |
| **7.1** | Emergency Maintenance Mode | Emergency Button: `[🚨 Toggle Maintenance]`| `POST /api/sync`| `maintenanceMode = true/false` | Locks storefront with countdown screen | Low |
| **8.1** | Switch Active Gateway | Gateway Selector: `[Cashfree]` `[PayPal]` `[UPI]`| `POST /api/sync`| `activeGateway`, `enabledGateways` | Switches live checkout gateway | Medium |
| **8.2** | Toggle Multi-Gateway Mode | Button: `[⚡ Toggle Multi-Gateway]` | `POST /api/sync` | `gatewayMode = 'multiple'/'single'` | Toggles multi-option checkout | Low |
| **8.3** | Update Cashfree / PayPal Keys | Secure Bot Dialog with secret masking | `POST /api/sync` | `cashfree`, `paypal` config objects | Securely saves to central backend | High |
| **9.1** | Live Traffic Snapshot | Command: `/traffic` | `GET /api/sync` | `visitorStats` object | Unique visitors, views, device breakdown | Low |
| **9.2** | View Recent Live Visitors | Inline List of latest 10 visitor hits | `GET /api/sync` | `visitorStats.recentVisits` | Shows IP, device type, location, page | Low |
| **10.1**| System Activity Audit Logs | Command: `/logs` or `/audit` | `GET /api/sync` | `activityLogs` array | Filterable timeline of all admin changes | Medium |
| **11.1**| Export All Data to Backup | Command: `/backup` or `/export` | `GET /api/sync` | Full JSON dump | Sends `.json` file attachment in Telegram | Medium |

---

## 2. PARITY SCORE SUMMARY
* **Total Features Evaluated:** 37
* **Full Direct Parity Possible via Telegram Inline Keyboards:** 35 (94.6%)
* **High-Complexity Guided Features (e.g. Full Product Creation):** 2 (5.4% — Supported via Step-by-Step State Machine or Telegram Web App)
* **Features Requiring Separate Duplicate Database:** **0 (0.0%)** — All operations execute against the same existing central database and backend!

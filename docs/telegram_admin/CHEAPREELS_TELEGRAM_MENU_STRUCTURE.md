# CHEAPREELS.IN — TELEGRAM ADMIN DASHBOARD & MENU SPECIFICATION
**Document ID:** CHEAPREELS-MENU-004  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. MAIN DASHBOARD (`/start` or `/dashboard`)

### Message Header
```
⚡ CHEAPREELS.IN — ADMIN COMMAND CENTER ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 Store Status: LIVE & OPERATIONAL
💰 Today's Revenue: ₹1,480 | 12 Orders
👥 Active Visitors: 8 Live Now
🔒 Security Guard: Active (ID: 5151255259)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose a management module below:
```

### Main Inline Keyboard Layout
```
[ 📦 Bundles (126) ]   [ 🛒 Orders (Ledger) ]
[ 💰 Sales Command ]   [ 👥 Customer Base   ]
[ 📢 Announcements ]   [ 🔥 Special Offer   ]
[ 💳 Gateways & PG ]   [ 📊 Traffic & Live  ]
[ 🚨 Maintenance   ]   [ 📜 Activity Logs   ]
[ 🔄 Refresh Data  ]   [ 📁 Export Backup   ]
```

---

## 2. MODULE SUB-MENUS & WORKFLOW SPECIFICATIONS

### 2.1 📦 Bundles Management Sub-Menu (`menu:bundles`)
* **Message Body:**
  ```
  📦 BUNDLES MANAGEMENT (126 Available)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Showing: Page 1 of 13 (Bundles 1–10)
  
  1. 2000+ PUBG BGMI Reels Bundle (₹149)
  2. 5000+ AI Avatar Mega Bundle (₹29)
  3. 3000+ Sanatan Dharma Status (₹39)
  ...
  ```
* **Inline Keyboard:**
  ```
  [ 🔍 Search Bundle ]   [ ➕ Add New Bundle ]
  [ ⬅️ Prev Page     ]   [ Next Page ➡️      ]
  [ 📂 Filter Category]   [ 🏷️ Bulk Price Edit]
  [ 🔙 Main Menu     ]
  ```

### 2.2 🛒 Orders Management Sub-Menu (`menu:orders`)
* **Message Body:**
  ```
  🛒 RECENT ORDERS FEED
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #CR-238414 • ₹149 • VERIFIED • John Miller • PUBG BGMI
  #CR-982104 • ₹39  • PENDING  • Amit Sharma • Sanatan
  #CR-120934 • ₹29  • VERIFIED • Rohit Kumar • AI Avatar
  ```
* **Inline Keyboard:**
  ```
  [ 🔍 Search Order  ]   [ ⏳ Pending UPI Only]
  [ ⬅️ Older Orders  ]   [ Newer Orders ➡️    ]
  [ 💳 Filter by PG  ]   [ 📥 Export Orders   ]
  [ 🔙 Main Menu     ]
  ```

### 2.3 Individual Order Inspection Card (`order:CR-238414`)
* **Message Body:**
  ```
  📦 ORDER #CR-238414
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👤 Customer: John Miller
  📱 WhatsApp: +91 9876543210
  📧 Email: john.miller@example.com
  📍 Location: Mumbai, Maharashtra
  
  💵 Total Amount: ₹149 (or $149 USD)
  💳 Payment Gateway: PayPal / Cashfree
  🔢 UTR / Txn Ref: PAYID-JOIRNTVC
  🟢 Status: VERIFIED & UNLOCKED
  ⏰ Placed: 26 Nov 2026, 02:08 PM
  
  🛍️ Items:
  • 2000+ PUBG BGMI Reels Bundle (₹149)
  📁 Drive: https://drive.google.com/drive/folders/...
  ```
* **Inline Keyboard:**
  ```
  [ 📂 Open Google Drive ]   [ 💬 WhatsApp Customer ]
  [ 🔒 Revoke Drive Link ]   [ 🗑 Delete Test Order ]
  [ 🔙 Back to Orders    ]
  ```

### 2.4 💰 Sales Command Center (`menu:sales`)
* **Message Body:**
  ```
  💰 SALES COMMAND CENTER & REVENUE INTELLIGENCE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📅 Today's Gross: ₹2,340 (18 Orders)
  📅 Yesterday:     ₹4,120 (32 Orders)
  📊 Last 7 Days:   ₹24,890 (194 Orders)
  📈 This Month:    ₹98,420 (780 Orders)
  
  💳 Gateway Breakdown:
  • Cashfree: 62% (₹1,450)
  • PayPal:   28% ($240 USD)
  • UPI QR:   10% (₹230)
  
  🏆 Top Selling:
  1. AI Avatar Motivational (48 Sales)
  2. PUBG BGMI Gaming (32 Sales)
  3. Sanatan Dharma Status (28 Sales)
  ```
* **Inline Keyboard:**
  ```
  [ 📅 Custom Date Filter ]   [ 📈 Hourly Trend   ]
  [ 📊 Gateway Share      ]   [ 📥 Download CSV   ]
  [ 🔙 Main Menu          ]
  ```

### 2.5 📢 Announcement Bar Controller (`menu:announcement`)
* **Message Body:**
  ```
  📢 TOP ANNOUNCEMENT BANNER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Status: 🟢 ACTIVE
  Badge: 🔥 MEGA SALE
  Text: "Get 2,50,000+ Reels with Lifetime Free Updates @ ₹29 Only!"
  Target Link: https://www.cheapreels.in/
  ```
* **Inline Keyboard:**
  ```
  [ 🔴 Turn Banner OFF   ]   [ ✏️ Edit Banner Text ]
  [ 🏷️ Edit Badge Text    ]   [ 🔗 Edit Target Link ]
  [ 🔙 Main Menu         ]
  ```

### 2.6 💳 Payment Gateways Control Center (`menu:gateways`)
* **Message Body:**
  ```
  💳 PAYMENT GATEWAYS SWITCHBOARD
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mode: MULTIPLE GATEWAYS (Customer Chooses at Checkout)
  
  1. Cashfree PG:     🟢 ENABLED (Production Live)
  2. PayPal USD:      🟢 ENABLED (1:1 USD Live)
  3. Direct UPI QR:   🟢 ENABLED (cheapreels@upi)
  4. Razorpay:        ⚪ DISABLED
  ```
* **Inline Keyboard:**
  ```
  [ ⚡ Toggle Cashfree ]   [ 🌐 Toggle PayPal   ]
  [ 📱 Toggle UPI QR   ]   [ 💳 Toggle Razorpay ]
  [ 🔀 Switch Single/Multi Mode ]
  [ 🔙 Main Menu       ]
  ```

### 2.7 🚨 Emergency Maintenance Mode (`menu:maintenance`)
* **Message Body:**
  ```
  🚨 EMERGENCY STOREFRONT CONTROL
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Storefront Status: 🟢 PUBLIC ACCESS OPEN
  
  Warning: Enabling Maintenance Mode will immediately display a maintenance countdown screen to all public visitors on PC and Mobile.
  ```
* **Inline Keyboard:**
  ```
  [ 🔴 ACTIVATE EMERGENCY MAINTENANCE ]
  [ ✏️ Edit Maintenance Message       ]
  [ 🔙 Main Menu                       ]
  ```

---

## 3. CALLBACK QUERY DATA SPECIFICATION

To ensure deterministic routing in the serverless webhook, all callback data uses a compact namespaced schema (Telegram limits `callback_data` to 64 bytes):

| Callback String | Target Handler | Parameters Encoded | Action Performed |
| :--- | :--- | :--- | :--- |
| `nav:home` | Navigation Router | None | Renders Main Dashboard |
| `nav:bundles:page` | Bundles Router | `page` (number) | Renders specific page of bundles |
| `b_view:<id>` | Bundle Handler | `id` (bundle ID) | Displays bundle detail card |
| `b_price:<id>` | Bundle Editor | `id` (bundle ID) | Starts interactive price edit conversation |
| `b_drive:<id>` | Bundle Editor | `id` (bundle ID) | Starts interactive Drive link edit |
| `ord:view:<id>` | Order Handler | `id` (order ID) | Displays order detail card |
| `ord:verify:<id>`| Order Action | `id` (order ID) | Verifies order and unlocks Drive link live |
| `ord:revoke:<id>`| Order Action | `id` (order ID) | Revokes Drive access |
| `gw:toggle:<id>`| Gateway Switch | `cashfree`/`paypal`/`upi` | Toggles gateway enabled state |
| `maint:toggle` | Maintenance Handler | None | Toggles maintenance mode |
| `act:cancel` | Conversation Machine| None | Cancels active input, returns to home |

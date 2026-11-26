# CHEAPREELS.IN — TELEGRAM ADMIN OPERATING SYSTEM ARCHITECTURE
**Document ID:** CHEAPREELS-ARCH-003  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. ARCHITECTURAL TOPOLOGY

The Telegram Admin Operating System acts as a **privileged, headless remote interface** to the existing CheapReels.in architecture. It does not replace the web Admin Panel; both interfaces converge on the exact same serverless APIs and persistent central GitHub database.

```
       ┌────────────────────────┐             ┌─────────────────────────┐
       │   Telegram Admin Bot   │             │  Web Admin Panel (PC)   │
       │  (BotFather Interface) │             │ (SHA-256 Passcode Vault)│
       └───────────┬────────────┘             └────────────┬────────────┘
                   │                                       │
                   │ Webhook (HTTPS POST)                  │ REST API (Bearer Auth)
                   ▼                                       ▼
       ┌────────────────────────┐             ┌─────────────────────────┐
       │ /api/telegram-webhook  │             │        /api/sync        │
       │ (Vercel Serverless Fn) │◄───────────►│ (Vercel Serverless Fn)  │
       └───────────┬────────────┘             └────────────┬────────────┘
                   │                                       │
                   │ Authenticated GitHub Commit / Read    │
                   ▼                                       ▼
       ┌────────────────────────────────────────────────────────────────┐
       │            CENTRAL AUTHORITATIVE DATABASE (JSON VAULT)         │
       │       diamondplus07xyz-lab/cheapreels (public/data/store_config)│
       │       (Dual-Mirrored with diamondplus07xyz-lab/digibundle)     │
       └───────────────────────────────┬────────────────────────────────┘
                                       │
                                       │ Edge Cache Invalidation & SSE
                                       ▼
       ┌────────────────────────────────────────────────────────────────┐
       │              PUBLIC CUSTOMER STOREFRONT & CHECKOUT             │
       │                   https://www.cheapreels.in                    │
       │              (Instant Updates on PC & Mobile)                  │
       └────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT SPECIFICATIONS

### 2.1 The Telegram Webhook Endpoint (`/api/telegram-webhook.js`)
* **Hosting:** Vercel Edge / Serverless Function.
* **URL:** `https://www.cheapreels.in/api/telegram-webhook`
* **Trigger:** Telegram HTTPS Webhook dispatched by Telegram's Bot infrastructure on user actions.
* **Supported Telegram Update Types:**
  1. `message`: Text commands (`/start`, `/sales`, `/bundles`, `/orders`, `/help`), inline search queries, photo uploads (for thumbnails).
  2. `callback_query`: Interactive button clicks on inline keyboards (e.g. `order_verify:CR-123456`, `bundle_edit:12`, `gw_toggle:cashfree`).
* **Execution Lifecycle:**
  1. **Security Gatekeeper:** Validates `X-Telegram-Bot-Api-Secret-Token` header and verifies `msg.from.id === 5151255259`. Rejects unauthorized callers immediately with HTTP 403.
  2. **Router / State Machine:** Resolves incoming command or callback query against the active admin session state.
  3. **Data Service:** Reads current data from `/api/sync` or cached in-memory vault.
  4. **Action Dispatcher:** Performs the requested business operation (verify order, edit price, toggle banner).
  5. **Persistence Engine:** Commits the mutation to GitHub via `/api/sync` (Dual-repo mirror).
  6. **UI Renderer:** Edits the Telegram message or responds with a fresh interactive Inline Keyboard dashboard.

### 2.2 In-Memory Conversation State Machine
Telegram commands often require multi-step inputs (e.g., *Edit Price ➔ Enter new number ➔ Confirm*).
* **Storage:** Global serverless memory cache + lightweight encrypted Telegram callback query payload encoding.
* **Structure:**
  ```javascript
  const adminConversations = new Map();
  // Key: telegramUserId (5151255259)
  // Value: {
  //   step: 'AWAITING_BUNDLE_PRICE',
  //   targetId: 'bundle-42',
  //   previousValue: 149,
  //   expiresAt: Date.now() + 5 * 60 * 1000 // 5-minute timeout
  // }
  ```
* **State Cancellation:** Any `/cancel` command or `[❌ Cancel]` button tap resets the state machine back to the Main Dashboard.

---

## 3. TWO-WAY SYNCHRONIZATION DATA FLOW

### Scenario A: Admin Edits Product Price on Telegram
1. Admin taps `[📦 Bundles]` ➔ Searches `PUBG` ➔ Taps `[✏️ Edit Price]`.
2. Admin sends text `199`.
3. Telegram Webhook validates the number `199`.
4. Webhook updates `store_config.json` via `/api/sync` with commit message: `Telegram Admin: Updated PUBG bundle price to 199 [skip ci]`.
5. Webhook invalidates Vercel Edge Cache.
6. The customer storefront and Web Admin Panel instantly reflect `₹199` (and `$199 USD` for PayPal) on the next heartbeat or page visit!
7. Bot sends Telegram confirmation with updated bundle card and `[Preview Live]` button.

### Scenario B: Customer Places an Order on Website
1. Customer buys bundle via Cashfree or PayPal.
2. Gateway verifies transaction; `/api/cashfree` or `/api/paypal` marks order `VERIFIED` and unlocks Google Drive links.
3. Order is appended to `store_config.json` orders ledger.
4. `telegramAlerts.js` dispatches instant rich Telegram notification to Chat ID `5151255259` with contextual inline buttons:
   `[📂 View Drive Link]` `[👤 Customer WhatsApp]` `[📊 Today's Sales]`
5. Admin clicks `[📊 Today's Sales]` directly on Telegram and receives the updated sales tally in 1 second!

---

## 4. RELIABILITY & FAULT TOLERANCE
* **Zero External Dependencies:** Built entirely with standard Node.js native `fetch` and Vercel serverless functions.
* **Cold Start Optimization:** Lightweight handler (<15KB) with zero heavy frameworks, ensuring Telegram webhook responds in <600ms (Telegram requires <3000ms response to prevent webhook retries).
* **Webhook Retry Deduplication:** Uses Telegram `update_id` cache to prevent double-processing on network retries.
* **Dual Mirroring:** Every data commit automatically mirrors to both GitHub repositories (`cheapreels` and `digibundle`) ensuring 100% redundancy.

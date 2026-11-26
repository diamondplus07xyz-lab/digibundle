# CHEAPREELS.IN — TWO-WAY LIVE SYNCHRONIZATION ARCHITECTURE
**Document ID:** CHEAPREELS-SYNC-006  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. SYNCHRONIZATION OBJECTIVE & MANDATE

The primary mandate is: **There must be exactly ONE Single Source of Truth for the entire CheapReels.in ecosystem.**
* Any change made through **Telegram** must instantly update the central database, invalidating caches so PC, Mobile, and Tablet visitors receive the new data.
* Any change made through the **Web Admin Panel** must immediately update the central database and be available in Telegram.
* Any customer purchase must update the orders ledger, notify Telegram, and update both the Web Admin Panel and customer device without discrepancy.

---

## 2. CENTRAL REPOSITORY STORAGE MECHANISM

The authoritative database resides at:
* **Repository:** `diamondplus07xyz-lab/cheapreels` (and secondary replica `diamondplus07xyz-lab/digibundle`).
* **File:** `public/data/store_config.json`
* **Access Controller:** `/api/sync.js` Vercel Serverless Function.
* **Commit Tagging:** Changes committed by automated processes or Telegram bot use the `[skip ci]` flag to avoid consuming Vercel Hobby build limits, while verified administrative mutations persist permanently in Git history.

```
                  ┌───────────────────────────────┐
                  │    /api/sync Serverless API   │
                  │  (Central Database Gatekeeper)│
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       ┌─────────────────────┐         ┌─────────────────────┐
       │   Primary GitHub    │         │    Mirror GitHub    │
       │ cheapreels/store_cfg│         │ digibundle/store_cfg│
       └─────────────────────┘         └─────────────────────┘
```

---

## 3. TWO-WAY SYNCHRONIZATION PROTOCOLS

### 3.1 Flow 1: Telegram ➔ Website & Web Admin Panel
1. **Telegram Action:** Admin changes a bundle price or toggles an announcement.
2. **Webhook Verification:** `/api/telegram-webhook` verifies Telegram user ID `5151255259`.
3. **Database Write:** Calls `/api/sync` with action payload:
   ```json
   {
     "updateType": "BUNDLES_UPDATED",
     "bundles": updatedBundlesArray,
     "author": "Telegram Admin (5151255259)"
   }
   ```
4. **Commit & Invalidate:** `/api/sync` commits the new JSON to GitHub and purges the serverless in-memory cache (`cacheData = null`).
5. **Client Broadcast:** Web visitors and open Admin Panels on PC/mobile receive the update via their standard 15-second heartbeat poll (`/api/sync`) or window focus revalidation (`visibilitychange`).
6. **Frontend State Replacement:** React state (`setBundles` / `setConfig`) updates automatically; UI re-renders with zero hard refresh needed.

### 3.2 Flow 2: Web Admin Panel ➔ Telegram
1. **Web Admin Action:** Admin clicks "Save Gateways" or edits a product in the Web Admin Panel.
2. **API Push:** Web Admin Panel sends `POST /api/sync` with `Authorization: Bearer <ADMIN_HASH>`.
3. **Database Write:** GitHub JSON file is updated.
4. **Telegram Read:** The very next time the admin opens Telegram or taps any button, the Telegram Webhook fetches the latest JSON from `/api/sync`, reading the exact same state updated by the Web Admin!

### 3.3 Flow 3: Customer Purchase ➔ All Interfaces
1. **Checkout Event:** Customer completes payment via Cashfree, PayPal, or UPI QR.
2. **Atomic Order Insertion:** The payment callback validates the payment server-side and appends the order to `orders` array.
3. **Simultaneous Notification:** `sendTelegramNewSaleAlert` sends instant rich Telegram notification to Chat ID `5151255259`.
4. **Web Admin Refresh:** Open Admin Panels on PC/mobile show the new order badge count and row within seconds.

---

## 4. CONFLICT RESOLUTION & RECOVERY STRATEGY

### 4.1 Last-Write-Wins with Entity Granularity
To prevent concurrent updates from overwriting unrelated fields:
* Mutations are partitioned by entity type: `BUNDLES_UPDATED`, `ORDERS_UPDATED`, `CONFIG_UPDATED`, `VISITORS_UPDATED`.
* If Admin A edits a bundle title in Web Admin while Admin B edits a gateway setting in Telegram, both operations merge cleanly because they mutate disjoint keys in the central JSON schema (`bundles` vs `gateways`).

### 4.2 Network Interruption & Reconnection
* If Telegram webhook fails due to a network timeout, Telegram automatically queues and retries delivery up to 24 hours.
* The webhook uses an in-memory `processedUpdateIds` set to guarantee **idempotency** (retried webhooks will not duplicate operations).

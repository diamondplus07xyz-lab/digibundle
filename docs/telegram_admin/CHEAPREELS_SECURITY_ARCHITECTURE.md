# CHEAPREELS.IN — TELEGRAM ADMIN SECURITY ARCHITECTURE
**Document ID:** CHEAPREELS-SEC-007  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. THREAT MODEL & SECURITY POSTURE

Telegram bots operate in an open network where any Telegram user can message the bot. Therefore, the Telegram interface must be treated as a **critical administrative boundary** with strict Zero-Trust defense controls.

### Potential Threat Vectors:
1. Unauthorized users sending commands (`/start`, `/delete_order`, `/edit_price`).
2. Spoofed HTTP requests sent directly to `/api/telegram-webhook`.
3. Replay attacks using intercepted webhook payloads.
4. Leaked credentials (Bot token, GitHub token, payment secret keys).
5. Denial of Service (DoS) via automated spam messages to the webhook.

---

## 2. MANDATORY SECURITY CONTROLS

### 2.1 Numeric User ID Allowlist (Zero Username Trust)
* Telegram `@usernames` can be renamed or spoofed by bad actors.
* The system enforces strict authentication using the **immutable Numeric Telegram User ID**:
  ```javascript
  const AUTHORIZED_ADMIN_IDS = new Set([
    '5151255259' // Owner & Master Admin Numeric Telegram ID
  ]);
  
  function authenticateTelegramUser(update) {
    const fromId = String(
      update.message?.from?.id || 
      update.callback_query?.from?.id || 
      ''
    ).trim();
    
    if (!fromId || !AUTHORIZED_ADMIN_IDS.has(fromId)) {
      console.warn(`[SECURITY ALERT] Unauthorized Telegram access attempt from ID: ${fromId}`);
      return false; // REJECT
    }
    return true; // AUTHORIZED
  }
  ```
* Any message or button click from an unlisted Telegram user receives zero response and logs a high-severity security alert.

### 2.2 Telegram Webhook Secret Token Verification
* When setting the webhook via `setWebhook`, a cryptographic secret token is registered:
  `secret_token = sha256(botToken + ADMIN_SALT)`
* Every request from Telegram includes the header:
  `X-Telegram-Bot-Api-Secret-Token: <SECRET_TOKEN>`
* If the incoming request lacks this header or has an invalid secret, `/api/telegram-webhook` responds with `HTTP 403 Forbidden` and terminates before parsing the payload.

### 2.3 Idempotency & Replay Defense
* Every Telegram update contains an integer `update_id`.
* The webhook maintains a rolling cache of the last 1,000 `update_id`s in memory:
  ```javascript
  const recentUpdates = new Set();
  if (recentUpdates.has(update.update_id)) {
    return res.status(200).json({ ok: true, notice: 'Duplicate update ignored' });
  }
  recentUpdates.add(update.update_id);
  ```

### 2.4 Destructive Action Double-Confirmation
Any high-impact or destructive action requires two-step confirmation:
1. **Activating Maintenance Mode:** Requires explicit confirmation tap:  
   `"⚠️ Are you sure you want to block all public visitors? [Yes, Enable] [Cancel]"`
2. **Deleting an Order or Bundle:** Requires explicit confirmation tap.
3. **Switching Gateway Credentials:** Masked input preview before commitment.

### 2.5 Sensitive Data Protection (PCI-DSS & PII Minimal Exposure)
* In customer notifications and cards:
  * Full credit card numbers, CVVs, and raw bank passwords are never stored or transmitted.
  * Secrets in `/public/data/store_config.json` are masked (`••••••••`).
  * Only necessary fulfillment PII (Name, WhatsApp, Email, City/State) is displayed.

---

## 3. AUDIT TRAIL RECORDING
Every administrative operation triggered via Telegram logs an audit record into `activityLogs`:
* `category`: `PRODUCT` / `ORDER` / `GATEWAY` / `SECURITY`
* `actorType`: `Telegram_Admin`
* `actorId`: `5151255259`
* `title`: Human-readable summary (e.g. *Price updated for PUBG Bundle to ₹199*)
* `timestamp`: Precise ISO string
* `status`: `Success` / `Failed`

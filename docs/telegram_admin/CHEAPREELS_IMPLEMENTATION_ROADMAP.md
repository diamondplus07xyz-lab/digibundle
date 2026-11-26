# CHEAPREELS.IN — 10-STAGE TELEGRAM ADMIN IMPLEMENTATION ROADMAP
**Document ID:** CHEAPREELS-ROADMAP-009  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. IMPLEMENTATION PRINCIPLES
1. **Zero Disruption to Live Storefront:** The public website, customer checkout, Cashfree, PayPal, and UPI QR must remain 100% active during all stages.
2. **Reuse Existing Backend APIs:** The Telegram Admin OS directly operates `/api/sync` and existing business logic.
3. **No Duplicate Database:** GitHub-backed central `store_config.json` remains the sole Single Source of Truth.
4. **Strict Authorization:** Numeric Telegram ID `5151255259` and webhook secret header are enforced at Stage 1.

---

## 2. STAGE-BY-STAGE EXECUTION BREAKDOWN

### STAGE 1: Serverless Webhook Handler & Security Gatekeeper
* **Deliverable:** Create `/api/telegram-webhook.js`.
* **Scope:**
  * Implement HTTP POST handler accepting Telegram updates.
  * Verify `X-Telegram-Bot-Api-Secret-Token`.
  * Validate `update.message.from.id === '5151255259'`.
  * Register webhook URL with Telegram Bot API (`setWebhook`).
* **Test Criteria:** Unauthorized users receive 403; authorized user receives authenticated handshake.

### STAGE 2: Main Dashboard & Navigation Router
* **Deliverable:** Interactive Inline Keyboard Dashboard.
* **Scope:**
  * Implement `/start` and `/dashboard` response.
  * Render modular 12-button inline grid.
  * Implement callback query router (`callback_data` parser).
* **Test Criteria:** Tapping any module button renders its respective sub-menu in <800ms.

### STAGE 3: Bundles Management Module
* **Deliverable:** Full product catalog control through Telegram.
* **Scope:**
  * Paginated bundle list (10 per page with Next/Prev).
  * Bundle search by title.
  * Bundle detail card with preview and Drive link.
  * Interactive price editing conversation state machine.
  * Interactive Google Drive link updater.
* **Test Criteria:** Price edited on Telegram immediately updates `store_config.json`, Web Admin, and storefront.

### STAGE 4: Orders Management & Manual Verification Module
* **Deliverable:** Live orders stream & payment verification in chat.
* **Scope:**
  * Order list sorted by latest timestamp.
  * Order search by ID, phone, email, or UTR.
  * `[✅ Verify & Unlock]` button that flips UPI order from `PENDING_VERIFICATION` to `VERIFIED` and unlocks Drive link live for the customer.
  * `[🔒 Revoke Access]` and `[🗑 Delete Order]` buttons.
* **Test Criteria:** Verifying a pending order via Telegram immediately unlocks the customer's Google Drive link on their device.

### STAGE 5: Sales Command Center & Financial Intelligence
* **Deliverable:** Real-time revenue analytics dashboard.
* **Scope:**
  * Financial calculations: Today, Yesterday, 7 Days, Month, All-Time.
  * Gross vs Net, Domestic INR vs International PayPal USD breakdown.
  * Gateway percentage distribution.
  * Top-selling bundles ranking.
  * Dynamic CSV export generation sent as file attachment.
* **Test Criteria:** Calculated totals strictly match verified orders ledger; zero discrepancies.

### STAGE 6: Website Content & Marketing Controls
* **Deliverable:** Remote storefront content management.
* **Scope:**
  * Announcement banner toggle (ON/OFF) and text editor.
  * Special Offer / Mega Deal banner toggle (ON/OFF), price editor, and Drive links editor.
  * Emergency Maintenance mode toggle with double-confirmation dialog.
* **Test Criteria:** Toggling announcement or special offer on Telegram immediately shows/hides it on the live website.

### STAGE 7: Payment Gateways Switchboard
* **Deliverable:** Gateway failover and configuration control.
* **Scope:**
  * View active gateways and modes (Single vs Multiple).
  * 1-tap toggling of Cashfree, PayPal, UPI QR, and Razorpay.
  * Failover from Cashfree to Direct UPI QR in case of PG outages.
* **Test Criteria:** Toggling gateway in Telegram immediately updates checkout payment choices for customers.

### STAGE 8: Traffic Analytics & Visitor Stream
* **Deliverable:** Real-time visitor snapshot in chat.
* **Scope:**
  * Display total views, unique visitors, mobile vs desktop split.
  * View latest 10 live visitor hits with page and device type.
* **Test Criteria:** Shows real visitor data from `visitorStats`.

### STAGE 9: Automated Briefings & Uptime Guardian
* **Deliverable:** Scheduled crons and health checks.
* **Scope:**
  * Morning financial briefing (09:00 AM IST).
  * Nightly sales recap (11:55 PM IST).
  * 15-minute homepage uptime heartbeat with outage alerts.
* **Test Criteria:** Cron triggers dispatch scheduled briefings on time without manual input.

### STAGE 10: End-to-End Testing, Audit Trail & Rollback Hardening
* **Deliverable:** Production deployment, dual-repository sync verification, and documentation.
* **Scope:**
  * Run complete test suite across all 10 stages.
  * Verify all actions log into `activityLogs`.
  * Ensure dual-mirroring to `digibundle` repository.
* **Test Criteria:** Full acceptance criteria met across all modules.

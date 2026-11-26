# CHEAPREELS.IN — TELEGRAM ADMIN MASTER TESTING STRATEGY
**Document ID:** CHEAPREELS-TEST-010  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. TESTING OBJECTIVE

To ensure enterprise-grade reliability, security, and two-way data integrity across all interfaces (Telegram Bot, Web Admin Panel, Central Database, and Public Storefront) before and after deployment.

---

## 2. DETAILED TEST MATRICES

### 2.1 Security & Access Control Tests

| Test ID | Test Scenario | Execution Method | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Unauthorized Telegram User | Send `/start` from non-whitelisted Telegram ID | Request is rejected with HTTP 403; zero response in chat | Zero data exposed |
| **SEC-02** | Authorized Admin Handshake | Send `/start` from Numeric ID `5151255259` | Telegram bot responds with Main Command Dashboard | Interactive buttons render |
| **SEC-03** | Webhook Secret Header Check | Send POST to `/api/telegram-webhook` without secret header | Endpoint responds `403 Forbidden` | Payload unparsed |
| **SEC-04** | Webhook Secret Header Valid | Send POST with valid `X-Telegram-Bot-Api-Secret-Token` | Endpoint processes update with `200 OK` | Processed cleanly |
| **SEC-05** | Replay Attack / Duplicate Update | Re-send identical `update_id` payload | Endpoint ignores duplicate with notice `200 OK` | No duplicate execution |

### 2.2 Bundles & Product Management Tests

| Test ID | Test Scenario | Execution Method | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **PRD-01** | Browse Bundles List | Tap `[📦 Bundles]` in Telegram | Displays bundles 1–10 with pagination buttons | <800ms response |
| **PRD-02** | Search Bundle by Query | Send `/search pubg` | Displays PUBG BGMI bundle card with price & links | Accurate match |
| **PRD-03** | Edit Bundle Price via Bot | Tap `[✏️ Edit Price]` ➔ send `199` ➔ confirm | Central `store_config.json` commits to GitHub | Website shows ₹199 |
| **PRD-04** | Verify Dual-Currency Price | Check PayPal gateway after price change | PayPal display updates to `$199 USD` (1:1 price) | 1:1 USD verified |
| **PRD-05** | Update Google Drive Link | Send new Drive URL in bot | Updates `driveLink` on product | Verified in Order Success |
| **PRD-06** | Conversation Cancellation | Tap `[❌ Cancel]` midway through price change | State machine resets; price remains unchanged | State cleaned |

### 2.3 Orders & Customer Fulfillment Tests

| Test ID | Test Scenario | Execution Method | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **ORD-01** | Live Order Stream Inspection | Tap `[🛒 Orders]` | Shows latest 5 orders with status, total, customer | Formatted card |
| **ORD-02** | Manual UPI Payment Approval | Click `[✅ Verify & Unlock]` on pending order | Flips order status to `VERIFIED`; unlocks Drive folder | Customer screen unlocks |
| **ORD-03** | Revoke Order Access | Click `[🔒 Revoke Access]` on order | Sets `driveLinkUnlocked = false` | Drive button locks |
| **ORD-04** | Order Search by Phone/UTR | Send `/order 9876543210` | Returns specific order card | Instant query match |

### 2.4 Sales Intelligence & Calculations Tests

| Test ID | Test Scenario | Execution Method | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **SAL-01** | Today's Revenue Calculation | Send `/today` or tap `[💰 Sales]` | Sum matches verified orders created today | Zero math discrepancies |
| **SAL-02** | Test Order Exclusion | Inspect totals with test orders present in ledger | Test orders are excluded from revenue totals | Clean financial ledger |
| **SAL-03** | Multi-Currency Separation | Check sales report with PayPal & Cashfree orders | Separates INR gross vs USD gross | Clear currency breakdown |
| **SAL-04** | CSV Ledger Generation | Tap `[📥 Download CSV]` | Generates and sends `.csv` document in Telegram | Opens in Excel cleanly |

### 2.5 Two-Way Synchronization Tests

| Test ID | Test Scenario | Execution Method | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **SYN-01** | Telegram ➔ Web Storefront | Change announcement banner in Telegram | Homepage updates announcement banner on refresh | Instant visibility |
| **SYN-02** | Web Admin ➔ Telegram | Change special offer price in Web Admin | `/offer` in Telegram returns updated price | Single Source of Truth |
| **SYN-03** | Storefront Sale ➔ Telegram | Complete checkout on website | Telegram bot receives instant sale notification | Alert in <1.5s |
| **SYN-04** | Dual-Repo Mirroring | Commit a Telegram admin change | Verifies commit in `cheapreels` & `digibundle` repos | Both repos synchronized |

---

## 3. ROLLBACK & DISASTER RECOVERY PROTOCOL

If any anomaly occurs during operation:
1. **Webhook Disablement:** A single call to `https://api.telegram.org/bot<TOKEN>/deleteWebhook` instantly detaches Telegram from the serverless endpoint without affecting website traffic.
2. **Git Commit Reversion:** Since every change creates an atomic Git commit with author metadata, any unwanted change can be reverted using `git revert <COMMIT_HASH>`.
3. **Emergency Storefront Safety:** The customer-facing website and payment gateways run independently of the Telegram webhook, guaranteeing 100% storefront uptime regardless of Telegram API availability.

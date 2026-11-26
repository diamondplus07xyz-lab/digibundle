# CHEAPREELS.IN — TELEGRAM AUTOMATION & INTELLIGENT ALERTS PLAN
**Document ID:** CHEAPREELS-AUTO-008  
**Date:** November 26, 2026  
**Auditor:** Senior Full-Stack Architect & Backend Database Engineer

---

## 1. AUTOMATION CATEGORIES & TRIGGER CONDITIONS

The Telegram Admin Operating System includes 5 core automation pipelines running asynchronously on Vercel Cron or real-time event triggers:

```
                          AUTOMATION PIPELINES
 ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
 │ Real-Time Sales &    │  │ Scheduled Financial  │  │ System Health &      │
 │ Checkout Leads Alert │  │ Briefings (Cron)     │  │ Uptime Guardian      │
 └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
 ┌──────────────────────┐  ┌──────────────────────┐
 │ Inventory & Link     │  │ Security & Fraud     │
 │ Health Monitor       │  │ Defense Alerts       │
 └──────────────────────┘  └──────────────────────┘
```

---

## 2. DETAILED PIPELINE SPECIFICATIONS

### 2.1 Pipeline 1: Real-Time Sales & Checkout Leads (Event-Driven)
* **Trigger 1: New Sale Received**
  * When an order is verified (Cashfree, PayPal, or manual UPI).
  * Telegram Message:
    ```
    💰 NEW SALE RECEIVED — CHEAPREELS.IN 💰
    ━━━━━━━━━━━━━━━━━━━━━━━━━
    📦 Order ID: #CR-238414
    💵 Total Amount: ₹149 (or $149 USD)
    💳 Payment Mode: 🌐 PayPal International
    🔢 UTR / Txn Ref: PAYID-JOIRNTVC
    
    👤 Customer Details:
    • Name: John Miller
    • WhatsApp: +91 9876543210
    • Email: john.miller@example.com
    • Location: Mumbai, Maharashtra
    
    🛍️ Purchased Bundles:
      1. 2000+ PUBG BGMI Reels Bundle (₹149)
    ━━━━━━━━━━━━━━━━━━━━━━━━━
    [ 📂 Drive Folder ]   [ 💬 WhatsApp Customer ]
    ```
* **Trigger 2: High-Intent Checkout Lead (Warm Lead)**
  * When a visitor fills in customer details and enters Step 2 (`Pay & Authorize`).
  * Alerts admin with customer phone and selected bundles so admin can follow up if payment is abandoned.

### 2.2 Pipeline 2: Scheduled Financial Briefings (Vercel Cron)
* **Morning Brief (09:00 AM IST):**
  * Summary of overnight traffic, yesterday's total sales, and pending UPI verifications.
* **Nightly Closing Recap (11:55 PM IST):**
  * Full day's financial report: Gross Revenue, Total Orders, Top Selling Bundle, Gateway breakdown.

### 2.3 Pipeline 3: System Health & Uptime Guardian
* **Heartbeat Verification:**
  * Checks website homepage (`https://www.cheapreels.in/`) HTTP 200 status every 15 minutes.
  * If HTTP 500/503 or timeout detected: Dispatches urgent red alert to Telegram:  
    `"🚨 CRITICAL ALERT: Website unreachable (HTTP 500)! Investigating backend..."`
  * Automatically notifies when back online:  
    `"🟢 RESTORED: Website is back online and operational."`

### 2.4 Pipeline 4: Inventory & Google Drive Link Health Check
* Weekly automated audit verifying that every bundle has an active, valid Google Drive link (`drive.google.com/drive/folders/...`) and not empty or placeholder strings.

### 2.5 Pipeline 5: Security & Fraud Defense
* Multiple failed payments from the same IP address or phone number trigger a high-priority warning:
  `"⚠️ SUSPICIOUS ACTIVITY: 4 failed payment attempts in 5 minutes from IP: 103.XX.XX.XX"`.

---

## 3. NOTIFICATION COOLDOWNS & QUIET HOURS
* **Cooldown Buffer:** High-volume checkout leads have a 60-second debounce per IP to prevent spamming Telegram when a customer taps back and forth.
* **Critical Bypass:** Verified sales and downtime alerts ALWAYS bypass cooldowns and deliver instantly.

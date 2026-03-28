# Product Requirements Document (PRD)
# Food Truck Jajanan Bango — POS System

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [System Overview & User Flows](#5-system-overview--user-flows)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Epics & User Stories](#8-epics--user-stories)
9. [Prioritization (MoSCoW)](#9-prioritization-moscow)
10. [Out of Scope](#10-out-of-scope)
11. [Dependencies & Assumptions](#11-dependencies--assumptions)

---

## 1. Executive Summary

Food Truck Jajanan Bango (FJB) requires a unified point-of-sale (POS) system to manage orders, payments, and kitchen operations across multiple city outlets. The system consists of three interfaces deployed on tablets and TV/kiosk screens:

- **Cashier/Waiter Tablet** — staff-operated order-taking and payment processing
- **Self-Kiosk (TV Display)** — customer-facing self-service ordering
- **Kitchen Display Tablet** — order tracking and status management for kitchen staff
- **Report Dashboard** — aggregated sales and performance analytics

The system integrates QRIS/GoPay payment processing and WhatsApp (WA) notifications to deliver real-time order status updates to customers.

---

## 2. Problem Statement

FJB food trucks operate across multiple city outlets. Current manual order-taking creates bottlenecks in high-traffic periods, increases error rates, and provides no data-driven visibility into product performance or outlet efficiency. Customers lack real-time order status updates, leading to confusion at the pickup counter. Additionally, there is no centralised reporting mechanism to evaluate marketing program impact (e.g. voucher/redeem codes tied to BliBli partnership).

---

## 3. Goals & Success Metrics

### Business Goals
- Reduce average order processing time by ≥30%
- Enable cashless QRIS/digital payment at all outlets
- Provide automated WA order status notifications to every customer
- Deliver cross-outlet sales and product performance reporting

### Success Metrics

| Metric | Target |
|--------|--------|
| Average order-to-kitchen time | ≤ 60 seconds after payment |
| Payment success rate (QRIS) | ≥ 98% |
| WA notification delivery rate | ≥ 95% |
| Self-kiosk order completion rate | ≥ 70% of sessions started |
| Report data freshness | ≤ 5 minutes lag from real-time |
| System uptime per outlet | ≥ 99.5% during operating hours |

---

## 4. User Personas

### Persona 1 — Kamal (Cashier / Waiter)
- **Role:** Frontline staff processing customer orders on the tablet
- **Goals:** Quickly take orders, confirm payment, restart for next customer
- **Pain Points:** Long queues, needing to remember menu prices, chasing kitchen for order status
- **Device:** iPad (landscape, ~10-11")

### Persona 2 — Kitchen Cook
- **Role:** Prepares food based on incoming orders
- **Goals:** See new orders instantly, track preparation status, mark orders as ready
- **Pain Points:** Missed orders, wrong item quantities, unclear pickup status
- **Device:** iPad (landscape, ~10-11")

### Persona 3 — Customer (Walk-in)
- **Role:** Visits FJB food truck and wants to order food/drinks
- **Goals:** Browse menu, place order, pay quickly, receive order without confusion
- **Pain Points:** Long queues, not knowing order status, losing paper receipts
- **Device:** Self-kiosk TV or their own smartphone (for WA)

### Persona 4 — FJB Admin / Manager
- **Role:** Oversees operations across multiple city outlets
- **Goals:** Analyse sales, monitor product performance, evaluate voucher/marketing ROI
- **Pain Points:** No consolidated data, manual spreadsheet reports, no cross-outlet visibility
- **Device:** Tablet (portrait/landscape)

---

## 5. System Overview & User Flows

### 5.1 System Architecture Overview

Three operational modules on tablets/kiosks backed by a shared REST API:

```
┌─────────────────────────────────────────────────────────────┐
│                    FJB POS System                           │
├──────────────────┬──────────────────┬───────────────────────┤
│ Cashier/Waiter   │ Self-Kiosk (TV)  │ Kitchen Display       │
│ Tablet           │ Display          │ Tablet                │
├──────────────────┴──────────────────┴───────────────────────┤
│                   Backend REST API                          │
├──────────────┬──────────────────────┬───────────────────────┤
│ QRIS/GoPay   │ WhatsApp Business    │ Report Analytics      │
│ Payment GW   │ Notification API     │ Engine                │
└──────────────┴──────────────────────┴───────────────────────┘
```

### 5.2 User Flow — Cashier/Waiter (Tablet)

```
App Launch
   └─► Login Page (username)
         └─► PIN Entry (4-digit)
               └─► City Selection
                     └─► Outlet Selection
                           └─► Order Screen
                                 ├─► Browse items by category / search
                                 ├─► Add items to cart (qty + notes)
                                 ├─► Select Dine In / Take Away
                                 └─► Lanjut Bayar (Continue to Pay)
                                       └─► Confirmation Screen
                                             ├─► Select payment: QRIS / GoPay / Cash
                                             ├─► Enter customer name + WA number
                                             ├─► Set order type + table number
                                             └─► Konfirmasi Pembayaran
                                                   ├─► [QRIS] Show QR + countdown → await payment
                                                   └─► [Cash] Complete order directly
                                                         └─► WA notification: order received
```

### 5.3 User Flow — Self-Kiosk (TV Display)

```
Kiosk Idle Screen
   └─► Customer approaches → Browse menu (2-column grid)
         └─► Tap item → Detail popup (qty selector)
               └─► Add Order → items shown with ✓ checkmark
                     └─► View Order (cart review + edit/delete)
                           └─► Buat Pesanan (Create Order)
                                 └─► Enter Name + WA Number
                                       └─► QRIS Payment Screen
                                             └─► [Option A] Scan QR → open BliBli Microsite
                                             └─► [Option B] Payment success → WA message sent
                                                   └─► Pembayaran berhasil → Selesai
                                                         └─► Auto-return to idle in 10 seconds
```

### 5.4 User Flow — Kitchen Display (Tablet)

```
Kitchen Tablet
   └─► Login → Kitchen Dashboard
         └─► Columns: NEW ORDER | ON PROCESS | PICKUP | COMPLETE
               ├─► NEW ORDER: tap "Proses" → moves to ON PROCESS + WA notif (processing)
               ├─► ON PROCESS: tap "Ready to Pickup" → moves to PICKUP + WA notif (pick up)
               ├─► PICKUP: tap "Complete" → moves to COMPLETE + WA notif (thank you)
               │          └─► tap "Remind Pickup" → re-sends WA notification
               └─► COMPLETE: order closed ✓
```

### 5.5 BliBli Microsite Integration Flow

**Option 1 — Through Self-Kiosk QR:**
Customer chooses menu → QR code shown on screen → customer scans → opens BliBli Microsite

**Option 2 — Through WA Message:**
Customer completes order → picks up order → after ~10 minutes → receives WA message with link → clicks link → opens BliBli Microsite

---

## 6. Functional Requirements

### 6.1 Authentication & Session Management

**FR-001: MUST — Username Login**
- Staff enters username on the login screen
- System validates against registered users in the backend
- Acceptance Criteria:
  - Invalid username shows error message
  - Field has a "Enter username" placeholder with person icon

**FR-002: MUST — 4-Digit PIN Authentication**
- After username, staff enters a 4-digit PIN via on-screen numpad
- PIN dots fill as digits are entered; `C` clears last digit; `X` cancels
- Acceptance Criteria:
  - PIN is not displayed in plain text (shown as dots)
  - Three consecutive failed attempts locks the account for 5 minutes
  - Successful PIN entry proceeds to city selection

**FR-003: MUST — City Selection**
- After PIN, staff selects their assigned city from a dropdown
- Acceptance Criteria:
  - Only cities with active outlets are listed
  - Selection persists for the session

**FR-004: MUST — Outlet Selection**
- After city, staff selects their specific outlet
- Acceptance Criteria:
  - Only outlets belonging to the selected city are shown
  - Empty state shown when no outlets found for city

**FR-005: MUST — Session Logout**
- Staff can log out via the power button (bottom-left of sidebar)
- Acceptance Criteria:
  - Confirmation prompt before logout
  - Session cleared on logout; login page shown

---

### 6.2 Menu & Product Management

**FR-006: MUST — Display Menu by Category**
- Products grouped into: Semua (All), Makanan (Food), Minuman (Drinks)
- Acceptance Criteria:
  - Category filter tabs displayed; "Semua" active by default
  - Tab switch filters product grid without page reload

**FR-007: MUST — Product Card Display**
- Each product card shows: product image (or placeholder), name, price (Rp), stock availability (e.g. "Tersedia 20 item"), and Add button
- Acceptance Criteria:
  - Out-of-stock products show "Habis" badge and disabled "Tambahkan" button
  - Available products show teal "Tambahkan" button

**FR-008: MUST — Item Search**
- Search bar "Cari Item" filters products in real-time
- Acceptance Criteria:
  - Search is case-insensitive
  - Empty results show appropriate message

---

### 6.3 Order Management (Cashier Tablet)

**FR-009: MUST — Add Item to Order**
- Tapping "Tambahkan" adds item to the order panel with qty = 1
- Tapping again increments quantity
- Acceptance Criteria:
  - Order panel shows: item name (truncated), qty controls (−/+), line price, delete (trash) icon, and notes field
  - Adding same item increments quantity rather than creating duplicate entry

**FR-010: MUST — Adjust Item Quantity in Order**
- Staff can increase/decrease qty using +/− controls in the order panel
- Acceptance Criteria:
  - Decreasing qty to 0 removes the item from the order
  - Maximum quantity limited by available stock

**FR-011: MUST — Add Order Notes per Item**
- Each order line has a free-text "Order Notes" input
- Acceptance Criteria:
  - Notes are saved per item and sent to the kitchen
  - Max 200 characters per note field

**FR-012: MUST — Select Order Type**
- Toggle between "Dine In" and "Take Away" per order
- Acceptance Criteria:
  - Active type is highlighted (orange for Dine In, outlined for Take Away)
  - Selection persists until changed

**FR-013: MUST — Order Totals Calculation**
- Order panel calculates and displays:
  - Subtotal
  - Service Charge (5% of subtotal)
  - PB1 / Tax (10% of subtotal)
  - Total Pembayaran
- Acceptance Criteria:
  - Totals update in real-time as items are added/removed
  - Rounding follows Indonesian currency conventions (nearest Rp 1)

**FR-014: MUST — Auto-increment Order Number**
- Each new order receives a sequential number (e.g. #00001, #00002)
- Acceptance Criteria:
  - Order number resets daily per outlet
  - Numbers are zero-padded to 5 digits

---

### 6.4 Payment Processing

**FR-015: MUST — Payment Method Selection**
- Staff selects one of: QRIS, GoPay, Cash
- Acceptance Criteria:
  - Selected method is visually active (border/highlight)
  - Only one method selectable at a time

**FR-016: MUST — Customer Information Entry**
- Fields: Customer Name (Nama Pemesan), WhatsApp Number (No. WA)
- Also: Order Type dropdown + Table Number (No. Meja) for Dine In
- Acceptance Criteria:
  - WA number validated as numeric, 10–13 digits
  - Table number only required when order type is Dine In
  - Empty customer name is allowed (walk-up cash orders)

**FR-017: MUST — QRIS Payment Flow**
- Upon confirming QRIS payment, system calls payment gateway and displays QR code
- Countdown timer shows payment deadline (10 minutes default)
- Acceptance Criteria:
  - QR code includes merchant name, NMID
  - System polls or listens for payment confirmation
  - On success: order status updates; WA notification triggered
  - On timeout: order remains in pending state; staff can re-generate QR

**FR-018: MUST — Cash Payment Flow**
- Staff confirms cash received and completes order
- Acceptance Criteria:
  - No payment gateway call for cash
  - Order status immediately set to paid/received
  - WA notification triggered if WA number provided

**FR-019: MUST — Cancel Order**
- "Batalkan Order" link cancels the current order
- Acceptance Criteria:
  - Confirmation dialog before cancellation
  - Cancelled order is logged in system
  - Order number is not reused

---

### 6.5 Self-Kiosk (TV Display)

**FR-020: MUST — Customer Product Browsing**
- 2×N grid of product cards showing: image, name, price
- Sidebar navigation icons for menu sections
- Acceptance Criteria:
  - Products load within 2 seconds of kiosk waking
  - Grid scrolls vertically for overflow items

**FR-021: MUST — Item Detail Popup**
- Tapping a product card opens an overlay showing image, name, price, and qty controls
- "Add Order" button adds to cart
- Acceptance Criteria:
  - Popup closable via X button
  - Qty defaults to 1; can increase with + button

**FR-022: MUST — Cart Management (Kiosk)**
- Cart accessible via "View Order" button showing count (e.g. "View Order (2)")
- Cart shows item list with qty controls and "Hapus" (Delete) button
- Acceptance Criteria:
  - Subtotal, service charge, PB1, and total shown in cart
  - Removing all items resets to empty cart state

**FR-023: MUST — Restart Order (Kiosk)**
- "Restart Order" button clears all items and returns to browsing
- Acceptance Criteria:
  - Confirmation prompt before clearing
  - Total resets to Rp 0

**FR-024: MUST — Customer Name & WA Entry (Kiosk)**
- Before payment, kiosk prompts: "Isi Nama dan Nomor WhatsApp"
- Subtitle: "untuk kebutuhan notifikasi status order"
- Footer note: "Digital Struk akan dikirim melalui WhatsApp"
- Acceptance Criteria:
  - "Lanjut ke Pembayaran" enabled only when both fields are valid
  - "Kembali ke Order" takes customer back to cart

**FR-025: MUST — QRIS Payment (Kiosk)**
- QRIS QR code displayed after customer info entry
- Payment countdown timer shown
- Acceptance Criteria:
  - On payment success: "Pembayaran berhasil" confirmation shown with ✓
  - "Selesai" button + auto-return to idle screen after 10 seconds
  - "Kembali ke awal dalam 10 detik" countdown shown

---

### 6.6 Kitchen Display

**FR-026: MUST — Real-time Order Display**
- New paid orders appear automatically in the "NEW ORDER" column
- Acceptance Criteria:
  - Orders appear within 5 seconds of payment confirmation
  - Each card shows: Order No, Customer Name, time placed, item list (name + qty)
  - Column header shows count badge (e.g. "(2)")

**FR-027: MUST — Order Status Transitions**
- Kitchen staff advances orders through statuses:
  - NEW ORDER → "Proses" → ON PROCESS
  - ON PROCESS → "Ready to Pickup" → PICKUP
  - PICKUP → "Complete" → COMPLETE
- Acceptance Criteria:
  - Status change triggers corresponding WA notification
  - Transition is instant; no page reload required

**FR-028: SHOULD — Remind Pickup**
- "Remind Pickup" button in PICKUP column re-sends WA notification to customer
- Acceptance Criteria:
  - Button only visible in PICKUP column
  - Rate-limited to once every 2 minutes per order

**FR-029: SHOULD — Remaining Products Display**
- "Sisa Produk Hari Ini" (Remaining Products Today) section on kitchen dashboard
- Acceptance Criteria:
  - Shows remaining stock count per product
  - Staff can update remaining quantity from the kitchen tablet

---

### 6.7 WhatsApp Notifications

**FR-030: MUST — Order Received Notification**
- Sent when payment is confirmed
- Message content: order number, items ordered, total amount

**FR-031: MUST — Order Processing Notification**
- Sent when kitchen moves order to ON PROCESS status
- Message content: order is being prepared, estimated time

**FR-032: MUST — Ready for Pickup Notification**
- Sent when kitchen marks order as ready
- Message content: order number, pickup reminder

**FR-033: MUST — Order Completed / Thank You Notification**
- Sent when order is marked COMPLETE
- Message content: thank you, BliBli Microsite link for voucher/promo

**FR-034: SHOULD — Delayed Pickup Reminder (10 minutes)**
- If order remains in PICKUP status for 10+ minutes, system sends automatic WA nudge
- Acceptance Criteria:
  - Triggered automatically; no staff action needed
  - Sent only once per order unless staff presses "Remind Pickup"

---

### 6.8 Reporting & Analytics (Admin)

**FR-035: MUST — Summary Dashboard**
- Displays: Total Sales (Rp), Transactions count, Buyer count, Code Redeemed count, Top City/Outlet
- Date range filter: Start Date / End Date
- Quick filter: "Last 7 days" default
- Acceptance Criteria:
  - Numbers update when date range changes
  - "Download" button exports report as CSV/PDF

**FR-036: MUST — Product Performance**
- Horizontal scroll of top-performing products with sold quantity
- Acceptance Criteria:
  - Products ordered by quantity sold (descending)
  - Images and names shown per product

**FR-037: MUST — Sales Trends Chart**
- Line chart with Hourly / Daily toggle
- Multiple product lines colour-coded
- Acceptance Criteria:
  - X-axis: time intervals; Y-axis: sales amount in Rp
  - Chart readable on tablet screen

**FR-038: MUST — City/Outlet Performance Table**
- Table columns: City, Sales (Rp), Transactions, Redeem Code, per-product quantities
- Acceptance Criteria:
  - Sortable by column
  - All active cities shown

**FR-039: SHOULD — Voucher Program Impact**
- Metrics: Total Redeem Code Used, Total Sales (With Code), Avg Order (With Code), Avg Order (Without Code), Uplift in Avg Order Value
- Acceptance Criteria:
  - Uplift shown as percentage change (e.g. +16.7%)
  - Section only visible when voucher/redeem feature is active

---

## 7. Non-Functional Requirements

**NFR-001: MUST — Performance**
- API responses ≤ 300ms at p95 under normal load
- Menu page loads within 2 seconds on tablet Wi-Fi connection
- QRIS QR code renders within 3 seconds of payment initiation

**NFR-002: MUST — Security**
- PIN stored as bcrypt hash (minimum cost factor 12); never transmitted in plaintext
- All API communication over HTTPS/TLS 1.2+
- JWT tokens expire in 8 hours (staff shift length); refresh token for auto-renewal during active sessions
- WA numbers and customer names encrypted at rest (AES-256)

**NFR-003: MUST — Availability**
- System uptime ≥ 99.5% during outlet operating hours (typically 08:00–22:00 local time)
- Payment gateway integration includes retry logic (max 3 retries, exponential backoff)

**NFR-004: MUST — Offline Resilience**
- Cashier tablet caches current menu data locally; can display menu during brief connectivity loss
- Orders queued locally and synced when connectivity restores

**NFR-005: SHOULD — Scalability**
- Backend supports ≥ 100 concurrent active orders across all outlets
- Architecture is multi-tenant by outlet; isolated data per outlet

**NFR-006: MUST — Device Compatibility**
- Primary device: iPad (10–11", landscape orientation) running iPadOS 16+
- Self-kiosk: HD TV or large tablet (portrait orientation) with touch support
- Front-end tested on Chrome/Safari (latest 2 major versions)

**NFR-007: SHOULD — Data Retention**
- Order data retained for 2 years
- Reports aggregated monthly after 6 months to reduce storage

**NFR-008: MUST — Localisation**
- Currency formatted as "Rp X.XXX" (ID locale)
- Dates in Indonesian format: "Selasa, 12 Agustus 2025"
- UI text uses Bahasa Indonesia for customer-facing and staff interfaces

---

## 8. Epics & User Stories

### Epic 1: Authentication & Setup
**Business Value:** Ensure only authorised staff access the POS and associate orders with the correct outlet.

| Story ID | User Story |
|----------|-----------|
| US-001 | As a cashier, I want to log in with my username so that the system knows who I am |
| US-002 | As a cashier, I want to verify my identity with a 4-digit PIN so that my account is secure |
| US-003 | As a cashier, I want to select my city and outlet on login so that orders are attributed to the right location |
| US-004 | As a cashier, I want to log out after my shift so that no one can use my session |

---

### Epic 2: Order Management (Staff)
**Business Value:** Allow staff to take and manage customer orders accurately and efficiently.

| Story ID | User Story |
|----------|-----------|
| US-005 | As a cashier, I want to browse and search the menu so that I can find items quickly |
| US-006 | As a cashier, I want to add items with quantity and notes so that the kitchen has all information |
| US-007 | As a cashier, I want to select Dine In or Take Away so that the order type is communicated to the kitchen |
| US-008 | As a cashier, I want to see the running total so that I can inform the customer before payment |

---

### Epic 3: Payment Processing
**Business Value:** Enable fast, accurate, multi-method payment and provide customers with digital receipts.

| Story ID | User Story |
|----------|-----------|
| US-009 | As a cashier, I want to select QRIS, GoPay, or Cash so that I can accommodate the customer's preferred payment |
| US-010 | As a cashier, I want the QRIS QR code to be generated automatically so that the customer can scan and pay |
| US-011 | As a cashier, I want payment confirmation to automatically update the order status so that I don't need to manually confirm |
| US-012 | As a cashier, I want to cancel an order if the customer changes their mind so that the record is accurate |

---

### Epic 4: Self-Kiosk Ordering
**Business Value:** Reduce queue pressure on staff by enabling customers to self-serve.

| Story ID | User Story |
|----------|-----------|
| US-013 | As a customer, I want to browse the menu on the kiosk so that I can order without waiting for a waiter |
| US-014 | As a customer, I want to see item details and set quantity so that I order exactly what I want |
| US-015 | As a customer, I want to review my cart before paying so that I can make changes |
| US-016 | As a customer, I want to enter my WhatsApp number so that I receive order status updates |
| US-017 | As a customer, I want to pay via QRIS on the kiosk so that the transaction is cashless and quick |

---

### Epic 5: Kitchen Operations
**Business Value:** Give kitchen staff real-time visibility into orders and status control to communicate readiness.

| Story ID | User Story |
|----------|-----------|
| US-018 | As a cook, I want new orders to appear on my screen immediately after payment so that I can start preparation |
| US-019 | As a cook, I want to mark an order as "in process" so that the system and customer know I've started |
| US-020 | As a cook, I want to mark an order as "ready for pickup" so that the customer is notified via WA |
| US-021 | As a cook, I want to send a pickup reminder if the customer hasn't collected their order so that the counter stays clear |
| US-022 | As a cook, I want to see remaining stock per product so that I can flag when items are running low |

---

### Epic 6: WhatsApp Notifications
**Business Value:** Keep customers informed throughout their order journey to reduce anxiety and unnecessary queueing.

| Story ID | User Story |
|----------|-----------|
| US-023 | As a customer, I want a WA message when my order is received so that I know it's been placed |
| US-024 | As a customer, I want a WA message when the kitchen starts my order so that I know progress is being made |
| US-025 | As a customer, I want a WA message when my food is ready so that I can go collect it |
| US-026 | As a customer, I want a WA thank-you message with a BliBli link so that I can access any promotions |

---

### Epic 7: Reporting & Analytics
**Business Value:** Enable managers to make data-driven decisions on product mix, outlet performance, and marketing ROI.

| Story ID | User Story |
|----------|-----------|
| US-027 | As a manager, I want a sales summary by date range so that I can track overall revenue |
| US-028 | As a manager, I want product performance data so that I know which items to prioritise |
| US-029 | As a manager, I want to compare outlet performance so that I can identify top and underperforming locations |
| US-030 | As a manager, I want voucher/redeem code impact metrics so that I can evaluate the BliBli partnership ROI |
| US-031 | As a manager, I want to download reports as CSV/PDF so that I can share with stakeholders |

---

## 9. Prioritization (MoSCoW)

| Priority | Feature Area |
|----------|-------------|
| **Must Have** | Authentication (FR-001 to FR-005) |
| **Must Have** | Menu Display & Order Management (FR-006 to FR-014) |
| **Must Have** | Payment Processing — QRIS & Cash (FR-015 to FR-019) |
| **Must Have** | Self-Kiosk Core Flow (FR-020 to FR-025) |
| **Must Have** | Kitchen Display — Order Status (FR-026 to FR-027) |
| **Must Have** | WA Notifications — Core 4 (FR-030 to FR-033) |
| **Must Have** | Basic Reporting (FR-035 to FR-038) |
| **Should Have** | GoPay Integration (FR-015 payment method) |
| **Should Have** | Remind Pickup (FR-028) |
| **Should Have** | Remaining Products Tracking (FR-029) |
| **Should Have** | Delayed WA Reminder (FR-034) |
| **Should Have** | Voucher Program Impact Report (FR-039) |
| **Could Have** | Report PDF/CSV Export (FR-035 Download) |
| **Won't Have (v1)** | Multi-language support beyond Bahasa Indonesia |
| **Won't Have (v1)** | Loyalty points system |
| **Won't Have (v1)** | Online/delivery ordering |

---

## 10. Out of Scope

- Inventory management / stock replenishment beyond daily remaining count
- Staff scheduling or HR management
- Multi-currency support
- Delivery order management
- Customer-facing mobile app
- Loyalty / points program
- Third-party aggregator integrations (GrabFood, GoFood) beyond BliBli QR microsite

---

## 11. Dependencies & Assumptions

### Dependencies
| Dependency | Owner | Impact if Unavailable |
|------------|-------|----------------------|
| QRIS Payment Gateway API | Payment Provider | QRIS and GoPay payment unavailable |
| WhatsApp Business API | Meta / WA BSP | All WA notifications unavailable |
| BliBli Microsite URL | BliBli Partnership | QR/WA link omitted from notifications |
| Stable outlet Wi-Fi | Outlet Operations | Offline mode activates; some features degraded |

### Assumptions
- All tablets are company-managed iPads with stable Wi-Fi at each outlet.
- Each outlet has a designated staff PIN and username provisioned before go-live.
- Payment gateway provider supports QRIS and GoPay under a single merchant account per outlet.
- WhatsApp Business API is approved and the phone number is registered per city or per outlet.
- Product catalogue (names, prices, categories, images) is pre-loaded by an admin before POS launch.
- Service charge (5%) and PB1 tax (10%) rates are fixed for v1.0; configurable in a later version.

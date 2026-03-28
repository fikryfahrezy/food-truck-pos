# Technical Documentation
# Food Truck Jajanan Bango — POS System

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Draft

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Entity Relationship Diagram (ERD)](#3-entity-relationship-diagram-erd)
4. [Database Schema](#4-database-schema)
5. [API Contract](#5-api-contract)
6. [Integration Specifications](#6-integration-specifications)
7. [Authentication & Security](#7-authentication--security)
8. [Real-time Communication](#8-real-time-communication)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Error Codes & Handling](#10-error-codes--handling)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                               │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  Cashier/Waiter │  │  Self-Kiosk     │  │ Kitchen Display │    │
│  │  Tablet (Nuxt)  │  │  TV (Nuxt)      │  │ Tablet (Nuxt)   │    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘    │
│           │                   │                     │              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Admin Report Dashboard (Nuxt)              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS REST + WebSocket
┌──────────────────────────────┴──────────────────────────────────────┐
│                         Backend Layer                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Quarkus REST API (Java)                        │   │
│  │                                                             │   │
│  │  Auth Service │ Order Service │ Menu Service │ Report Svc   │   │
│  │  Payment Svc  │ Notif Service │ Outlet Svc   │ Kiosk Svc    │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │                    Data Layer                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │   │
│  │  │ PostgreSQL  │  │    Redis    │  │   Object Storage    │ │   │
│  │  │ (Primary DB)│  │  (Cache +   │  │   (Product Images)  │ │   │
│  │  │             │  │  Sessions + │  │                     │ │   │
│  │  │             │  │  WS pubsub) │  │                     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                       External Services                             │
│                                                                     │
│   ┌─────────────────────┐      ┌──────────────────────────────┐    │
│   │  QRIS/GoPay Payment │      │ WhatsApp Business API (BSP)  │    │
│   │  Gateway            │      │                              │    │
│   └─────────────────────┘      └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Breakdown

| Module | Responsibility |
|--------|---------------|
| Auth Service | Login, PIN verification, JWT issuance, session management |
| Menu Service | Product catalogue, categories, stock availability |
| Order Service | Order creation, item management, status transitions |
| Payment Service | Payment initiation, gateway integration, settlement |
| Notification Service | WA message dispatch, scheduling, retry queue |
| Outlet Service | City, outlet CRUD and assignment |
| Kiosk Service | Self-kiosk session management, cart state |
| Report Service | Aggregated analytics queries, export generation |

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | Nuxt.js (Vue 3) | 3.x | Composition API, SSR disabled (SPA mode for tablet) |
| **Frontend UI** | Tailwind CSS | 3.x | Utility-first styling |
| **Backend** | Quarkus (Java) | 3.x | Native compilation support, REST via RESTEasy |
| **ORM** | Hibernate Panache | — | Active Record pattern |
| **Database** | PostgreSQL | 15+ | Primary persistence |
| **Cache / Sessions** | Redis | 7+ | JWT token store, real-time pub/sub |
| **Object Storage** | S3-compatible | — | Product images |
| **Containerisation** | Docker / Docker Compose | — | Per environment compose files provided |
| **WA Integration** | WhatsApp Business API | — | Via approved BSP (Business Solution Provider) |
| **Payment** | QRIS / GoPay | — | Via payment gateway (e.g. Midtrans, Xendit) |
| **Code Quality** | Checkstyle, ESLint | — | `checkstyle.xml`, `eslint.config.mjs` |
| **Task Runner** | Lefthook | — | Git hooks for lint/test |

---

## 3. Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    cities    │       │   outlets    │       │    users     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──────<│ id (PK)      │       │ id (PK)      │
│ name         │       │ city_id (FK) │       │ username     │
│ created_at   │       │ name         │       │ pin_hash     │
└──────────────┘       │ is_active    │       │ full_name    │
                       │ created_at   │       │ role         │
                       └──────┬───────┘       │ is_active    │
                              │               │ created_at   │
                              │               └──────┬───────┘
                              │                      │
                              │               ┌──────┴──────────┐
                              │               │  user_sessions  │
                              │               ├─────────────────┤
                              │               │ id (PK)         │
                              │               │ user_id (FK)    │
                              │               │ outlet_id (FK)──┤
                              │               │ jwt_jti         │
                              │               │ expires_at      │
                              │               │ created_at      │
                              │               └─────────────────┘
                              │
              ┌───────────────┴──────────────┐
              │                              │
┌─────────────┴──────┐       ┌───────────────┴──────┐
│  product_categories│       │      products        │
├────────────────────┤       ├──────────────────────┤
│ id (PK)            │──────<│ id (PK)              │
│ name               │       │ category_id (FK)     │
│ display_order      │       │ outlet_id (FK) ──────┤
│ created_at         │       │ name                 │
└────────────────────┘       │ price                │
                             │ image_url            │
                             │ stock_quantity       │
                             │ is_available         │
                             │ created_at           │
                             │ updated_at           │
                             └──────────────────────┘
                                        │
                                        │
┌─────────────────────────────────────┐ │
│              orders                 │ │
├─────────────────────────────────────┤ │
│ id (PK)                             │ │
│ order_number    (e.g. 00001)        │ │
│ outlet_id (FK)                      │ │
│ cashier_user_id (FK, nullable)      │ │
│ customer_name                       │ │
│ customer_wa                         │ │
│ order_type      (dine_in/take_away) │ │
│ table_number    (nullable)          │ │
│ source          (cashier/kiosk)     │ │
│ status (new/processing/pickup/done) │ │
│ payment_method  (qris/gopay/cash)   │ │
│ payment_status  (pending/paid/fail) │ │
│ subtotal                            │ │
│ service_charge                      │ │
│ tax_pb1                             │ │
│ total_amount                        │ │
│ payment_ref     (gateway ref ID)    │ │
│ created_at                          │ │
│ updated_at                          │ │
└────────────────┬────────────────────┘
                 │
┌────────────────┴────────────────────┐
│           order_items               │
├─────────────────────────────────────┤
│ id (PK)                             │
│ order_id (FK)                       │
│ product_id (FK) ────────────────────┘
│ product_name    (snapshot at order) │
│ product_price   (snapshot at order) │
│ quantity                            │
│ notes                               │
│ created_at                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       wa_notifications              │
├─────────────────────────────────────┤
│ id (PK)                             │
│ order_id (FK)                       │
│ type  (received/processing/pickup/  │
│        complete/reminder)           │
│ wa_number                           │
│ message_text                        │
│ status  (pending/sent/failed)       │
│ sent_at (nullable)                  │
│ error_message (nullable)            │
│ created_at                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           vouchers                  │
├─────────────────────────────────────┤
│ id (PK)                             │
│ code                                │
│ discount_type (fixed/percent)       │
│ discount_value                      │
│ valid_from                          │
│ valid_until                         │
│ usage_limit                         │
│ usage_count                         │
│ is_active                           │
│ created_at                          │
└────────────────┬────────────────────┘
                 │
┌────────────────┴────────────────────┐
│         order_vouchers              │
├─────────────────────────────────────┤
│ id (PK)                             │
│ order_id (FK)                       │
│ voucher_id (FK)                     │
│ discount_amount                     │
│ created_at                          │
└─────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Key Design Decisions

- **Order number** is sequential per outlet per calendar day; reset at midnight. Format: `YYMMDD-OUTLETID-NNNNN` internally, displayed as `#NNNNN`.
- **Product name and price** are snapshotted in `order_items` to preserve historical order accuracy.
- **customer_wa** column is encrypted at rest (AES-256 via application-level encryption before write).
- **Soft deletes** on `products` and `outlets` via `is_active` flag; no hard deletes.
- **Indexes:** `orders(outlet_id, created_at)`, `orders(status)`, `order_items(order_id)`, `products(outlet_id, category_id, is_available)`.

### 4.2 Enumerated Types

```sql
-- Order status lifecycle
CREATE TYPE order_status AS ENUM ('new', 'processing', 'pickup', 'complete', 'cancelled');

-- Payment method
CREATE TYPE payment_method AS ENUM ('qris', 'gopay', 'cash');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'expired');

-- Order source
CREATE TYPE order_source AS ENUM ('cashier', 'kiosk');

-- Order type
CREATE TYPE order_type AS ENUM ('dine_in', 'take_away');

-- User role
CREATE TYPE user_role AS ENUM ('cashier', 'kitchen', 'admin');

-- WA notification type
CREATE TYPE wa_notif_type AS ENUM ('received', 'processing', 'pickup', 'complete', 'reminder');

-- WA notification send status
CREATE TYPE notif_status AS ENUM ('pending', 'sent', 'failed');
```

---

## 5. API Contract

### 5.1 Base URL & Versioning

```
Base URL: https://api.fjb-pos.internal/v1
Content-Type: application/json
Authorization: Bearer <JWT>
```

All timestamps are ISO 8601 UTC. All monetary amounts are integers in IDR (Indonesian Rupiah) **cents** — i.e., `Rp 98.175` is stored and transmitted as `9817500` (value × 100) to avoid floating-point issues. Display formatting is handled client-side.

---

### 5.2 Authentication

#### POST /auth/login
Validates username and returns user info with full name; does not issue JWT yet.

**Request:**
```json
{
  "username": "kamal"
}
```

**Response 200:**
```json
{
  "user_id": "usr_01HWZ3F4Q8Y2N",
  "full_name": "Kamal",
  "requires_pin": true
}
```

**Response 404:**
```json
{ "error": "USER_NOT_FOUND", "message": "Username not found" }
```

---

#### POST /auth/pin
Verifies PIN and issues JWT. Increments failed attempt counter.

**Request:**
```json
{
  "user_id": "usr_01HWZ3F4Q8Y2N",
  "pin": "1234"
}
```

**Response 200:**
```json
{
  "access_token": "<JWT>",
  "token_type": "Bearer",
  "expires_in": 28800,
  "user": {
    "id": "usr_01HWZ3F4Q8Y2N",
    "full_name": "Kamal",
    "role": "cashier"
  }
}
```

**Response 401:**
```json
{
  "error": "INVALID_PIN",
  "message": "Incorrect PIN",
  "attempts_remaining": 2
}
```

**Response 423:**
```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account locked due to too many failed attempts",
  "locked_until": "2026-03-27T10:35:00Z"
}
```

---

#### POST /auth/logout
Invalidates the JWT by adding `jti` to Redis denylist.

**Headers:** `Authorization: Bearer <JWT>`

**Response 204:** (No Content)

---

#### GET /auth/cities
Returns cities with active outlets. Requires valid JWT.

**Response 200:**
```json
{
  "cities": [
    { "id": "city_01", "name": "Jakarta" },
    { "id": "city_02", "name": "Bandung" },
    { "id": "city_03", "name": "Surabaya" }
  ]
}
```

---

#### GET /auth/outlets?city_id={city_id}
Returns outlets for a given city.

**Response 200:**
```json
{
  "outlets": [
    { "id": "out_01", "name": "Food Truck Jajanan Bango JKT" },
    { "id": "out_02", "name": "Food Truck Jajanan Bango BSD" }
  ]
}
```

---

#### POST /auth/select-outlet
Sets outlet in session/JWT claims. Returns updated token.

**Request:**
```json
{
  "outlet_id": "out_01"
}
```

**Response 200:**
```json
{
  "access_token": "<updated JWT with outlet claim>",
  "outlet": {
    "id": "out_01",
    "name": "Food Truck Jajanan Bango JKT",
    "city": "Jakarta"
  }
}
```

---

### 5.3 Menu

#### GET /menu/categories
Returns product categories.

**Response 200:**
```json
{
  "categories": [
    { "id": "cat_01", "name": "Makanan", "display_order": 1 },
    { "id": "cat_02", "name": "Minuman", "display_order": 2 }
  ]
}
```

---

#### GET /menu/products?category_id={id}&search={query}&outlet_id={id}
Returns products filtered by category and/or search query for a given outlet.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| outlet_id | string | Yes | Outlet to fetch menu for |
| category_id | string | No | Filter by category |
| search | string | No | Full-text search on product name |

**Response 200:**
```json
{
  "products": [
    {
      "id": "prod_01",
      "name": "Mienta Bakmi",
      "price": 2500000,
      "category_id": "cat_01",
      "category_name": "Makanan",
      "image_url": "https://cdn.fjb.internal/products/mienta-bakmi.jpg",
      "stock_quantity": 20,
      "is_available": true
    },
    {
      "id": "prod_04",
      "name": "Iced Coffee Malika",
      "price": 2500000,
      "category_id": "cat_02",
      "category_name": "Minuman",
      "image_url": null,
      "stock_quantity": 0,
      "is_available": false
    }
  ]
}
```

---

#### PATCH /menu/products/{product_id}/stock
Updates remaining stock for a product. Kitchen staff use this.

**Request:**
```json
{
  "stock_quantity": 15
}
```

**Response 200:**
```json
{
  "id": "prod_01",
  "stock_quantity": 15,
  "is_available": true
}
```

---

### 5.4 Orders

#### POST /orders
Creates a new order (cashier or kiosk). Returns the order with number assigned.

**Request:**
```json
{
  "outlet_id": "out_01",
  "source": "cashier",
  "order_type": "dine_in",
  "table_number": "5",
  "customer_name": "Fajar Syarief",
  "customer_wa": "628123456789",
  "payment_method": "qris",
  "items": [
    {
      "product_id": "prod_03",
      "quantity": 1,
      "notes": "tidak pedas"
    },
    {
      "product_id": "prod_02",
      "quantity": 2,
      "notes": ""
    }
  ]
}
```

**Response 201:**
```json
{
  "id": "ord_01HXZ",
  "order_number": "00001",
  "outlet_id": "out_01",
  "source": "cashier",
  "order_type": "dine_in",
  "table_number": "5",
  "customer_name": "Fajar Syarief",
  "status": "new",
  "payment_status": "pending",
  "payment_method": "qris",
  "items": [
    {
      "id": "oi_01",
      "product_id": "prod_03",
      "product_name": "Roti Mochi Ayam Kecap",
      "product_price": 2500000,
      "quantity": 1,
      "notes": "tidak pedas",
      "line_total": 2500000
    },
    {
      "id": "oi_02",
      "product_id": "prod_02",
      "product_name": "Nasi Goreng Saikoro",
      "product_price": 3000000,
      "quantity": 2,
      "notes": "",
      "line_total": 6000000
    }
  ],
  "subtotal": 8500000,
  "service_charge": 425000,
  "tax_pb1": 892500,
  "total_amount": 9817500,
  "created_at": "2026-03-27T08:01:00Z"
}
```

**Response 422:**
```json
{
  "error": "PRODUCT_UNAVAILABLE",
  "message": "Product 'Iced Coffee Malika' is out of stock",
  "product_id": "prod_04"
}
```

---

#### GET /orders/{order_id}
Returns full order details.

**Response 200:** Same structure as POST /orders response body.

---

#### GET /orders?outlet_id={id}&status={status}&date={YYYY-MM-DD}
Returns orders for kitchen display or cashier history.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| outlet_id | string | Yes | Filter by outlet |
| status | string | No | Filter by order status |
| date | string | No | ISO date; defaults to today |

**Response 200:**
```json
{
  "orders": [ /* array of order objects (same structure as above) */ ],
  "total": 8
}
```

---

#### PATCH /orders/{order_id}/status
Transitions order to the next status. Only valid transitions accepted.

**Valid transitions:**
| From | To | Trigger |
|------|----|---------|
| `new` | `processing` | Kitchen taps "Proses" |
| `processing` | `pickup` | Kitchen taps "Ready to Pickup" |
| `pickup` | `complete` | Kitchen taps "Complete" |
| `new` / `processing` | `cancelled` | Cashier cancels order |

**Request:**
```json
{
  "status": "processing"
}
```

**Response 200:**
```json
{
  "id": "ord_01HXZ",
  "order_number": "00001",
  "status": "processing",
  "updated_at": "2026-03-27T08:05:00Z"
}
```

**Response 422:**
```json
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot transition from 'pickup' to 'new'"
}
```

---

#### POST /orders/{order_id}/remind-pickup
Sends a WA reminder to the customer for an order in PICKUP status.

**Response 200:**
```json
{
  "message": "Reminder sent",
  "next_allowed_at": "2026-03-27T08:17:00Z"
}
```

**Response 429:**
```json
{
  "error": "RATE_LIMITED",
  "message": "Reminder already sent recently",
  "next_allowed_at": "2026-03-27T08:17:00Z"
}
```

---

### 5.5 Payment

#### POST /payments/initiate
Initiates payment and, for QRIS/GoPay, returns the QR code or redirect URL.

**Request:**
```json
{
  "order_id": "ord_01HXZ",
  "payment_method": "qris"
}
```

**Response 200 (QRIS):**
```json
{
  "payment_id": "pay_01HXZ",
  "order_id": "ord_01HXZ",
  "payment_method": "qris",
  "qr_string": "00020101021226...",
  "qr_image_url": "https://cdn.fjb.internal/qr/pay_01HXZ.png",
  "amount": 9817500,
  "expires_at": "2026-03-27T08:11:00Z"
}
```

**Response 200 (Cash):**
```json
{
  "payment_id": "pay_02HXZ",
  "order_id": "ord_01HXZ",
  "payment_method": "cash",
  "status": "paid",
  "amount": 9817500
}
```

---

#### POST /payments/webhook
Receives payment status callback from the payment gateway. This endpoint is **not** authenticated by JWT; it uses HMAC signature verification.

**Request (from gateway):**
```json
{
  "payment_id": "pay_01HXZ",
  "order_id": "ord_01HXZ",
  "status": "settlement",
  "transaction_id": "GW-TXN-XYZ123",
  "signature": "hmac_sha256_signature"
}
```

**Response 200:**
```json
{ "received": true }
```

> Backend verifies HMAC signature against shared secret before processing. On verified success: payment_status → `paid`, order_status → `new`, WA notification enqueued.

---

#### GET /payments/{payment_id}/status
Polls payment status (used as fallback to webhook).

**Response 200:**
```json
{
  "payment_id": "pay_01HXZ",
  "status": "pending",
  "expires_at": "2026-03-27T08:11:00Z"
}
```

---

### 5.6 Reports

#### GET /reports/summary?start_date={date}&end_date={date}&outlet_id={id}
Returns aggregate summary for the selected period.

**Response 200:**
```json
{
  "period": { "start": "2026-03-21", "end": "2026-03-27" },
  "total_sales": 320000000,
  "total_transactions": 345,
  "total_buyers": 330,
  "codes_redeemed": 314,
  "top_city": "Jakarta",
  "top_outlet": "Food Truck Jajanan Bango JKT"
}
```

---

#### GET /reports/products?start_date={date}&end_date={date}&outlet_id={id}
Returns product performance sorted by quantity sold descending.

**Response 200:**
```json
{
  "products": [
    { "id": "prod_01", "name": "Product A", "image_url": "...", "quantity_sold": 150 },
    { "id": "prod_06", "name": "Product F", "image_url": "...", "quantity_sold": 130 }
  ]
}
```

---

#### GET /reports/sales-trends?start_date={date}&end_date={date}&granularity={hourly|daily}&outlet_id={id}
Returns sales data for chart rendering.

**Response 200:**
```json
{
  "granularity": "hourly",
  "series": [
    {
      "product_id": "prod_01",
      "product_name": "Product A",
      "data": [
        { "timestamp": "2026-03-27T04:00:00Z", "amount": 15000000 },
        { "timestamp": "2026-03-27T08:00:00Z", "amount": 42000000 }
      ]
    }
  ]
}
```

---

#### GET /reports/outlets?start_date={date}&end_date={date}
Returns per-city/outlet performance table.

**Response 200:**
```json
{
  "rows": [
    {
      "city": "Jakarta",
      "outlet": "FJB JKT",
      "total_sales": 450000000,
      "transactions": 150,
      "codes_redeemed": 10,
      "products": [
        { "product_id": "prod_01", "name": "Product A", "quantity": 10 }
      ]
    }
  ]
}
```

---

#### GET /reports/voucher-impact?start_date={date}&end_date={date}
Returns voucher program metrics.

**Response 200:**
```json
{
  "total_codes_used": 80,
  "total_sales_with_code": 320000000,
  "avg_order_with_code": 21000000,
  "avg_order_without_code": 18000000,
  "uplift_percentage": 16.7
}
```

---

#### GET /reports/export?start_date={date}&end_date={date}&format={csv|pdf}
Triggers report export. Returns file download URL.

**Response 200:**
```json
{
  "download_url": "https://cdn.fjb.internal/exports/report-2026-03-27.csv",
  "expires_at": "2026-03-27T09:00:00Z"
}
```

---

## 6. Integration Specifications

### 6.1 QRIS / Payment Gateway

**Provider recommendation:** Midtrans or Xendit (both support QRIS and GoPay under a single merchant account)

**Flow:**
```
FJB Backend                    Payment Gateway
    │                               │
    │  POST /charge (order data)    │
    │──────────────────────────────>│
    │                               │
    │  { qr_string, transaction_id }│
    │<──────────────────────────────│
    │                               │
    │  (customer scans QR)          │
    │                               │
    │<──────────────────────────────│
    │  Webhook: settlement          │
    │                               │
    │  Verify HMAC signature        │
    │  Update order status          │
    │  Enqueue WA notification      │
```

**Key fields to retain:**  
- `transaction_id` from gateway stored in `orders.payment_ref`
- Webhook HMAC key stored in environment config (not in codebase)

**Timeout handling:**  
- QRIS QR expires in 10 minutes (configurable)  
- Backend sets `payment_status = expired` and notifies cashier via WebSocket

---

### 6.2 WhatsApp Business API

**Approach:** Use an approved WhatsApp BSP (e.g. Wati, Twilio, Vonage). Messages sent using pre-approved Message Templates.

**Template definitions:**

| Template Name | Trigger Event | Variables |
|--------------|---------------|-----------|
| `fjb_order_received` | Payment confirmed | `{{customer_name}}`, `{{order_number}}`, `{{total_amount}}`, `{{items_summary}}` |
| `fjb_order_processing` | Kitchen → ON PROCESS | `{{customer_name}}`, `{{order_number}}` |
| `fjb_order_ready` | Kitchen → PICKUP | `{{customer_name}}`, `{{order_number}}` |
| `fjb_order_complete` | Kitchen → COMPLETE | `{{customer_name}}`, `{{order_number}}`, `{{blibli_link}}` |
| `fjb_pickup_reminder` | 10 min timeout / manual remind | `{{customer_name}}`, `{{order_number}}` |

**Dispatch architecture:**
```
Order Status Change
        │
        ▼
  Notification Service
        │
        ▼
   Redis Queue (wa_notifications)
        │
        ▼
  WA Worker (Quarkus @Scheduled / Reactive consumer)
        │  ── success ──>  wa_notifications.status = 'sent'
        │  ── failure ──>  retry (max 3, exponential backoff)
                           after 3 failures: status = 'failed', alert ops
```

---

### 6.3 BliBli Microsite

The FJB system never directly integrates with BliBli. Integration is one-directional:
- Backend stores a configurable `blibli_microsite_url` per outlet/campaign.
- This URL is inserted as-is into the `fjb_order_complete` WA template variable `{{blibli_link}}`.
- For self-kiosk QRIS, the QR code image embeds this same URL so customers can scan to open the microsite.

---

## 7. Authentication & Security

### 7.1 JWT Structure

```json
{
  "iss": "fjb-pos-api",
  "sub": "usr_01HWZ3F4Q8Y2N",
  "jti": "unique-token-id",
  "role": "cashier",
  "outlet_id": "out_01",
  "exp": 1901520000,
  "iat": 1901491200
}
```

- Algorithm: **RS256** (asymmetric; private key signs, public key verifies)
- `jti` stored in Redis with TTL equal to token expiry for revocation (logout denylist)
- Tokens expire after **8 hours**

### 7.2 PIN Security

- PIN stored as **bcrypt** hash with cost factor 12 in the database
- PIN is never logged or stored in cache
- Failed attempt counter stored in Redis with a 5-minute TTL reset on success
- After 3 failed attempts within the window: account locked for 5 minutes

### 7.3 Data Encryption

- `customer_wa` and `customer_name` encrypted at application layer using **AES-256-GCM** before database write
- Encryption key managed via environment secret (not in source code)
- Database-level encryption at rest for the PostgreSQL volume

### 7.4 API Security

- All endpoints served over **HTTPS / TLS 1.2+**
- CORS configured to allow only the front-end domain origins
- Payment webhook endpoint validated using **HMAC-SHA256** signature of the request body
- Rate limiting on auth endpoints: 10 requests/minute per IP on `/auth/*`
- SQL injection prevention: all queries use parameterised statements via Hibernate Panache

### 7.5 Role-Based Access Control (RBAC)

| Role | Permitted Endpoints |
|------|-------------------|
| `cashier` | Auth, Menu (read), Orders (create/read/cancel), Payments |
| `kitchen` | Auth, Orders (read/status update), Menu stock update |
| `admin` | All of the above + Reports |
| `kiosk` | Menu (read), Orders (create — kiosk source), Payments |

> Kiosk sessions use a dedicated long-lived service token with restricted role; no username/PIN flow.

---

## 8. Real-time Communication

### 8.1 WebSocket Events

Kitchen display and cashier tablets subscribe to WebSocket channels for real-time updates.

**Connection:** `wss://api.fjb-pos.internal/v1/ws?outlet_id={id}&token={JWT}`

**Events emitted by server:**

| Event | Payload | Consumer |
|-------|---------|----------|
| `order.created` | `{ order_id, order_number, customer_name, items[], total_amount }` | Kitchen display |
| `order.status_changed` | `{ order_id, order_number, old_status, new_status }` | Kitchen + Cashier |
| `payment.confirmed` | `{ order_id, payment_method }` | Cashier tablet |
| `payment.expired` | `{ order_id }` | Cashier tablet |
| `stock.updated` | `{ product_id, stock_quantity }` | Cashier tablet (menu grid) |

### 8.2 Redis Pub/Sub Channel Naming

```
channel: outlet:{outlet_id}:orders       — order lifecycle events
channel: outlet:{outlet_id}:payments     — payment events
channel: outlet:{outlet_id}:stock        — stock update events
```

---

## 9. Deployment Architecture

### 9.1 Container Composition

The repository provides multiple Docker Compose files:

| File | Purpose |
|------|---------|
| `back-end/compose.jvm.yaml` | Backend running on JVM (development/staging) |
| `back-end/compose.native.yaml` | Backend native image (production) |
| `back-end/compose.native-micro.yaml` | Minimal native image for resource-constrained environments |
| `back-end/compose.legacy.yaml` | Legacy JAR mode |
| `front-end/compose.yaml` | Front-end Nuxt app |

### 9.2 Environment Variables

**Backend (`.env` or secrets manager):**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) |
| `AES_ENCRYPTION_KEY` | AES-256 key for PII encryption |
| `PAYMENT_GW_API_KEY` | Payment gateway API key |
| `PAYMENT_GW_WEBHOOK_SECRET` | HMAC secret for webhook validation |
| `WA_BSP_API_KEY` | WhatsApp BSP API key |
| `WA_BSP_API_URL` | WhatsApp BSP base URL |
| `S3_BUCKET_URL` | Object storage bucket endpoint |
| `S3_ACCESS_KEY` | Object storage access key |
| `S3_SECRET_KEY` | Object storage secret key |
| `BLIBLI_MICROSITE_URL` | Default BliBli microsite URL for WA templates |

**Frontend (`nuxt.config.ts` runtime config):**

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_API_BASE_URL` | Backend API base URL |
| `NUXT_PUBLIC_WS_BASE_URL` | Backend WebSocket URL |

### 9.3 Network Topology

```
Internet / Customer WA
       │
  [WAF / Load Balancer]
       │
  [API Gateway]
       │
  [Quarkus Container]
       │
  ┌────┴────┐
  │Postgres │
  │ Redis   │ (in private subnet; not internet-exposed)
  └─────────┘
```

---

## 10. Error Codes & Handling

### 10.1 Standard Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {}
}
```

### 10.2 Error Code Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 401 | `INVALID_PIN` | Incorrect PIN entered |
| 403 | `FORBIDDEN` | Role not permitted for this endpoint |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate order or resource conflict |
| 422 | `INVALID_TRANSITION` | Invalid order status transition |
| 422 | `PRODUCT_UNAVAILABLE` | One or more products out of stock |
| 423 | `ACCOUNT_LOCKED` | Account locked after failed PIN attempts |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `GATEWAY_ERROR` | External payment gateway unavailable |
| 503 | `SERVICE_UNAVAILABLE` | Backend temporarily unavailable |

### 10.3 Client Error Handling Guidelines

- **401 UNAUTHORIZED:** Clear local token, redirect to login page
- **423 ACCOUNT_LOCKED:** Display lock message and `locked_until` timestamp
- **422 PRODUCT_UNAVAILABLE:** Highlight the out-of-stock item in cart; prompt to remove
- **502 GATEWAY_ERROR (payment):** Allow cashier to retry after 10 seconds; offer Cash as fallback
- **Network timeout (kiosk):** Show "Menunggu pembayaran..." with retry option; auto-cancel after 10 minutes

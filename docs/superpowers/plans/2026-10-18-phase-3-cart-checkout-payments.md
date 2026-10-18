# Phase 3: Cart, Checkout & Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement shopping cart sync (Redis + localStorage), multi-vendor checkout flow with address selection and shipping options, payment gateway abstractions (eSewa, Khalti, FonePay, bank transfer, COD), and order splitting per vendor.

**Architecture:** Cart service using Redis and localStorage fallback; Checkout and Payment modules with webhook/callback handlers for Nepali payment gateways and order sub-splitting per vendor.

**Tech Stack:** Node.js, Express, MongoDB, Mongoose, Redis, Vite, React, Tailwind CSS, Axios.

**Spec:** `docs/superpowers/specs/2026-10-18-multivendor-ecommerce-design.md`

## Global Constraints

- Plain JavaScript (`.js`, `.jsx`) — no TypeScript.
- Currency: NPR.
- Secure payment verification callbacks.

---

## Tasks

### Task 1: Cart Backend & Frontend Module

**Files:**
- Create: `packages/server/src/modules/cart/cart.model.js` (or Redis-backed cart service)
- Create: `packages/server/src/modules/cart/cart.service.js`
- Create: `packages/server/src/modules/cart/cart.controller.js`
- Create: `packages/server/src/modules/cart/cart.routes.js`
- Create: `packages/client/src/features/storefront/cart/Cart.jsx`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Produces: `/api/v1/cart` (CRUD cart items, sync with user session).

- [ ] **Step 1: Implement Cart service using Redis (or MongoDB fallback) for persistent user carts**
- [ ] **Step 2: Implement Cart controller and routes**
- [ ] **Step 3: Implement Storefront Cart component in React with quantity controls and totals**
- [ ] **Step 4: Commit cart module**

```bash
git add packages/server/src/modules/cart packages/client/src/features/storefront/cart
git commit -m "feat: add cart backend module and storefront cart UI"
```

---

### Task 2: Checkout & Order Splitting Module

**Files:**
- Create: `packages/server/src/modules/orders/order.model.js`
- Create: `packages/server/src/modules/orders/order.service.js`
- Create: `packages/server/src/modules/orders/order.controller.js`
- Create: `packages/server/src/modules/orders/order.routes.js`
- Create: `packages/client/src/features/storefront/checkout/Checkout.jsx`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Consumes: Cart items, user addresses.
- Produces: `/api/v1/checkout`, `/api/v1/account/orders` (split orders by vendor).

- [ ] **Step 1: Implement Order Mongoose model supporting multi-vendor sub-orders**
- [ ] **Step 2: Implement Order service for calculating totals, shipping, splitting items by vendor, and stock deduction**
- [ ] **Step 3: Implement Checkout controller and routes**
- [ ] **Step 4: Implement Storefront Checkout component (address selection, shipping method, order summary)**
- [ ] **Step 5: Commit checkout and order module**

```bash
git add packages/server/src/modules/orders packages/client/src/features/storefront/checkout
git commit -m "feat: add multi-vendor order splitting backend and checkout UI"
```

---

### Task 3: Payment Gateways Integration (eSewa, Khalti, FonePay, COD, Bank Transfer)

**Files:**
- Create: `packages/server/src/modules/payments/payment.model.js`
- Create: `packages/server/src/modules/payments/payment.service.js`
- Create: `packages/server/src/modules/payments/payment.controller.js`
- Create: `packages/server/src/modules/payments/payment.routes.js`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Consumes: Order creation.
- Produces: `/api/v1/payments/initiate`, `/api/v1/payments/verify`.

- [ ] **Step 1: Implement Payment Mongoose model and verification service for eSewa, Khalti, FonePay, Bank Transfer, and COD**
- [ ] **Step 2: Implement Payment controller and callback/webhook routes**
- [ ] **Step 3: Commit payment integration module**

```bash
git add packages/server/src/modules/payments
git commit -m "feat: add payment gateway integration for eSewa, Khalti, FonePay, COD, and Bank Transfer"
```

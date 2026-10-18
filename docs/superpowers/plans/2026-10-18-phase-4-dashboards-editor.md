# Phase 4: Dashboards, Layout Editor & Vendor Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement vendor order fulfillment workflows, super-admin moderation & payout management, drag-and-drop homepage layout editor (`dnd-kit`), and real-time Socket.io notifications.

**Architecture:** Extended backend modules for fulfillment, admin controls, layout persistence, and Socket.io event broadcasting. Frontend dashboards for vendors and admins, plus the visual layout editor canvas and properties panel.

**Tech Stack:** Node.js, Express, Socket.io, Mongoose, Vite, React, Tailwind CSS, dnd-kit.

**Spec:** `docs/superpowers/specs/2026-10-18-multivendor-ecommerce-design.md`

## Global Constraints

- Plain JavaScript (`.js`, `.jsx`) — no TypeScript.
- Three user roles: customer, vendor, admin.
- Bilingual (`en`, `ne`), currency NPR.

---

## Tasks

### Task 1: Vendor Order Fulfillment & Sales Reports

**Files:**
- Create: `packages/client/src/features/vendor/orders/VendorOrders.jsx`
- Create: `packages/client/src/features/vendor/reports/VendorReports.jsx`
- Modify: `packages/server/src/modules/orders/order.controller.js`

**Interfaces:**
- Produces: Vendor dashboard order status updates and sales report analytics.

- [ ] **Step 1: Implement Vendor Orders management UI (view sub-orders, update fulfillment status to processing/shipped/delivered, add tracking numbers)**
- [ ] **Step 2: Implement Vendor Sales Reports view (revenue over time, order breakdown)**
- [ ] **Step 3: Commit vendor fulfillment and reports UI**

```bash
git add packages/client/src/features/vendor/orders packages/client/src/features/vendor/reports
git commit -m "feat: add vendor order fulfillment and sales reports UI"
```

---

### Task 2: Admin Dashboard & Vendor Moderation

**Files:**
- Create: `packages/server/src/modules/admin/admin.controller.js`
- Create: `packages/server/src/modules/admin/admin.routes.js`
- Create: `packages/client/src/features/admin/vendors/AdminVendors.jsx`
- Create: `packages/client/src/features/admin/payouts/AdminPayouts.jsx`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Produces: `/api/v1/admin/*` (vendor verification, product moderation, commission settings, payout processing).

- [ ] **Step 1: Implement Admin backend module for vendor approvals, product moderation, commissions, and payouts**
- [ ] **Step 2: Implement Admin frontend views for vendor management and payout processing**
- [ ] **Step 3: Commit admin management module**

```bash
git add packages/server/src/modules/admin packages/client/src/features/admin
git commit -m "feat: add admin dashboard backend and management UI for vendors and payouts"
```

---

### Task 3: Drag-and-Drop Layout Editor

**Files:**
- Create: `packages/server/src/modules/layout/layout.model.js`
- Create: `packages/server/src/modules/layout/layout.controller.js`
- Create: `packages/server/src/modules/layout/layout.routes.js`
- Create: `packages/client/src/features/editor/LayoutEditor.jsx`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Produces: `/api/v1/layout/:pageName` (draft/published page layouts), admin drag-and-drop page builder UI (`dnd-kit`).

- [ ] **Step 1: Implement PageLayout Mongoose model and layout service/controller for drafts, publishing, and block configurations**
- [ ] **Step 2: Implement LayoutEditor React component using dnd-kit, block palette, canvas drop zone, and properties inspector**
- [ ] **Step 3: Wire storefront homepage to render published layout blocks dynamically**
- [ ] **Step 4: Commit layout editor module**

```bash
git add packages/server/src/modules/layout packages/client/src/features/editor
git commit -m "feat: add page layout editor backend and visual drag-and-drop builder UI"
```

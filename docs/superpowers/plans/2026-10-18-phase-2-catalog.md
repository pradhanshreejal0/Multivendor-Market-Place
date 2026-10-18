# Phase 2: Product Catalog, Categories & Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement category tree management, vendor product creation & management (multilingual, variants, images), customer product listing & detail pages with filters and sorting, and full-text search with autocomplete.

**Architecture:** Mongoose models and Express controllers/routes for Categories and Products. React components for vendor product form, storefront catalog grid, product detail view, and search bar with autocomplete.

**Tech Stack:** Node.js, Express, MongoDB, Mongoose, Vite, React, Tailwind CSS, Lucide icons, React Hook Form, Zod.

**Spec:** `docs/superpowers/specs/2026-10-18-multivendor-ecommerce-design.md`

## Global Constraints

- Plain JavaScript (`.js`, `.jsx`) — no TypeScript.
- Bilingual product names and descriptions (`en`, `ne`).
- Single currency (NPR).
- Strict validation using Zod schemas.

---

## Tasks

### Task 1: Category Management Module

**Files:**
- Create: `packages/server/src/modules/categories/category.model.js`
- Create: `packages/server/src/modules/categories/category.service.js`
- Create: `packages/server/src/modules/categories/category.controller.js`
- Create: `packages/server/src/modules/categories/category.routes.js`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Produces: `/api/v1/categories` (public tree listing, admin CRUD).

- [ ] **Step 1: Create Category Mongoose model with parent/ancestors support**
- [ ] **Step 2: Implement category service & controller (tree building, CRUD)**
- [ ] **Step 3: Implement category routes and register in Express index.js**
- [ ] **Step 4: Commit category module**

```bash
git add packages/server/src/modules/categories
git commit -m "feat: add category model, service, controller, and routes"
```

---

### Task 2: Product Module (Vendor & Public APIs)

**Files:**
- Create: `packages/server/src/modules/products/product.model.js`
- Create: `packages/server/src/modules/products/product.service.js`
- Create: `packages/server/src/modules/products/product.controller.js`
- Create: `packages/server/src/modules/products/product.routes.js`
- Modify: `packages/server/src/index.js`

**Interfaces:**
- Produces: `/api/v1/products` (public catalog search/filter, vendor product CRUD).

- [ ] **Step 1: Create Product Mongoose model with bilingual fields, variants, and text search indexes**
- [ ] **Step 2: Implement product service (pagination, filters by category/price/vendor, full-text search)**
- [ ] **Step 3: Implement product controller and routes with vendor data isolation and admin moderation**
- [ ] **Step 4: Commit product backend module**

```bash
git add packages/server/src/modules/products
git commit -m "feat: add product model, service, controller, and routes"
```

---

### Task 3: Vendor Product Management UI

**Files:**
- Create: `packages/client/src/features/vendor/products/ProductList.jsx`
- Create: `packages/client/src/features/vendor/products/ProductForm.jsx`
- Modify: `packages/client/src/features/vendor/VendorLayout.jsx`

**Interfaces:**
- Consumes: `/api/v1/vendor/products`
- Produces: Vendor product dashboard pages for listing and creating/editing products with variants.

- [ ] **Step 1: Implement Vendor Product List view with status badges and actions**
- [ ] **Step 2: Implement Vendor Product Form (multilingual name/description, pricing, variants builder, category picker)**
- [ ] **Step 3: Commit vendor product management UI**

```bash
git add packages/client/src/features/vendor/products
git commit -m "feat: add vendor product listing and creation UI"
```

---

### Task 4: Storefront Catalog & Product Detail UI

**Files:**
- Create: `packages/client/src/features/storefront/catalog/ProductListing.jsx`
- Create: `packages/client/src/features/storefront/catalog/ProductDetail.jsx`
- Create: `packages/client/src/features/storefront/catalog/SearchResults.jsx`

**Interfaces:**
- Consumes: `/api/v1/products`, `/api/v1/categories`
- Produces: Customer storefront catalog, filters sidebar, product detail page with variant selection, and search results.

- [ ] **Step 1: Implement ProductListing view with category filter sidebar and sorting**
- [ ] **Step 2: Implement ProductDetail view with image gallery, bilingual title/desc support, and variant selector**
- [ ] **Step 3: Implement SearchBar autocomplete and SearchResults page**
- [ ] **Step 4: Commit storefront catalog and search UI**

```bash
git add packages/client/src/features/storefront/catalog
git commit -m "feat: add customer product catalog, detail view, and search UI"
```

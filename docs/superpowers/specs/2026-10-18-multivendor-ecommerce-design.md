# Multi-Vendor E-Commerce Platform — Architectural Design Spec

**Date:** 2026-10-18  
**Status:** Approved  
**Target Market:** Nepal (launch), global expansion ready  
**Stack:** Vite + React (JSX), Node.js + Express.js (JavaScript), MongoDB + Mongoose, Redis, Tailwind CSS + shadcn/ui

---

## 1. System Architecture & Project Structure

### Monorepo Structure
```
marketplace/
├── packages/
│   ├── client/              # Vite + React frontend (.jsx)
│   ├── server/              # Express.js backend (.js)
│   └── shared/              # Shared constants & Zod validation schemas
├── package.json             # Workspace root (npm workspaces)
└── turbo.json               # Turborepo build orchestration
```

- **Single SPA Frontend:** Route-based code splitting for customer storefront (`/`), vendor dashboard (`/vendor/*`), and admin dashboard (`/admin/*`).
- **Backend API:** Modular Express architecture with centralized error handling, Zod validation, and JWT authentication.

---

## 2. Data Model (MongoDB Collections)

- **Users:** `_id`, `email`, `password`, `role` (`customer` | `vendor` | `admin`), `profile`, `addresses`, `wishlist`, `isActive`, `preferredLanguage`.
- **Vendors:** `_id`, `userId`, `storeName`, `slug`, `description`, `logo`, `banner`, `businessDocuments`, `bankDetails`, `commissionRate`, `status` (`pending` | `approved` | `suspended` | `rejected`), `rating`, `shippingMethod`.
- **Products:** `_id`, `vendorId`, `name` (`en`, `ne`), `slug`, `description`, `category`, `price`, `compareAtPrice`, `variants`, `stock`, `images`, `attributes`, `status`, `isApproved`, `isFeatured`.
- **Categories:** `_id`, `name`, `slug`, `parent`, `ancestors`, `commissionRate`, `isActive`.
- **Orders:** `_id`, `orderNumber`, `customerId`, `vendorOrders` (array of sub-orders per vendor with items, shipping, fulfillment status, commission), `totals`, `shippingAddress`, `paymentMethod`, `paymentStatus`.
- **Payments:** `_id`, `orderId`, `customerId`, `amount`, `currency` (NPR), `method`, `status`, `gatewayTransactionId`.
- **Reviews:** `_id`, `productId`, `customerId`, `orderId`, `rating`, `title`, `comment`, `isVerifiedPurchase`, `vendorReply`.
- **Promotions:** `_id`, `name`, `code`, `type` (`percentage` | `fixed`), `value`, `minOrderAmount`, `usageLimit`, `startDate`, `endDate`.
- **PageLayouts:** `_id`, `pageName`, `status` (`draft` | `published`), `version`, `sections` (drag-and-drop block configs).
- **Notifications:** `_id`, `userId`, `type`, `title`, `message`, `isRead`.
- **PlatformSettings:** Singleton config for default commission, currency, shipping providers.

---

## 3. Pages & Features

### Customer Storefront
- Dynamic homepage via drag-and-drop layout editor.
- Product catalog with search, filters (price, category, rating, vendor), and sorting.
- Product detail with variant selector and image gallery.
- Shopping cart, multi-step checkout (address, shipping, payment), and order tracking.
- Customer account (profile, orders, wishlist, reviews).
- Bilingual support: English and Nepali (`en`, `ne`).

### Vendor Dashboard
- Sales KPIs and revenue charts.
- Product management (CRUD, multilingual, variants builder, image uploads).
- Inventory management with stock levels and low-stock alerts.
- Order fulfillment pipeline (confirm, process, ship with tracking number).
- Sales reports, customer reviews reply, store settings, and bank details.

### Admin Dashboard
- Platform KPIs and audit logs.
- Vendor verification and approval queue.
- Customer and product management (moderation, featuring).
- Order overview and refund processing.
- Commission management (default, category-level, vendor overrides).
- Payout calculation and processing.
- Category tree CRUD and static page management.
- Drag-and-drop Layout Editor (`/admin/editor`).

---

## 4. Authentication & Security

- **Auth:** JWT access tokens (15m) + refresh tokens in httpOnly cookies (7d).
- **Roles:** Customer, Vendor, Admin (middleware-based RBAC).
- **Security measures:** Bcrypt (salt rounds 12), rate limiting (`express-rate-limit`), Helmet.js headers, Zod input validation, CORS configuration, AES-256 encryption for bank details.

---

## 5. Drag-and-Drop Layout Editor

- Built with **dnd-kit** for performant drag-and-drop.
- Block types: Hero Banner, Product Grid, Category Carousel, Promotional Banner, Text Block, Spacer, Video Block, Vendor Spotlight, Custom HTML, Countdown Timer.
- Properties panel for configuring selected blocks.
- Draft / Preview (`?preview=draft`) / Publish workflow with version history.

---

## 6. API Design & Backend Architecture

- RESTful endpoints under `/api/v1`.
- Standardized success/error response envelopes.
- Redis caching for product details, category tree, and published layouts.
- Socket.io for real-time notifications (new orders, status updates, low stock).
- Multer + S3 storage for image and document uploads.

---

## 7. Frontend Architecture

- **State:** TanStack Query (server state) + Zustand (client/cart state) + React Hook Form.
- **Routing:** React Router v6 with lazy-loaded role-based layouts.
- **UI:** Tailwind CSS + shadcn/ui components.
- **Accessibility:** WCAG AA compliance, keyboard navigation, aria labels.

---

## 8. Deployment & Infrastructure

- **Frontend:** Vercel or AWS S3 + CloudFront (CDN).
- **Backend:** VPS (DigitalOcean/AWS) running Node.js in Docker Compose behind Nginx.
- **Database:** MongoDB Atlas.
- **Storage:** AWS S3 or Cloudflare R2.
- **Payment integrations:** eSewa, Khalti, FonePay, bank transfer verification, Cash on Delivery.
- **Roadmap:** 5 phases spanning Foundation (1-2), Catalog (3-4), Cart/Checkout (5-6), Dashboards & Editor (7-9), and Production Polish (10).

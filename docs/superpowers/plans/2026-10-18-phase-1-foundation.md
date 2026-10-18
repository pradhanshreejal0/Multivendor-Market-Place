# Phase 1: Foundation & Core Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the monorepo structure, database connection, JWT authentication, role-based access control, i18n setup, layout shells, and core UI primitives for the multi-vendor e-commerce platform.

**Architecture:** Monorepo with Turborepo (`packages/client`, `packages/server`, `packages/shared`). Vite + React (.jsx) on the frontend, Express.js (.js) with MongoDB/Mongoose on the backend. JWT auth with httpOnly refresh cookies.

**Tech Stack:** Vite, React, Tailwind CSS, shadcn/ui primitives, Node.js, Express, MongoDB, Mongoose, Redis, Zod, i18next.

**Spec:** `docs/superpowers/specs/2026-10-18-multivendor-ecommerce-design.md`

## Global Constraints

- Plain JavaScript (`.js`, `.jsx`) — no TypeScript.
- Three user roles only: `customer`, `vendor`, `admin`.
- Single currency (NPR) and bilingual support (English and Nepali).
- Secure password hashing (bcrypt salt rounds 12) and JWT access/refresh tokens.
- Strict input validation using Zod schemas shared or mirrored between client and server.

## Review Focus

1. **Token Expiry & Refresh Race Conditions:** Concurrent requests receiving 401 must queue or single-flight the refresh token request.
2. **Role Escalation Protection:** Users must never be able to self-register as `admin` or `vendor` with admin privileges.
3. **Database Connection Resilience:** Server must handle MongoDB reconnection gracefully and fail cleanly if DB is unreachable on startup.
4. **CORS & Cookie Security:** httpOnly refresh cookies configured with SameSite and Secure flags in production.
5. **i18n Fallback:** Missing translation keys must gracefully fall back to English without crashing the render tree.

---

## Tasks

### Task 1: Monorepo Setup & Shared Workspace

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/constants/roles.js`
- Create: `packages/shared/src/validation/authValidation.js`

**Interfaces:**
- Produces: `ROLES = { CUSTOMER: 'customer', VENDOR: 'vendor', ADMIN: 'admin' }`, Zod schemas for login and registration.

- [ ] **Step 1: Initialize root package.json and turbo.json**

```json
{
  "name": "marketplace-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

- [ ] **Step 2: Create packages/shared/src/constants/roles.js**

```js
export const ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};
```

- [ ] **Step 3: Create packages/shared/src/validation/authValidation.js using Zod**

```js
import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([ROLES.CUSTOMER, ROLES.VENDOR]).default(ROLES.CUSTOMER),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});
```

- [ ] **Step 4: Commit setup**

```bash
git add package.json turbo.json packages/shared
git commit -m "feat: initialize monorepo and shared validation schemas"
```

---

### Task 2: Backend Core & Database Connection

**Files:**
- Create: `packages/server/package.json`
- Create: `packages/server/src/config/db.js`
- Create: `packages/server/src/utils/errors.js`
- Create: `packages/server/src/middleware/errorHandler.js`
- Create: `packages/server/src/index.js`

**Interfaces:**
- Consumes: `registerSchema`, `loginSchema` from `@marketplace/shared`.
- Produces: Express server running on `PORT`, connected to MongoDB.

- [ ] **Step 1: Write backend package.json and install dependencies (express, mongoose, cors, dotenv, helmet, morgan, zok, bcryptjs, jsonwebtoken, cookie-parser)**
- [ ] **Step 2: Create database connection handler in packages/server/src/config/db.js**

```js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

- [ ] **Step 3: Create custom error classes in packages/server/src/utils/errors.js and errorHandler middleware**
- [ ] **Step 4: Create Express entrypoint packages/server/src/index.js with security helmet, cors, json parser, and error handler**
- [ ] **Step 5: Commit backend core**

```bash
git add packages/server
git commit -m "feat: set up Express server, MongoDB connection, and error handling"
```

---

### Task 3: Authentication Module & RBAC Middleware

**Files:**
- Create: `packages/server/src/modules/auth/user.model.js`
- Create: `packages/server/src/modules/auth/auth.service.js`
- Create: `packages/server/src/modules/auth/auth.controller.js`
- Create: `packages/server/src/modules/auth/auth.routes.js`
- Create: `packages/server/src/middleware/auth.middleware.js`

**Interfaces:**
- Consumes: `User` model, JWT secrets from env.
- Produces: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `authenticate`, `authorize` middleware.

- [ ] **Step 1: Create User Mongoose model (`packages/server/src/modules/auth/user.model.js`)**
- [ ] **Step 2: Implement auth service with register, login, token generation, and refresh logic**
- [ ] **Step 3: Implement auth controller and Express router**
- [ ] **Step 4: Implement `authenticate` and `authorize(...roles)` middleware**
- [ ] **Step 5: Commit auth module**

```bash
git add packages/server/src/modules/auth packages/server/src/middleware
git commit -m "feat: implement user model, auth service, controllers, routes, and RBAC middleware"
```

---

### Task 4: Frontend Scaffolding & i18n Setup

**Files:**
- Create: `packages/client/package.json`
- Create: `packages/client/vite.config.js`
- Create: `packages/client/src/index.css`
- Create: `packages/client/src/lib/i18n.js`
- Create: `packages/client/src/lib/api.js`
- Create: `packages/client/src/app/App.jsx`

**Interfaces:**
- Consumes: Backend API endpoints (`/api/v1/auth/*`).
- Produces: Vite React app with Tailwind CSS, i18n (`en`, `ne`), and Axios API client.

- [ ] **Step 1: Initialize client package.json with Vite, React, React Router, Tailwind, Zustand, TanStack Query, i18next, axios**
- [ ] **Step 2: Configure Tailwind CSS and PostCSS (`packages/client/vite.config.js`, `tailwind.config.js`)**
- [ ] **Step 3: Initialize i18n with English and Nepali translation resources (`packages/client/src/lib/i18n.js`)**
- [ ] **Step 4: Create Axios API client with 401 refresh interceptor (`packages/client/src/lib/api.js`)**
- [ ] **Step 5: Commit frontend scaffolding**

```bash
git add packages/client
git commit -m "feat: scaffold Vite frontend with Tailwind, i18n, and Axios client"
```

---

### Task 5: Core Layout Shells & Protected Route Guards

**Files:**
- Create: `packages/client/src/components/ProtectedRoute.jsx`
- Create: `packages/client/src/features/storefront/StorefrontLayout.jsx`
- Create: `packages/client/src/features/vendor/VendorLayout.jsx`
- Create: `packages/client/src/features/admin/AdminLayout.jsx`
- Create: `packages/client/src/app/Router.jsx`

**Interfaces:**
- Consumes: Auth store (user role, tokens).
- Produces: Layout shells for Storefront, Vendor, and Admin; role-based router guard.

- [ ] **Step 1: Create `ProtectedRoute.jsx` component handling role authorization check**
- [ ] **Step 2: Create `StorefrontLayout.jsx`, `VendorLayout.jsx`, and `AdminLayout.jsx` shells with responsive navigation**
- [ ] **Step 3: Wire up `Router.jsx` with lazy-loaded route structures**
- [ ] **Step 4: Commit layout shells and routing**

```bash
git add packages/client/src/components packages/client/src/features packages/client/src/app/Router.jsx
git commit -m "feat: add layout shells, protected route guards, and base routing"
```

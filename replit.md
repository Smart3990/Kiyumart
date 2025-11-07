# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion, designed to operate as either a single-store or a multi-vendor marketplace. Its core purpose is to provide a comprehensive online destination with functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform aims to offer a diverse and inclusive product range, supported by dynamic category management, extensive admin dashboards for user and product management, and a robust application verification system for sellers and riders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI components are crafted with Shadcn UI (Radix UI primitives) and Tailwind CSS, adhering to a mobile-first, responsive design with a green color scheme. Key features include a persistent shopping cart and wishlist, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards. Paystack is integrated for payments, and Leaflet.js with OpenStreetMap is used for live delivery tracking. The system supports dynamic components for multi-vendor functionality, an admin branding system for UI customization, and a reusable Media Upload System for Cloudinary. Comprehensive approval workflows are in place for sellers and riders, with sellers having dedicated product management features and a dynamic store type selection process with 10 predefined categories.

**Critical TanStack Query Configuration:**
- **QueryKey Best Practice**: The default `queryFn` in `client/src/lib/queryClient.ts` uses ONLY the first element of the `queryKey` array as the URL endpoint. Additional array elements serve exclusively as cache discriminators, NOT URL path segments.
- **Correct Pattern**: `queryKey: ["/api/products", sellerId]` fetches from `/api/products`, using `sellerId` only for cache differentiation.
- **Custom QueryFn Required**: Queries needing dynamic URLs (e.g., `/api/users/${id}`) must provide their own `queryFn` that properly constructs the URL.
- **Historical Bug Fix (Nov 2025)**: Corrected default `queryFn` from `queryKey.join("/")` to `queryKey[0]`, eliminating malformed URLs like `/api/users/media-library` that caused cascading 403/404 errors.

### Backend Architecture

The backend is developed with Express.js and integrates a native HTTP server with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) serves as the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads.

**Production Security Features:**
- Helmet security headers for XSS protection, content security, and frame options
- Role-aware rate limiting (100 API requests/15min, 5 auth attempts/15min)
- Structured error logging with request context and user tracking
- HMAC signature verification for Paystack webhooks

**Multi-Vendor Financial System:**
- Commission tracking with configurable platform rates (default 10%)
- Seller payout management with multiple payment methods
- Platform earnings tracking and reporting
- Automatic revenue splitting between sellers and platform

The architecture supports a comprehensive application verification system, including Ghana Card verification for sellers and riders, with detailed admin review processes. It also includes secured API endpoints for managing footer pages with CRUD operations and role-based access control.

### Database Schema Design

The database schema encompasses tables for core e-commerce functionalities (Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart), store management (Stores), real-time communication (Chat Messages), content management (Hero Banners, Banner Collections, Marketplace Banners, Footer Pages), dynamic categories, and platform configuration.

**Commission & Financial System:**
- `commissions`: Tracks platform commission on each order with configurable rates, seller/platform revenue splits
- `seller_payouts`: Manages seller payout requests with status tracking (pending, processing, completed, failed)
- `platform_earnings`: Records platform revenue from commissions and service fees
- Platform settings include `defaultCommissionRate` and `minimumPayoutAmount` configuration

**Performance Optimization:**
- Indexes on users (role, isActive, isApproved)
- Indexes on products (sellerId, storeId, category, isActive)
- Indexes on orders (buyerId, sellerId, riderId, status, paymentStatus, createdAt)
- Indexes on commissions (sellerId, orderId, status)

It supports product variants, multi-vendor associations, enhanced product modules with video and dynamic fields, verified buyer reviews, promotions, subscriptions, wishlists, and localization. Recent additions include fields for `profileImage`, `ghanaCardFront`, `ghanaCardBack` for application verification, an `isApproved` flag in the User interface for managing approval workflows, the `footerPages` table for dynamic footer link management with group-based organization, and the `storeId` field in orders for multi-vendor support.

### UI/UX Decisions

The platform prioritizes a mobile-first, responsive design with a green color scheme. Navigation has been refined for buyer and admin dashboards, removing redundancy and ensuring role-specific routing. Role-based dashboards are completely separated for super_admin and regular admin, with distinct access levels and menu items. Profile update enhancements include the 'name' field, and category grids have been optimized for consistent sizing. Profile avatar fallbacks use `profile?.name`. All hardcoded currency symbols have been eliminated, and dynamic currency conversion is implemented across the platform using `formatPrice()`. Footer pages are dynamically rendered from the database, and authentication redirects users to their role-specific dashboards.

## Recent Updates (November 2025)

### Critical Bug Fixes
1. **Messaging System Fix**: Corrected Socket.IO message broadcasting to emit to both sender and receiver, ensuring instant message updates across all user types (buyers, sellers, riders, agents, admins, super_admins)
2. **Express Rate Limiting**: Fixed X-Forwarded-For validation error by enabling `trust proxy` in Express configuration for proper rate limiting behind Replit's proxy

### Payment System Foundation (In Progress)
**Completed**:
- Extended `stores` table schema with Paystack vendor payment fields:
  - `paystackSubaccountId`: Paystack subaccount code (e.g., ACCT_xxxxxxxx)
  - `payoutType`: Enum for bank_account or mobile_money
  - `payoutDetails`: JSONB for storing bank account or Mobile Money (MoMo) details
  - `isPayoutVerified`: Boolean flag for Paystack verification status
- Database schema pushed successfully without breaking existing IDs

**Next Steps for Complete Paystack Split Payment Implementation**:
1. **Vendor Payment Setup UI**: Create seller dashboard page for configuring payout method (bank account or MoMo) with form validation
2. **Paystack Subaccount API**: Implement backend endpoint to create Paystack subaccounts via Paystack API when vendors submit payment details
3. **Dynamic Commission Calculation**: Add API routes to fetch and apply platform commission rate from settings during checkout
4. **Split Payment Flow**: Modify checkout process to:
   - Calculate vendor share (100% - commission rate)
   - Include `subaccounts` array in Paystack transaction initialization
   - Set `bearer` field to specify who pays transaction fees
5. **Admin Commission Management UI**: Create admin dashboard section to view/edit `defaultCommissionRate` and view split transaction reports
6. **Webhook Handler**: Implement secure Paystack webhook endpoint (`/webhooks/paystack`) to:
   - Validate signature with X-Paystack-Signature header
   - Listen for `charge.success` events
   - Record final split amounts and fees

### Agent Management & Admin User Creation
**Completed**:
- Added "Create Agent" button in AdminUsers page (navigates to `/admin/users/create?role=agent`)
- **NEW**: Added "Create Admin" button for super_admin users (navigates to `/admin/users/create?role=admin`)
- Created complete `AdminUserCreate` page component with:
  - Form validation using Zod schema
  - All user fields (name, email, password, phone, role)
  - Proper error handling and toast notifications
  - Pre-fills role from query parameter
  - Full data-testid coverage for testing
- Agent role fully integrated in permissions system with dashboard access
- User creation fully functional for all roles (buyer, seller, rider, agent, admin)
- Super admin can now create admin users with proper permissions

### Seller Store Auto-Creation System
**Completed**:
- Auto-creation logic implemented in `/api/stores/my-store` endpoint (routes.ts lines 3579-3597)
- Approved sellers automatically get stores created on first dashboard access
- Store creation also triggered during seller approval process (routes.ts lines 414-455)
- Prevents "Store Not Found" errors for approved sellers
- All stores include seller's name, description, logo, and store type metadata

### Form UX Improvements (November 2025)
**Completed**:
- Fixed scrolling issues in admin forms:
  - `AdminUserEdit`: Added `max-h-[calc(100vh-200px)] overflow-y-auto` to form card
  - `AdminRiders` (Add Rider Dialog): Added `max-h-[90vh] overflow-y-auto` to dialog content
  - All admin forms now properly scrollable on small viewports
- Enhanced mobile responsiveness for long forms

### Role-Based Access Control Enhancements
**Completed**:
- Super Admin has 100% feature parity with Admin:
  - Full access to `/api/admin/active-riders` endpoint for live rider tracking
  - Access to RealTimeRiderMap component on admin dashboard
  - Complete visibility of all riders and their locations
  - All admin management features available to super_admin
- Sidebar menu items aligned between admin and super_admin roles
- Permission system ready for granular access control expansion

### Admin Messaging System Improvements
**In Progress**:
- Socket.IO instant messaging working across all roles
- Current implementation: Contact list shows all users for admin
- **Future Enhancement**: Add message preview with latest message snippet and unread counts
- Recommended: Implement `/api/messages/summary` endpoint for conversation previews

## External Dependencies

-   **Cloudinary**: Media asset management and CDN.
-   **Paystack**: Payment processing gateway.
-   **Frankfurter.app**: Currency conversion API for live exchange rates.
-   **Neon Database**: Serverless PostgreSQL hosting.
-   **Socket.IO**: Real-time bidirectional communication.
-   **Drizzle ORM**: Type-safe database operations for PostgreSQL.
-   **TanStack Query**: Asynchronous state management.
-   **Shadcn UI + Radix UI**: UI component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Wouter**: Lightweight React router.
-   **JWT + Bcrypt**: Authentication and password security.
-   **Multer**: Multipart form data handling.
-   **React QR Code**: QR code generation.
-   **Leaflet.js**: Interactive maps (with OpenStreetMap).
# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Recent Changes (November 7, 2025)

### Production Security & Performance Enhancements
- **Helmet Security Headers**: Implemented comprehensive security headers (XSS protection, content type sniffing prevention, frame options, referrer policy)
- **Rate Limiting**: Added role-aware rate limiting with separate buckets for API (100 requests/15min) and authentication (5 attempts/15min) endpoints
- **Enhanced Error Handling**: Implemented structured error logging with timestamps, request context, and user tracking for production debugging
- **Database Indexes**: Added performance indexes to critical tables (users: role/isActive/isApproved, products: sellerId/storeId/category/isActive, orders: buyerId/sellerId/riderId/status/paymentStatus/createdAt, commissions: sellerId/orderId/status)

### Commission System for Multi-Vendor Marketplace
- **Commission Tables**: Created comprehensive commission tracking system with `commissions`, `seller_payouts`, and `platform_earnings` tables
- **Configurable Commission Rate**: Added `defaultCommissionRate` (10% default) and `minimumPayoutAmount` (50 GHS default) to platform settings
- **Commission Calculation**: Platform automatically tracks commission on each order, splitting revenue between seller and platform
- **Payout Management**: Admin dashboard support for tracking seller payouts with status management (pending, processing, completed, failed)
- **Multiple Payout Methods**: Support for bank transfer, mobile money, and Paystack-based payouts with bank details storage

### Paystack Webhook Integration
- **Async Payment Verification**: Implemented `/api/webhooks/paystack` endpoint for handling asynchronous payment confirmations from Paystack
- **HMAC Signature Verification**: Webhook validates Paystack signatures using HMAC SHA-512 for security
- **Idempotency Protection**: Prevents duplicate transaction processing by checking existing transaction status
- **Real-time Notifications**: Webhook triggers Socket.IO events and database notifications when payments are confirmed
- **Order Status Automation**: Automatically updates order status to "processing" when payment succeeds via webhook

### Super Admin Media Library Fix
- **Fixed Critical 403 Permission Errors**: Resolved all "Unauthorized to access media library" errors preventing super_admin from accessing media library features
- **Updated Media Library Endpoints**: Modified POST/GET/DELETE /api/media-library and GET /api/assets/images to authorize super_admin role alongside admin role
- **Fixed Seller Media Filtering**: Updated seller media library filtering to properly show uploads from both admin and super_admin users while maintaining category-specific filtering
- **All Buttons Working**: Verified all admin and super_admin dashboard navigation buttons work correctly after permission fixes

### Buyer Dashboard Improvements
- **Removed Duplicate Navigation Cards**: Eliminated redundant My Orders, Wishlist, and Profile cards from buyer dashboard main page (already exist in sidebar)
- **Smart Payment Redirects**: Recent orders now intelligently redirect - unpaid orders go to `/payment/:orderId` with "Click to pay" indicator, paid orders go to tracking
- **Fixed Navigation Routes**: Updated DashboardLayout to use global routes for buyer (/notifications, /settings) while preserving role-specific routes for other roles

### Complete Dashboard Navigation Fix (All User Roles)
- **Created 13 Missing Dashboard Pages**: Built all missing pages to resolve dead navigation links across Seller, Rider, and Admin roles
  - Seller: Orders, Coupons, Deliveries, Notifications, Messages, Analytics, Settings
  - Rider: Deliveries, Active Route, Notifications, Messages, Earnings, Settings
  - Admin: Notifications
- **Fixed Query Cache Management**: Implemented role-specific query keys for notifications to prevent cache leakage between different user roles
  - AdminNotifications: `["/api/notifications", user?.role]`
  - SellerNotifications: `["/api/notifications", "seller"]`
  - RiderNotifications: `["/api/notifications", "rider"]`
- **Fixed Currency Formatting**: Updated all formatPrice calls to safely convert values using `Number(value) || 0` pattern to prevent type conversion errors
- **Fixed Cache Invalidation**: All mutation invalidation keys now match their respective query keys for proper state updates
  - RiderDeliveries: Uses `["/api/deliveries", "rider"]` for both query and invalidation
- **All Navigation Links Working**: Every dashboard navigation button now routes to a functional page with proper role guards and data fetching

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion, designed to operate as either a single-store or a multi-vendor marketplace. Its core purpose is to provide a comprehensive online destination with functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform aims to offer a diverse and inclusive product range, supported by dynamic category management, extensive admin dashboards for user and product management, and a robust application verification system for sellers and riders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI components are crafted with Shadcn UI (Radix UI primitives) and Tailwind CSS, adhering to a mobile-first, responsive design with a green color scheme. Key features include a persistent shopping cart and wishlist, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards. Paystack is integrated for payments, and Leaflet.js with OpenStreetMap is used for live delivery tracking. The system supports dynamic components for multi-vendor functionality, an admin branding system for UI customization, and a reusable Media Upload System for Cloudinary. Comprehensive approval workflows are in place for sellers and riders, with sellers having dedicated product management features and a dynamic store type selection process with 10 predefined categories.

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
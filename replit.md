# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, designed to operate as both a single-store and a multi-vendor marketplace. It provides comprehensive e-commerce functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and integrated Paystack payments. The platform emphasizes a diverse product range, dynamic category and store management, extensive admin dashboards, and a robust application verification system for sellers and riders. The vision is to offer a seamless and inclusive online shopping experience, addressing the significant market potential within modest fashion.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 9, 2025 - CRITICAL FIX: Restored Theme System After Accidental Deletion**
- **ROOT CAUSE IDENTIFIED**: When removing glassmorphism CSS, accidentally deleted ALL essential Shadcn UI theme variables from index.css
- **IMPACT**: Complete loss of dark mode, fonts, colors, borders, and all styling - app was visually broken
- **FIX APPLIED**: Restored complete @layer base structure with all Shadcn UI CSS custom properties in HSL format for Tailwind v3
- **Variables restored**: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart colors, sidebar colors
- **Result**: Dark mode, fonts, and all styling now working perfectly

**November 9, 2025 - Removed Glassmorphism and Mobile UI**
- **Removed all glassmorphism styles**: Deleted glass-* CSS classes and gradient systems (glass-card, glass-panel, glass-button, glass-nav, glass-badge, etc.)
- **Deleted mobile-specific components**: Removed BottomNavigation, MobileHeader, ProductGridMobile components
- **Deleted mobile-specific pages**: Removed HomeMobile, MobileProductDetail, MobileNotifications pages
- **Removed mobile hooks**: Deleted useIsMobile hook files
- **Cleaned up imports**: Updated all files that referenced deleted mobile components (HomeConnected, ProductDetails, App, Footer)
- **Refactored TrackOrder and EReceipt pages**: Replaced mobile-style sticky headers with standard desktop Header and Footer components
- **Verified complete removal**: Confirmed via code search that NO references to mobile components or glass- classes remain
- **Reverted to standard desktop UI**: Application now uses standard responsive design without dedicated mobile views

**November 8, 2025 - Critical Navigation Fix: Product Creation**
- **Fixed broken seller product creation flow**: Changed navigation from non-existent `/seller/add-product` to correct `/seller/products` route
- **Affected buttons**: "Add New Product" (main action) and "Add Your First Product" (empty state) in SellerDashboardConnected
- **Root cause**: Routing mismatch - sellers use dialog-based product creation in SellerProducts page, not a dedicated route
- **Validation**: Confirmed no other broken navigation links exist, server running successfully

**November 8, 2025 - Product Creation & Image Gallery Updates**
- **Fixed critical product creation failure**: Switched from FormData to JSON payload using `apiRequest` with native arrays
- **Image requirements updated**: Maximum 5 images (down from 10), minimum changed from 1 to 0 (optional)
- **Photography guidance added**: "Capture product from all angles - front, back, sides, and detailed shots" displayed in gallery
- **Required fields added**: Product creation now includes `sellerId` (user.id) and `storeId` (store?.id or null) for multi-vendor support
- **ProductGallery component enhancements**: Description prop, updated empty state with angle instructions, perfect image counter display

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI components are developed using Shadcn UI (Radix UI primitives) and Tailwind CSS with responsive design.

**Key Features**: Persistent shopping cart, product browsing with advanced filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards (super_admin, regular admin). It supports dynamic components for multi-vendor functionality, an admin branding system, a reusable media upload system integrated with Cloudinary, and comprehensive approval workflows for sellers and riders. Product categories can be restricted by `storeTypes` for sellers, and public seller store routes are `sellers/:id` to distinguish from authenticated seller dashboard routes.

### Backend Architecture

The backend is an Express.js application integrating a native HTTP server with Socket.IO for real-time WebSocket communication. Authentication is JWT-based with bcrypt for password hashing and implements role-based access control. PostgreSQL (Neon serverless) serves as the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads. Production security features include Helmet for security headers, role-aware rate limiting, structured error logging, and HMAC signature verification for Paystack webhooks.

**Payment Method Support:**
- Card Payments (Visa, Mastercard) via Paystack.
- Bank Transfers via Paystack.
- Mobile Money (MTN, Vodafone/Telecel, AirtelTigo) for buyers, with seller payouts to bank accounts or mobile money.
- Cryptocurrency support (e.g., Bitcoin, USDT) is planned, with NOWPayments and BitAfrika as recommended gateways.

**Multi-Vendor Financial System:**
Includes commission tracking with configurable platform rates, seller payout management across various methods, platform earnings tracking and reporting, and automatic revenue splitting.

The system also features an application verification system with Ghana Card verification for sellers and riders, and secure API endpoints for managing footer pages with CRUD operations and role-based access.

### Database Schema Design

The database schema includes tables for Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart, Stores, Chat Messages, Hero Banners, and Footer Pages. It supports commission tracking, seller payouts, platform earnings, and application verification details such as `profileImage`, `ghanaCardFront`, `ghanaCardBack`, and `isApproved` flags. Performance is optimized with indexes on key fields.

## External Dependencies

-   **Cloudinary**: Media asset management.
-   **Paystack**: Payment processing.
-   **Frankfurter.app**: Currency conversion API.
-   **Neon Database**: Serverless PostgreSQL.
-   **Socket.IO**: Real-time communication.
-   **Drizzle ORM**: Type-safe database operations.
-   **TanStack Query**: Asynchronous state management.
-   **Shadcn UI + Radix UI**: UI component primitives.
-   **Tailwind CSS**: CSS framework.
-   **Wouter**: React router.
-   **JWT + Bcrypt**: Authentication and password security.
-   **Multer**: File uploads.
-   **React QR Code**: QR code generation.
-   **Leaflet.js**: Interactive maps (with OpenStreetMap).
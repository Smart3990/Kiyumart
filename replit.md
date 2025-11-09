# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, designed to operate as both a single-store and a multi-vendor marketplace. It provides comprehensive e-commerce functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and integrated Paystack payments. The platform emphasizes a diverse product range, dynamic category and store management, extensive admin dashboards, and a robust application verification system for sellers and riders. The vision is to offer a seamless and inclusive online shopping experience, addressing the significant market potential within modest fashion.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 9, 2025 - UI/UX OVERHAUL: Product Gallery, Hero Banner, Category Carousel (Architect Approved)**
- **✅ ProductDetails Mini Images Redesign**: Changed from fixed 64×64px to responsive grid (cols-5 md:cols-6 with aspect-square), fits perfectly under main image
- **✅ Keyboard Accessibility**: Added tabIndex, onKeyDown handlers, aria-labels, focus-visible ring states for thumbnails
- **✅ HeroBanner Carousel Navigation**: Re-added ChevronLeft/ChevronRight arrows, implemented 5-second auto-advance timer
- **✅ Smart Scroll-Down Button**: Now targets actual sections using querySelector('main, section') instead of fixed viewport height
- **✅ Multiple Action Buttons**: Added "Shop Now", "Explore Collection", "View Deals" buttons to hero banner
- **✅ Category Carousel Responsive**: Changed from fixed w-72 to w-[min(280px,80vw)] md:w-72 for mobile-first design
- **✅ Visible Scrollbar**: Replaced scrollbar-hide with styled webkit-scrollbar (height-2, rounded, muted colors)
- **✅ Scroll Indicator**: Added "Scroll to see more →" text for discoverability
- **✅ Dynamic Store Filtering**: Fetches primaryStore via useQuery, derives storeType dynamically (fallback: "clothing")
- **✅ Zero Regressions**: All architect feedback addressed, responsive across mobile/tablet/desktop
- **Files modified**: ProductDetails.tsx, HeroBanner.tsx, HomeConnected.tsx, index.css (scrollbar utilities)

**November 9, 2025 - COMPLETE: WhatsApp-Style Chat Status Ticks (Production Ready)**
- **✅ Backend Security:** JWT-based Socket.IO authentication middleware prevents message status spoofing
- **✅ Socket.IO Auth:** Middleware extracts JWT from cookies/auth object, binds userId to socket.data, auto-joins user room
- **✅ Ownership Validation:** message_delivered/message_read handlers verify receiver owns message before updating status
- **✅ MessageStatusTicks Refactored:** Accepts flattened props (isRead, readAt, deliveredAt, status) instead of full message object
- **✅ Variant Support:** Primary variant for light text on colored backgrounds (blue-300 read ticks), default for muted backgrounds (blue-500)
- **✅ Frontend Integration:** ChatInterface renders MessageStatusTicks with variant="primary", ChatPageConnected upgraded to JWT socket auth
- **✅ Real-time Updates:** message_status_updated listener updates local message state for instant UI updates (✓ → ✓✓ → ✓✓ blue)
- **✅ Removed Manual Register:** Socket.IO auth middleware auto-joins user room, no manual "register" event needed
- **✅ Trust Proxy Fixed:** Express rate limiting now trusts only first proxy (Replit's), prevents X-Forwarded-For spoofing
- **✅ Zero Security Issues:** All changes architect-approved, TypeScript LSP clean, workflow running successfully
- **Files modified**: server/routes.ts (JWT middleware + handlers), server/index.ts (trust proxy), MessageStatusTicks.tsx (refactored), ChatPageConnected.tsx (JWT auth + listener), ChatInterface.tsx (integrated component)

**November 9, 2025 - PHASE 1: Category UI Integration Complete**
- **Created CategorySelect component**: Reusable category selector with storeType filtering for multi-vendor support
- **Fixed critical filtering bug**: Global categories (storeTypes = null/empty) now appear for ALL store types
- **Updated all product forms**: AdminProductCreate, AdminProductEdit, and SellerProducts now use CategorySelect with categoryId
- **Backend schema verified**: insertProductSchema accepts categoryId (optional), legacy category field excluded
- **Migration executed successfully**: 40 default categories seeded across 10 storeTypes (clothing, electronics, beauty, etc.)
- **Key feature**: Sellers see global + store-specific categories; admins see all 40 categories
- **Zero regressions**: LSP clean, workflow running, backward compatibility maintained with legacy category field
- **Architect approved**: Complete code review confirms correct implementation with no critical issues
- **Files modified**: CategorySelect.tsx (new), AdminProductEdit.tsx, AdminProductCreate.tsx, SellerProducts.tsx, server/routes.ts

**November 9, 2025 - CRITICAL BUG FIX: Seller Store Creation & Product Creation**
- **Fixed seller store creation**: Created centralized `ensureStoreForSeller` helper in storage.ts for idempotent store provisioning
- **Fixed product creation failures**: Products now auto-create missing stores for approved sellers with proper error handling
- **Updated approval flow**: Admin approval now atomically creates store BEFORE setting isApproved=true (prevents orphaned approvals)
- **Added database constraint**: `stores.primarySellerId` now has UNIQUE constraint to prevent duplicate stores per seller
- **Improved error messages**: All store-related errors now provide specific, actionable guidance (missing approval, storeType, etc.)
- **Three endpoints refactored**: `/api/users/:id/approve`, `POST /api/products`, `GET /api/stores/my-store` now use centralized helper
- **Key architectural change**: Store creation is no longer duplicated across multiple endpoints - single source of truth
- **Result**: Sellers reliably get stores after approval, products always have storeId, zero duplicate stores possible

**November 9, 2025 - Navigation & Branding Fixes**
- **Fixed live delivery tracking**: Corrected orderId extraction from Wouter location query params
- **Fixed branding auto-update**: Switched from imported queryClient to useQueryClient() hook for proper React Query provider instance
- **Added explicit refetch**: Branding changes now immediately update UI via refetchQueries in mutation success handler

**November 9, 2025 - COMPREHENSIVE THEME SYSTEM OVERHAUL**
- **FIXED BROKEN FONTS**: Added missing CSS variables (--font-sans, --font-serif, --font-mono) that were referenced in Tailwind config but never defined
- **FONTS NOW USE**: Inter & Poppins (sans-serif), Playfair Display & Lora (serif), JetBrains Mono & Fira Code (monospace)
- **FIXED DARK MODE COLORS**: Replaced bluish dark theme (HSL 222.2 84% 4.9%) with neutral pure black/gray theme (HSL 0 0% 7%)
- **ELIMINATED BLUE TINT**: Dark mode now uses 0% saturation for professional, neutral appearance perfect for e-commerce
- **UPDATED PRIMARY COLOR**: Changed to vibrant orange (HSL 16 100% 61%) for better brand identity and call-to-action visibility
- **ADDED FONT SMOOTHING**: Enabled -webkit-font-smoothing and -moz-osx-font-smoothing for crisp typography
- **RESULT**: Complete, professional theme system with modern fonts, neutral dark mode, and vibrant accent colors

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
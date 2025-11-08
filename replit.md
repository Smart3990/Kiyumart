# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, designed to operate as both a single-store and a multi-vendor marketplace. It provides comprehensive e-commerce functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and integrated Paystack payments. The platform emphasizes a diverse product range, dynamic category and store management, extensive admin dashboards, and a robust application verification system for sellers and riders. The vision is to offer a seamless and inclusive online shopping experience, addressing the significant market potential within modest fashion.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 8, 2025 - Native Mobile App Transformation**
- **Complete native design system**: System fonts (SF Pro, Roboto), 4px spacing grid, minimal shadows (2-4px blur), 12px border radius
- **30+ native utility classes**: `.native-card`, `.native-button`, `.native-skeleton`, `.native-haptic`, `.native-transition`, safe area utilities
- **Footer optimization**: Hidden on mobile (<768px) for native feel, preserved on desktop with all functionality
- **HomeMobile enhancements**: Skeleton loaders, pull-to-refresh gesture, lazy-loaded images, native typography, flat design
- **MobileProductDetail upgrades**: Native sticky header, image counter badge, skeleton loaders, haptic feedback, rounded thumbnail gallery
- **BottomNavigation native styling**: Backdrop blur translucency, safe area padding, active tab animations, optimized badge size
- **Performance improvements**: Lazy loading, query-based loading states, minimal transitions (200ms), reduced shadow calculations
- **Mobile-first responsive**: All components optimized for one-hand mobile use, 44px minimum touch targets, iOS safe areas
- **Architect review**: Passed evaluation - "meets stated objectives, mobile flows remain functional, cohesive native transformation"

**November 8, 2025 - Critical Navigation Fix: Product Creation**
- **Fixed broken seller product creation flow**: Changed navigation from non-existent `/seller/add-product` to correct `/seller/products` route
- **Affected buttons**: "Add New Product" (main action) and "Add Your First Product" (empty state) in SellerDashboardConnected
- **Root cause**: Routing mismatch - sellers use dialog-based product creation in SellerProducts page, not a dedicated route
- **Validation**: Confirmed no other broken navigation links exist, server running successfully

**November 8, 2025 - Mobile-First App Redesign (Initial)**
- **Complete mobile UI overhaul**: Transformed entire app with dark theme, orange primary color (#ff6b35), matching design mockups
- **New mobile components**: BottomNavigation (with cart badge), MobileHeader, CategoryChips, ProductGridMobile
- **Mobile-optimized pages**: HomeMobile, TrackOrder, EReceipt, MobileNotifications, MobileProductDetail
- **Responsive routing**: useIsMobile hook detects screen size, automatically serves mobile/desktop versions
- **PWA optimization**: Added theme-color, apple-mobile-web-app meta tags for native app feel
- **Timeline stepper**: Order tracking with visual delivery progress (5 stages)
- **QR code receipts**: E-receipts with scannable QR codes, payment details, export options
- **Bottom navigation**: Fixed navigation bar with Home, Cart (badge), Orders, Profile

**November 8, 2025 - Product Creation & Image Gallery Updates**
- **Fixed critical product creation failure**: Switched from FormData to JSON payload using `apiRequest` with native arrays
- **Image requirements updated**: Maximum 5 images (down from 10), minimum changed from 1 to 0 (optional)
- **Photography guidance added**: "Capture product from all angles - front, back, sides, and detailed shots" displayed in gallery
- **Required fields added**: Product creation now includes `sellerId` (user.id) and `storeId` (store?.id or null) for multi-vendor support
- **ProductGallery component enhancements**: Description prop, updated empty state with angle instructions, perfect image counter display

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI components are developed using Shadcn UI (Radix UI primitives) and Tailwind CSS, adhering to a **native mobile-first design** with dark theme and orange primary color (#ff6b35).

**Native Mobile App Experience**:
- **Design System**: System fonts (SF Pro Display, Roboto), 4px spacing grid, minimal shadows (2-4px blur), 12px default border radius
- **Utility Classes**: 30+ native classes including `.native-card`, `.native-button`, `.native-skeleton`, `.native-haptic`, `.native-transition`, safe area helpers
- **Mobile Components**: HomeMobile, MobileProductDetail with skeleton loaders, pull-to-refresh, lazy loading, native typography
- **BottomNavigation**: Native tab bar with backdrop blur, safe area padding, active animations, 44px touch targets
- **Performance**: Query-based loading states, lazy images, 200ms transitions, minimal shadow calculations
- **Responsive**: Automatic desktop/mobile switching via useIsMobile hook (<768px), tablet support at 1024px
- **iOS/Android Patterns**: Sticky headers with backdrop blur, haptic press feedback, rounded corners, flat design

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
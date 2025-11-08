# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, supporting both single-store and multi-vendor marketplace models. It provides comprehensive online functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform focuses on a diverse product range, dynamic category management, extensive admin dashboards, and a robust application verification system for sellers and riders.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Mobile Money & Cryptocurrency Support (November 8, 2025)

**Mobile Money Integration:**
- ✅ Enabled mobile money payment channels for buyers (MTN, Vodafone/Telecel, AirtelTigo)
- ✅ Updated seller payment setup page with dual-mode support:
  - Bank account payouts (via Paystack subaccounts with automatic split payments)
  - Mobile money payouts (stores details for manual transfer processing)
- ✅ Enhanced payment setup UI with radio button selection between bank and mobile money
- ✅ Backend validation for both payout types with proper error handling
- ✅ Mobile money providers: MTN Mobile Money, Vodafone/Telecel Cash, AirtelTigo Money

**Cryptocurrency Payment Research:**
- ✅ Created comprehensive documentation: `docs/cryptocurrency-payment-integration.md`
- ✅ Identified best gateways for Ghana market:
  - **NOWPayments**: 300+ cryptos, 0.5% fees, global coverage
  - **BitAfrika**: Local Ghana platform with mobile money integration
  - **CoinGate**: Developer-friendly with Lightning Network support
- ✅ Implementation roadmap and sample code prepared
- ✅ Database schema designs for crypto transactions ready
- 🔶 Awaiting user demand assessment before full implementation

**Technical Implementation:**
- Added `channels: ["card", "bank_transfer", "mobile_money"]` to Paystack payment initialization
- Updated `SellerPaymentSetup.tsx` with RadioGroup for payment method selection
- Backend logic differentiates between bank accounts (Paystack subaccounts) and mobile money (stored for transfers)
- Mobile money identifier format: `mobile_{provider}_{number}` for tracking

## System Architecture

### Frontend Architecture

The frontend uses React 18 (Vite, TypeScript) with Wouter for routing and TanStack Query for server state. UI components are built with Shadcn UI (Radix UI primitives) and Tailwind CSS, following a mobile-first, responsive design with a green color scheme. Features include a persistent shopping cart, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards. Paystack is integrated for payments, and Leaflet.js with OpenStreetMap handles live delivery tracking. The system supports dynamic components for multi-vendor functionality, an admin branding system, a reusable Media Upload System for Cloudinary, and comprehensive approval workflows for sellers and riders.

**Critical TanStack Query Configuration:**
- The `queryFn` in `client/src/lib/queryClient.ts` uses ONLY the first element of `queryKey` as the URL endpoint. Additional elements are for cache discrimination.
- Queries needing dynamic URLs must provide a custom `queryFn`.

### Backend Architecture

The backend is developed with Express.js and integrates a native HTTP server with Socket.IO for WebSocket communication. Authentication is JWT-based, utilizing bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) is the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads.

**Production Security Features:**
- Helmet for security headers.
- Role-aware rate limiting.
- Structured error logging.
- HMAC signature verification for Paystack webhooks.

**Payment Method Support** (November 2025):
- **Card Payments**: Visa, Mastercard via Paystack
- **Bank Transfers**: Direct bank transfers via Paystack
- **Mobile Money** (NEW): 
  - Buyer payments: MTN Mobile Money, Vodafone/Telecel Cash, AirtelTigo Money
  - Seller payouts: Bank accounts (via Paystack subaccounts) or mobile money (via manual transfers)
  - All Ghana mobile money networks supported
- **Cryptocurrency** (Planned): Documentation created for Bitcoin, USDT, and other crypto payments
  - Recommended gateways: NOWPayments (global), BitAfrika (Ghana + mobile money integration)
  - See `docs/cryptocurrency-payment-integration.md` for implementation guide

**Multi-Vendor Financial System:**
- Commission tracking with configurable platform rates.
- Seller payout management with multiple payment methods.
- Platform earnings tracking and reporting.
- Automatic revenue splitting.

The architecture includes an application verification system with Ghana Card verification for sellers and riders, and secure API endpoints for managing footer pages with CRUD operations and role-based access.

### Database Schema Design

The database schema includes tables for core e-commerce functionalities (Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart), store management (Stores), real-time communication (Chat Messages), content management (Hero Banners, Footer Pages), and platform configuration. Key additions support commission tracking, seller payouts, platform earnings, and application verification details such as `profileImage`, `ghanaCardFront`, `ghanaCardBack`, and `isApproved` flags. Performance is optimized with indexes on key fields across various tables.

### UI/UX Decisions

The platform emphasizes a mobile-first, responsive design with a green color scheme. Navigation is refined for buyer and admin dashboards, ensuring role-specific routing. Role-based dashboards for super_admin and regular admin have distinct access levels. Currency symbols are dynamically handled, and footer pages are rendered from the database. Authentication redirects users to their role-specific dashboards. Key improvements include enhanced form scrolling and mobile responsiveness.

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
-   **Leaflet.js**: Interactive maps.
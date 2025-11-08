# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, supporting both single-store and multi-vendor marketplace models. It offers comprehensive online functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform focuses on a diverse product range, dynamic category management, extensive admin dashboards, and a robust application verification system for sellers and riders. The business vision is to provide a seamless and inclusive online shopping experience for modest fashion, tapping into a significant market potential for Islamic women's apparel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 (Vite, TypeScript) with Wouter for routing and TanStack Query for server state. UI components are built with Shadcn UI (Radix UI primitives) and Tailwind CSS, following a mobile-first, responsive design with a green color scheme. Features include a persistent shopping cart, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards. The system supports dynamic components for multi-vendor functionality, an admin branding system, a reusable Media Upload System for Cloudinary, and comprehensive approval workflows for sellers and riders.

**Key Design Decisions:**
- **UI/UX:** Mobile-first, responsive design with a green color scheme. Role-based dashboards (super_admin, regular admin) with distinct access levels. Dynamic currency symbols and database-rendered footer pages. Enhanced form scrolling and mobile responsiveness.
- **Critical TanStack Query Configuration:** `queryFn` uses ONLY the first element of `queryKey` as the URL endpoint; additional elements are for cache discrimination. Queries needing dynamic URLs require a custom `queryFn`.
- **Seller Product Management:** Categories can be restricted by `storeTypes`, ensuring sellers only see relevant categories. File uploads (images, videos) from computer are supported via `MediaUploadInput`, integrating with Cloudinary.
- **Routing:** Public seller store routes are `sellers/:id` to avoid conflicts with authenticated seller dashboard routes (`seller/*`).
- **Real-Time Updates:** Cross-session Socket.IO notification system for real-time updates, e.g., automatic store query refetch and cache invalidation when a seller is approved.

### Backend Architecture

The backend is developed with Express.js and integrates a native HTTP server with Socket.IO for WebSocket communication. Authentication is JWT-based, utilizing bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) is the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads.

**Production Security Features:**
- Helmet for security headers.
- Role-aware rate limiting.
- Structured error logging.
- HMAC signature verification for Paystack webhooks.

**Payment Method Support:**
- **Card Payments**: Visa, Mastercard via Paystack.
- **Bank Transfers**: Direct bank transfers via Paystack.
- **Mobile Money**: MTN Mobile Money, Vodafone/Telecel Cash, AirtelTigo Money for buyers. Seller payouts can be to bank accounts (via Paystack subaccounts) or mobile money (via manual transfers).
- **Cryptocurrency** (Planned): Documentation exists for Bitcoin, USDT, and other crypto payments, with recommended gateways like NOWPayments and BitAfrika.

**Multi-Vendor Financial System:**
- Commission tracking with configurable platform rates.
- Seller payout management with multiple payment methods.
- Platform earnings tracking and reporting.
- Automatic revenue splitting.

The architecture includes an application verification system with Ghana Card verification for sellers and riders, and secure API endpoints for managing footer pages with CRUD operations and role-based access.

### Database Schema Design

The schema includes tables for Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart, Stores, Chat Messages, Hero Banners, and Footer Pages. Key features supported are commission tracking, seller payouts, platform earnings, and application verification details such as `profileImage`, `ghanaCardFront`, `ghanaCardBack`, and `isApproved` flags. Performance is optimized with indexes on key fields.

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
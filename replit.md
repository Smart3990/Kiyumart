# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion, operating as both a single-store and a multi-vendor marketplace. Its mode is dynamically controlled by an admin feature flag (`isMultiVendor`). The platform offers comprehensive e-commerce functionalities including product and order management, live delivery tracking with map visualization, real-time chat, and Paystack payment integration. KiyuMart aims to be a leading online destination for modest Islamic fashion, providing a diverse and inclusive product range to a global market.

In **Single-Store Mode** (`isMultiVendor: false`), the platform presents a curated Islamic fashion experience with dedicated hero banners, product categories (Abayas, Hijabs, Evening Wear), product display with pricing and ratings, and product video showcases.

In **Multi-Vendor Marketplace Mode** (`isMultiVendor: true`), the platform transforms into a dynamic marketplace featuring a banner carousel, seller category grids, and global featured products. This mode includes a banner management system for admins and categorizes products by seller.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI is designed using Shadcn UI (Radix UI primitives) and Tailwind CSS, emphasizing a mobile-first, responsive design with a modern green color scheme.

**Key Features**:
- Persistent shopping cart and wishlist
- Product browsing with category filters
- Real-time order tracking via Socket.IO
- Multi-language support (English, French, Spanish) with automatic currency switching
- QR code generation for orders
- Role-based dashboards (admin, seller, buyer, rider)
- Notifications and user profile management
- Paystack payment integration
- Live delivery tracking with Leaflet.js and OpenStreetMap
- **Multi-Vendor Specific Components**: Dynamic homepage, marketplace banner carousel, seller category cards, and an admin banner manager with CRUD capabilities.
- **Admin Branding System**: Full color customization for primary, secondary, accent, and theme-specific colors via `/admin/branding`.
- **Media Upload System**: Reusable `MediaUploadInput` component supporting image and video uploads to Cloudinary with validation, and preview functionality.
- **Dynamic Category Management**: Admin CRUD for categories with image uploads, display ordering, and homepage integration.

### Backend Architecture

The backend uses Express.js with a native HTTP server integrated with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL, hosted on Neon serverless, is the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all image and video uploads. Real-time features (chat, order updates, delivery notifications) are powered by Socket.IO. Payment processing is integrated via Paystack API. The API adheres to RESTful principles, using Zod for request validation and Multer for file uploads.

### Database Schema Design

The database schema includes tables for:
- **Core Commerce**: Users (with role-specific fields), Products (with seller/store association, video support, dynamic fields), Orders (with status tracking, delivery geolocation), Reviews (with verified purchase, seller replies, admin moderation), Delivery Zones, Transactions, Product Variants, Cart (with variantId, selectedColor, selectedSize, selectedImageIndex).
- **Store Management**: Stores (linked to sellers).
- **Real-Time Communication**: Chat Messages.
- **Content Management**: Hero Banners (single-store), Banner Collections, and Marketplace Banners (multi-vendor).
- **Dynamic Categories**: Categories with name, slug, image, description, displayOrder, isActive, and Category Fields for custom attributes.
- **Configuration**: Platform Settings for dynamic feature toggling (e.g., `isMultiVendor`, `shopDisplayMode`, branding colors).

**Schema Extensions**:
- **Product Variants**: Cart schema extended to track `variantId`, `selectedColor`, `selectedSize`, and `selectedImageIndex`.
- **Multi-Vendor Support**: `stores` table links to sellers, and products can reference `storeId`.
- **Enhanced Product Module**: Products support a single video (max 30s) and a `dynamicFields` JSON column for category-specific attributes.
- **Verified Buyer Reviews**: Reviews are linked to orders (`orderId`) for `isVerifiedPurchase` validation, support images, seller replies, and admin moderation.

## External Dependencies

-   **Cloudinary**: Media asset management and CDN.
-   **Paystack**: Payment processing gateway.
-   **exchangerate.host**: Currency conversion API.
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
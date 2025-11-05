# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion, functioning as both a single-store and a multi-vendor marketplace controlled by an admin feature flag (`isMultiVendor`). It provides comprehensive e-commerce features including product/order management, live delivery tracking with map visualization, real-time chat, and Paystack payment integration. KiyuMart aims to be a leading online destination for modest Islamic fashion with a diverse and inclusive product range.

In **Single-Store Mode**, it offers a curated experience with dedicated hero banners and product categories. In **Multi-Vendor Marketplace Mode**, it transforms into a dynamic marketplace with banner carousels, seller category grids, global featured products, and a banner management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 (Vite, TypeScript), Wouter for routing, and TanStack Query for server state management. UI is built with Shadcn UI (Radix UI primitives) and Tailwind CSS, focusing on a mobile-first, responsive design with a green color scheme.

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
- Multi-Vendor specific components for dynamic homepage and banner management.
- Admin Branding System for full color customization.
- Reusable Media Upload System for Cloudinary.
- Dynamic Category Management with CRUD operations and image uploads.

### Backend Architecture

The backend is built with Express.js and a native HTTP server integrated with Socket.IO for WebSocket communication. Authentication is JWT-based with bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) is the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all media uploads. The API is RESTful, using Zod for request validation and Multer for file uploads.

### Database Schema Design

The database schema includes tables for:
- **Core Commerce**: Users, Products (with seller association, video, dynamic fields), Orders (with status, geolocation), Reviews (with verified purchase, seller replies), Delivery Zones, Transactions, Product Variants, Cart.
- **Store Management**: Stores (linked to sellers).
- **Real-Time Communication**: Chat Messages.
- **Content Management**: Hero Banners, Banner Collections, Marketplace Banners.
- **Dynamic Categories**: Categories with custom attributes.
- **Configuration**: Platform Settings for dynamic feature toggling (e.g., `isMultiVendor`, branding colors).

**Schema Extensions**:
- **Product Variants**: Cart schema extended to track `variantId`, `selectedColor`, `selectedSize`, `selectedImageIndex`.
- **Multi-Vendor Support**: `stores` table links to sellers, and products can reference `storeId`.
- **Enhanced Product Module**: Products support a single video and a `dynamicFields` JSON column.
- **Verified Buyer Reviews**: Reviews linked to orders for `isVerifiedPurchase` validation, support images, seller replies, and admin moderation.
- **Additional Tables**: admin_wallet_transactions, promotions, subscription_plans, featured_listings, wishlists, product_media, currency_rates, delivery_assignments, localization_strings, security_settings.

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

## Recent Updates (November 2025)

### Banner Images Library
Added a comprehensive collection of **30+ professional banner images** for various occasions and categories:

**Collections Include:**
- Religious & Cultural: Ramadan (2), Easter (2)
- Holidays: Christmas (2), New Year (2), Thanksgiving (2)
- Special Occasions: Valentine's Day (2), Mother's Day (2), Breast Cancer Awareness (2), International Women's Day (2)
- Shopping Events: Black Friday (2), Cyber Monday (2), Summer Sale (2)
- Product Categories: Electronics/Tech (2), Fashion Sale (2), Back to School (2)

**Location**: `attached_assets/stock_images/`

**Access**: Admins can browse all banners via the Media Library's "Available Assets" tab, copy URLs with one click, and use them for hero banners, marketplace banners, or any promotional content.

**Documentation**: See `attached_assets/BANNER_IMAGES_GUIDE.md` for complete reference.

### Initial Content Populated (November 5, 2025)

**Hero Banners (Single-Store Mode)** - 3 banners:
1. Ramadan Collection - Elegant modest fashion for the holy month
2. New Arrivals - Fresh styles for every occasion
3. Summer Collection - Light and elegant modest wear

**Marketplace Banners (Multi-Vendor Mode)** - 3 banners:
1. Discover Multiple Vendors - Shop from diverse modest fashion stores
2. Exclusive Collections - Unique pieces from sellers worldwide
3. Special Offers - Amazing deals from trusted vendors

**Islamic Fashion Products** - 6 initial products in single-store mode:
1. Elegant Black Abaya with Gold Embroidery - GHS 299.99 (15% off) - 4.8★ (124 reviews)
2. Burgundy Velvet Abaya - GHS 349.99 (20% off) - 4.9★ (87 reviews)
3. Navy Blue Modest Dress - GHS 189.99 (10% off) - 4.7★ (156 reviews)
4. Pink Lace Abaya Dress - GHS 279.99 (12% off) - 4.6★ (98 reviews)
5. Emerald Green Satin Modest Dress - GHS 259.99 (18% off) - 4.8★ (142 reviews)
6. Classic Black Abaya - GHS 199.99 - 4.9★ (203 reviews)

All products feature professional stock images from `attached_assets/stock_images/` and are associated with the default seller account (`seller@kiyumart.com`).
# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform dedicated to modest Islamic women's fashion, including abayas, hijabs, and dresses. It functions as both a single-store and a multi-vendor marketplace, with dynamic switching controlled by an admin through a feature flag (`isMultiVendor` in platform settings). The platform offers comprehensive e-commerce features like product and order management, delivery tracking with live map visualization, real-time chat, and Paystack payment integration. Its business vision is to be a leading online destination for modest Islamic fashion, offering a diverse and inclusive range of products to a global market.

### Single-Store Mode (Primary/Default)

The primary mode (`isMultiVendor: false`) displays a curated single-store Islamic fashion experience:
- **Hero Banner**: Showcases Islamic fashion imagery with women in hijabs and abayas, featuring collections like "New Season Collection"
- **Product Categories**: Islamic fashion categories including Elegant Abayas, Hijabs & Accessories, and Evening Wear
- **Product Display**: Grid layout showing product images with cost price (strikethrough) and selling price (green text), ratings, and reviews
- **Video Showcase**: Each product includes a "See it in Action" video section showing fit, details, and quality
- **Price Display Format**: Original price with strikethrough + discounted price in primary green color (matching GHS currency format)
- **Islamic Fashion Focus**: All content, from banners to products, emphasizes modest fashion and Islamic values

### Multi-Vendor Marketplace Mode

When enabled via the admin settings (`isMultiVendor: true`), the platform transforms into a marketplace with:
- **Dynamic Homepage**: Replaces single-store layout with marketplace banner carousel, seller category grid, and global featured products
- **Banner Management System**: Admins can create banner collections and schedule marketplace banners with template library support
- **Seller Categorization**: Products are grouped by seller with visual category cards showing store logos and product counts
- **Feature Flag Isolation**: All multi-vendor features are completely isolated; disabling the flag restores full single-store functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), using Wouter for routing, and TanStack Query for server state management. UI is designed with Shadcn UI (Radix UI primitives) and Tailwind CSS, focusing on a mobile-first, responsive design with a modern green color scheme. 

**Key Features**:
- Persistent shopping cart and wishlist
- Product browsing with category filters for Islamic women's fashion
- Product cards displaying ratings, prices, and seller information
- Real-time order tracking with Socket.IO updates
- Multi-language support (English, French, Spanish) with automatic currency switching (GHS, EUR, USD)
- QR code generation for orders
- Role-based dashboards (admin, seller, buyer)
- Notifications and user profile management
- Paystack payment integration
- Live delivery tracking with Leaflet.js and OpenStreetMap

**Multi-Vendor Components** (activated when `isMultiVendor: true`):
- `MultiVendorHome`: Marketplace homepage with banner carousel, seller grid, and featured products
- `MarketplaceBannerCarousel`: Auto-playing carousel with Embla for marketplace promotions
- `SellerCategoryCard`: Visual cards displaying seller stores with logos and product counts
- `AdminBannerManager`: Complete CRUD interface for banner collections and marketplace banners with scheduling

### Backend Architecture

The backend utilizes Express.js with a native HTTP server wrapped with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL, hosted on Neon serverless, is the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all image and video uploads. Real-time features such as chat, order updates, and delivery notifications are powered by Socket.IO. Payment processing is integrated via the Paystack API. The API follows RESTful principles, using Zod for request validation and Multer for file uploads.

### Database Schema Design

The database schema includes tables for:
- **Core Commerce**: Users (with role-specific fields), Products (with seller association and inventory), Orders (with status tracking and delivery details, including geolocation data), Reviews (with product ratings and user comments), Delivery Zones, Transactions, Product Variants, Cart (with variant tracking: variantId, selectedColor, selectedSize)
- **Real-Time Communication**: Chat Messages
- **Content Management**: Hero Banners (single-store), Banner Collections and Marketplace Banners (multi-vendor mode)
- **Configuration**: Platform Settings for dynamic feature toggling (including `isMultiVendor` flag, footer settings, and layout preferences)

#### Multi-Vendor Schema Extensions (Nov 2025)
- `banner_collections`: Groups of themed marketplace banners with activation controls
- `marketplace_banners`: Scheduled promotional banners with product/store references, display ordering, and metadata for the marketplace carousel

#### Product Variant Tracking in Cart (Nov 2025)
- Cart schema extended with variant tracking fields: `variantId`, `selectedColor`, `selectedSize`
- When customers select specific product variants (color/size) on product details pages, the exact selection is stored in the cart
- Cart retrieval returns complete variant metadata to ensure correct items are displayed throughout the shopping experience
- Backend storage layer preserves variant selections from add-to-cart through checkout

## External Dependencies

-   **Cloudinary**: Media asset management and CDN.
-   **Paystack**: Payment processing gateway.
-   **exchangerate.host**: Free currency conversion API.
-   **Neon Database**: Serverless PostgreSQL hosting.
-   **Socket.IO**: Real-time bidirectional communication.
-   **Drizzle ORM**: Type-safe database operations for PostgreSQL.
-   **TanStack Query**: Asynchronous state management and data synchronization.
-   **Shadcn UI + Radix UI**: Accessible UI component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Wouter**: Lightweight React router.
-   **JWT + Bcrypt**: Authentication and password security.
-   **Multer**: Multipart form data handling.
-   **React QR Code**: QR code generation.
-   **Leaflet.js**: Interactive maps (used with OpenStreetMap).
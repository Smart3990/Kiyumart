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

## Quick Testing Guide

To test all dashboards and features:

1. **Create Test Accounts**: Go to `/auth` and click "Create Test Accounts" button
2. **Quick Login**: Use the quick login buttons for instant access:
   - **Admin**: admin@kiyumart.com / admin123 → Access `/admin` dashboard
   - **Seller**: seller@kiyumart.com / seller123 → Access `/seller` dashboard
   - **Buyer**: buyer@kiyumart.com / buyer123 → Access `/buyer` dashboard
   - **Rider**: rider@kiyumart.com / rider123 → Access `/rider` dashboard

All dashboards are now fully functional with proper routing and authentication.

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
- **Core Commerce**: Users (with role-specific fields), Products (with seller association, store linkage, video support, and dynamic fields), Orders (with status tracking and delivery details, including geolocation data), Reviews (with verified purchase tracking, seller replies, and admin moderation), Delivery Zones, Transactions, Product Variants, Cart (with variant tracking: variantId, selectedColor, selectedSize, selectedImageIndex)
- **Store Management**: Stores (with primary_seller_id for backward compatibility)
- **Real-Time Communication**: Chat Messages
- **Content Management**: Hero Banners (single-store), Banner Collections and Marketplace Banners (multi-vendor mode)
- **Dynamic Categories**: Category Fields (admin-created custom fields per category)
- **Configuration**: Platform Settings for dynamic feature toggling (including `isMultiVendor` flag, footer settings, and layout preferences)

#### Backend API Enhancements (Nov 2025)
**Critical Security Fixes:**
- Video upload validation now uses server-side Cloudinary metadata (not client input) to enforce 30-second maximum duration
- `uploadWithMetadata()` function extracts actual video duration from Cloudinary response
- Product creation rejects videos >30 seconds with detailed error messages showing actual duration

**New API Endpoints:**
- Category Fields CRUD (admin-only): `POST/GET/PATCH/DELETE /api/category-fields` - Manage dynamic category fields
- Stores CRUD: `POST/GET/PATCH/DELETE /api/stores` - Multi-vendor store management with seller authorization
- Enhanced Reviews: `POST /api/reviews/:id/reply` - Sellers can reply to customer reviews
- Verified Purchase Check: `GET /api/reviews/verify-purchase/:productId` - Check if buyer purchased product
- Review creation automatically verifies purchase and sets `isVerifiedPurchase` flag for delivered orders

**Storage Layer:**
- `addSellerReply()` - Seller response to reviews with timestamp
- `verifyPurchaseForReview()` - Checks delivered orders for verified purchase badge
- Category fields CRUD methods for admin-created dynamic fields
- Stores CRUD with filtering (isActive, isApproved)
- `getStoreByPrimarySeller()` - Find store by seller account

#### Recent Updates (Nov 4, 2025)

**Navigation Improvements:**
- Fixed all dashboard sidebar navigation - clicking sidebar items now properly navigates to pages
- Admin dashboard "Mode Settings" button now navigates to `/admin/settings`
- Seller dashboard sidebar items navigate to correct seller routes
- All navigation uses wouter's `navigate()` for proper SPA routing (no more `window.location.href`)

**Platform Settings Enhancements:**
- Added `shopDisplayMode` field to platform_settings table ("by-store" | "by-category")
- Admin can toggle between "Shop by Store" and "Shop by Categories" view in multi-vendor mode
- Homepage heading dynamically updates based on selected display mode
- Store count badge visibility restricted to admin users only

**Footer Improvements:**
- Multi-vendor footer now shows appropriate marketplace links instead of hiding content:
  - "Marketplace" section with: Home, All Products, Browse Stores, Become a Seller
  - Single-store mode shows traditional category links: Home, Abayas, Hijabs, Dresses
- Footer adapts grid layout: 3 columns in multi-vendor mode, 4 columns in single-store mode

**Media Upload System:**
- Created `MediaUploadInput` component - reusable upload widget for all URL fields
- Dual input modes: Enter URL directly OR upload file
- Supports both images (10MB max) and videos (30MB max, 30s duration limit)
- New backend endpoints: `POST /api/upload/image` and `POST /api/upload/video`
- Uploads to Cloudinary with automatic validation (file type, size, duration)
- Preview functionality for uploaded images/videos
- Tab interface for seamless switching between URL entry and file upload

**Auto-Calendar Banner Feature:**
- Banner system already supports auto-scheduling via `startAt` and `endAt` timestamps
- `getActiveMarketplaceBanners()` automatically filters banners by current date
- Admins can create occasion-based banners (Christmas, Eid, Ramadan, etc.) with scheduled dates
- System automatically displays only active banners within their scheduled time range

**Profile & Order Tracking:**
- Profile update API exists at `PATCH /api/profile` - supports updating: username, phone, address, city, country
- Order tracking available via `/orders` page for all users
- Buyer dashboard has direct links to "My Orders" and order tracking
- Real-time order status updates via Socket.IO
- Live delivery map with rider location tracking

#### Multi-Vendor Schema Extensions (Nov 2025)
- `banner_collections`: Groups of themed marketplace banners with activation controls
- `marketplace_banners`: Scheduled promotional banners with product/store references, display ordering, and metadata for the marketplace carousel

#### Product Variant Tracking in Cart (Nov 2025)
- Cart schema extended with variant tracking fields: `variantId`, `selectedColor`, `selectedSize`, `selectedImageIndex`
- When customers select specific product variants (color/size) on product details pages, the exact selection is stored in the cart
- Selected product image is also tracked (selectedImageIndex) so cart displays the exact image user clicked
- Cart retrieval returns complete variant metadata to ensure correct items are displayed throughout the shopping experience
- Backend storage layer preserves variant selections from add-to-cart through checkout

#### Stores & Multi-Vendor Support (Nov 2025)
- `stores` table added with `primary_seller_id` to link stores to seller accounts
- Products can optionally reference a `storeId` for multi-vendor marketplace mode
- Backward compatible: existing products still use `sellerId` for single-store operation
- Migration automatically creates default stores for all existing sellers

#### Enhanced Product Module (Nov 2025)
- Video support: Products can have 1 video (max 30 seconds, MP4/WEBM format)
- Video duration tracking: `videoDuration` field validates 30-second limit
- Dynamic fields: `dynamicFields` JSON column for category-specific custom attributes (e.g., electronics specs, fashion sizes)
- Category Fields system: Admins can define custom fields per category (text, dropdown, table, etc.)

#### Verified Buyer Reviews (Nov 2025)
- Reviews linked to specific orders via `orderId` to verify purchases
- `isVerifiedPurchase` flag indicates buyer actually purchased the product
- Review images: Buyers can upload images with their reviews
- Seller replies: Sellers can respond to reviews (`sellerReply`, `sellerReplyAt`)
- Admin moderation: `isApproved` flag for review moderation

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
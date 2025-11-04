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

## Recent Major Updates (November 2025)

### Phase 1: Critical Bug Fixes & Foundation

**All Critical Bugs Fixed ✅:**
1. **Discount Badge**: Now only shows when product has actual discount (costPrice > sellingPrice), calculates accurate percentage
2. **Rider Quick Login**: Test rider account now includes vehicleInfo, isActive, isApproved flags for immediate access
3. **Seller "Store Not Found"**: Auto-creates store record in stores table when creating seller test accounts
4. **Message Counter**: Real-time unread message count with `/api/messages/unread-count` endpoint
5. **Category Images**: Shop by Categories now uses database category.image with fallback support

**New Admin Features:**
1. **AdminBranding Page** (`/admin/branding`):
   - Comprehensive color customization system
   - Primary, secondary, accent colors
   - Separate light mode colors (background, text, card)
   - Separate dark mode colors (background, text, card)
   - 8 new branding color fields in platform_settings schema
   - Real-time preview and save functionality

2. **AdminStoreManager Page** (`/admin/store`):
   - Comprehensive single-store management interface
   - Store profile settings (name, description, logo, contact)
   - Store branding controls (custom vs platform branding)
   - Business settings (hours, location, shipping, currency)
   - Store mode toggle (Single Store ↔ Multi-Vendor)
   - Integrated with platform settings API

3. **Store Mode Toggle System**:
   - Added to ALL dashboards (admin, seller, buyer, rider)
   - Admin: Full edit permissions with confirmation dialog
   - Other roles: Read-only indicator showing current mode
   - Displays "Single Store Mode" or "Multi-Vendor Mode" with icons
   - Auto-refreshes page after mode change
   - Confirmation dialog with detailed impact warnings

**Dashboard Navigation Enhancements:**
- Universal back navigation buttons on ALL admin pages (strictly non-negotiable ✅)
- ALL admin pages converted to DashboardSidebar layout (no Header/Footer exceptions)
- Branding route added to all admin page navigation handlers
- Store menu item added to admin sidebar

**Fixed Dead Actions:**
1. **AdminRiders**:
   - Add Rider: Opens full dialog form with all required fields
   - Creates rider via POST /api/users with proper validation
   - Edit Rider: Opens edit dialog with pre-filled data
   
2. **AdminUsers**:
   - Edit User: Opens dialog to edit name, email, phone, role
   - Ban/Activate: Toggles user status via PATCH /api/users/:id/status
   
3. **AdminProducts**:
   - View: Navigates to product detail page
   - Edit: Navigates to product edit page
   - Delete: Shows confirmation dialog, deletes via DELETE /api/products/:id
   
4. **AdminOrders**:
   - View: Opens order details dialog with full information
   - Status update: Updates order status via PATCH /api/orders/:id/status

**Real-Time Notification System (Complete ✅):**
- Database-backed notifications table with proper schema
- Socket.IO real-time updates
- Admin receives notifications for: new users (sellers/riders), products, orders, reviews, messages
- Unread count badges on all dashboards (shows actual count, auto-refreshes every 30 seconds)
- Mark as read functionality (individual + mark all)
- Notifications page with filtering and type-based icons
- Backend routes: GET /api/notifications, GET /api/notifications/unread-count, PATCH /api/notifications/:id/read, PATCH /api/notifications/mark-all-read

### Phase 2: Database Schema Extensions (Foundation for Advanced Features)

**10 New Tables Added:**
1. **admin_wallet_transactions**: Admin earnings tracking (type: sale, commission, promotion_fee)
2. **promotions**: Admin-promoted seller products with scheduling
3. **subscription_plans**: Premium monetization tiers
4. **featured_listings**: Premium product placement system
5. **wishlists**: User wishlist items with timestamps
6. **product_media**: Multiple images per product with display ordering
7. **currency_rates**: Cached exchange rates for multi-currency support
8. **delivery_assignments**: Rider delivery tracking and proof
9. **localization_strings**: Multi-language support (EN, FR, AR, ES, ZH)
10. **security_settings**: User security preferences (PIN, biometrics)

**New Enums:**
- adminTransactionTypeEnum (sale, commission, promotion_fee)
- mediaTypeEnum (image, video)
- deliveryAssignmentStatusEnum (assigned, en_route, delivered, cancelled)

**All tables include:**
- Proper insert schemas using createInsertSchema
- Insert types using z.infer
- Select types using typeof table.$inferSelect
- Successfully synced to database with npm run db:push

### Architecture & Code Quality

**Structural Integrity Maintained:**
- ALL changes strictly preserved existing structural layouts
- NO modifications to existing component hierarchies
- Only ADDED features on top of existing structure
- NO refactoring or layout modifications
- All updates incremental only

**Ready for Next Implementation Phase:**
- ✅ Foundation complete for admin wallet system
- ✅ Foundation complete for promotion system
- ✅ Foundation complete for wishlist feature
- ✅ Foundation complete for enhanced product detail (media gallery)
- ✅ Foundation complete for multi-currency conversion
- ✅ Foundation complete for delivery tracking
- ✅ Foundation complete for chat system
- ✅ Foundation complete for multi-language
- ✅ Foundation complete for security features

### Testing & Quality Assurance

**Test Accounts Working:**
- Admin: admin@kiyumart.com / admin123
- Seller: seller@kiyumart.com / seller123
- Buyer: buyer@kiyumart.com / buyer123
- Rider: rider@kiyumart.com / rider123 ✅ FIXED
- Agent: agent@kiyumart.com / agent123

All test accounts auto-create stores for sellers and include proper role-specific fields.
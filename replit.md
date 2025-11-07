# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion. It operates in two modes: a single-store model and a multi-vendor marketplace, controlled by an admin feature flag (`isMultiVendor`). The platform offers comprehensive e-commerce functionalities including product/order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. KiyuMart aims to be a premier online destination for modest Islamic fashion, providing a diverse and inclusive product range.

## Recent Changes (November 2025)

### Single-Store Mode & Primary Store Filtering (November 7, 2025)
- **Backend Product Filtering**: Enhanced `GET /api/products` endpoint to automatically filter products by primary store in single-store mode. When platform settings have `isMultiVendor=false` and a `primaryStoreId` is configured, the backend queries the primary store's seller and filters all product responses to only show products from that seller (unless an explicit sellerId query parameter is provided). This ensures customers only see the primary store's inventory on the homepage and product pages in single-store mode.
- **Dynamic Footer Categories**: Footer component now dynamically displays categories based on products from the primary store in single-store mode. Instead of hardcoded "Abayas, Hijabs, Dresses" links, the footer queries `/api/products` (which auto-filters by primary store), extracts unique categories from returned products, and displays the first 3 categories. Shows "All Products" fallback if no categories are available. Multi-vendor mode continues to show standard Marketplace navigation links.
- **Orders Cascade Delete Fix**: Fixed critical bug in user deletion cascade logic where `orders.userId` was referenced instead of `orders.buyerId`, causing delete failures. Orders table uses `buyerId` and `riderId` fields, not a generic `userId` field.

### User Management & Application Verification (November 7, 2025)
- **Transactional Hard Delete**: Implemented atomic hard delete for users with complete cascade handling. All related data (chat messages, cart items, wishlist items, notifications, products, stores, orders) is deleted within a single database transaction using `db.transaction()`. If any delete operation fails, the entire transaction rolls back, preventing partial deletions and maintaining data integrity. UI updated from "Deactivate User" to "Delete User" with clear warning about permanent removal.
- **Ghana Card Display in Application Preview**: Created `ViewApplicationDialog` component that displays comprehensive seller/rider application details including profile photo, personal information, Ghana Card front/back verification images in a responsive grid layout, and store/business information. "View Application" button appears for all pending seller/rider applications in admin management pages.
- **Enhanced Rejection Workflow**: Application rejection now properly invalidates TanStack Query cache using `queryClient.invalidateQueries(["/api/users"])`, ensuring rejected applications immediately disappear from the pending applications list without requiring manual page refresh.
- **Fixed Pending Applications Filter**: Corrected AdminSellers and AdminRiders pending filter from `isApproved === false` to `isApproved === false && isActive === true` to properly exclude rejected applications (where isActive=false) from the pending list, ensuring only truly pending applications appear after approval/rejection.
- **Fixed Store View Navigation**: Corrected "View Store" button in AdminSellers to navigate with sellerId (`/seller/${sellerId}`) instead of storeId, matching SellerStorePage route expectations. Button now only shows for approved sellers who have stores.
- **Admin Product Management**: Confirmed full admin product management capability at `/admin/products` with ability to view all seller products, edit any product (including category assignment), delete products, and toggle product status. AdminProductEdit page includes category dropdown for reassigning products to different categories.
- **Verified Shopping Pages**: Confirmed that cart (`/cart`), wishlist (`/wishlist`), and order history (`/orders`) pages are fully functional with proper routing in App.tsx and accessible to all user roles including admins.

### Admin Seller Management Improvements (November 7, 2025)
- **Dual-View Seller Management**: AdminSellers page now features tabs for "All Sellers" (default view showing all registered sellers) and "Pending Applications" (unapproved sellers only). This fixes the issue where admin-created sellers (auto-approved with `isApproved=true`) were not visible in the management interface. Admins can now view the complete seller roster while still having dedicated access to pending applications requiring approval.
- **Quick Store View Button**: Each seller card in AdminSellers page now includes a "View Store" button that directly navigates to the seller's store page (`/seller/{storeId}`). The button only appears for sellers who have an associated store, using the sellerToStoreMap lookup for efficient store ID retrieval.
- **Category Management Accessible**: Confirmed AdminCategoryManager is fully integrated with route `/admin/categories` and accessible via the "Categories" menu item in the admin sidebar, allowing admins to manage product categories displayed on the homepage.
- **Admin Shopping Features**: Verified that admin users can access their personal shopping cart (`/cart`), wishlist (`/wishlist`), and purchase history (`/orders`) through dedicated sidebar menu items ("Shopping Cart", "My Wishlist", "My Purchases") with proper routing in DashboardLayout.

### Admin Application Management Enhancements (November 7, 2025)
- **Smart Notification Redirects**: Clicking notifications now intelligently redirects admins to the relevant page based on notification type and metadata. Product notifications route to `/admin/products/:id/edit`, user notifications to `/admin/users/:id/edit`, and order notifications to `/admin/orders`, all using existing routes. Preview dialog only shown for notifications without redirect metadata.
- **Enhanced Store Banner Upload**: Admin create seller form now uses MediaUploadInput component for store banner images, supporting both file upload to Cloudinary and direct URL entry, replacing the basic URL input field.
- **Dual-Tab Rider Management**: AdminRiders page now features tabs for "All Riders" (default view showing all registered riders) and "Pending Applications" (unapproved riders only), matching the AdminSellers pattern. Approved riders remain visible after approval instead of disappearing from the interface.
- **Soft-Delete User Deactivation**: Changed user deletion from hard delete to soft delete by setting `isActive=false`. This prevents foreign key constraint violations across 18+ related tables (stores, products, orders, cart, notifications, etc.). UI updated from "Delete User" to "Deactivate User" to reflect the safe, reversible nature of the operation.
- **Application Rejection System**: Implemented complete approve/reject workflow for pending seller/rider applications. AdminSellers page now displays Approve/Reject buttons for pending applications. Backend validates that only unapproved applications can be rejected. Rejection sets both `isApproved=false` and `isActive=false`, effectively denying the application.
- **Cascading Store Deactivation**: Enhanced seller deactivation to automatically cascade to their associated store. When an approved seller is deactivated, their store is also deactivated (sets store `isActive=false` and `isApproved=false`). Reactivating the seller also reactivates their store, ensuring consistent state management between sellers and their stores.

### Store Creation & Product Linking (November 7, 2025)
- **Automatic Store Creation on Seller Approval**: Refactored seller approval workflow to create stores BEFORE setting user approval status, ensuring atomicity. If store creation fails, seller remains unapproved and admin can safely retry.
- **Product Auto-Linking**: Products created by sellers now automatically link to their store. System fetches seller's store and sets storeId, preventing orphaned products.
- **Schema Fix for Seller Metadata**: Added `storeType`, `storeTypeMetadata`, and `storeBanner` to `insertUserSchema`, enabling proper persistence of seller application data including category selection and category-specific product information.
- **Enhanced Error Handling**: Comprehensive logging and rollback logic for store creation failures. Admin receives clear error messages when store creation fails, with detailed logs for debugging.
- **Database Cleanup**: Removed all test users (buyer, rider, seller) and associated stores. Only admin and agent accounts remain.

### Admin Dashboard Enhancements
- **Fixed AdminUserEdit Page**: Corrected API request syntax to properly load and update user information. The edit form now successfully fetches user data via `GET /api/users/:id` and updates via `PATCH /api/users/:id`.
- **Redesigned AdminMessages Page**: Completely overhauled the messaging interface to list all platform users organized by role categories (All, Sellers, Buyers, Riders, Admins, Agents). Admin can now search for users, filter by role, select any user to view message history, and start conversations directly from the admin dashboard.
- **Added Backend User Endpoint**: New `GET /api/users/:id` route with admin authorization for fetching individual user details, supporting the edit user functionality.
- **Dynamic Platform Branding**: Implemented `useBranding` hook that synchronizes primary color from platform settings to CSS custom properties (`--primary`, `--ring`, `--sidebar-*`, `--chart-1`), enabling instant platform-wide theme updates when admin changes branding colors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), utilizing Wouter for routing and TanStack Query for server state management. UI components are developed using Shadcn UI (Radix UI primitives) and Tailwind CSS, adhering to a mobile-first, responsive design with a green color scheme. Key features include a persistent shopping cart and wishlist, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards (admin, seller, buyer, rider). It integrates Paystack for payments, Leaflet.js and OpenStreetMap for live delivery tracking, and supports multi-vendor specific dynamic components and an admin branding system for full color customization. A reusable Media Upload System for Cloudinary and Dynamic Category Management are also implemented. The platform includes comprehensive approval workflows for sellers and riders with professional 72-hour response messaging, and sellers have dedicated product management functionality at `/seller/products` for full CRUD operations. The seller application process now features a dynamic store type selection system with 10 predefined categories (Clothing, Electronics, Food & Beverages, Beauty & Cosmetics, Home & Garden, Books & Media, Sports & Fitness, Toys & Games, Health & Wellness, Automotive), each with category-specific product information fields that validate on both frontend and backend.

### Backend Architecture

The backend is developed with Express.js and integrates a native HTTP server with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) serves as the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary is used for all media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads. The architecture supports a comprehensive application verification system, including Ghana Card verification for sellers and riders, with detailed admin review processes.

### Database Schema Design

The database schema encompasses tables for core commerce functionalities (Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart), store management (Stores), real-time communication (Chat Messages), content management (Hero Banners, Banner Collections, Marketplace Banners), dynamic categories, and platform configuration. Extensions support product variants, multi-vendor associations, enhanced product modules with video and dynamic fields, verified buyer reviews, and additional tables for promotions, subscriptions, wishlists, and localization. Recent updates include fields for `profileImage`, `ghanaCardFront`, `ghanaCardBack` for comprehensive application verification, and `isApproved` flag in the User interface for managing seller/rider approval workflows.

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
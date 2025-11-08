# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, supporting both single-store and multi-vendor marketplace models. It provides comprehensive online functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform focuses on a diverse product range, dynamic category management, extensive admin dashboards, and a robust application verification system for sellers and riders.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Enhanced Seller Product Management (November 8, 2025)

**Category Filtering by Store Type:**
- ✅ Added `storeTypes` array field to categories table for multi-store-type support
- ✅ Sellers now see only categories relevant to their store type during product creation/editing
- ✅ Intelligent filtering logic:
  - Categories with no store type restrictions → visible to all sellers
  - Categories with store type restrictions → only visible to matching store types
- ✅ Helpful UI feedback showing which categories are available for the seller's store type
- ✅ Graceful fallback: sellers without approved stores see all categories

**File Upload from Computer:**
- ✅ Replaced URL text inputs with MediaUploadInput component for images and videos
- ✅ Sellers can now:
  - Upload images directly from their computer (max 10MB)
  - Upload videos directly from their computer (max 30MB)
  - Or manually enter Cloudinary URLs for flexibility
- ✅ Integrated with existing Cloudinary upload endpoints (`/api/upload/image`, `/api/upload/video`)
- ✅ Proper validation for file type and size with user-friendly error messages
- ✅ Upload progress indication and success/error toast notifications

**Technical Implementation:**
- Database schema updated with `storeTypes` column in categories table
- SellerProducts form fetches seller's store to determine filtering criteria
- MediaUploadInput component maintains backend compatibility by submitting Cloudinary URLs
- No breaking changes to existing product creation/update flows

**Admin Category Manager Update:**
- ✅ Added store types multi-select (checkboxes) to category create/edit form
- ✅ Admins can now assign specific store types to categories or leave empty for all stores
- ✅ Store type restrictions displayed as badges in category list
- ✅ Two-column checkbox grid for all 10 store types (clothing, electronics, food_beverages, etc.)
- ✅ Complete integration with seller-side category filtering

### Critical Routing Conflict Fix (November 8, 2025)

**Problem Resolved:**
- Fixed major routing conflict where `/seller/:id` pattern for public seller store pages conflicted with seller dashboard routes
- Routes like `/seller/orders` and `/seller/products` were incorrectly interpreted as seller IDs
- This caused 403 errors (`/api/users/orders`, `/api/users/products`) and "Store Not Found" errors

**Solution Implemented:**
- Changed public seller store route from `/seller/:id` to `/sellers/:id` (plural)
- Clean separation: `/seller/*` for authenticated dashboard, `/sellers/:id` for public stores
- Updated all navigation links and components:
  - `SellerStorePage.tsx`: Route changed to `/sellers/:id`
  - `Footer.tsx`: Simplified logic, removed unnecessary dashboard route filtering
  - `SellerCategoryCard.tsx`: Navigation updated to `/sellers/:id`
  - `AdminSellers.tsx`: View store button updated to `/sellers/:id`

**Benefits:**
- No more routing conflicts or 403 errors
- Improved semantic clarity (plural for browsing stores, singular for dashboard)
- Simplified Footer component logic

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

### Real-Time Seller Store Updates Fix (November 8, 2025)

**Problem Identified:**
- Sellers didn't see their assigned stores immediately after admin approval
- Root cause: React Query cache issue - cached 404 responses persisted after store creation
- Browser-specific caching prevented cross-session updates

**Solution Implemented:**
- ✅ Cross-session Socket.IO notification system for real-time updates
- ✅ Backend emits `seller-approved:${sellerId}` event when seller is approved (server/routes.ts)
- ✅ Shared NotificationProvider listens for seller-approved events with authenticated connection
- ✅ Automatic store query refetch and cache invalidation on approval
- ✅ Toast notification shows "Application Approved!" to seller in real-time
- ✅ Enhanced logging for debugging store creation and retrieval flow

**Technical Details:**
- Socket.IO event emission in `/api/users/:id/approve` endpoint after store creation
- NotificationProvider (client/src/contexts/NotificationContext.tsx) handles seller-approved listener
- Prevents duplicate socket connections (uses shared authenticated socket instance)
- Store query (`/api/stores/my-store`) automatically refetches when event received
- Works even if seller dashboard is open during admin approval (no page refresh needed)

**Key Learning:**
- React Query caches are per-browser-instance - admin cache invalidation doesn't affect seller's browser
- Cross-session updates require real-time communication (Socket.IO, SSE, or polling)
- Always use shared socket connections to preserve authentication and prevent resource leaks

### Product Management Bug Fixes (November 8, 2025)

**Critical Product Creation/Update Issues Resolved:**

**Problem #1: Product Creation Failures**
- Root cause: Frontend-backend field name mismatch with database schema
- Product creation form sent `categoryId`, `stockQuantity`, `videoUrl` fields
- Database schema expects `category` (text), `stock` (integer), `video` (text)
- Zod validation errors prevented successful product creation

**Problem #2: Multi-Image Data Loss**
- Product updates overwrote entire images array when editing
- Changing primary image deleted all secondary product images
- Tags and other fields caused image array to be reset

**Problem #3: Media Library Crashes**
- SellerMediaLibrary page crashed with `.map()` error
- Backend API sometimes returned non-array responses
- Missing array validation caused runtime errors

**Solutions Implemented:**

✅ **Schema Alignment (SellerProducts.tsx):**
- Updated Product interface to match database exactly:
  - `category: string` (category name, not ID)
  - `stock: number` (not `stockQuantity`)
  - `video: string | null` (not `videoUrl`)
  - Removed `inStock` (derived from `stock > 0`)
- Form submission sends schema-aligned field names
- Form default values correctly read database fields

✅ **Multi-Image Preservation (SellerProducts.tsx):**
```typescript
// Replace primary image but keep secondary images
let images = product?.images || [];
if (data.imageUrl && product && data.imageUrl !== product.images[0]) {
  images = [data.imageUrl, ...product.images.slice(1)];
}
```
- Update mutation always sends complete `images` array
- Primary image changes preserve secondary images
- No data loss during edits

✅ **Media Library Safety (SellerMediaLibrary.tsx):**
```typescript
return Array.isArray(data) ? data : [];
```
- Added array validation to prevent crashes
- Graceful fallback when API returns non-array

**Technical Impact:**
- Product creation now works without Zod validation errors
- Multi-image products retain all images during updates
- Media library handles edge cases safely
- Complete data flow validated: Form → FormData → Backend → Database

**Known Remaining Issues:**

⚠️ **ChatPageConnected Infinite Loop:**
- "Maximum update depth exceeded" error in browser console
- Likely caused by useEffect dependencies triggering re-renders
- Requires investigation of Socket.IO event listeners and state updates
- **Status:** Not yet investigated

⚠️ **Missing Chat Features (Documented, Not Implemented):**
1. **Message Attachments:**
   - UI elements exist (paperclip icon, attachment button)
   - No backend storage or file upload handlers
   - No Cloudinary integration for chat media
   - **Impact:** Users cannot send images/files in messages

2. **Voice/Video Calls:**
   - Phone icon exists in chat interface
   - No WebRTC implementation
   - No signaling server setup
   - **Impact:** Call feature non-functional

**Files Modified:**
- `client/src/pages/SellerProducts.tsx` - Schema alignment and image preservation
- `client/src/pages/SellerMediaLibrary.tsx` - Array validation safety

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
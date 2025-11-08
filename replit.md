# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, supporting both single-store and multi-vendor marketplace models. It offers comprehensive online functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform focuses on a diverse product range, dynamic category management, extensive admin dashboards, and a robust application verification system for sellers and riders. The business vision is to provide a seamless and inclusive online shopping experience for modest fashion, tapping into a significant market potential for Islamic women's apparel.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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

### Chat Page Infinite Loop Fix (November 8, 2025)

**Problem Identified:**
- "Maximum update depth exceeded" error in browser console
- ChatPageConnected component had infinite re-render loop
- Caused by unnecessary manual query refetch when selecting contacts

**Root Cause:**
```typescript
onClick={() => {
  setSelectedContact(contact);
  refetchMessages(); // ❌ UNNECESSARY - causes double refetch
}}
```

When clicking a contact:
1. `setSelectedContact(contact)` updates state
2. `refetchMessages()` manually triggers query refetch
3. TanStack Query ALSO auto-refetches because `queryKey: ["/api/messages", selectedContact?.id]` changed
4. Double-refetch triggered cascading state updates causing infinite loop

**Solution Implemented:**

✅ **Removed Unnecessary Manual Refetch:**
```typescript
onClick={() => {
  setSelectedContact(contact);
  // TanStack Query will auto-refetch when selectedContact?.id changes
}}
```

✅ **Leveraged TanStack Query Auto-Refetch:**
- Query automatically refetches when queryKey changes
- `selectedContact?.id` is part of queryKey array
- Changing contacts triggers automatic data reload
- No manual refetch needed

**Technical Impact:**
- No more "Maximum update depth exceeded" errors
- Chat page loads and switches contacts smoothly
- Browser console is clean with no warnings
- Proper reliance on TanStack Query's reactive system

**Known Limitation (Not Causing Errors):**
⚠️ Socket listener has stale closure for `selectedContact` reference
- Real-time messages might not filter correctly by contact
- Not causing infinite loops or errors
- Future enhancement: Refactor socket listener to use refs

**Files Modified:**
- `client/src/pages/ChatPageConnected.tsx` - Removed manual refetch call

### Missing Chat Features (Documented, Not Implemented)

⚠️ **Message Attachments:**
- UI elements exist (paperclip icon, attachment button)
- No backend storage or file upload handlers
- No Cloudinary integration for chat media
- **Impact:** Users cannot send images/files in messages

⚠️ **Voice/Video Calls:**
- Phone icon exists in chat interface
- No WebRTC implementation
- No signaling server setup
- **Impact:** Call feature non-functional

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
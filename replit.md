# KiyuMart - Fashion E-commerce Marketplace

## Overview

KiyuMart is a dual-mode e-commerce platform that operates as both a single-store fashion marketplace and a multi-vendor marketplace. The platform supports dynamic switching between modes through admin controls, allowing for flexible business models. Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides comprehensive e-commerce functionality including product management, order processing, delivery tracking, real-time chat, and payment integration.

## Production Status (Phase 1 - ✅ COMPLETE & PRODUCTION READY)

**✅ Core E-Commerce Features:**
- Multi-role authentication system (Super Admin, Seller, Buyer, Rider, Agent)
- Product catalog with categories, search, and filtering
- **NEW: Cost price display with strike-through styling**
- **NEW: Auto-calculated discount badges (percentage off)**
- **NEW: Wishlist system with heart icon toggle and persistence**
- **NEW: Auto-search with 300ms debounce (filters by name/category)**
- **NEW: Cart badge counter with real-time updates across all pages**
- **NEW: ProductDetails page (/product/:id) with full product view**
- **NEW: Cart page (/cart) with item management and order summary**
- Shopping cart with persistent state
- Complete checkout workflow with delivery information
- Paystack payment integration
- Multi-currency support with real-time conversion
- QR code generation for delivery confirmation
- Analytics dashboards for all user roles
- Cloudinary-powered image management
- Mobile-responsive design

**✅ Phase 2 - Enhanced Order Tracking (COMPLETE):**
- **Visual Order Status Timeline**: Progressive indicator showing order journey (pending → processing → shipped → delivered)
- **Real-time Status Updates**: Socket.IO integration for instant order status notifications
- **Status Badges**: Color-coded badges with icons for quick status identification
- **Advanced Filtering**: Search by order number/address, filter by status
- **Responsive Design**: Mobile-optimized timeline and card layouts
- **Toast Notifications**: Real-time alerts when order status changes

**🔄 Phase 2 - In Progress:**
- **Chat System**: Backend complete (Socket.IO, APIs, DB schema), frontend auth guard fixed, manual testing pending
- **Delivery Tracking**: Needs Leaflet.js map integration
- **Analytics**: Needs charts and advanced dashboards

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Phase 2 - Enhanced Order Tracking (Completed Nov 3, 2025)

**OrderStatusTimeline Component:**
- Visual timeline showing order progression through stages
- Icons for each stage: Clock (pending), Package (processing), Truck (shipped), CheckCircle (delivered)
- Completed steps highlighted in primary color with connecting lines
- Special UI for cancelled (red) and disputed (yellow) orders
- Delivery timestamp shown for completed orders

**OrderStatusBadge Component:**
- Color-coded badges for all order statuses
- Background colors adapt to light/dark themes
- Icons integrated for visual clarity
- Variants: pending (gray), processing (blue), shipped (purple), delivered (green), cancelled (red), disputed (yellow)

**Enhanced OrderTracking Page:**
- Search functionality with real-time filtering by order number or address
- Status filter dropdown (all, pending, processing, shipped, delivered, cancelled, disputed)
- Results count display showing filtered vs total orders
- Improved card layout with header sections
- Timeline integration in each order card
- QR code hidden for cancelled orders

**Real-time Socket.IO Updates:**
- Backend emits `order_status_updated` event when order status changes
- Frontend listens for updates and invalidates query cache
- Toast notifications alert users of status changes
- Automatic UI refresh without page reload
- Socket connection cleanup on component unmount

**Backend Enhancements:**
- PATCH /api/orders/:id/status now emits Socket.IO events to buyer
- Event payload includes orderId, orderNumber, status, updatedAt
- Targeted emission to specific buyer's socket room

### Phase 1 MVP (Completed Nov 3, 2025)

**Product Display Enhancements:**
- Added `costPrice` field to products schema (decimal type)
- Product cards now display cost price with strike-through when higher than selling price
- Auto-calculated discount badge shows percentage off in top-left of product cards
- Calculation: `Math.round(((costPrice - sellingPrice) / costPrice) * 100)`

**Wishlist Functionality:**
- New `wishlist` table with unique constraint on (userId, productId)
- API endpoints: POST /api/wishlist, GET /api/wishlist, DELETE /api/wishlist/:productId
- Heart icon on product cards (filled when wishlisted, empty otherwise)
- Optimistic UI updates with useEffect sync for server-driven changes
- Persistence verified across page refreshes
- Toast notifications for add/remove actions
- Authentication required (redirects to /auth if not logged in)

**Auto-Search with Debounce:**
- 300ms debounce using useRef and setTimeout with proper cleanup
- Case-insensitive filtering across product.name and product.category
- Dynamic heading: "Search Results (count)" when searching, "Featured Products" when idle
- Shows all matching products when searching, first 8 products when not searching
- Empty state with "No products found matching" message

**Cart Badge Counter:**
- Real-time updates across all pages (Home, ProductDetails, Cart)
- Calculation: `cartItems.reduce((sum, item) => sum + item.quantity, 0)`
- Badge shows when count > 0, positioned absolute on top-right of cart icon
- Query invalidation ensures sync after mutations
- ProductDetails now fetches cart data to maintain accurate badge

**New Pages:**
- `/product/:id` - Full product details with images, prices, quantity selector, add to cart, wishlist toggle
- `/cart` - Complete cart management with quantity controls, remove items, order summary, checkout button

**Query Optimization:**
- Cart product query key includes sorted product IDs for proper cache invalidation
- All pages use TanStack Query for efficient data fetching and caching
- Mutations properly invalidate related queries

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with Vite as the build tool and development server
- TypeScript for type safety across the application
- Client-side routing using Wouter (lightweight alternative to React Router)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and API data fetching
- Custom query client configuration with credential-based authentication
- Local component state using React hooks for UI-specific state

**UI Component System**
- Shadcn UI component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- CSS variables for theme customization (light/dark mode support)
- Component aliases configured for clean imports (@/components, @/lib, etc.)

**Design System**
- New York style variant from Shadcn UI
- Custom color palette with HSL-based theming
- Typography using Inter/SF Pro Display and Outfit/Poppins
- Mobile-first responsive design approach
- Product-first visual hierarchy inspired by Shopify and modern fashion platforms

**Key Features (Production Ready)**
- Shopping cart with persistent state
- Product browsing with category filtering
- Real-time order tracking with status updates
- Multi-currency support with real-time conversion
- QR code generation for delivery confirmation
- Role-based dashboards (Admin, Seller, Rider)
- Paystack payment integration

**Phase 2 Features (Future Roadmap)**
- Real-time chat interface (Socket.io backend complete, frontend optimization needed)
- Order tracking page (API functional, frontend rendering refinement needed)
- Advanced delivery tracking with map integration

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- Native HTTP server wrapped with Socket.IO for WebSocket support
- Custom middleware for request logging and error handling

**Authentication & Authorization**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (admin, seller, buyer, rider, agent)
- Session secret required via environment variable
- Token expiration set to 7 days
- Protected routes using custom middleware (requireAuth, requireRole)

**Database Layer**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database operations
- Schema-first approach with Zod validation
- Database connection pooling for performance
- Migrations managed through Drizzle Kit

**Database Schema Design**
- Users table with role-based fields (store info for sellers, vehicle info for riders)
- Products with seller association and inventory tracking
- Orders with status tracking and delivery method selection
- Delivery zones with pricing configuration
- Chat messages for buyer-seller communication
- Transactions for payment tracking
- Platform settings for dynamic configuration
- Shopping cart with user-product associations

**File Storage**
- Cloudinary integration for image and video uploads
- Stream-based upload process for memory efficiency
- Organized folder structure (default: "kiyumart")
- Support for auto-detection of resource types

**Real-time Communication**
- Socket.IO for WebSocket connections
- Chat messaging between users
- Order status updates
- Delivery tracking notifications

**Payment Processing**
- Paystack API integration for payment gateway
- Support for multiple currencies (GHS primary)
- Transaction tracking and webhook handling
- Platform processing fee configuration

**API Design**
- RESTful endpoints organized by feature
- Multer middleware for multipart file uploads
- JSON request/response format
- Comprehensive error handling
- Request validation using Zod schemas

### External Dependencies

**Third-Party Services**
- **Cloudinary**: Media asset management and CDN for product images, user profiles, and store banners
- **Paystack**: Payment processing gateway with support for Ghana and Nigeria
- **exchangerate.host**: Free currency conversion API with hourly cache (1-hour duration)
- **Neon Database**: Serverless PostgreSQL hosting
- **Socket.IO**: Real-time bidirectional communication for chat and notifications

**Key Libraries**
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **TanStack Query**: Asynchronous state management and data synchronization
- **Shadcn UI + Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Lightweight routing for React
- **JWT + Bcrypt**: Authentication and password security
- **Multer**: Multipart form data handling for file uploads
- **React QR Code**: QR code generation for delivery confirmation

**Map Integration**
- OpenStreetMap via Leaflet.js (referenced in requirements, not yet implemented)
- Planned for delivery tracking and location selection

**Development Tools**
- Vite for fast HMR and optimized production builds
- TypeScript for type checking
- ESBuild for server bundling
- Replit-specific plugins for development environment
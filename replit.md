# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is a specialized e-commerce platform focused on modest Islamic women's fashion, including elegant abayas, hijabs, and modest dresses. The platform operates as both a single-store fashion marketplace and a multi-vendor marketplace, supporting dynamic switching between modes through admin controls. Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides comprehensive e-commerce functionality including product management, order processing, delivery tracking with live map visualization, real-time chat, and Paystack payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

### Footer and Platform Settings Management (Nov 3, 2025)
- **Footer Logo Display**: Logo now displays in Footer with theme-aware variants (light/dark mode)
- **Dynamic Footer Content**: Footer fetches data from platform_settings table via `/api/settings` endpoint
  - Contact information (phone, email, address) dynamically displayed
  - Social media links (Facebook, Instagram, Twitter) shown only when configured
  - Footer description text controlled from database
  - Platform name displayed in copyright section
- **Platform Settings Schema**: Added footer control fields to platform_settings table:
  - contactPhone, contactEmail, contactAddress (default values set)
  - facebookUrl, instagramUrl, twitterUrl (optional social links)
  - footerDescription (editable platform description)
- **Profile Page Buttons Connected**: All dormant buttons now navigate properly:
  - "Start Shopping" → navigates to home page (/)
  - "View Details" (in orders) → navigates to order tracking page (/track)
  - "Change Password" → navigates to settings page (/settings)
  - "Manage Email Preferences" → navigates to settings page (/settings)
- **Shopping Cart Bug Fix**: Fixed NaN price display in cart by updating getCart() function to join with products table and return complete price data
- **Paystack Payment Integration Fix**: Updated payment routes to use Paystack secret key from platform_settings instead of environment variable
- **QR Code Display Fix**: Enhanced QRCodeDisplay component with forced white background (!bg-white) for proper visibility in both light and dark modes
- **Admin Settings Page**: Created comprehensive platform settings management interface at `/admin/settings`
  - General settings: Platform name, multi-vendor toggle
  - Payment configuration: Paystack public/secret keys, processing fee percentage
  - Contact information: Phone, email, address, social media links, footer description
  - Branding: Primary color customization
  - Currency: Default currency selection (GHS, NGN, XOF, USD, EUR, SAR)
  - Accessible from admin dashboard via "Configure" button
  - Form validation with Zod and real-time updates

### UI/UX and Navigation Enhancements (Nov 3, 2025)
- **Shopping Cart Currency**: Cart and CartPopover use dynamic currencySymbol from LanguageContext (GHS/EUR/USD)
- **Perfect Circle Badges**: All notification badges (cart, wishlist, notifications) display as perfect circles with rounded-full class
- **Active State Indicators**: Navigation icons highlight in primary color when on their respective pages
- **Wishlist Counter Badge**: Heart icon in header shows wishlist item count with perfect circle badge
- **Settings Page**: Created comprehensive settings page with:
  - Notification preferences (email, push, order updates, promotions)
  - Appearance settings (dark mode toggle)
  - Language and region display
  - Account security options (2FA setup, password change)
  - Privacy controls (download data, delete account)
  - Route: `/settings`
  - Settings button added to Profile page
- **Profile Picture Upload**: Complete implementation with:
  - Camera icon button on profile avatar with file upload functionality
  - Frontend validation: file type and 5MB size limit
  - Server-side validation: MIME type checking (JPEG/PNG/WEBP/GIF), file size enforcement
  - Cloudinary integration for secure image storage in kiyumart/profiles folder
  - Real-time UI updates with proper cache invalidation
  - Loading states and comprehensive error handling
- **Profile Security**: Enhanced profile update endpoint with strict field whitelisting (username, phone, address, city, country only) to prevent privilege escalation

### Product Data Completeness (Nov 3, 2025)
- **Videos**: All products now have video URLs for product demos/showcases
- **Variants**: Every product has size and color variants with SKU codes
  - Abayas: S/M/L/XL sizes with color options (Black, Burgundy, Cream, Pink, Emerald Green)
  - Hijabs: One Size with multiple color options (Multicolor, Navy Blue, Burgundy)
  - Accessories: One Size with color variants (Black, Brown, Tortoise)
  - Dresses: S/M/L/XL sizes with various colors (Beige)
  
### E-commerce Enhancements (Nov 3, 2025)
- **Payment Flow**: Changed "Place Order" to "Pay" button with direct Paystack integration and callback handling
- **Product Variants**: 
  - Added database schema and API for product colors and sizes (productVariants table)
  - Implemented variant selection UI with color and size buttons on ProductDetails page
  - Variant-aware stock management - availability updates based on selected color/size combination
  - Automatic validation that resets invalid combinations
  - Disabled buttons for out-of-stock variants
  - Required selections marked with red asterisks
  - Clear messaging for missing or invalid selections
- **Hero Banners**: Added hero_banners table for multiple auto-scrolling banners
- **Wishlist Page**: Created dedicated wishlist page at /wishlist route
- **Product Gallery**: 
  - Updated products to support up to 5 images with thumbnail navigation
  - Thumbnail grid uses 5 columns (grid-cols-5) for even distribution
  - Clickable thumbnails with hover effects and selection indicators
  - Video playback support for products with video field
- **Related Products**: "You May Also Like" section on ProductDetails page showing up to 4 products from same category
- **Category Navigation**: Fixed category cards to properly navigate to category pages
- **Sample Data**: Added 8 product variants (S/M/L/XL sizes) and 3 hero banners

### Product Reviews System (Nov 3, 2025)
- Added complete reviews functionality for products
- Database schema: `reviews` table with productId, userId, rating (1-5), comment, helpful count, timestamps
- API routes: POST /api/reviews (create), GET /api/products/:productId/reviews (fetch)
- ProductDetails page displays reviews with avatars, star ratings, user names, and comments
- Sample data: 5 reviews across products with authentic Islamic fashion feedback
- Integration with users table for reviewer information

### Diverse Hero Banner (Nov 3, 2025)
- New hero banner featuring both Arab and Black ladies in Islamic modest fashion
- Boutique setting showcasing inclusivity and diversity in modest wear
- Image: Diverse_Islamic_fashion_banner_eb13714d.png
- Replaces previous single-model banner with more representative imagery
- Displayed on both Home and HomeConnected pages

### Product Catalog Images Update (Nov 3, 2025)
- Updated all product images to use authentic Islamic fashion stock photography
- Stock images stored in /attached_assets/stock_images/ directory
- Images match product names and descriptions (abayas, modest dresses)
- Resolved mismatched imagery to ensure consistent Islamic fashion presentation

### Custom Logo Implementation (Nov 3, 2025)
- Integrated custom KiyuMart logo with separate assets for light and dark modes
- Light mode: Dark teal logo (logoLight.png) displayed on white/light backgrounds
- Dark mode: Light teal logo (logoDark.png) displayed on dark backgrounds  
- Automatic theme-aware switching using CSS classes
- Logo positioned in header with proper navigation and accessibility

### Database Product Updates (Nov 3, 2025)
- Populated cost_price field for all products to enable strikethrough pricing display
- Updated product names to Islamic fashion items (Elegant Black Abaya, Navy Blue Embroidered Modest Dress, etc.)
- All products categorized under "abayas" category
- Cost prices set 25-33% higher than selling prices to show realistic discounts

### Category Page Implementation (Nov 3, 2025)
- Created dynamic CategoryPage component with filtering by category ID
- Route: `/category/:id` for abayas, hijabs, and evening wear categories
- Displays category title, description, and filtered product grid
- Empty state messaging when no products exist in a category
- Seamless integration with existing ProductCard component showing cost price strikethrough

### Islamic Women's Fashion Update
- Updated all product and category images to feature Islamic women's modest fashion
- Products now exclusively showcase elegant abayas, hijabs, and modest dresses
- Generated professional product photography for 6 different Islamic dress styles
- Updated category images for "Elegant Abayas", "Hijabs & Accessories", and "Evening Wear"
- New hero banner featuring Islamic fashion lifestyle imagery

### Multi-Language System
- Implemented comprehensive LanguageContext supporting English, French, and Spanish
- Automatic currency switching: English (GHS), French (EUR), Spanish (USD)
- Translated UI elements including hero banners, section headings, and navigation
- Language selector in header for easy switching

### New Pages
- **Notifications Page** (`/notifications`): View order updates, delivery status, promotions, and system notifications with read/unread status
- **Profile Page** (`/profile`): User account management with tabs for personal information, order history, and settings
- **Category Pages** (`/category/:id`): Dynamic product browsing by category with filtering and empty states

## System Architecture

### Frontend Architecture

The frontend uses React 18 with Vite, TypeScript, and Wouter for routing. TanStack Query manages server state and API data fetching. UI is built with Shadcn UI (Radix UI primitives) and Tailwind CSS, following a mobile-first, responsive design with a modern green color scheme (#10b981). Key features include:
- Persistent shopping cart
- Product browsing with filtering for Islamic women's fashion (abayas, hijabs, modest dresses)
- Product cards displaying ratings, cost price (strikethrough, larger gray text), and selling price (bold, colored)
- Real-time order tracking with visual timelines and Socket.IO updates
- Multi-language support (English, French, Spanish) with automatic currency switching (GHS, EUR, USD)
- QR code generation
- Role-based dashboards (admin, seller, buyer, rider, agent)
- Notifications page for order updates, deliveries, and promotions
- Profile page for user account management
- Paystack payment integration
- Live delivery tracking with Leaflet.js and OpenStreetMap for interactive map visualization

### Backend Architecture

The backend is built with Express.js, leveraging a native HTTP server wrapped with Socket.IO for WebSocket communication. Authentication is JWT-based with bcrypt for password hashing and role-based access control (admin, seller, buyer, rider, agent). PostgreSQL, hosted on Neon serverless, serves as the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles image and video uploads. Real-time communication is facilitated by Socket.IO for chat, order updates, and delivery notifications. Payment processing is integrated via the Paystack API. API design is RESTful, with Zod for request validation and Multer for file uploads.

### Database Schema Design

The database schema includes tables for Users (with role-specific fields), Products (with seller association and inventory), Orders (with status tracking and delivery details), Reviews (with product ratings and user comments), Delivery Zones, Chat Messages, Transactions, and Platform Settings for dynamic configuration. It also includes a `delivery_tracking` table for geolocation data and extensions to the `orders` table for delivery coordinates.

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
# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Recent Changes (November 7, 2025)

### Latest Updates
- **Currency API Fix**: Fixed critical currency conversion error by switching API from `api.frankfurter.dev` (404 errors) to `api.frankfurter.app`. Currency rates now load successfully with live exchange rates for GHS, USD, NGN, EUR, GBP, XOF, ZAR, and KES currencies.
- **Enhanced Role Navigation**: Updated Header component to show dashboard icons for admin, super_admin, and agent roles with proper routing. All privileged roles now have quick access to their dashboards from the header.
- **Super Admin Implementation**: Created super_admin role with elevated permissions and test account (super_admin@kiyumart.com/super_admin123). Updated all test credentials documentation to include 6 roles with standardized credentials pattern.
- **Welcome Text Update**: Changed AuthPage welcome message from "Your Fashion Marketplace" to "Quality meet affordability" to better reflect platform value proposition.
- **Real-time Currency Conversion**: Integrated live exchange rate fetching in LanguageContext with React Query, fetching rates from `/api/currency/rates` endpoint (using api.frankfurter.app). Implemented `formatPrice()` and `convertPrice()` helpers that automatically convert prices from base currency (GHS) to selected currency. Updated ProductCard, Cart, and CartPopover components to use `formatPrice()` for automatic currency conversion. Rates are cached for 1 hour with automatic hourly refresh.

### Bug Fixes
- **Image Upload Fix**: Created public upload endpoint (`/api/upload/public`) for unauthenticated Ghana card and profile image uploads during seller/rider registration
- **Application Visibility**: Added "Approved" tabs to AdminSellers and AdminRiders pages to preserve visibility of approved users after approval
- **Navigation Fix**: Added onClick handler to Admin Dashboard "View All" button to properly navigate to orders page
- **Dynamic Seller Footers**: Updated Footer component to display seller-specific store information (name, logo, description) when viewing individual seller store pages (`/seller/:id`)

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion, operating as either a single-store or a multi-vendor marketplace. It offers comprehensive e-commerce functionalities including product and order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. The platform aims to be a premier online destination for modest Islamic fashion, providing a diverse and inclusive product range. It includes features like dynamic category management, extensive admin dashboards for user and product management, and a robust application verification system for sellers and riders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), using Wouter for routing and TanStack Query for server state management. UI components are developed with Shadcn UI (Radix UI primitives) and Tailwind CSS, following a mobile-first, responsive design with a green color scheme. Key features include a persistent shopping cart and wishlist, product browsing with filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation for orders, and role-based dashboards. It integrates Paystack for payments, Leaflet.js and OpenStreetMap for live delivery tracking, and supports dynamic components for multi-vendor mode. An admin branding system allows full color customization, and a reusable Media Upload System for Cloudinary is implemented. Comprehensive approval workflows for sellers and riders are included, with sellers having dedicated product management functionality. The seller application process features a dynamic store type selection system with 10 predefined categories, each with category-specific product information fields.

### Backend Architecture

The backend is developed with Express.js and integrates a native HTTP server with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL (Neon serverless) serves as the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary is used for all media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads. The architecture supports a comprehensive application verification system, including Ghana Card verification for sellers and riders, with detailed admin review processes.

### Database Schema Design

The database schema includes tables for core commerce functionalities (Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart), store management (Stores), real-time communication (Chat Messages), content management (Hero Banners, Banner Collections, Marketplace Banners), dynamic categories, and platform configuration. Extensions support product variants, multi-vendor associations, enhanced product modules with video and dynamic fields, verified buyer reviews, promotions, subscriptions, wishlists, and localization. Recent additions include fields for `profileImage`, `ghanaCardFront`, `ghanaCardBack` for application verification, and an `isApproved` flag in the User interface for managing approval workflows.

## External Dependencies

-   **Cloudinary**: Media asset management and CDN.
-   **Paystack**: Payment processing gateway.
-   **Frankfurter.app**: Currency conversion API for live exchange rates.
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
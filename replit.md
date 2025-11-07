# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform specializing in modest Islamic women's fashion. It operates in two modes: a single-store model and a multi-vendor marketplace, controlled by an admin feature flag (`isMultiVendor`). The platform offers comprehensive e-commerce functionalities including product/order management, real-time delivery tracking with map visualization, live chat, and Paystack payment integration. KiyuMart aims to be a premier online destination for modest Islamic fashion, providing a diverse and inclusive product range.

## Recent Changes (November 2025)

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
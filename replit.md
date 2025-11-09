# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform for modest Islamic women's fashion, functioning as both a single-store and multi-vendor marketplace. It provides comprehensive e-commerce features including product and order management, real-time delivery tracking, live chat, and Paystack payments. The platform supports a diverse product range, dynamic category and store management, extensive admin dashboards, and a robust application verification system for sellers and riders. The project aims to deliver a seamless and inclusive online shopping experience within the modest fashion market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), using Wouter for routing and TanStack Query for server state management. UI components are developed with Shadcn UI (Radix UI primitives) and Tailwind CSS, focusing on responsive design. Key features include a persistent shopping cart, product browsing with advanced filters, real-time order tracking via Socket.IO, multi-language support with automatic currency switching, QR code generation, and role-based dashboards. It supports dynamic components for multi-vendor functionality, an admin branding system, a reusable media upload system integrated with Cloudinary, and comprehensive approval workflows. Public seller store routes are `sellers/:id`. The design removed all glassmorphism styles and mobile-specific components, reverting to a standard responsive desktop UI. The theme system has been overhauled to use modern fonts (Inter, Poppins, Playfair Display, Lora, JetBrains Mono, Fira Code), a neutral pure black/gray dark mode, and a vibrant orange primary color. Product image and video validation enforce specific dimensions and durations (4K images, videos under 30 seconds).

### Backend Architecture

The backend is an Express.js application with a native HTTP server and Socket.IO for real-time communication. Authentication is JWT-based with bcrypt for password hashing and implements role-based access control. PostgreSQL (Neon serverless) is the primary database, managed by Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all media uploads. The API is RESTful, employing Zod for request validation and Multer for file uploads. Security features include Helmet, role-aware rate limiting, structured error logging, and HMAC signature verification for Paystack webhooks. The system supports a multi-vendor financial model with commission tracking, seller payout management, and automatic revenue splitting. An application verification system utilizes Ghana Card verification for sellers and riders.

### Database Schema Design

The database schema includes tables for Users, Products, Orders, Reviews, Delivery Zones, Transactions, Product Variants, Cart, Stores, Chat Messages, Hero Banners, and Footer Pages. It supports commission tracking, seller payouts, platform earnings, and application verification details such as `profileImage`, `ghanaCardFront`, `ghanaCardBack`, and `isApproved` flags.

## External Dependencies

-   **Cloudinary**: Media asset management.
-   **Paystack**: Payment processing (Card, Bank Transfers, Mobile Money).
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
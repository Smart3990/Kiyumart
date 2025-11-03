# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is an e-commerce platform dedicated to modest Islamic women's fashion, including abayas, hijabs, and dresses. It functions as both a single-store and a multi-vendor marketplace, with dynamic switching controlled by an admin. The platform offers comprehensive e-commerce features like product and order management, delivery tracking with live map visualization, real-time chat, and Paystack payment integration. Its business vision is to be a leading online destination for modest Islamic fashion, offering a diverse and inclusive range of products to a global market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 (Vite, TypeScript), using Wouter for routing, and TanStack Query for server state management. UI is designed with Shadcn UI (Radix UI primitives) and Tailwind CSS, focusing on a mobile-first, responsive design with a modern green color scheme. Key features include a persistent shopping cart, product browsing with filters for Islamic women's fashion, product cards displaying ratings and prices, real-time order tracking with Socket.IO updates, multi-language support (English, French, Spanish) with automatic currency switching (GHS, EUR, USD), QR code generation, role-based dashboards, a notifications page, a profile page for user management, and Paystack payment integration. Live delivery tracking is implemented using Leaflet.js and OpenStreetMap.

### Backend Architecture

The backend utilizes Express.js with a native HTTP server wrapped with Socket.IO for WebSocket communication. Authentication is JWT-based, incorporating bcrypt for password hashing and role-based access control. PostgreSQL, hosted on Neon serverless, is the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations. Cloudinary handles all image and video uploads. Real-time features such as chat, order updates, and delivery notifications are powered by Socket.IO. Payment processing is integrated via the Paystack API. The API follows RESTful principles, using Zod for request validation and Multer for file uploads.

### Database Schema Design

The database schema includes tables for Users (with role-specific fields), Products (with seller association and inventory), Orders (with status tracking and delivery details, including geolocation data), Reviews (with product ratings and user comments), Delivery Zones, Chat Messages, Transactions, Hero Banners, Product Variants, and Platform Settings for dynamic configuration.

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
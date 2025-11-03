# KiyuMart - Islamic Women's Fashion E-commerce Marketplace

## Overview

KiyuMart is a specialized e-commerce platform focused on modest Islamic women's fashion, including elegant abayas, hijabs, and modest dresses. The platform operates as both a single-store fashion marketplace and a multi-vendor marketplace, supporting dynamic switching between modes through admin controls. Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides comprehensive e-commerce functionality including product management, order processing, delivery tracking with live map visualization, real-time chat, and Paystack payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

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

The database schema includes tables for Users (with role-specific fields), Products (with seller association and inventory), Orders (with status tracking and delivery details), Delivery Zones, Chat Messages, Transactions, and Platform Settings for dynamic configuration. It also includes a `delivery_tracking` table for geolocation data and extensions to the `orders` table for delivery coordinates.

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
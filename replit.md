# KiyuMart - Fashion E-commerce Marketplace

## Overview

KiyuMart is a dual-mode e-commerce platform that operates as both a single-store fashion marketplace and a multi-vendor marketplace. The platform supports dynamic switching between modes through admin controls, allowing for flexible business models. Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides comprehensive e-commerce functionality including product management, order processing, delivery tracking with live map visualization, real-time chat, and Paystack payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with Vite, TypeScript, and Wouter for routing. TanStack Query manages server state and API data fetching. UI is built with Shadcn UI (Radix UI primitives) and Tailwind CSS, following a mobile-first, responsive design with a modern blue color scheme. Key features include a persistent shopping cart, product browsing with filtering, real-time order tracking with visual timelines and Socket.IO updates, multi-currency support, QR code generation, role-based dashboards, notification system, and Paystack integration. Live delivery tracking includes Leaflet.js with OpenStreetMap for interactive map visualization. Product cards display ratings, cost price (strikethrough), and selling price (colored and bolded).

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
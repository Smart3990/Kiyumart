# KiyuMart - Fashion E-commerce Marketplace

## Overview

KiyuMart is a dual-mode e-commerce platform that operates as both a single-store fashion marketplace and a multi-vendor marketplace. The platform supports dynamic switching between modes through admin controls, allowing for flexible business models. Built with React (Vite) on the frontend and Node.js + Express on the backend, it provides comprehensive e-commerce functionality including product management, order processing, delivery tracking, real-time chat, and payment integration.

## Production Status (Phase 1 - Ready to Deploy)

**✅ Core E-Commerce Features:**
- Multi-role authentication system (Super Admin, Seller, Buyer, Rider, Agent)
- Product catalog with categories, search, and filtering
- Shopping cart with persistent state
- Complete checkout workflow with delivery information
- Paystack payment integration
- Multi-currency support with real-time conversion
- QR code generation for delivery confirmation
- Analytics dashboards for all user roles
- Cloudinary-powered image management
- Mobile-responsive design

**🔄 Phase 2 Roadmap:**
- Real-time chat system (backend infrastructure complete)
- Enhanced order tracking interface
- Map-based delivery tracking
- Advanced analytics and reporting

## User Preferences

Preferred communication style: Simple, everyday language.

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
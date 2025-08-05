# Overview

This is a logistics management system called "Хром логистика" (Chrome Logistics) built for managing shipment requests. The application provides a complete solution for creating, tracking, and managing cargo shipment requests with two categories: local deliveries in Astana and intercity deliveries. It features role-based authentication (employees and managers), a modern React frontend with shadcn/ui components, and a robust Express.js backend with PostgreSQL database.

# User Preferences

Preferred communication style: Simple, everyday language.
Content style: Changed public-facing text to corporate internal use - removed client-oriented marketing language and replaced with internal system terminology.
Design preferences: Professional and clean UI/UX with ХРОМ-KZ branding, corporate color scheme (blue primary, clean whites and grays), minimal animations for business environment.
Contact information: Phone +7 (702) 997 00 94, Email nurbek@creativegroup.kz

# Migration Status
✓ Successfully migrated from Replit Agent to standard environment (Aug 4, 2025)
✓ All packages installed and configured
✓ PostgreSQL database connected and migrations applied
✓ Public order submission forms working without authentication
✓ Fixed data validation issues between frontend and backend
✓ All API endpoints tested and functional
✓ Admin requests management page implemented with pricing functionality (Aug 4, 2025)
✓ System fully tested and verified - all components working correctly (Aug 4, 2025)
✓ Authentication system tested with admin user (admin/admin123)
✓ Public API endpoints verified for order submission and tracking
✓ Protected API endpoints confirmed working with JWT authentication
✓ Database operations tested successfully
✓ Migration from Replit Agent completed successfully (Aug 4, 2025)
✓ Major design overhaul completed using ХРОМ-KZ brand colors with modern UI/UX trends (Jan 4, 2025)
✓ Updated login and home pages with contemporary styling, glassmorphism effects, and brand-consistent design elements
✓ Redesigned with professional corporate aesthetic and proper logo integration (Aug 4, 2025)
✓ Implemented fully responsive design optimized for mobile, tablet, and desktop devices (Aug 4, 2025)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, modern interface
- **Styling**: Tailwind CSS with ХРОМ-KZ brand colors, professional corporate design, and fully responsive layout optimized for all device sizes (mobile-first approach with sm:, md:, lg: breakpoints)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints following conventional patterns (/api/auth/*, /api/shipment-requests/*, etc.)
- **Error Handling**: Centralized error middleware with structured error responses

## Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle migrations for version-controlled schema changes
- **Core Tables**:
  - `users`: User accounts with role-based access (employee/manager)
  - `shipment_requests`: Main entity storing all shipment request data including cargo details, addresses, contacts, and status
- **Relationships**: Foreign key relationship between shipment requests and their creators

## Authentication & Authorization
- **Session Management**: JWT tokens stored in localStorage with 24-hour expiration
- **Role System**: Two-tier system (employee/manager) with different access levels
- **Security**: Password hashing with bcrypt, secure token validation middleware

## Data Model
- **Request Tracking**: Auto-generated request numbers (AST-YYYY-NNN for Astana, INT-YYYY-NNN for intercity)
- **Status Workflow**: Predefined status progression (new → processing → assigned → transit → delivered/cancelled)
- **Cargo Information**: Comprehensive cargo details including weight, volume, dimensions (removed confusing "package count" field)
- **Contact Management**: Separate loading and unloading contact information
- **Transport Assignment**: JSON field for storing transport and driver details
- **Pricing System**: Added priceKzt (decimal) and priceNotes (text) fields for logistics managers to set shipment costs

# External Dependencies

- **Database Provider**: Neon serverless PostgreSQL for managed database hosting
- **UI Components**: Radix UI primitives for accessible component foundations
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Dependencies**: Vite ecosystem including React plugin and TypeScript support
- **Authentication**: JWT and bcrypt libraries for secure user management
- **Database Client**: Neon serverless client with WebSocket support for real-time connections
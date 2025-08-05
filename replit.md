# Overview

This is a logistics management system called "Хром логистика" (Chrome Logistics) built for managing shipment requests. The application provides a complete solution for creating, tracking, and managing cargo shipment requests with two categories: local deliveries in Astana and intercity deliveries. It features role-based authentication (employees and managers), a modern React frontend with shadcn/ui components, and a robust Express.js backend with PostgreSQL database.

# User Preferences

Preferred communication style: Simple, everyday language. Business-focused interface without emojis - professional and strict design for corporate environment.
Content style: Changed public-facing text to corporate internal use - removed client-oriented marketing language and replaced with internal system terminology.
Design preferences: Professional and clean UI/UX with ХРОМ-KZ branding, corporate color scheme (blue primary, clean whites and grays), minimal animations for business environment.
Contact information: Phone +7 (702) 997 00 94, Email nurbek@creativegroup.kz

# Migration Status
✓ Successfully migrated from Replit Agent to standard environment (Aug 5, 2025)
✓ Fixed authentication login and redirect issues - login now works correctly (Aug 5, 2025)
✓ Added Telegram notification system for new shipment requests and status updates (Aug 5, 2025)
✓ Fixed request update validation error - now accepts both string and number types for pricing (Aug 5, 2025)
✓ Implemented role-based personal cabinets - employees see only their requests, managers see all (Aug 5, 2025)
✓ Added public delivery tracking by phone number for external users (Aug 5, 2025)
✓ Created separate navigation and permissions for employee vs manager roles (Aug 5, 2025)
✓ Implemented complete user registration system with role selection (Aug 5, 2025)
✓ All packages installed and configured
✓ PostgreSQL database connected and migrations applied successfully (Aug 5, 2025)
✓ ХРОМ-KZ brand logo integrated across all pages (home, login, admin panel) (Aug 5, 2025)
✓ Button layout optimized for better text display and responsiveness (Aug 5, 2025)
✓ Fixed sidebar transparency issue - replaced glass effect with solid white background (Aug 5, 2025)
✓ Added calendar view for shipment schedules - displays future shipments by date (Aug 5, 2025)
✓ Updated navigation to include calendar with date-based filtering and visual indicators (Aug 5, 2025)
✓ Added cargo photo upload functionality with image compression and size optimization (Aug 5, 2025)
✓ Increased Express.js payload limit to 10MB and implemented client-side image compression (Aug 5, 2025)
✓ Admin user created: admin/admin123 for system access (Aug 5, 2025)
✓ Public order submission forms working without authentication
✓ Fixed data validation issues between frontend and backend
✓ All API endpoints tested and functional
✓ Admin requests management page implemented with pricing functionality
✓ System fully tested and verified - all components working correctly
✓ Authentication system tested with admin user (admin/admin123)
✓ Public API endpoints verified for order submission and tracking
✓ Protected API endpoints confirmed working with JWT authentication
✓ Database operations tested successfully
✓ Major design overhaul completed using ХРОМ-KZ brand colors with modern UI/UX trends
✓ Updated login and home pages with contemporary styling, glassmorphism effects, and brand-consistent design elements
✓ Redesigned with professional corporate aesthetic and proper logo integration
✓ Implemented fully responsive design optimized for mobile, tablet, and desktop devices
✓ Project verified and working correctly - all components functional (Aug 5, 2025)
✓ Server running successfully on port 5000 with API endpoints responding
✓ Frontend loading properly with hot module replacement active
✓ Database connectivity confirmed with user authentication working
✓ Request management system fully operational with real-time updates
✓ Successfully migrated from Replit Agent environment to standard Replit environment (Aug 5, 2025)
✓ Comprehensive analytics dashboard implemented with interactive charts and KPI metrics (Aug 5, 2025)
✓ Visual analytics system includes monthly trends, category distribution, status tracking, and performance KPIs (Aug 5, 2025)
✓ Updated registration system - role selection removed, roles now assigned only by administrator (Aug 5, 2025)
✓ New users automatically receive "employee" role, administrators can change roles through user management (Aug 5, 2025)
✓ Implemented role-based access control with ProtectedRoute component for manager-only pages (Aug 5, 2025)
✓ Dashboard now shows personalized statistics - employees see only their own request stats (Aug 5, 2025)
✓ Added role-based data filtering in API endpoints for proper data separation (Aug 5, 2025)
✓ Created user management page for administrators to change user roles (Aug 5, 2025)
✓ Database backup created: backup_20250805_064639.sql stored in /backups directory (Aug 5, 2025)
✓ Added phone number requirement to public shipment request forms (Aug 5, 2025)
✓ Created employee profile management system with personal data editing (Aug 5, 2025)
✓ Implemented profile page for updating firstName, lastName, position, age, and phone (Aug 5, 2025)
✓ Added profile navigation link in sidebar user section with modern UI (Aug 5, 2025)
✓ Enhanced user schema with additional personal information fields (Aug 5, 2025)
✓ Created API endpoints for profile management with validation (Aug 5, 2025)
✓ Implemented password change functionality in employee profiles with security validation (Aug 5, 2025)
✓ Added tabbed interface to profile page separating personal data and security settings (Aug 5, 2025)
✓ Created secure password change API endpoint with current password verification (Aug 5, 2025)
✓ Added password strength requirements and user guidance in profile interface (Aug 5, 2025)
✓ Implemented automatic request linking by phone number - public requests now auto-assign to existing users (Aug 5, 2025)
✓ Enhanced phone number matching with normalization to handle different formats and spacing (Aug 5, 2025)
✓ Added smart user lookup system for seamless request ownership transfer when phone numbers match (Aug 5, 2025)
✓ Implemented functional notification panel in header with real-time request updates and system notifications (Aug 5, 2025)
✓ Created comprehensive settings panel with theme controls, notification preferences, and quick actions (Aug 5, 2025)
✓ Fixed all authentication and registration bugs - system fully functional and ready for production use (Aug 5, 2025)
✓ Completed comprehensive system testing - all API endpoints working correctly (Aug 5, 2025)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, modern interface
- **Styling**: Tailwind CSS with ХРОМ-KZ brand colors, professional corporate design, and fully responsive layout optimized for all device sizes (mobile-first approach with sm:, md:, lg: breakpoints)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Build Tool**: Vite for fast development and optimized production builds
- **Charts & Analytics**: Recharts library for interactive data visualization and KPI dashboards

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
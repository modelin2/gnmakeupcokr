# Calendar-Based Appointment Management System

## Overview

This is a calendar-based appointment management system designed for Korean users (화장/뷰티 salons or similar businesses). The application allows users to view, create, edit, and manage appointments through an interactive calendar interface. It features category-based organization, search functionality, and data import capabilities from legacy SQL databases.

The system is built as a full-stack web application with a React frontend and Express backend, using PostgreSQL for data persistence. It emphasizes efficient data entry, clear visual categorization, and mobile-responsive layouts following Material Design principles with productivity app influences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**UI Components**: shadcn/ui component library built on Radix UI primitives
- Provides accessible, customizable components (dialogs, forms, calendars, buttons)
- Styled with Tailwind CSS following a "new-york" theme preset
- Custom design system with Material Design influences

**Routing**: wouter (lightweight client-side router)
- Simple routing with single main route to CalendarPage

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state (useState) for UI state
- No global state management library (Redux, Zustand) - keeps architecture simple

**Form Handling**:
- react-hook-form for form state and validation
- Zod schemas for runtime type validation
- @hookform/resolvers for schema integration

**Date Handling**: date-fns library with Korean locale support
- Formatting, parsing, and manipulation of dates
- Korean calendar localization (ko locale)

**Key Design Decisions**:
- Component-based architecture with reusable UI components
- Separation of presentation components from page-level logic
- Custom hooks for mobile detection and toast notifications
- TypeScript path aliases (@/, @shared/) for clean imports

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API pattern
- GET /api/appointments - List appointments with optional filters
- GET /api/appointments/:id - Get single appointment
- POST /api/appointments - Create appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Delete appointment

**Storage Layer**: Abstracted through IStorage interface
- DatabaseStorage implementation using Drizzle ORM
- Enables testing and potential storage backend swapping
- Methods for CRUD operations on appointments and users

**Data Access**: Drizzle ORM
- Type-safe database queries with TypeScript
- Schema defined in shared/schema.ts
- Migration system via drizzle-kit

**Build System**:
- Custom build script (script/build.ts) using esbuild for server
- Vite for client bundling
- Server dependencies selectively bundled to reduce syscalls and improve cold start

**Development Setup**:
- Vite middleware integration for HMR in development
- Static file serving in production from dist/public

**Key Design Decisions**:
- Monorepo structure with shared types between client and server
- TypeScript throughout for type safety
- Separation of concerns: routes, storage, database connection
- Environment-based configuration (NODE_ENV, DATABASE_URL)

### Data Storage

**Database**: PostgreSQL (via Drizzle ORM)

**Schema Design**:

*Users Table*:
- id (UUID primary key, auto-generated)
- username (unique text)
- password (text) - Note: Should use proper hashing (bcrypt/argon2)

*Appointments Table*:
- id (auto-incrementing integer primary key)
- name (text, required) - Customer name
- category (integer, default 1) - Service category (1-7)
- date (timestamp, required) - Appointment date
- time (text, required) - Appointment time slot (Korean format: "오전9시")
- phone (text, nullable) - Contact number
- notes (text, nullable) - Additional notes
- secret (boolean, default false) - Privacy flag
- originalNo (integer, nullable) - Reference to legacy data

**Type Safety**: Zod schemas mirror database schema
- insertAppointmentSchema for validation
- Shared between frontend and backend via @shared/schema

**Key Design Decisions**:
- Simple relational model without complex joins
- Time stored as text in Korean format matching UI expectations
- Category as integer ID (mapped to names/colors in frontend)
- Support for legacy data migration via originalNo field

### Authentication and Authorization

**Current State**: Basic user schema exists but no active authentication
- User table defined with username/password
- No session management implemented
- No authentication middleware on routes

**Planned Architecture** (based on dependencies):
- express-session for session management
- connect-pg-simple for PostgreSQL session store
- passport with passport-local strategy (dependencies present)
- JWT tokens (jsonwebtoken dependency present)

**Security Considerations**:
- Password should be hashed (dependencies suggest bcrypt or similar needed)
- CORS configuration available but not currently active
- express-rate-limit dependency suggests rate limiting planned

## External Dependencies

### Third-Party Services

**None currently integrated**, but infrastructure present for:
- Email (nodemailer dependency)
- AI/ML (openai, @google/generative-ai dependencies)
- Payment processing (stripe dependency)
- WebSocket support (ws dependency)

### Database

**PostgreSQL** - Required
- Connection via pg driver (node-postgres)
- Connection string configured via DATABASE_URL environment variable
- Session storage via connect-pg-simple

### UI Component Libraries

**Radix UI**: Headless, accessible component primitives
- Dialog, Popover, Select, Calendar, and 20+ other components
- Provides accessibility and keyboard navigation out of the box

**shadcn/ui**: Pre-styled components built on Radix UI
- Configured in components.json
- Uses "new-york" style variant
- Tailwind CSS integration with custom theme

### Styling

**Tailwind CSS**: Utility-first CSS framework
- Custom configuration in tailwind.config.ts
- Design tokens for colors, spacing, border radius
- Dark mode support via class-based theming
- Korean font support (Inter, Noto Sans KR from Google Fonts)

### Development Tools

**Replit Plugins**:
- @replit/vite-plugin-runtime-error-modal - Error overlay
- @replit/vite-plugin-cartographer - Code navigation
- @replit/vite-plugin-dev-banner - Development banner

### Data Import

**Legacy Data Support**:
- Import from SQL/text files containing old appointment data
- Parser for Korean text-based database dumps
- Mapping from legacy fields to new schema
- Progress tracking UI during import

### Additional Libraries

- **class-variance-authority**: Type-safe component variants
- **clsx** + **tailwind-merge**: Conditional className utilities
- **embla-carousel-react**: Carousel component support
- **cmdk**: Command palette/search component
- **nanoid**: Unique ID generation
- **zod-validation-error**: Better error messages for Zod validation
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Travel Management System - A full-stack monorepo application for managing travel bookings, payments, suppliers, and customer relationships.

**Stack:**
- Backend: Laravel 11 REST API with Sanctum token authentication
- Frontend: React 19 with TypeScript, Vite, React Query, Tailwind CSS 4
- Database: MySQL with Redis caching

## Development Commands

### Backend (Laravel 11)

```bash
cd backend

# Setup
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed              # Seeds 3 users: admin@voyager.com, agent@voyager.com, customer@voyager.com (password: "password")

# Development (runs all services concurrently)
composer dev                             # Starts API server (:8000) + queue listener + logs + frontend Vite

# Individual services
php artisan serve                        # API server on localhost:8000
php artisan queue:listen --tries=1       # Job queue processing
php artisan pail --timeout=0            # Real-time logs

# Database
php artisan migrate                      # Run migrations
php artisan migrate:fresh --seed         # Reset database and reseed
php artisan tinker                       # Interactive shell

# Testing
php artisan test                         # Run all tests
php artisan test tests/Unit             # Unit tests only
php artisan test tests/Feature          # Feature tests only
php artisan test --filter TestName      # Single test
```

### Frontend (React + Vite)

```bash
cd frontend

# Setup
npm install

# Development
npm run dev                              # Vite dev server on localhost:5173 with HMR
npm run build                            # TypeScript compile + production build
npm run preview                          # Preview production build
npm run lint                             # ESLint check
```

## Architecture Overview

### Backend Architecture

**Authentication Flow:**
- Token-based API auth via Laravel Sanctum
- Stateful domains: `localhost:5173` (frontend dev)
- Tokens never expire (configurable in `config/sanctum.php`)
- Register/Login returns token → Client stores token → Include `Authorization: Bearer {token}` in requests

**API Route Structure** (`routes/api.php`):
```
Public:
  POST /api/register
  POST /api/login

Protected (auth:sanctum middleware):
  POST   /api/logout
  GET    /api/user

  # RESTful resources (all support index, store, show, update, destroy)
  /api/users
  /api/bookings
  /api/payments
  /api/suppliers
  /api/documents

  # Custom actions
  POST /api/bookings/{id}/confirm
  POST /api/bookings/{id}/cancel
  POST /api/payments/{id}/process
  POST /api/documents/upload
```

**Database Patterns:**
- **Primary Keys**: UUIDs on most models (Booking, Customer, Supplier, etc.)
- **Soft Deletes**: User, Booking, Customer, Supplier, Payment, Invoice, Document
- **Polymorphic Relations**: `Document`, `Communication`, `ActivityLog` can attach to any model via `morphTo/morphMany`
- **Enums**: Booking status (pending, confirmed, completed, cancelled), Payment status, Invoice status

**Core Domain Model:**
```
Booking (central entity)
├── Customer (belongsTo)
├── Agent/User (belongsTo, nullable)
├── Company (belongsTo - multi-tenancy)
├── BookingItems[] (hasMany - line items)
├── Travelers[] (hasMany - passengers)
├── Payments[] (hasMany)
├── Invoices[] (hasMany)
├── Documents[] (morphMany - visas, tickets, etc.)
├── Communications[] (morphMany - emails, calls, SMS)
└── ActivityLogs[] (morphMany - audit trail)
```

**Key Models** (in `app/Models/`):
- `User` - Roles: super_admin, company_admin, agent, customer
- `Customer` - Extended customer info (individual/corporate), passport, emergency contact
- `Booking` - Core business entity with status, financial totals, tax, commission
- `BookingItem` - Line items for each booking
- `Traveler` - Individual travelers on a booking
- `Payment` - Multiple payment methods: cash, credit_card, bank_transfer, paypal, stripe
- `Invoice` - Generated from bookings with statuses: draft, sent, paid, overdue, cancelled
- `Document` - Polymorphic file attachments
- `Communication` - Polymorphic communication logs
- `ActivityLog` - Polymorphic audit trail
- `Supplier` - Travel suppliers with categories (airline, hotel, car_rental, tour_operator, insurance, other)
- `Product` - Travel products/services

**Configuration:**
- Database: MySQL (default), supports SQLite, PostgreSQL
- Cache: Redis via Predis
- Session: Redis
- Queue: Database-backed
- Test Environment: In-memory arrays for cache/session/queue, sync queue processing

### Frontend Architecture

**Project Structure:**
```
src/
├── App.tsx              # Main app shell
├── main.tsx             # React root
├── components/
│   ├── auth/            # Login, Register components
│   ├── booking/         # Booking-related components
│   ├── common/          # Shared UI components
│   └── layout/          # Layout components
├── pages/               # Route pages (TBD)
├── hooks/               # Custom React hooks (TBD)
├── services/            # API clients (TBD)
├── types/               # TypeScript interfaces (TBD)
└── utils/               # Utility functions (TBD)
```

**State Management:**
- React Query (TanStack Query 5.90.5) for server state caching
- Local component state for UI state

**Form Handling:**
- React Hook Form + Zod schema validation
- `@hookform/resolvers` for integration

**API Client:**
- Axios 1.12.2
- Base URL: `VITE_API_URL=http://localhost:8000/api` (from `.env`)

**TypeScript:**
- Strict mode enabled (`tsconfig.app.json`)
- Target: ES2022, Module: ESNext

**Styling:**
- Tailwind CSS 4.1.16 with `@tailwindcss/postcss` plugin (in `postcss.config.js`)
- Lucide React for icons

## Important Implementation Notes

### Backend

1. **Thin Controllers**: Keep business logic in service classes, controllers should handle HTTP concerns only
2. **Route Model Binding**: Use implicit route model binding for clean controller methods
3. **Resource Collections**: Use API Resources for response transformation
4. **Validation**: Use Form Requests for complex validation rules
5. **Eloquent Relationships**: Eager load relationships to prevent N+1 queries
6. **Queue Jobs**: Use for heavy operations (PDF generation, email sending, reports)
7. **Activity Logging**: Use `ActivityLog` model for audit trail on critical operations

### Frontend

1. **API Client Pattern**: Create service files in `src/services/` for each API resource (e.g., `auth.ts`, `bookings.ts`)
2. **React Query**: Use `useQuery` for fetching, `useMutation` for create/update/delete with optimistic updates
3. **Type Safety**: Define API response types in `src/types/` and use throughout
4. **Form Validation**: Define Zod schemas for all forms in component files or separate schema files
5. **Error Handling**: Centralize API error handling in Axios interceptors

## Database Seeding

Default seeded users (password: "password"):
- `admin@voyager.com` - super_admin role
- `agent@voyager.com` - agent role
- `customer@voyager.com` - customer role

## Testing

Backend uses PHPUnit with:
- Test database: SQLite in-memory (or separate MySQL database)
- Environment: `APP_ENV=testing` with sync queue and array cache
- Suites: `tests/Unit/` and `tests/Feature/`
- Laravel testing helpers available (actingAs, assertDatabaseHas, etc.)

## Environment Setup

**Backend** (`.env`):
```
DB_CONNECTION=mysql
DB_DATABASE=travel_management
SANCTUM_STATEFUL_DOMAINS=localhost:5173
REDIS_HOST=127.0.0.1
SESSION_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=database
```

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Voyager
```

## Development Workflow

1. **Backend changes requiring migrations:**
   ```bash
   php artisan make:migration create_something_table
   php artisan migrate
   php artisan migrate:fresh --seed  # Reset if needed
   ```

2. **Adding new API endpoints:**
   - Add route to `routes/api.php`
   - Create/update controller in `app/Http/Controllers/`
   - Add model/service logic in `app/Models/` or `app/Services/`
   - Protect with `auth:sanctum` middleware if needed

3. **Frontend API integration:**
   - Create service file in `src/services/`
   - Define types in `src/types/`
   - Use React Query hooks in components
   - Handle loading/error states

## Key File Locations

- API Routes: `backend/routes/api.php`
- Models: `backend/app/Models/`
- Migrations: `backend/database/migrations/`
- Controllers: `backend/app/Http/Controllers/`
- Seeders: `backend/database/seeders/`
- Frontend Entry: `frontend/src/main.tsx`
- API Config: `frontend/.env` (VITE_API_URL)

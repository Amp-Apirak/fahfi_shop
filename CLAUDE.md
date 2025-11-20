# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fahfi Shop is a full-stack point-of-sale (POS) and inventory management system with a Nuxt 4 frontend and Express.js backend. The system tracks product inventory, sales transactions, expenses, and user activities with comprehensive logging.

## Tech Stack

- **Frontend**: Nuxt 4 (Vue 3) with Bootstrap 5 and Chart.js
- **Backend**: Express.js (Node.js) with MySQL2
- **Authentication**: JWT tokens with bcryptjs password hashing
- **File Upload**: Multer for image storage
- **Database**: MySQL with connection pooling

## Development Setup

### Database
- Initialize database from `fahfi_shop_db.sql` or `fahfi_shop_db_default.sql`
- Database name: `fahfi_shop_db`
- Configure connection in `backend/.env`

### Backend (`backend/`)
```bash
npm install                # Install dependencies
npm run dev              # Start dev server with nodemon (port 3001)
npm start                # Start production server
```

**Environment Variables** (`.env`):
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `PORT` (default: 3001)
- `JWT_SECRET` (for token signing)

### Frontend (`frontend/`)
```bash
npm install              # Install dependencies
npm run dev            # Start dev server with hot-reload
npm run build          # Build for production
npm run generate       # Generate static site
npm run preview        # Preview production build
```

## Architecture

### Backend Structure

**Authentication Flow**:
- Register/Login endpoints create/verify users with bcrypt-hashed passwords
- JWT tokens issued on successful login (8-hour expiration)
- `authenticateToken` middleware validates tokens and extracts user info into `req.user`

**API Endpoints**:
- **Auth**: `POST /api/register`, `POST /api/login`
- **Products**: CRUD operations with stock tracking (`/api/products*`)
- **Sales**: Transaction-based with automatic stock deduction (`/api/sales*`)
- **Expenses**: Cost tracking (`/api/expenses*`)
- **Users**: User management (`/api/users*`)
- **Dashboard**: Summary and chart data (`/api/dashboard/*`)
- **Upload**: Image upload via Multer (`POST /api/upload`)

**Key Patterns**:
- **Transactions**: Sales operations use database transactions (`beginTransaction()`, `commit()`, `rollback()`) to ensure atomicity when updating stock and creating sale records
- **Logging**: All CRUD operations log to `action_logs` table with user info and details
- **Error Handling**: MySQL-specific error codes (e.g., `ER_DUP_ENTRY`, `ER_ROW_IS_REFERENCED_2`) are caught and handled with appropriate HTTP status codes
- **Date Filtering**: Dashboard endpoints accept `startDate` and `endDate` query params for custom date ranges

**Static Files**: Frontend accesses uploaded images via `http://localhost:3001/uploads/` (served from `public/uploads/`)

### Frontend Structure

**Routing**: Nuxt file-based routing in `app/pages/` (index, login, pos, sales-history, products, expenses)

**Authentication**:
- `useAuth` composable manages token and user data via cookies
- `auth.global.ts` middleware redirects unauthenticated users to `/login`
- Admin checks use `user.role === 'Admin'`

**Components**: Reusable UI components in `app/components/` (HeaderComponent, SidebarComponent, charts, tables)

**API Integration**: Direct axios calls from pages/composables (no formal API layer abstraction)

## Important Behaviors

1. **Stock Management**: Sales transactions automatically deduct stock; deleting sales reverses the deduction via transaction rollback
2. **Image Upload**: Only JPEG/PNG accepted; files saved with timestamp prefix to prevent collisions
3. **User Roles**: Currently supports "Admin" and "Staff" roles; role checks are not yet enforced on backend (commented in code)
4. **Dashboard Dates**: Default to today; accepts custom ranges via query params
5. **Error Messages**: Most displayed in Thai; sensitive errors logged server-side with user-friendly messages to client

## Database Schema

Key tables:
- `users` (id, username, password, role, created_at)
- `products` (id, name, category, grade, stock_quantity, cost_price, sell_price, product_image_url, last_updated_by)
- `sales` (id, total_amount, sale_date, created_by, last_updated_by)
- `sale_details` (id, sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) - FK with ON DELETE CASCADE
- `expenses` (id, expense_date, category, details, amount, receipt_image_url, created_by, last_updated_by)
- `action_logs` (id, user_id, action_type, target_table, target_id, details, created_at)

## Common Tasks

**Adding a new API endpoint**:
1. Add route in `backend/index.js` with `authenticateToken` middleware
2. Include logging to `action_logs` for audit trail
3. Handle MySQL errors appropriately
4. Call from frontend with axios + token from `useAuth` composable

**Modifying products/sales/expenses**:
- Ensure transaction handling for stock updates
- Always log changes to `action_logs`
- Validate required fields before DB operations

**Frontend page updates**:
- Use `useAuth` for auth state
- Pages are auto-protected by `auth.global.ts` middleware (except `/login`)
- Fetch data with axios and handle loading/error states

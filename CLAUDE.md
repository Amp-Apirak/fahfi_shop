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

## Quick Start Commands

### Backend Setup
```bash
cd backend
npm install                    # Install dependencies
npm run dev                   # Start dev server with nodemon (port 3001)
npm start                     # Start production server
```

### Frontend Setup
```bash
cd frontend
npm install                   # Install dependencies
npm run dev                   # Start dev server with hot-reload (port 3000)
npm run build                 # Build for production
npm run preview               # Preview production build
```

### Database
- Initialize from `fahfi_shop_db.sql` or `fahfi_shop_db_default.sql`
- Database name: `fahfi_shop_db`
- Configure connection in `backend/.env` with: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

### Environment Variables

**Backend** (`.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=fahfi_shop_db
PORT=3001
JWT_SECRET=your_jwt_secret_key
```

**Frontend** communicates with backend at `http://localhost:3001`

## Architecture

### Backend Structure (`backend/index.js`)

Monolithic Express server (~1700 lines) with these API groups:

**Authentication** (public):
- `POST /api/register` - Create new user with bcrypt-hashed password
- `POST /api/login` - Issue JWT token (8-hour expiration)

**Protected Endpoints** (all require `authenticateToken` middleware):
- **Products**: CRUD with stock tracking (`GET/POST/PUT/DELETE /api/products*`)
- **Sales**: Transaction-based with automatic stock deduction (`GET/POST/PUT/DELETE /api/sales*`)
- **Expenses**: Cost tracking (`GET/POST/PUT/DELETE /api/expenses*`)
- **Users**: User management (`GET/PUT/DELETE /api/users*`)
- **Dashboard**: Summary and chart data with date filtering (`GET /api/dashboard/*`)
- **Upload**: Image upload via Multer (`POST /api/upload`)

**Key Backend Patterns**:

1. **Database Transactions** (Sales operations only):
   ```javascript
   const connection = await db.getConnection();
   await connection.beginTransaction();
   try {
     // Update stock, create sale record
     await connection.commit();
   } catch (err) {
     await connection.rollback();
   }
   ```
   Used to ensure atomicity when updating `products.stock_quantity` and creating `sales`/`sale_details` records (e.g., `backend/index.js:862`, `backend/index.js:1049`, `backend/index.js:1152`)

2. **Audit Logging**: Every CRUD operation inserts record to `action_logs` with user ID, action type, table name, target ID, and JSON details

3. **Error Handling**: Catches MySQL-specific codes (`ER_DUP_ENTRY` for duplicates, `ER_ROW_IS_REFERENCED_2` for FK violations) and returns appropriate HTTP status codes with Thai-language error messages

4. **Authentication Middleware** (`authenticateToken`):
   - Extracts Bearer token from `Authorization` header
   - Verifies with `JWT_SECRET`
   - Attaches decoded user object to `req.user`
   - Returns 401 if missing, 403 if invalid/expired

5. **Static File Serving**: `app.use(express.static("public"))` serves uploaded images at `http://localhost:3001/uploads/`

### Frontend Structure

**Routing**: Nuxt file-based routing in `app/pages/`:
- `/login` - Auth page (public)
- `/` (index.vue) - Dashboard (~784 lines)
- `/pos` - Point of sale interface (~246 lines)
- `/products` - Product management (~728 lines)
- `/sales-history` - Sales transactions (~478 lines)
- `/expenses` - Expense tracking (~238 lines)

**Authentication Flow**:
- `useAuth()` composable (`app/composables/useAuth.ts`) manages token and user data via cookies
- `auth.global.ts` middleware redirects unauthenticated users to `/login` (except `/login` itself)
- Admin checks use `user.role === 'Admin'`
- `useApiError()` composable handles 401/403 responses for automatic logout

**Component Architecture**:
- `HeaderComponent.vue` - Top navigation with user info
- `SidebarComponent.vue` - Left navigation menu
- `StatCard.vue` - Dashboard metric displays
- `StockChart.vue`, `TopProductsChart.vue` - Chart.js visualizations
- `SalesTable.vue` - Reusable data table
- `BsIcon.vue` - Bootstrap icon wrapper

**API Integration**: Direct axios calls from pages/composables with token attached from `useAuth` composable. No centralized API service layer.

## Important Behaviors

1. **Stock Management**: Sales deduct stock atomically via transaction; deleting sales reverses stock via transaction rollback
2. **Image Upload**: Only JPEG/PNG accepted; files saved with timestamp prefix (`Date.now() + extension`) to `backend/public/uploads/`
3. **User Roles**: Supports "Admin" and "Staff"; role checks on frontend (`useAuth.isAdmin`) but backend role enforcement currently commented out
4. **Dashboard Dates**: Default to today; custom ranges via `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` query params
5. **Error Messages**: User-facing messages in Thai; sensitive errors logged server-side only
6. **Stock Visibility**: Dashboard and POS show real-time stock via `stock_quantity` field (updated on each sale)

## Database Schema

Key tables with important relationships:
- `users` (id, username, password_hash, role, created_at)
- `products` (id, name, category, grade, stock_quantity, cost_price, sell_price, product_image_url, last_updated_by, created_at, last_updated_at)
- `sales` (id, total_amount, sale_date, created_by, last_updated_by, created_at)
- `sale_details` (id, sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) - FK with ON DELETE CASCADE to auto-clean when sale deleted
- `expenses` (id, expense_date, category, details, amount, receipt_image_url, created_by, last_updated_by, created_at)
- `action_logs` (id, user_id, action_type, target_table, target_id, details, created_at)

## Common Development Tasks

**Adding a new API endpoint**:
1. Add route handler in `backend/index.js` wrapped with `authenticateToken` middleware
2. Extract data from `req.body` or `req.params` with validation
3. Execute SQL query using `db.getConnection().query()`
4. Log to `action_logs` table with user ID from `req.user.id`
5. Return JSON response with proper HTTP status code
6. Call from frontend with axios: `axios.get(url, { headers: { Authorization: `Bearer ${token}` } })`

**Modifying stock-dependent operations** (products, sales):
- Use database transactions to ensure atomicity
- Always update `last_updated_by` field
- Log complete operation details to `action_logs`
- Handle FK/unique constraint errors with appropriate messages

**Adding frontend page**:
- Create `.vue` file in `app/pages/`
- Use `useAuth()` composable for authentication state
- Page automatically protected by `auth.global.ts` (redirects to `/login` if not authenticated)
- Fetch data with axios + token; handle 401/403 with `useApiError()`
- Structure with HeaderComponent + SidebarComponent + content area (see `app.vue` layout pattern)

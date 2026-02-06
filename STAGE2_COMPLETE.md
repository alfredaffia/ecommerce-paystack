# Stage 2: Authentication & Admin Features - COMPLETE ✅

## Summary

Stage 2 has been successfully completed! The API now includes JWT authentication, user registration/login, role-based access control, and admin-only endpoints.

## What Was Implemented

### 1. User Entity ✅
**File**: `src/user/entities/user.entity.ts`

- User table with email, password, firstName, lastName
- Role enum (USER, ADMIN)
- Password excluded from JSON responses
- Timestamps (createdAt, updatedAt)

### 2. Authentication System ✅

**Auth Service** (`src/auth/auth.service.ts`):
- User registration with password hashing (bcrypt)
- User login with credential validation
- JWT token generation
- User validation for JWT strategy
- Admin user creation method

**Auth Controller** (`src/auth/auth.controller.ts`):
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (protected)

**JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`):
- Validates JWT tokens
- Extracts user from token payload
- Integrates with Passport.js

### 3. Guards & Decorators ✅

**Guards**:
- `JwtAuthGuard` - Protects routes requiring authentication
- `RolesGuard` - Restricts access based on user roles

**Decorators**:
- `@Public()` - Mark routes as public (no auth required)
- `@Roles(UserRole.ADMIN)` - Restrict to specific roles
- `@CurrentUser()` - Get authenticated user in route handlers

### 4. Admin Endpoints ✅

**Admin Controller** (`src/admin/admin.controller.ts`):
- `GET /admin/orders` - Get all orders (admin only)
- `GET /admin/orders/:id` - Get order by ID (admin only)
- `PATCH /admin/orders/:id/status` - Update order status (admin only)
- `GET /admin/stats` - Get order statistics (admin only)

All admin routes require:
1. Valid JWT token
2. User role = ADMIN

### 5. Enhanced Order Service ✅

New methods added:
- `findOne(id)` - Get order by ID
- `updateStatus(id, status)` - Update order status
- `getStats()` - Get order statistics (total orders, revenue, etc.)

## File Structure

```
src/
├── user/
│   └── entities/
│       └── user.entity.ts          # User entity with roles
├── auth/
│   ├── dto/
│   │   ├── register.dto.ts         # Registration DTO
│   │   └── login.dto.ts            # Login DTO
│   ├── strategies/
│   │   └── jwt.strategy.ts         # JWT validation strategy
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # JWT authentication guard
│   │   └── roles.guard.ts          # Role-based access guard
│   ├── decorators/
│   │   ├── roles.decorator.ts      # @Roles decorator
│   │   ├── public.decorator.ts     # @Public decorator
│   │   └── current-user.decorator.ts # @CurrentUser decorator
│   ├── auth.service.ts             # Authentication logic
│   ├── auth.controller.ts          # Auth endpoints
│   └── auth.module.ts              # Auth module
├── admin/
│   ├── dto/
│   │   └── update-order-status.dto.ts # Update status DTO
│   ├── admin.controller.ts         # Admin endpoints
│   └── admin.module.ts             # Admin module
└── order/
    └── order.service.ts            # Enhanced with new methods
```

## Environment Variables

Add to `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**: Same as registration

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <your_jwt_token>
```

### Admin Endpoints

All admin endpoints require:
- `Authorization: Bearer <admin_jwt_token>`
- User role must be ADMIN

#### Get All Orders
```http
GET /admin/orders
Authorization: Bearer <admin_jwt_token>
```

#### Get Order by ID
```http
GET /admin/orders/1
Authorization: Bearer <admin_jwt_token>
```

#### Update Order Status
```http
PATCH /admin/orders/1/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "paid"
}
```

Valid statuses: `pending`, `paid`, `failed`, `refunded`

#### Get Statistics
```http
GET /admin/stats
Authorization: Bearer <admin_jwt_token>
```

**Response**:
```json
{
  "totalOrders": 150,
  "totalRevenue": 7500000,
  "paidOrders": 140,
  "pendingOrders": 5,
  "failedOrders": 5
}
```

## Testing Instructions

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `access_token` from the response.

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create Admin User (via code)

You can create an admin user programmatically. Add this to your code temporarily:

```typescript
// In main.ts or a seed script
const authService = app.get(AuthService);
await authService.createAdmin('admin@example.com', 'AdminPass123!');
```

Or use a database migration/seed script.

### 5. Test Admin Endpoints
```bash
# Login as admin first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'

# Use admin token to access admin endpoints
curl -X GET http://localhost:3000/admin/orders \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

## Security Features

✅ **Password Security**:
- Passwords hashed with bcrypt (10 rounds)
- Passwords never returned in API responses
- Strong password validation (min 8 chars, uppercase, lowercase, number, special char)

✅ **JWT Security**:
- Tokens signed with secret key
- Configurable expiration (default 7 days)
- Token validation on every protected request

✅ **Role-Based Access Control**:
- Users assigned roles (USER, ADMIN)
- Guards enforce role requirements
- Admin endpoints protected by RolesGuard

✅ **Input Validation**:
- Email format validation
- Password strength requirements
- All DTOs validated with class-validator

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Common Issues & Solutions

### Issue: "User with this email already exists"
**Solution**: Email is already registered. Use a different email or login with existing credentials.

### Issue: "Invalid credentials"
**Solution**: Check email and password are correct. Passwords are case-sensitive.

### Issue: "Insufficient permissions"
**Solution**: Endpoint requires admin role. Login with an admin account.

### Issue: "Unauthorized"
**Solution**: JWT token is missing, invalid, or expired. Login again to get a new token.

## Next Steps

- Create admin user for your application
- Implement password reset functionality (optional)
- Add email verification (optional)
- Implement refresh tokens (optional)
- Add rate limiting for auth endpoints (optional)

---

**Stage 2 Complete!** Authentication and admin features are fully functional. 🔐

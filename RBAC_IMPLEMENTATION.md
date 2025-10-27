# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the complete RBAC implementation for the Travel Management System. The system supports four roles with hierarchical permissions:

1. **super_admin** - Full system access
2. **company_admin** - Company-level management
3. **agent** - Booking and customer management
4. **customer** - View own data only

## Backend Implementation

### 1. User Model Methods

The `User` model (backend/app/Models/User.php) includes the following RBAC methods:

#### Check Role
```php
// Check single role
$user->hasRole('agent');  // returns boolean

// Check multiple roles
$user->hasRole(['super_admin', 'company_admin']);  // returns boolean
```

#### Role-Specific Helpers
```php
$user->isSuperAdmin();     // Check if super_admin
$user->isCompanyAdmin();   // Check if company_admin
$user->isAgent();          // Check if agent
$user->isCustomer();       // Check if customer
```

#### Assign Role
```php
$user->assignRole('agent');  // Returns boolean
```

#### Check Permission
```php
$user->hasPermission('create_bookings');  // Returns boolean
```

#### Get All Permissions
```php
$permissions = $user->getPermissions();  // Returns array
```

### 2. Middleware

Two middleware classes protect routes:

#### CheckRole Middleware
```php
// Protect route for single role
Route::middleware('role:super_admin')->group(function () {
    // Routes for super_admin only
});

// Protect route for multiple roles
Route::middleware('role:super_admin,company_admin')->group(function () {
    // Routes for admins
});
```

#### CheckPermission Middleware
```php
// Protect route by permission
Route::middleware('permission:create_bookings')->group(function () {
    // Routes requiring create_bookings permission
});
```

### 3. API Endpoints

#### User Management (Admin Only)
```
GET    /api/users                      - List all users (paginated)
POST   /api/users                      - Create new user
GET    /api/users/{id}                 - Get user details
PUT    /api/users/{id}                 - Update user
DELETE /api/users/{id}                 - Delete user (soft delete)

POST   /api/users/{id}/assign-role     - Assign role to user
GET    /api/users/{id}/permissions     - Get user's permissions
POST   /api/users/{id}/check-permission - Check specific permission
```

#### User Profile (All Authenticated Users)
```
GET    /api/profile                    - Get current user profile
PUT    /api/profile                    - Update current user profile
```

### 4. Permission Sets

Each role has specific permissions:

**Super Admin** (`super_admin`):
- All permissions (wildcard `*`)

**Company Admin** (`company_admin`):
- `manage_company_users`
- `manage_company_bookings`
- `manage_company_customers`
- `view_company_reports`
- `manage_company_payments`
- `manage_company_invoices`
- `manage_company_documents`

**Agent** (`agent`):
- `create_bookings`
- `view_own_bookings`
- `update_own_bookings`
- `manage_customers`
- `create_payments`
- `view_own_payments`
- `generate_invoices`
- `upload_documents`
- `view_suppliers`
- `view_products`

**Customer** (`customer`):
- `view_own_bookings`
- `view_own_payments`
- `view_own_invoices`
- `view_own_documents`
- `update_own_profile`

### 5. Testing

Run RBAC tests:
```bash
cd backend
php artisan test --filter RoleBasedAccessControlTest
```

All 13 tests cover:
- Role checking functionality
- Role assignment
- Permission verification
- Middleware protection
- API endpoint authorization
- Profile access and updates

## Frontend Implementation

### 1. AuthContext Hooks

The `useAuth()` hook provides RBAC methods:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, hasRole, hasPermission, isSuperAdmin, isAgent } = useAuth();

  // Check role
  if (hasRole('super_admin')) {
    // Render admin content
  }

  // Check multiple roles
  if (hasRole(['super_admin', 'company_admin'])) {
    // Render admin content
  }

  // Check permission
  if (hasPermission('create_bookings')) {
    // Render create booking button
  }

  // Use role helpers
  if (isSuperAdmin()) {
    // Render super admin content
  }
}
```

### 2. RoleBasedAccess Component

Use the `RoleBasedAccess` component for conditional rendering:

```tsx
import RoleBasedAccess from '@/components/common/RoleBasedAccess';

// Render for specific role
<RoleBasedAccess roles="super_admin">
  <button>Admin Only Button</button>
</RoleBasedAccess>

// Render for multiple roles
<RoleBasedAccess roles={["super_admin", "company_admin"]}>
  <button>Admin Button</button>
</RoleBasedAccess>

// Render based on permission
<RoleBasedAccess permission="create_bookings">
  <button>Create Booking</button>
</RoleBasedAccess>

// With fallback content
<RoleBasedAccess
  roles="super_admin"
  fallback={<div>Access Denied</div>}
>
  <button>Admin Only Button</button>
</RoleBasedAccess>
```

### 3. Available Methods

From `useAuth()` hook:

- `hasRole(roles: string | string[]): boolean` - Check if user has role(s)
- `isSuperAdmin(): boolean` - Check if super admin
- `isCompanyAdmin(): boolean` - Check if company admin
- `isAgent(): boolean` - Check if agent
- `isCustomer(): boolean` - Check if customer
- `hasPermission(permission: string): boolean` - Check permission

## Usage Examples

### Backend Route Protection

```php
// Protect entire route group
Route::middleware(['auth:sanctum', 'role:super_admin,company_admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});

// Protect individual route
Route::middleware(['auth:sanctum', 'permission:create_bookings'])->post(
    '/bookings',
    [BookingController::class, 'store']
);
```

### Backend Controller Logic

```php
public function index(Request $request)
{
    $user = $request->user();

    // Super admin sees all bookings
    if ($user->isSuperAdmin()) {
        return Booking::paginate();
    }

    // Company admin sees company bookings
    if ($user->isCompanyAdmin()) {
        return Booking::where('company_id', $user->company_id)->paginate();
    }

    // Agent sees own bookings
    if ($user->isAgent()) {
        return Booking::where('agent_id', $user->id)->paginate();
    }

    // Customer sees own bookings
    return Booking::where('customer_id', $user->customer->id)->paginate();
}
```

### Frontend Conditional Rendering

```tsx
function BookingList() {
  const { hasPermission, isCustomer } = useAuth();

  return (
    <div>
      <h1>Bookings</h1>

      {/* Only show create button if user can create bookings */}
      <RoleBasedAccess permission="create_bookings">
        <button onClick={createBooking}>Create Booking</button>
      </RoleBasedAccess>

      {/* Show different views based on role */}
      {isCustomer() ? (
        <CustomerBookingList />
      ) : (
        <AdminBookingList />
      )}
    </div>
  );
}
```

### Frontend Route Protection

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(['super_admin', 'company_admin'])) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Usage in router
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

## API Request Examples

### Assign Role
```bash
POST /api/users/1/assign-role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "agent"
}
```

### Check Permission
```bash
POST /api/users/1/check-permission
Authorization: Bearer {token}
Content-Type: application/json

{
  "permission": "create_bookings"
}
```

### Get User Permissions
```bash
GET /api/users/1/permissions
Authorization: Bearer {token}
```

Response:
```json
{
  "role": "agent",
  "permissions": [
    "create_bookings",
    "view_own_bookings",
    "update_own_bookings",
    "manage_customers",
    "create_payments",
    "view_own_payments",
    "generate_invoices",
    "upload_documents",
    "view_suppliers",
    "view_products"
  ]
}
```

## Testing the Implementation

### Backend Tests

```bash
cd backend
php artisan test --filter RoleBasedAccessControlTest
```

### Manual Testing

1. Create test users with different roles:
```bash
php artisan tinker

$admin = User::factory()->create(['role' => 'super_admin', 'email' => 'test-admin@example.com']);
$agent = User::factory()->create(['role' => 'agent', 'email' => 'test-agent@example.com']);
$customer = User::factory()->create(['role' => 'customer', 'email' => 'test-customer@example.com']);
```

2. Test API endpoints with different roles using Postman or curl
3. Test frontend by logging in with different user accounts

## Security Considerations

1. **Always validate on backend** - Frontend checks are for UX only, not security
2. **Use middleware** - Protect all sensitive routes with role/permission middleware
3. **Check permissions in controllers** - Add additional checks in business logic
4. **Audit role changes** - Log when roles are assigned/changed
5. **Validate role values** - Only allow valid role enum values

## Next Steps

To extend the RBAC system:

1. **Add new permissions** - Update permission arrays in User model and AuthContext
2. **Create custom policies** - Use Laravel policies for model-specific authorization
3. **Add permission management UI** - Create admin interface to manage roles/permissions
4. **Implement row-level security** - Add data scoping based on company/user ownership
5. **Add audit logging** - Track all permission checks and role changes

## Files Modified

### Backend
- `app/Models/User.php` - Added RBAC methods
- `app/Http/Middleware/CheckRole.php` - Role verification middleware
- `app/Http/Middleware/CheckPermission.php` - Permission verification middleware
- `app/Http/Controllers/UserController.php` - User management endpoints
- `bootstrap/app.php` - Registered middleware aliases
- `routes/api.php` - Added protected routes
- `tests/Feature/RoleBasedAccessControlTest.php` - Comprehensive tests

### Frontend
- `src/contexts/AuthContext.tsx` - Added RBAC methods and hooks
- `src/components/common/RoleBasedAccess.tsx` - Conditional rendering component
- `src/types/auth.ts` - Type definitions (already had role field)

## Support

For questions or issues:
1. Check this documentation
2. Review test files for usage examples
3. Consult Laravel and React documentation
4. Check project CLAUDE.md for additional context

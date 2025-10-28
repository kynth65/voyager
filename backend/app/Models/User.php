<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'role',
        'status',
        'last_login_at',
        'preferences',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'preferences' => 'json',
        ];
    }

    /**
     * Get the full URL for the user's avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        // If avatar is already a full URL, return it as is
        if (str_starts_with($this->avatar, 'http')) {
            return $this->avatar;
        }

        // Convert storage path to full URL
        return url('storage/' . $this->avatar);
    }

    /**
     * Get all bookings created by this user.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'user_id');
    }

    /**
     * Get all refunds processed by this user (admin only).
     */
    public function processedRefunds()
    {
        return $this->hasMany(Refund::class, 'processed_by');
    }

    // Role-Based Access Control Methods

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }

        return $this->role === $roles;
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is an agent.
     */
    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    /**
     * Check if user is a customer.
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(string $role): bool
    {
        $validRoles = ['superadmin', 'admin', 'agent', 'customer'];

        if (!in_array($role, $validRoles)) {
            return false;
        }

        $this->role = $role;
        return $this->save();
    }

    /**
     * Check if user has permission to perform an action.
     * Permissions are role-based with hierarchical access.
     */
    public function hasPermission(string $permission): bool
    {
        $permissions = [
            'superadmin' => [
                'manage_users',
                'manage_vessels',
                'manage_routes',
                'manage_all_bookings',
                'view_all_customers',
                'view_all_reports',
                'manage_system_settings',
                'manage_all_payments',
                'manage_all_refunds',
            ],
            'admin' => [
                'view_all_bookings',
                'confirm_bookings',
                'cancel_bookings',
                'view_all_customers',
                'view_payments',
                'manage_refunds',
                'view_reports',
            ],
            'agent' => [
                'create_bookings',
                'view_own_bookings',
                'update_own_bookings',
                'manage_customers',
                'create_payments',
                'view_own_payments',
                'generate_invoices',
                'upload_documents',
                'view_vessels',
                'view_routes',
            ],
            'customer' => [
                'create_bookings',
                'view_own_bookings',
                'cancel_own_bookings',
                'view_own_payments',
                'request_refunds',
                'update_own_profile',
            ],
        ];

        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Check if user's role has the specific permission
        return in_array($permission, $permissions[$this->role] ?? []);
    }

    /**
     * Get all permissions for the user's role.
     */
    public function getPermissions(): array
    {
        if ($this->isSuperAdmin()) {
            return ['*']; // Super admin has all permissions
        }

        $permissions = [
            'admin' => [
                'view_all_bookings',
                'confirm_bookings',
                'cancel_bookings',
                'view_all_customers',
                'view_payments',
                'manage_refunds',
                'view_reports',
            ],
            'agent' => [
                'create_bookings',
                'view_own_bookings',
                'update_own_bookings',
                'manage_customers',
                'create_payments',
                'view_own_payments',
                'generate_invoices',
                'upload_documents',
                'view_vessels',
                'view_routes',
            ],
            'customer' => [
                'create_bookings',
                'view_own_bookings',
                'cancel_own_bookings',
                'view_own_payments',
                'request_refunds',
                'update_own_profile',
            ],
        ];

        return $permissions[$this->role] ?? [];
    }
}

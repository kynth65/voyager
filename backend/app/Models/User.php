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
        'company_id',
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

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'agent_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'created_by');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
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
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is a company admin.
     */
    public function isCompanyAdmin(): bool
    {
        return $this->role === 'company_admin';
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
        $validRoles = ['super_admin', 'company_admin', 'agent', 'customer'];

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
            'super_admin' => [
                'manage_companies',
                'manage_all_users',
                'manage_all_bookings',
                'manage_suppliers',
                'manage_products',
                'view_all_reports',
                'manage_system_settings',
                'view_activity_logs',
                'manage_all_payments',
                'manage_all_invoices',
                'manage_all_documents',
            ],
            'company_admin' => [
                'manage_company_users',
                'manage_company_bookings',
                'manage_company_customers',
                'view_company_reports',
                'manage_company_payments',
                'manage_company_invoices',
                'manage_company_documents',
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
                'view_suppliers',
                'view_products',
            ],
            'customer' => [
                'view_own_bookings',
                'view_own_payments',
                'view_own_invoices',
                'view_own_documents',
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
            'company_admin' => [
                'manage_company_users',
                'manage_company_bookings',
                'manage_company_customers',
                'view_company_reports',
                'manage_company_payments',
                'manage_company_invoices',
                'manage_company_documents',
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
                'view_suppliers',
                'view_products',
            ],
            'customer' => [
                'view_own_bookings',
                'view_own_payments',
                'view_own_invoices',
                'view_own_documents',
                'update_own_profile',
            ],
        ];

        return $permissions[$this->role] ?? [];
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedAccessControlTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can check if they have a specific role.
     */
    public function test_user_can_check_role(): void
    {
        $user = User::factory()->create(['role' => 'agent']);

        $this->assertTrue($user->hasRole('agent'));
        $this->assertFalse($user->hasRole('super_admin'));
        $this->assertTrue($user->hasRole(['agent', 'customer']));
    }

    /**
     * Test user role helper methods.
     */
    public function test_user_role_helper_methods(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $companyAdmin = User::factory()->create(['role' => 'company_admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        $customer = User::factory()->create(['role' => 'customer']);

        $this->assertTrue($superAdmin->isSuperAdmin());
        $this->assertFalse($agent->isSuperAdmin());

        $this->assertTrue($companyAdmin->isCompanyAdmin());
        $this->assertFalse($agent->isCompanyAdmin());

        $this->assertTrue($agent->isAgent());
        $this->assertFalse($customer->isAgent());

        $this->assertTrue($customer->isCustomer());
        $this->assertFalse($agent->isCustomer());
    }

    /**
     * Test assigning role to user.
     */
    public function test_user_can_be_assigned_role(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->assertTrue($user->assignRole('agent'));
        $this->assertEquals('agent', $user->fresh()->role);

        // Test invalid role
        $this->assertFalse($user->assignRole('invalid_role'));
    }

    /**
     * Test user permissions based on role.
     */
    public function test_user_has_permission_based_on_role(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $companyAdmin = User::factory()->create(['role' => 'company_admin']);
        $agent = User::factory()->create(['role' => 'agent']);
        $customer = User::factory()->create(['role' => 'customer']);

        // Super admin has all permissions
        $this->assertTrue($superAdmin->hasPermission('manage_companies'));
        $this->assertTrue($superAdmin->hasPermission('create_bookings'));
        $this->assertTrue($superAdmin->hasPermission('view_own_bookings'));

        // Company admin has company-level permissions
        $this->assertTrue($companyAdmin->hasPermission('manage_company_users'));
        $this->assertTrue($companyAdmin->hasPermission('manage_company_bookings'));
        $this->assertFalse($companyAdmin->hasPermission('manage_companies'));

        // Agent has booking and customer management permissions
        $this->assertTrue($agent->hasPermission('create_bookings'));
        $this->assertTrue($agent->hasPermission('manage_customers'));
        $this->assertFalse($agent->hasPermission('manage_company_users'));

        // Customer has limited permissions
        $this->assertTrue($customer->hasPermission('view_own_bookings'));
        $this->assertTrue($customer->hasPermission('update_own_profile'));
        $this->assertFalse($customer->hasPermission('create_bookings'));
    }

    /**
     * Test getting all permissions for a user.
     */
    public function test_user_can_get_all_permissions(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $agent = User::factory()->create(['role' => 'agent']);

        $this->assertEquals(['*'], $superAdmin->getPermissions());
        $this->assertContains('create_bookings', $agent->getPermissions());
        $this->assertContains('manage_customers', $agent->getPermissions());
    }

    /**
     * Test role middleware blocks unauthorized users.
     */
    public function test_role_middleware_blocks_unauthorized_users(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/users')
            ->assertStatus(403)
            ->assertJson([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ]);
    }

    /**
     * Test role middleware allows authorized users.
     */
    public function test_role_middleware_allows_authorized_users(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
            ->getJson('/api/users')
            ->assertStatus(200);
    }

    /**
     * Test assign role endpoint.
     */
    public function test_admin_can_assign_role_via_api(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($admin)
            ->postJson("/api/users/{$user->id}/assign-role", [
                'role' => 'agent',
            ])
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Role assigned successfully.',
                'user' => [
                    'role' => 'agent',
                ],
            ]);

        $this->assertEquals('agent', $user->fresh()->role);
    }

    /**
     * Test non-admin cannot assign roles.
     */
    public function test_non_admin_cannot_assign_roles(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $targetUser = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->postJson("/api/users/{$targetUser->id}/assign-role", [
                'role' => 'agent',
            ])
            ->assertStatus(403);
    }

    /**
     * Test get user permissions endpoint.
     */
    public function test_can_get_user_permissions_via_api(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($admin)
            ->getJson("/api/users/{$agent->id}/permissions")
            ->assertStatus(200)
            ->assertJsonStructure([
                'role',
                'permissions',
            ])
            ->assertJson([
                'role' => 'agent',
            ]);
    }

    /**
     * Test check permission endpoint.
     */
    public function test_can_check_specific_permission_via_api(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $agent = User::factory()->create(['role' => 'agent']);

        $this->actingAs($admin)
            ->postJson("/api/users/{$agent->id}/check-permission", [
                'permission' => 'create_bookings',
            ])
            ->assertStatus(200)
            ->assertJson([
                'permission' => 'create_bookings',
                'has_permission' => true,
            ]);

        $this->actingAs($admin)
            ->postJson("/api/users/{$agent->id}/check-permission", [
                'permission' => 'manage_companies',
            ])
            ->assertStatus(200)
            ->assertJson([
                'permission' => 'manage_companies',
                'has_permission' => false,
            ]);
    }

    /**
     * Test profile endpoint is accessible to all authenticated users.
     */
    public function test_authenticated_user_can_access_profile(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user)
            ->getJson('/api/profile')
            ->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'permissions',
            ]);
    }

    /**
     * Test user can update their own profile.
     */
    public function test_user_can_update_own_profile(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'name' => 'Old Name',
        ]);

        $this->actingAs($user)
            ->putJson('/api/profile', [
                'name' => 'New Name',
                'phone' => '1234567890',
            ])
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Profile updated successfully.',
                'user' => [
                    'name' => 'New Name',
                    'phone' => '1234567890',
                ],
            ]);

        $this->assertEquals('New Name', $user->fresh()->name);
    }
}

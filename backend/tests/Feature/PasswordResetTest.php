<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can request password reset link.
     */
    public function test_user_can_request_password_reset_link(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/password/email', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);

        // Check that token was created in database
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test password reset request fails for non-existent email.
     */
    public function test_password_reset_request_fails_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/password/email', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test password reset request requires email.
     */
    public function test_password_reset_request_requires_email(): void
    {
        $response = $this->postJson('/api/password/email', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test user can validate reset token.
     */
    public function test_user_can_validate_reset_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'test-token-123';

        // Create reset token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/validate-token', [
            'email' => 'test@example.com',
            'token' => $token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'valid' => true,
            ]);
    }

    /**
     * Test token validation fails for invalid token.
     */
    public function test_token_validation_fails_for_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('correct-token'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/validate-token', [
            'email' => 'test@example.com',
            'token' => 'wrong-token',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'valid' => false,
            ]);
    }

    /**
     * Test token validation fails for expired token.
     */
    public function test_token_validation_fails_for_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'test-token-123';

        // Create expired token (61 minutes ago)
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->postJson('/api/password/validate-token', [
            'email' => 'test@example.com',
            'token' => $token,
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'valid' => false,
                'message' => 'Reset token has expired.',
            ]);
    }

    /**
     * Test user can reset password with valid token.
     */
    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $token = 'test-token-123';

        // Create reset token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Your password has been reset successfully!',
            ]);

        // Check password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('new-password', $user->password));

        // Check token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test password reset fails with invalid token.
     */
    public function test_password_reset_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('correct-token'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => 'wrong-token',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    /**
     * Test password reset fails with expired token.
     */
    public function test_password_reset_fails_with_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'test-token-123';

        // Create expired token
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);

        // Check token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test password reset requires password confirmation.
     */
    public function test_password_reset_requires_password_confirmation(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'test-token-123';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password reset requires minimum 8 characters.
     */
    public function test_password_reset_requires_minimum_length(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'test-token-123';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password reset revokes all existing tokens.
     */
    public function test_password_reset_revokes_all_existing_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        // Create some auth tokens
        $authToken1 = $user->createToken('device1')->plainTextToken;
        $authToken2 = $user->createToken('device2')->plainTextToken;

        $this->assertCount(2, $user->tokens);

        $token = 'reset-token-123';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);

        // Check all tokens were revoked
        $user->refresh();
        $this->assertCount(0, $user->tokens);
    }
}

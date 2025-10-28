<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user's email.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find a user with that email address.'],
            ]);
        }

        // Generate reset token
        $token = Str::random(64);

        // Store token in database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Send email with reset link
        try {
            Mail::send('emails.password-reset', ['token' => $token, 'email' => $request->email, 'user' => $user], function ($message) use ($request) {
                $message->to($request->email);
                $message->subject('Reset Password Notification');
            });
        } catch (\Exception $e) {
            // Log the error but don't expose it to the user
            \Log::error('Failed to send password reset email: ' . $e->getMessage());

            // For development/testing, return the token in the response
            if (config('app.env') === 'testing' || config('app.env') === 'local') {
                return response()->json([
                    'message' => 'Password reset link generated (email sending failed in local/test environment).',
                    'token' => $token, // Only for testing
                ]);
            }

            return response()->json([
                'message' => 'Failed to send reset email. Please try again later.',
            ], 500);
        }

        return response()->json([
            'message' => 'We have emailed your password reset link!',
        ]);
    }

    /**
     * Validate password reset token.
     */
    public function validateResetToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid reset token.',
            ], 400);
        }

        // Check if token has expired (60 minutes)
        if ($resetRecord->created_at < now()->subMinutes(60)) {
            return response()->json([
                'valid' => false,
                'message' => 'Reset token has expired.',
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid reset token.',
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Token is valid.',
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'email' => ['Invalid reset token.'],
            ]);
        }

        // Check if token has expired (60 minutes)
        if ($resetRecord->created_at < now()->subMinutes(60)) {
            // Delete expired token
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            throw ValidationException::withMessages([
                'token' => ['Reset token has expired.'],
            ]);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Invalid reset token.'],
            ]);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the reset token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoke all existing tokens for this user (optional security measure)
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Your password has been reset successfully!',
        ]);
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VesselController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\CustomerController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset (public routes)
Route::post('/password/email', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);
Route::post('/password/validate-token', [PasswordResetController::class, 'validateResetToken']);

// Public access to routes and vessels (for browsing before login)
Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/{route}', [RouteController::class, 'show']);
Route::get('/vessels', [VesselController::class, 'index']);
Route::get('/vessels/{vessel}', [VesselController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getCurrentUser']);

    // User Profile (accessible to all authenticated users)
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);

    // User Management (superadmin only)
    Route::middleware('role:superadmin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/restore', [UserController::class, 'restore']);
        Route::delete('users/{id}/force', [UserController::class, 'forceDelete']);
        Route::post('users/{user}/assign-role', [UserController::class, 'assignRole']);
        Route::get('users/{user}/permissions', [UserController::class, 'permissions']);
        Route::post('users/{user}/check-permission', [UserController::class, 'checkPermission']);
    });

    // Vessel Management (superadmin only - write operations)
    Route::middleware('role:superadmin')->group(function () {
        Route::post('vessels', [VesselController::class, 'store']);
        Route::put('vessels/{vessel}', [VesselController::class, 'update']);
        Route::delete('vessels/{vessel}', [VesselController::class, 'destroy']);
        Route::post('vessels/{id}/restore', [VesselController::class, 'restore']);
        Route::post('vessels/{id}/image', [VesselController::class, 'uploadImage']);
        Route::delete('vessels/{id}/image', [VesselController::class, 'deleteImage']);
        Route::get('vessels/{id}/availability', [VesselController::class, 'checkAvailability']);
    });

    // Route Management (superadmin only - write operations)
    Route::middleware('role:superadmin')->group(function () {
        Route::post('routes', [RouteController::class, 'store']);
        Route::put('routes/{route}', [RouteController::class, 'update']);
        Route::delete('routes/{route}', [RouteController::class, 'destroy']);
        Route::post('routes/{id}/restore', [RouteController::class, 'restore']);
    });

    // Bookings (customers can create and view their own, admins can see all)
    Route::apiResource('bookings', BookingController::class);
    Route::post('bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::get('vessels/{vessel}/capacity', [BookingController::class, 'getCapacity']);

    // Payments
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/{payment}/process', [PaymentController::class, 'process']);

    // Refunds
    Route::apiResource('refunds', RefundController::class);
    Route::post('refunds/{refund}/process', [RefundController::class, 'process']);

    // Customer Management (admin and superadmin only)
    Route::middleware('role:superadmin,admin')->group(function () {
        Route::get('customers', [CustomerController::class, 'index']);
        Route::get('customers/{id}', [CustomerController::class, 'show']);
        Route::get('customers/{id}/bookings', [CustomerController::class, 'bookings']);
    });

    // Suppliers (superadmin and admin can manage)
    Route::middleware('role:superadmin,admin')->group(function () {
        Route::post('suppliers', [SupplierController::class, 'store']);
        Route::put('suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });
    Route::get('suppliers', [SupplierController::class, 'index']);
    Route::get('suppliers/{supplier}', [SupplierController::class, 'show']);

    // Documents
    Route::apiResource('documents', DocumentController::class);
    Route::post('documents/upload', [DocumentController::class, 'upload']);
});

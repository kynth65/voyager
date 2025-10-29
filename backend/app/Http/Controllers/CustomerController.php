<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    /**
     * Get paginated list of customers with optional search.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|max:255',
        ]);

        $query = User::where('role', 'customer');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($customers);
    }

    /**
     * Get customer details with booking history and stats.
     */
    public function show(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')
            ->findOrFail($id);

        // Get customer bookings with relationships
        $bookings = Booking::where('user_id', $id)
            ->with(['route', 'vessel'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total_bookings' => $bookings->count(),
            'completed_bookings' => $bookings->where('status', 'completed')->count(),
            'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
            'total_spent' => $bookings->whereIn('status', ['confirmed', 'completed'])->sum('total_amount'),
        ];

        return response()->json([
            'user' => $customer,
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Get customer bookings only.
     */
    public function bookings(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')
            ->findOrFail($id);

        $bookings = Booking::where('user_id', $id)
            ->with(['route', 'vessel'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }
}

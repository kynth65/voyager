<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Route;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     * Admin sees all, customer sees only their own.
     */
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'vessel', 'route', 'payment']);

        // If user is customer, only show their own bookings
        if ($request->user()->role === 'customer') {
            $query->where('user_id', $request->user()->id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->where('booking_date', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->where('booking_date', '<=', $request->to_date);
        }

        // Filter by route
        if ($request->has('route_id') && $request->route_id) {
            $query->where('route_id', $request->route_id);
        }

        // Search by booking reference or customer name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        $bookings = $query->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'departure_time' => 'required|date_format:H:i',
            'passengers' => 'required|integer|min:1',
            'special_requirements' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:credit_card,debit_card,bank_transfer,cash,paypal',
        ]);

        try {
            DB::beginTransaction();

            // Get the route with vessel
            $route = Route::with('vessel')->findOrFail($validated['route_id']);

            // Check if route is active
            if (!$route->isActive()) {
                return response()->json([
                    'message' => 'This route is currently not available for booking.'
                ], 422);
            }

            // Check vessel capacity
            $capacityCheck = $this->checkCapacity(
                $route->vessel_id,
                $validated['route_id'],
                $validated['booking_date'],
                $validated['departure_time'],
                $validated['passengers']
            );

            if (!$capacityCheck['available']) {
                return response()->json([
                    'message' => 'Insufficient capacity. Available seats: ' . $capacityCheck['available_seats']
                ], 422);
            }

            // Calculate total amount
            $totalAmount = $this->calculateTotal($route->price, $validated['passengers']);

            // Generate unique booking reference
            $bookingReference = $this->generateBookingReference();

            // Create booking
            $booking = Booking::create([
                'booking_reference' => $bookingReference,
                'user_id' => $request->user()->id,
                'vessel_id' => $route->vessel_id,
                'route_id' => $validated['route_id'],
                'status' => 'pending',
                'booking_date' => $validated['booking_date'],
                'departure_time' => $validated['departure_time'],
                'passengers' => $validated['passengers'],
                'total_amount' => $totalAmount,
                'special_requirements' => $validated['special_requirements'] ?? null,
            ]);

            // Process mock payment
            $payment = $this->processMockPayment(
                $booking->id,
                $validated['payment_method'],
                $totalAmount
            );

            // If payment is successful, confirm the booking
            if ($payment->isCompleted()) {
                $booking->confirm();
            }

            DB::commit();

            // Load relationships for response
            $booking->load(['user', 'vessel', 'route', 'payment']);

            return response()->json([
                'message' => 'Booking created successfully!',
                'booking' => $booking,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create booking. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified booking.
     */
    public function show(Request $request, Booking $booking)
    {
        // Check authorization - customer can only view their own bookings
        if ($request->user()->role === 'customer' && $booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to view this booking.'
            ], 403);
        }

        $booking->load(['user', 'vessel', 'route', 'payment', 'refund']);

        return response()->json($booking);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Check authorization
        if ($request->user()->role === 'customer' && $booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to cancel this booking.'
            ], 403);
        }

        // Check if already cancelled
        if ($booking->isCancelled()) {
            return response()->json([
                'message' => 'This booking is already cancelled.'
            ], 422);
        }

        // Check if already completed
        if ($booking->status === 'completed') {
            return response()->json([
                'message' => 'Cannot cancel a completed booking.'
            ], 422);
        }

        $booking->cancel();
        $booking->load(['user', 'vessel', 'route', 'payment']);

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'booking' => $booking,
        ]);
    }

    /**
     * Confirm a booking (admin only).
     */
    public function confirm(Request $request, Booking $booking)
    {
        // Only admin and superadmin can confirm bookings
        if (!in_array($request->user()->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to confirm bookings.'
            ], 403);
        }

        // Check if already confirmed
        if ($booking->isConfirmed()) {
            return response()->json([
                'message' => 'This booking is already confirmed.'
            ], 422);
        }

        // Check if cancelled
        if ($booking->isCancelled()) {
            return response()->json([
                'message' => 'Cannot confirm a cancelled booking.'
            ], 422);
        }

        $booking->confirm();
        $booking->load(['user', 'vessel', 'route', 'payment']);

        return response()->json([
            'message' => 'Booking confirmed successfully.',
            'booking' => $booking,
        ]);
    }

    /**
     * Check vessel capacity for a specific route, date, and time.
     */
    public function checkCapacity(int $vesselId, int $routeId, string $bookingDate, string $departureTime, int $requestedPassengers)
    {
        // Get the vessel
        $vessel = Vessel::findOrFail($vesselId);

        // Get total passengers already booked for this vessel, route, date, and time
        $bookedPassengers = Booking::where('vessel_id', $vesselId)
            ->where('route_id', $routeId)
            ->where('booking_date', $bookingDate)
            ->where('departure_time', $departureTime)
            ->whereIn('status', ['pending', 'confirmed']) // Don't count cancelled bookings
            ->sum('passengers');

        $availableSeats = $vessel->capacity - $bookedPassengers;
        $isAvailable = $availableSeats >= $requestedPassengers;

        return [
            'available' => $isAvailable,
            'vessel_capacity' => $vessel->capacity,
            'booked_seats' => $bookedPassengers,
            'available_seats' => $availableSeats,
            'requested_seats' => $requestedPassengers,
        ];
    }

    /**
     * Get capacity information for a vessel (API endpoint).
     */
    public function getCapacity(Request $request, int $vesselId)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'booking_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'passengers' => 'required|integer|min:1',
        ]);

        $capacityInfo = $this->checkCapacity(
            $vesselId,
            $validated['route_id'],
            $validated['booking_date'],
            $validated['departure_time'],
            $validated['passengers']
        );

        return response()->json($capacityInfo);
    }

    /**
     * Calculate total amount for booking.
     */
    protected function calculateTotal(float $routePrice, int $passengers): float
    {
        return round($routePrice * $passengers, 2);
    }

    /**
     * Generate unique booking reference number.
     */
    protected function generateBookingReference(): string
    {
        do {
            // Format: VYG-YYYYMMDD-XXXX (e.g., VYG-20251029-A1B2)
            $reference = 'VYG-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }

    /**
     * Process mock payment (instant confirmation).
     */
    protected function processMockPayment(int $bookingId, string $paymentMethod, float $amount): Payment
    {
        // Generate mock transaction ID
        $transactionId = 'TXN-' . strtoupper(Str::random(12));

        // Create and complete payment instantly (mock payment)
        $payment = Payment::create([
            'booking_id' => $bookingId,
            'payment_method' => $paymentMethod,
            'amount' => $amount,
            'status' => 'completed',
            'transaction_id' => $transactionId,
            'payment_date' => now(),
            'notes' => 'Mock payment processed successfully',
        ]);

        return $payment;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments.
     * Admin/superadmin sees all, customer sees only their own.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['booking.user', 'booking.route', 'booking.vessel']);

        // If user is customer, only show payments for their own bookings
        if ($request->user()->role === 'customer') {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->has('payment_method') && $request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        // Search by transaction ID or booking reference
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('booking', function ($bookingQuery) use ($search) {
                      $bookingQuery->where('booking_reference', 'like', "%{$search}%");
                  });
            });
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        $payments = $query->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Store a newly created payment (manual payment record creation).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|in:credit_card,debit_card,bank_transfer,cash,paypal,gcash,paymaya',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Get the booking to check authorization
        $booking = Booking::findOrFail($validated['booking_id']);

        // Check if user is authorized to create payment for this booking
        if ($request->user()->role === 'customer' && $booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to create payment for this booking.'
            ], 403);
        }

        // Check if booking already has a payment
        if ($booking->payment) {
            return response()->json([
                'message' => 'This booking already has a payment record.'
            ], 422);
        }

        // Create payment with pending status
        $payment = Payment::create([
            'booking_id' => $validated['booking_id'],
            'payment_method' => $validated['payment_method'],
            'amount' => $validated['amount'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $payment->load(['booking.user', 'booking.route', 'booking.vessel']);

        return response()->json([
            'message' => 'Payment record created successfully.',
            'payment' => $payment,
        ], 201);
    }

    /**
     * Display the specified payment.
     */
    public function show(Request $request, Payment $payment)
    {
        // Check authorization - customer can only view payments for their own bookings
        if ($request->user()->role === 'customer' && $payment->booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to view this payment.'
            ], 403);
        }

        $payment->load(['booking.user', 'booking.route', 'booking.vessel']);

        return response()->json($payment);
    }

    /**
     * Process a payment (mock payment processing).
     * This marks a pending payment as completed with a transaction ID.
     */
    public function process(Request $request, Payment $payment)
    {
        // Check authorization
        if ($request->user()->role === 'customer' && $payment->booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to process this payment.'
            ], 403);
        }

        // Check if payment is already completed
        if ($payment->isCompleted()) {
            return response()->json([
                'message' => 'This payment has already been processed.'
            ], 422);
        }

        // Check if payment is failed
        if ($payment->isFailed()) {
            return response()->json([
                'message' => 'Cannot process a failed payment. Please create a new payment.'
            ], 422);
        }

        // Generate mock transaction ID
        $transactionId = 'TXN-' . strtoupper(Str::random(12));

        // Update payment to completed
        $payment->update([
            'status' => 'completed',
            'transaction_id' => $transactionId,
            'payment_date' => now(),
            'notes' => $payment->notes ? $payment->notes . ' | Processed on ' . now()->toDateTimeString() : 'Mock payment processed successfully',
        ]);

        // If the booking is still pending, confirm it
        if ($payment->booking->status === 'pending') {
            $payment->booking->confirm();
        }

        $payment->load(['booking.user', 'booking.route', 'booking.vessel']);

        return response()->json([
            'message' => 'Payment processed successfully.',
            'payment' => $payment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

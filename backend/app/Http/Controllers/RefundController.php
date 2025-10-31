<?php

namespace App\Http\Controllers;

use App\Models\Refund;
use App\Models\Booking;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    /**
     * Display a listing of refunds.
     * Admin/superadmin sees all, customer sees only their own.
     */
    public function index(Request $request)
    {
        $query = Refund::with(['booking.user', 'booking.route', 'booking.vessel', 'processedBy']);

        // If user is customer, only show refunds for their own bookings
        if ($request->user()->role === 'customer') {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by booking reference
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('booking', function ($bookingQuery) use ($search) {
                $bookingQuery->where('booking_reference', 'like', "%{$search}%");
            });
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        $refunds = $query->paginate($request->get('per_page', 15));

        return response()->json($refunds);
    }

    /**
     * Store a newly created refund request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        // Get the booking to check authorization
        $booking = Booking::with('payment')->findOrFail($validated['booking_id']);

        // Check if user is authorized to create refund for this booking
        // Only admin/superadmin can create refunds, or customer for their own booking
        if ($request->user()->role === 'customer' && $booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to create refund for this booking.'
            ], 403);
        }

        // Check if booking has a payment
        if (!$booking->payment) {
            return response()->json([
                'message' => 'This booking does not have a payment record.'
            ], 422);
        }

        // Check if booking already has a refund
        if ($booking->refund) {
            return response()->json([
                'message' => 'This booking already has a refund request.'
            ], 422);
        }

        // Create refund with pending status
        $refund = Refund::create([
            'booking_id' => $validated['booking_id'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'status' => 'pending',
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        $refund->load(['booking.user', 'booking.route', 'booking.vessel']);

        return response()->json([
            'message' => 'Refund request created successfully.',
            'refund' => $refund,
        ], 201);
    }

    /**
     * Display the specified refund.
     */
    public function show(Request $request, Refund $refund)
    {
        // Check authorization - customer can only view refunds for their own bookings
        if ($request->user()->role === 'customer' && $refund->booking->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to view this refund.'
            ], 403);
        }

        $refund->load(['booking.user', 'booking.route', 'booking.vessel', 'processedBy']);

        return response()->json($refund);
    }

    /**
     * Process a refund (approve/reject/process).
     * Only admin/superadmin can process refunds.
     */
    public function process(Request $request, Refund $refund)
    {
        // Only admin/superadmin can process refunds
        if (!in_array($request->user()->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to process refunds.'
            ], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject,process',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $action = $validated['action'];
        $adminNotes = $validated['admin_notes'] ?? null;

        // Update admin notes if provided
        if ($adminNotes) {
            $refund->admin_notes = $adminNotes;
        }

        switch ($action) {
            case 'approve':
                if (!$refund->isPending()) {
                    return response()->json([
                        'message' => 'Only pending refunds can be approved.'
                    ], 422);
                }
                $refund->approve($request->user()->id);
                $message = 'Refund approved successfully.';
                break;

            case 'reject':
                if (!$refund->isPending()) {
                    return response()->json([
                        'message' => 'Only pending refunds can be rejected.'
                    ], 422);
                }
                $refund->reject($request->user()->id, $adminNotes);
                $message = 'Refund rejected successfully.';
                break;

            case 'process':
                if (!$refund->isApproved() && !$refund->isPending()) {
                    return response()->json([
                        'message' => 'Only approved or pending refunds can be processed.'
                    ], 422);
                }
                // Auto-approve if pending
                if ($refund->isPending()) {
                    $refund->approve($request->user()->id);
                }
                $refund->process($request->user()->id);
                $message = 'Refund processed successfully.';
                break;

            default:
                return response()->json([
                    'message' => 'Invalid action.'
                ], 422);
        }

        $refund->load(['booking.user', 'booking.route', 'booking.vessel', 'processedBy']);

        return response()->json([
            'message' => $message,
            'refund' => $refund,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Refund $refund)
    {
        // Only admin/superadmin can update refunds
        if (!in_array($request->user()->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to update refunds.'
            ], 403);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'reason' => 'sometimes|string|max:1000',
            'admin_notes' => 'sometimes|string|max:1000',
        ]);

        $refund->update($validated);
        $refund->load(['booking.user', 'booking.route', 'booking.vessel', 'processedBy']);

        return response()->json([
            'message' => 'Refund updated successfully.',
            'refund' => $refund,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Refund $refund)
    {
        // Only admin/superadmin can delete refunds
        if (!in_array($request->user()->role, ['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to delete refunds.'
            ], 403);
        }

        // Only pending refunds can be deleted
        if (!$refund->isPending()) {
            return response()->json([
                'message' => 'Only pending refunds can be deleted.'
            ], 422);
        }

        $refund->delete();

        return response()->json([
            'message' => 'Refund deleted successfully.'
        ]);
    }
}

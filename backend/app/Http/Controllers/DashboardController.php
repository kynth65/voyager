<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     * Returns key metrics for admin/superadmin dashboard.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardStats(Request $request)
    {
        $today = Carbon::today();

        // Today's bookings
        $todaysBookings = Booking::whereDate('booking_date', $today)->count();

        // Total bookings
        $totalBookings = Booking::count();

        // Pending bookings (not confirmed or cancelled)
        $pendingBookings = Booking::where('status', 'pending')->count();

        // Confirmed bookings
        $confirmedBookings = Booking::where('status', 'confirmed')->count();

        // Cancelled bookings
        $cancelledBookings = Booking::where('status', 'cancelled')->count();

        // Today's revenue (completed payments for bookings today)
        $todaysRevenue = Payment::whereHas('booking', function ($query) use ($today) {
            $query->whereDate('booking_date', $today);
        })->where('status', 'completed')->sum('amount');

        // Total revenue (all completed payments)
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        // Pending payments
        $pendingPayments = Payment::where('status', 'pending')->sum('amount');

        // Total customers
        $totalCustomers = \App\Models\User::where('role', 'customer')->count();

        // Active vessels
        $activeVessels = Vessel::where('status', 'active')->count();

        // Total routes
        $totalRoutes = \App\Models\Route::count();

        return response()->json([
            'bookings' => [
                'today' => $todaysBookings,
                'total' => $totalBookings,
                'pending' => $pendingBookings,
                'confirmed' => $confirmedBookings,
                'cancelled' => $cancelledBookings,
            ],
            'revenue' => [
                'today' => (float) $todaysRevenue,
                'total' => (float) $totalRevenue,
                'pending' => (float) $pendingPayments,
            ],
            'customers' => $totalCustomers,
            'vessels' => $activeVessels,
            'routes' => $totalRoutes,
        ]);
    }

    /**
     * Get recent bookings.
     * Returns the latest bookings with pagination.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentBookings(Request $request)
    {
        $limit = $request->input('limit', 10);

        $bookings = Booking::with(['user', 'vessel', 'route', 'payment'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $bookings,
        ]);
    }

    /**
     * Get bookings grouped by vessel type.
     * Returns count of bookings for each vessel type (ferry, speedboat, etc.).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBookingsByType()
    {
        $bookingsByType = Booking::join('vessels', 'bookings.vessel_id', '=', 'vessels.id')
            ->select('vessels.type', DB::raw('COUNT(bookings.id) as count'))
            ->groupBy('vessels.type')
            ->get();

        return response()->json([
            'data' => $bookingsByType,
        ]);
    }

    /**
     * Get revenue statistics.
     * Returns detailed revenue breakdown by period.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRevenueStats(Request $request)
    {
        $period = $request->input('period', 'month'); // day, week, month, year

        // Total revenue
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        // Pending payments
        $pendingPayments = Payment::where('status', 'pending')->sum('amount');

        // Failed payments
        $failedPayments = Payment::where('status', 'failed')->sum('amount');

        // Revenue by period
        $revenueByPeriod = [];

        switch ($period) {
            case 'day':
                // Last 7 days
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::today()->subDays($i);
                    $revenue = Payment::whereDate('created_at', $date)
                        ->where('status', 'completed')
                        ->sum('amount');

                    $revenueByPeriod[] = [
                        'date' => $date->format('Y-m-d'),
                        'label' => $date->format('M d'),
                        'revenue' => (float) $revenue,
                    ];
                }
                break;

            case 'week':
                // Last 4 weeks
                for ($i = 3; $i >= 0; $i--) {
                    $startOfWeek = Carbon::today()->subWeeks($i)->startOfWeek();
                    $endOfWeek = Carbon::today()->subWeeks($i)->endOfWeek();

                    $revenue = Payment::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                        ->where('status', 'completed')
                        ->sum('amount');

                    $revenueByPeriod[] = [
                        'start_date' => $startOfWeek->format('Y-m-d'),
                        'end_date' => $endOfWeek->format('Y-m-d'),
                        'label' => 'Week ' . $startOfWeek->format('M d'),
                        'revenue' => (float) $revenue,
                    ];
                }
                break;

            case 'month':
                // Last 6 months
                for ($i = 5; $i >= 0; $i--) {
                    $date = Carbon::today()->subMonths($i);
                    $startOfMonth = $date->copy()->startOfMonth();
                    $endOfMonth = $date->copy()->endOfMonth();

                    $revenue = Payment::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                        ->where('status', 'completed')
                        ->sum('amount');

                    $revenueByPeriod[] = [
                        'date' => $date->format('Y-m'),
                        'label' => $date->format('M Y'),
                        'revenue' => (float) $revenue,
                    ];
                }
                break;

            case 'year':
                // Last 3 years
                for ($i = 2; $i >= 0; $i--) {
                    $year = Carbon::today()->subYears($i)->year;
                    $startOfYear = Carbon::create($year, 1, 1)->startOfDay();
                    $endOfYear = Carbon::create($year, 12, 31)->endOfDay();

                    $revenue = Payment::whereBetween('created_at', [$startOfYear, $endOfYear])
                        ->where('status', 'completed')
                        ->sum('amount');

                    $revenueByPeriod[] = [
                        'year' => $year,
                        'label' => (string) $year,
                        'revenue' => (float) $revenue,
                    ];
                }
                break;
        }

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'pending_payments' => (float) $pendingPayments,
            'failed_payments' => (float) $failedPayments,
            'revenue_by_period' => $revenueByPeriod,
        ]);
    }

    /**
     * Get popular routes.
     * Returns most booked routes.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPopularRoutes(Request $request)
    {
        $limit = $request->input('limit', 5);

        $popularRoutes = \App\Models\Route::withCount('bookings')
            ->orderBy('bookings_count', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $popularRoutes,
        ]);
    }

    /**
     * Get booking trends.
     * Returns booking statistics over time.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBookingTrends(Request $request)
    {
        $period = $request->input('period', 'month'); // day, week, month
        $bookingTrends = [];

        switch ($period) {
            case 'day':
                // Last 7 days
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::today()->subDays($i);
                    $count = Booking::whereDate('created_at', $date)->count();

                    $bookingTrends[] = [
                        'date' => $date->format('Y-m-d'),
                        'label' => $date->format('M d'),
                        'count' => $count,
                    ];
                }
                break;

            case 'week':
                // Last 4 weeks
                for ($i = 3; $i >= 0; $i--) {
                    $startOfWeek = Carbon::today()->subWeeks($i)->startOfWeek();
                    $endOfWeek = Carbon::today()->subWeeks($i)->endOfWeek();

                    $count = Booking::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();

                    $bookingTrends[] = [
                        'start_date' => $startOfWeek->format('Y-m-d'),
                        'end_date' => $endOfWeek->format('Y-m-d'),
                        'label' => 'Week ' . $startOfWeek->format('M d'),
                        'count' => $count,
                    ];
                }
                break;

            case 'month':
                // Last 6 months
                for ($i = 5; $i >= 0; $i--) {
                    $date = Carbon::today()->subMonths($i);
                    $startOfMonth = $date->copy()->startOfMonth();
                    $endOfMonth = $date->copy()->endOfMonth();

                    $count = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

                    $bookingTrends[] = [
                        'date' => $date->format('Y-m'),
                        'label' => $date->format('M Y'),
                        'count' => $count,
                    ];
                }
                break;
        }

        return response()->json([
            'data' => $bookingTrends,
        ]);
    }
}

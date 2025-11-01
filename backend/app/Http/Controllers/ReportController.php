<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Export bookings to CSV
     * GET /api/reports/bookings/export
     *
     * Query Parameters:
     * - start_date: Filter bookings from this date
     * - end_date: Filter bookings to this date
     * - status: Filter by booking status
     * - route_id: Filter by specific route
     */
    public function exportBookingsCSV(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:pending,confirmed,cancelled,completed',
            'route_id' => 'nullable|exists:routes,id',
        ]);

        $query = Booking::with(['user', 'vessel', 'route', 'payment']);

        // Apply filters
        if ($request->has('start_date')) {
            $query->whereDate('travel_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('travel_date', '<=', $request->end_date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Generate CSV content
        $csv = $this->generateBookingsCSV($bookings);

        // Return as downloadable file
        $filename = 'bookings_export_' . now()->format('Y-m-d_His') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Generate revenue report
     * GET /api/reports/revenue
     *
     * Query Parameters:
     * - start_date: Report start date (defaults to 30 days ago)
     * - end_date: Report end date (defaults to today)
     * - group_by: Group results by 'day', 'week', or 'month' (default: 'day')
     */
    public function generateRevenueReport(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'group_by' => 'nullable|in:day,week,month',
        ]);

        $startDate = $request->start_date
            ? Carbon::parse($request->start_date)
            : Carbon::now()->subDays(30);

        $endDate = $request->end_date
            ? Carbon::parse($request->end_date)
            : Carbon::now();

        $groupBy = $request->group_by ?? 'day';

        // Get total revenue
        $totalRevenue = Payment::where('status', 'completed')
            ->whereHas('booking', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('travel_date', [$startDate, $endDate]);
            })
            ->sum('amount');

        // Get revenue by status
        $revenueByStatus = Payment::select('status', DB::raw('SUM(amount) as total'))
            ->whereHas('booking', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('travel_date', [$startDate, $endDate]);
            })
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => (float) $item->total];
            });

        // Get revenue over time (grouped)
        $revenueOverTime = $this->getRevenueOverTime($startDate, $endDate, $groupBy);

        // Get revenue by route
        $revenueByRoute = Payment::select(
                'routes.id',
                'routes.origin',
                'routes.destination',
                DB::raw('COUNT(payments.id) as booking_count'),
                DB::raw('SUM(payments.amount) as total_revenue')
            )
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('routes', 'bookings.route_id', '=', 'routes.id')
            ->where('payments.status', 'completed')
            ->whereBetween('bookings.travel_date', [$startDate, $endDate])
            ->groupBy('routes.id', 'routes.origin', 'routes.destination')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'route_id' => $item->id,
                    'route' => $item->origin . ' → ' . $item->destination,
                    'booking_count' => $item->booking_count,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'group_by' => $groupBy,
            ],
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'revenue_by_status' => $revenueByStatus,
            ],
            'revenue_over_time' => $revenueOverTime,
            'top_routes' => $revenueByRoute,
        ]);
    }

    /**
     * Generate popular routes report
     * GET /api/reports/routes/popular
     *
     * Query Parameters:
     * - start_date: Filter bookings from this date
     * - end_date: Filter bookings to this date
     * - limit: Number of routes to return (default: 10)
     */
    public function generatePopularRoutesReport(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $startDate = $request->start_date
            ? Carbon::parse($request->start_date)
            : Carbon::now()->subDays(30);

        $endDate = $request->end_date
            ? Carbon::parse($request->end_date)
            : Carbon::now();

        $limit = $request->limit ?? 10;

        // Get popular routes with booking stats
        $popularRoutes = Route::select(
                'routes.id',
                'routes.origin',
                'routes.destination',
                'routes.price',
                'vessels.name as vessel_name',
                DB::raw('COUNT(bookings.id) as total_bookings'),
                DB::raw('SUM(bookings.number_of_passengers) as total_passengers'),
                DB::raw('SUM(CASE WHEN bookings.status = "confirmed" THEN 1 ELSE 0 END) as confirmed_bookings'),
                DB::raw('SUM(CASE WHEN bookings.status = "cancelled" THEN 1 ELSE 0 END) as cancelled_bookings'),
                DB::raw('SUM(CASE WHEN payments.status = "completed" THEN payments.amount ELSE 0 END) as total_revenue')
            )
            ->leftJoin('vessels', 'routes.vessel_id', '=', 'vessels.id')
            ->leftJoin('bookings', 'routes.id', '=', 'bookings.route_id')
            ->leftJoin('payments', 'bookings.id', '=', 'payments.booking_id')
            ->whereBetween('bookings.travel_date', [$startDate, $endDate])
            ->groupBy('routes.id', 'routes.origin', 'routes.destination', 'routes.price', 'vessels.name')
            ->orderByDesc('total_bookings')
            ->limit($limit)
            ->get()
            ->map(function ($route) {
                $totalBookings = $route->total_bookings ?: 1; // Avoid division by zero

                return [
                    'route_id' => $route->id,
                    'route' => $route->origin . ' → ' . $route->destination,
                    'vessel_name' => $route->vessel_name,
                    'price' => (float) $route->price,
                    'statistics' => [
                        'total_bookings' => $route->total_bookings,
                        'confirmed_bookings' => $route->confirmed_bookings,
                        'cancelled_bookings' => $route->cancelled_bookings,
                        'total_passengers' => $route->total_passengers,
                        'cancellation_rate' => round(($route->cancelled_bookings / $totalBookings) * 100, 2),
                    ],
                    'revenue' => [
                        'total' => (float) $route->total_revenue,
                        'average_per_booking' => $route->total_bookings > 0
                            ? round($route->total_revenue / $route->total_bookings, 2)
                            : 0,
                    ],
                ];
            });

        // Get overall statistics
        $totalBookings = Booking::whereBetween('travel_date', [$startDate, $endDate])->count();
        $totalPassengers = Booking::whereBetween('travel_date', [$startDate, $endDate])
            ->sum('number_of_passengers');
        $totalRevenue = Payment::where('status', 'completed')
            ->whereHas('booking', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('travel_date', [$startDate, $endDate]);
            })
            ->sum('amount');

        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_bookings' => $totalBookings,
                'total_passengers' => $totalPassengers,
                'total_revenue' => (float) $totalRevenue,
                'average_revenue_per_booking' => $totalBookings > 0
                    ? round($totalRevenue / $totalBookings, 2)
                    : 0,
            ],
            'routes' => $popularRoutes,
        ]);
    }

    /**
     * Helper: Generate CSV content from bookings
     */
    private function generateBookingsCSV($bookings)
    {
        $headers = [
            'Booking Reference',
            'Customer Name',
            'Customer Email',
            'Route',
            'Vessel',
            'Travel Date',
            'Travel Time',
            'Passengers',
            'Total Amount',
            'Payment Status',
            'Booking Status',
            'Created At',
        ];

        $rows = [];
        $rows[] = $headers;

        foreach ($bookings as $booking) {
            $rows[] = [
                $booking->booking_reference,
                $booking->user->name ?? 'N/A',
                $booking->user->email ?? 'N/A',
                $booking->route
                    ? $booking->route->origin . ' → ' . $booking->route->destination
                    : 'N/A',
                $booking->vessel->name ?? 'N/A',
                $booking->travel_date,
                $booking->travel_time ?? 'N/A',
                $booking->number_of_passengers,
                number_format($booking->total_amount, 2),
                $booking->payment->status ?? 'N/A',
                $booking->status,
                $booking->created_at->format('Y-m-d H:i:s'),
            ];
        }

        // Convert to CSV string
        $output = fopen('php://temp', 'r+');
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Helper: Get revenue over time grouped by period
     */
    private function getRevenueOverTime($startDate, $endDate, $groupBy)
    {
        $dateFormat = match ($groupBy) {
            'month' => '%Y-%m',
            'week' => '%Y-%u',
            default => '%Y-%m-%d',
        };

        return Payment::select(
                DB::raw("DATE_FORMAT(bookings.travel_date, '{$dateFormat}') as period"),
                DB::raw('COUNT(payments.id) as booking_count'),
                DB::raw('SUM(payments.amount) as revenue')
            )
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->where('payments.status', 'completed')
            ->whereBetween('bookings.travel_date', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'booking_count' => $item->booking_count,
                    'revenue' => (float) $item->revenue,
                ];
            });
    }
}

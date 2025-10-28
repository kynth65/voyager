<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RouteController extends Controller
{
    /**
     * Display a paginated list of routes with filters.
     */
    public function index(Request $request)
    {
        $query = Route::with('vessel');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vessel
        if ($request->has('vessel_id')) {
            $query->where('vessel_id', $request->vessel_id);
        }

        // Filter by origin or destination
        if ($request->has('origin')) {
            $query->where('origin', 'like', '%' . $request->origin . '%');
        }

        if ($request->has('destination')) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        // Search by origin or destination
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('origin', 'like', '%' . $request->search . '%')
                    ->orWhere('destination', 'like', '%' . $request->search . '%');
            });
        }

        // Include soft deleted routes if requested
        if ($request->boolean('with_deleted')) {
            $query->withTrashed();
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $routes = $query->paginate($perPage);

        return response()->json($routes);
    }

    /**
     * Store a newly created route.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vessel_id' => 'required|exists:vessels,id',
            'origin' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'schedule' => 'nullable|json',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if vessel exists and is active
        $vessel = Vessel::find($request->vessel_id);
        if (!$vessel) {
            return response()->json([
                'message' => 'Vessel not found',
            ], 404);
        }

        if (!$vessel->isActive()) {
            return response()->json([
                'message' => 'Vessel is not active and cannot be assigned to a route',
            ], 422);
        }

        $data = $request->only([
            'vessel_id',
            'origin',
            'destination',
            'price',
            'duration',
            'schedule',
            'status',
        ]);

        // If schedule is a string, decode it
        if (isset($data['schedule']) && is_string($data['schedule'])) {
            $data['schedule'] = json_decode($data['schedule'], true);
        }

        $route = Route::create($data);

        return response()->json([
            'message' => 'Route created successfully',
            'data' => $route->load('vessel'),
        ], 201);
    }

    /**
     * Display the specified route.
     */
    public function show(string $id)
    {
        $route = Route::withTrashed()->with(['vessel', 'bookings'])->findOrFail($id);

        return response()->json([
            'data' => $route,
        ]);
    }

    /**
     * Update the specified route.
     */
    public function update(Request $request, string $id)
    {
        $route = Route::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'vessel_id' => 'sometimes|required|exists:vessels,id',
            'origin' => 'sometimes|required|string|max:255',
            'destination' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'duration' => 'sometimes|required|integer|min:1',
            'schedule' => 'nullable|json',
            'status' => 'sometimes|required|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if vessel exists and is active if changing vessel
        if ($request->has('vessel_id') && $request->vessel_id != $route->vessel_id) {
            $vessel = Vessel::find($request->vessel_id);
            if (!$vessel) {
                return response()->json([
                    'message' => 'Vessel not found',
                ], 404);
            }

            if (!$vessel->isActive()) {
                return response()->json([
                    'message' => 'Vessel is not active and cannot be assigned to a route',
                ], 422);
            }
        }

        $data = $request->only([
            'vessel_id',
            'origin',
            'destination',
            'price',
            'duration',
            'schedule',
            'status',
        ]);

        // If schedule is a string, decode it
        if (isset($data['schedule']) && is_string($data['schedule'])) {
            $data['schedule'] = json_decode($data['schedule'], true);
        }

        $route->update($data);

        return response()->json([
            'message' => 'Route updated successfully',
            'data' => $route->fresh()->load('vessel'),
        ]);
    }

    /**
     * Soft delete the specified route.
     */
    public function destroy(string $id)
    {
        $route = Route::findOrFail($id);

        // Check if route has active bookings
        $hasActiveBookings = $route->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'message' => 'Cannot delete route with active bookings',
            ], 422);
        }

        $route->delete();

        return response()->json([
            'message' => 'Route deleted successfully',
        ]);
    }

    /**
     * Restore a soft deleted route.
     */
    public function restore(string $id)
    {
        $route = Route::withTrashed()->findOrFail($id);

        if (!$route->trashed()) {
            return response()->json([
                'message' => 'Route is not deleted',
            ], 422);
        }

        // Check if the vessel still exists and is active
        $vessel = Vessel::find($route->vessel_id);
        if (!$vessel || !$vessel->isActive()) {
            return response()->json([
                'message' => 'Cannot restore route because vessel is not available or not active',
            ], 422);
        }

        $route->restore();

        return response()->json([
            'message' => 'Route restored successfully',
            'data' => $route->load('vessel'),
        ]);
    }
}

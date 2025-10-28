<?php

namespace App\Http\Controllers;

use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VesselController extends Controller
{
    /**
     * Display a paginated list of vessels with filters.
     */
    public function index(Request $request)
    {
        $query = Vessel::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Include soft deleted vessels if requested
        if ($request->boolean('with_deleted')) {
            $query->withTrashed();
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $vessels = $query->paginate($perPage);

        return response()->json($vessels);
    }

    /**
     * Store a newly created vessel.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:ferry,charter,speedboat,yacht',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive,maintenance',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only([
            'name',
            'type',
            'capacity',
            'description',
            'status',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('vessels', 'public');
            $data['image'] = $imagePath;
        }

        $vessel = Vessel::create($data);

        return response()->json([
            'message' => 'Vessel created successfully',
            'data' => $vessel,
        ], 201);
    }

    /**
     * Display the specified vessel.
     */
    public function show(string $id)
    {
        $vessel = Vessel::withTrashed()->with(['routes', 'bookings'])->findOrFail($id);

        return response()->json([
            'data' => $vessel,
        ]);
    }

    /**
     * Update the specified vessel.
     */
    public function update(Request $request, string $id)
    {
        $vessel = Vessel::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:ferry,charter,speedboat,yacht',
            'capacity' => 'sometimes|required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only([
            'name',
            'type',
            'capacity',
            'description',
            'status',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($vessel->image && Storage::disk('public')->exists($vessel->image)) {
                Storage::disk('public')->delete($vessel->image);
            }

            $imagePath = $request->file('image')->store('vessels', 'public');
            $data['image'] = $imagePath;
        }

        $vessel->update($data);

        return response()->json([
            'message' => 'Vessel updated successfully',
            'data' => $vessel->fresh(),
        ]);
    }

    /**
     * Soft delete the specified vessel.
     */
    public function destroy(string $id)
    {
        $vessel = Vessel::findOrFail($id);

        // Check if vessel has active bookings
        $hasActiveBookings = $vessel->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'message' => 'Cannot delete vessel with active bookings',
            ], 422);
        }

        $vessel->delete();

        return response()->json([
            'message' => 'Vessel deleted successfully',
        ]);
    }

    /**
     * Restore a soft deleted vessel.
     */
    public function restore(string $id)
    {
        $vessel = Vessel::withTrashed()->findOrFail($id);

        if (!$vessel->trashed()) {
            return response()->json([
                'message' => 'Vessel is not deleted',
            ], 422);
        }

        $vessel->restore();

        return response()->json([
            'message' => 'Vessel restored successfully',
            'data' => $vessel,
        ]);
    }

    /**
     * Upload or update vessel image.
     */
    public function uploadImage(Request $request, string $id)
    {
        $vessel = Vessel::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Delete old image if exists
        if ($vessel->image && Storage::disk('public')->exists($vessel->image)) {
            Storage::disk('public')->delete($vessel->image);
        }

        // Store new image
        $imagePath = $request->file('image')->store('vessels', 'public');
        $vessel->update(['image' => $imagePath]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'data' => $vessel->fresh(),
        ]);
    }

    /**
     * Delete vessel image.
     */
    public function deleteImage(string $id)
    {
        $vessel = Vessel::findOrFail($id);

        if (!$vessel->image) {
            return response()->json([
                'message' => 'Vessel has no image',
            ], 422);
        }

        // Delete image file
        if (Storage::disk('public')->exists($vessel->image)) {
            Storage::disk('public')->delete($vessel->image);
        }

        $vessel->update(['image' => null]);

        return response()->json([
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * Check vessel availability for a date range.
     */
    public function checkAvailability(Request $request, string $id)
    {
        $vessel = Vessel::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'booking_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:booking_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bookingDate = $request->booking_date;
        $endDate = $request->end_date;

        $isAvailable = $vessel->isAvailableOn($bookingDate, $endDate);

        return response()->json([
            'available' => $isAvailable,
            'vessel' => $vessel,
            'booking_date' => $bookingDate,
            'end_date' => $endDate,
        ]);
    }
}

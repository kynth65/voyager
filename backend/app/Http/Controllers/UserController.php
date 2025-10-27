<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by company
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::in(['super_admin', 'company_admin', 'agent', 'customer'])],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'company_id' => 'nullable|exists:companies,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json($user->load(['company', 'customer']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:8',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => ['sometimes', Rule::in(['super_admin', 'company_admin', 'agent', 'customer'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
            'company_id' => 'nullable|exists:companies,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Assign a role to a user.
     */
    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['super_admin', 'company_admin', 'agent', 'customer'])],
        ]);

        $success = $user->assignRole($validated['role']);

        if (!$success) {
            return response()->json([
                'message' => 'Failed to assign role.',
            ], 400);
        }

        return response()->json([
            'message' => 'Role assigned successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Get user's permissions.
     */
    public function permissions(User $user)
    {
        return response()->json([
            'role' => $user->role,
            'permissions' => $user->getPermissions(),
        ]);
    }

    /**
     * Check if user has a specific permission.
     */
    public function checkPermission(Request $request, User $user)
    {
        $validated = $request->validate([
            'permission' => 'required|string',
        ]);

        $hasPermission = $user->hasPermission($validated['permission']);

        return response()->json([
            'permission' => $validated['permission'],
            'has_permission' => $hasPermission,
        ]);
    }

    /**
     * Get current user's profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->load(['company', 'customer']),
            'permissions' => $user->getPermissions(),
        ]);
    }

    /**
     * Update current user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'preferences' => 'nullable|array',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }
}

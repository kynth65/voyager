<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The permission to check for
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user has the required permission
        if (!$request->user()->hasPermission($permission)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to perform this action.',
                'required_permission' => $permission,
                'your_role' => $request->user()->role,
            ], 403);
        }

        return $next($request);
    }
}

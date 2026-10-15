<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage in routes:  ->middleware(['auth:sanctum', 'role:seller'])
 *                   ->middleware(['auth:sanctum', 'role:seller,admin'])
 *
 * Register the alias in bootstrap/app.php:
 *
 *   ->withMiddleware(function (Middleware $middleware) {
 *       $middleware->alias(['role' => \App\Http\Middleware\EnsureRole::class]);
 *   })
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'You do not have access to this resource.'], 403);
        }

        return $next($request);
    }
}

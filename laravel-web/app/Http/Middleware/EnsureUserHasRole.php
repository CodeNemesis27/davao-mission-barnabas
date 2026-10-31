<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Only let users with one of the given roles through, e.g. `role:Pastor` or `role:Pastor,Admin`.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_unless($user instanceof User && in_array($user->role, $roles, true), 403);

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToRolePanel
{
    /**
     * Send an authenticated user to the panel that belongs to their role.
     *
     * Guests are passed through untouched (Laravel's "auth" middleware handles them), and so are
     * Pastors: they work in the Starter Kit itself, so they stay on this route.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || $user->usesStarterKit()) {
            return $next($request);
        }

        $url = $user->homePanelUrl();

        // Unknown role: refuse instead of redirecting in circles.
        abort_if($url === null, 403);

        return redirect()->to($url);
    }
}

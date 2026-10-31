<?php

namespace App\Http\Responses;

use App\Models\User;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract, TwoFactorLoginResponseContract
{
    /**
     * Redirect the freshly authenticated user to the panel of their role.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request): Response
    {
        // JSON clients (the kit's own forms never send these) get Fortify's usual payload.
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();

        abort_unless($user instanceof User, 403);

        $url = $user->homeUrl();

        // Unknown role: refuse instead of redirecting in circles.
        abort_if($url === null, 403);

        // Never use the "intended" URL: it may belong to another role's panel
        // (e.g. a guest who opened /admin first, then logged in as a Member).
        if ($request->hasSession()) {
            $request->session()->forget('url.intended');
        }

        return redirect()->to($url);
    }
}

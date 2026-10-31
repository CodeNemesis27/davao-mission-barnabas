<?php

namespace App\Http\Responses;

use Filament\Auth\Http\Responses\Contracts\LogoutResponse as FilamentLogoutResponseContract;
use Illuminate\Http\RedirectResponse;

class FilamentLogoutResponse implements FilamentLogoutResponseContract
{
    /**
     * "Sign out" inside any Filament panel also lands on the Starter Kit login page.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request): RedirectResponse
    {
        return redirect()->route('login');
    }
}

<?php

namespace App\Actions\Fortify;

use App\Filament\Auth\MfaChallenge;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Panel;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;

class RedirectIfFilamentMfaEnabled extends RedirectIfTwoFactorAuthenticatable
{
    /**
     * Runs after the password is verified but before the user is logged in: users who turned on
     * Filament multi-factor authentication are sent to the challenge page of their panel first.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  callable  $next
     * @return mixed
     */
    public function handle($request, $next)
    {
        // Same credential check as Fortify's own two-factor step; a wrong login throws the usual error.
        $user = $this->validateCredentials($request);

        if (! $user instanceof User) {
            return $next($request);
        }

        $panelId = $user->homePanelId();
        $panel = $panelId === null ? null : Filament::getPanel($panelId);

        if (! $panel instanceof Panel || ! $this->hasEnabledProvider($panel, $user)) {
            return $next($request);
        }

        $request->session()->put(MfaChallenge::SESSION_KEY, [
            'id' => $user->getKey(),
            'panel' => $panel->getId(),
            'remember' => $request->boolean('remember'),
            'expires_at' => now()->addMinutes(MfaChallenge::TTL_MINUTES)->getTimestamp(),
        ]);

        return $request->wantsJson()
            ? response()->json(['two_factor' => true])
            : redirect()->to($panel->route('auth.mfa-challenge'));
    }

    protected function hasEnabledProvider(Panel $panel, User $user): bool
    {
        foreach ($panel->getMultiFactorAuthenticationProviders() as $provider) {
            if ($provider->isEnabled($user)) {
                return true;
            }
        }

        return false;
    }
}

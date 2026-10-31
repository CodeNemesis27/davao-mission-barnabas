<?php

namespace App\Filament\Auth;

use App\Models\User;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Auth\Pages\Login;
use Filament\Facades\Filament;
use Illuminate\Auth\SessionGuard;
use Illuminate\Contracts\Auth\Authenticatable;

/**
 * Multi-factor challenge for a login that started on the Starter Kit's /login page.
 *
 * Filament only challenges users on its own login page (disabled in this app), so this page
 * reuses that page's challenge form but takes the already password-verified user from the session.
 */
class MfaChallenge extends Login
{
    /**
     * Session key written by RedirectIfFilamentMfaEnabled once the password has been verified.
     */
    public const SESSION_KEY = 'filament_mfa';

    /**
     * How long a verified password may wait for its code.
     */
    public const TTL_MINUTES = 10;

    public function mount(): void
    {
        $signedInUser = Filament::auth()->user();

        if ($signedInUser instanceof User) {
            $this->redirectToRolePanel($signedInUser);

            return;
        }

        $user = $this->getUserUndertakingMultiFactorAuthentication();

        if (! $user instanceof User) {
            $this->redirect(route('login'));

            return;
        }

        $multiFactorChallenge = $this->getMultiFactorChallenge();

        if (! $multiFactorChallenge->hasEnabledProviders($user)) {
            session()->forget(static::SESSION_KEY);
            $this->redirect(route('login'));

            return;
        }

        // A filled value switches the inherited page from the credentials form to the challenge form.
        $this->userUndertakingMultiFactorAuthentication = encrypt([
            'identifier' => $user->getAuthIdentifier(),
            'userKey' => Filament::getUserScopedAuthIdentifier($user),
        ]);

        $multiFactorChallenge->beforeChallenge($user);

        $this->cacheSchema('multiFactorChallengeForm', null);
        $this->multiFactorChallengeForm->fill();
    }

    public function authenticate(): ?LoginResponse
    {
        $user = $this->getUserUndertakingMultiFactorAuthentication();

        if (! $user instanceof User) {
            $this->redirect(route('login'));

            return null;
        }

        $multiFactorChallenge = $this->getMultiFactorChallenge();

        // Re-checked right before validating: with no enabled factor an empty challenge would pass.
        if (! $multiFactorChallenge->hasEnabledProviders($user)) {
            session()->forget(static::SESSION_KEY);
            $this->redirect(route('login'));

            return null;
        }

        if ($this->isMultiFactorChallengeRateLimited($user)) {
            return null;
        }

        $this->cacheSchema('multiFactorChallengeForm', null);
        $this->multiFactorChallengeForm->validate();

        $pending = session(static::SESSION_KEY);
        $remember = is_array($pending) && (bool) ($pending['remember'] ?? false);

        /** @var SessionGuard $guard */
        $guard = Filament::auth();
        $guard->login($user, $remember);

        session()->regenerate();
        // Never reuse an "intended" URL: it may belong to another role's panel.
        session()->forget([static::SESSION_KEY, 'url.intended']);

        $this->redirectToRolePanel($user);

        return null;
    }

    /**
     * The user whose password was just verified on the Starter Kit login page (taken from the session).
     */
    protected function getUserUndertakingMultiFactorAuthentication(): ?Authenticatable
    {
        $pending = session(static::SESSION_KEY);
        $panel = Filament::getCurrentOrDefaultPanel();

        if (
            ! $panel
            || ! is_array($pending)
            || ! isset($pending['id'], $pending['panel'], $pending['expires_at'])
            || $pending['expires_at'] < now()->getTimestamp()
            || $pending['panel'] !== $panel->getId()
        ) {
            return null;
        }

        $user = User::query()->find($pending['id']);

        if (! $user instanceof User || ! $user->canAccessPanel($panel)) {
            return null;
        }

        return $user;
    }

    protected function redirectToRolePanel(User $user): void
    {
        $url = $user->homeUrl();

        abort_if($url === null, 403);

        $this->redirect($url);
    }
}

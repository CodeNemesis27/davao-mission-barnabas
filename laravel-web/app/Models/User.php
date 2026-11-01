<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthentication;
use Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthenticationRecovery;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthenticationRecovery;
use Filament\Facades\Filament;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasAppAuthentication, HasAppAuthenticationRecovery
{
    /** @use HasFactory<UserFactory> */
    use HasFactory,
        Notifiable,
        TwoFactorAuthenticatable,
        InteractsWithAppAuthentication,
        InteractsWithAppAuthenticationRecovery,
        HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        $initials = Str::initials($this->name, true);

        return Str::length($initials) > 1
            ? Str::substr($initials, 0, 1) . Str::substr($initials, -1)
            : $initials;
    }

    /**
     * Default values for new instances (mirrors the migration default), so `role`
     * is also populated on in-memory models, e.g. right after User::create() or in factories.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'Member',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function isClerk(): bool
    {
        return $this->role === 'Clerk';
    }

    public function isMember(): bool
    {
        return $this->role === 'Member';
    }

    public function usesStarterKit(): bool
    {
        return $this->isMember();
    }

    /**
     * Filament calls this for every panel request: a user may only enter the panel of their own role.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return match ($panel->getId()) {
            'admin' => $this->isAdmin(),
            'clerk' => $this->isClerk(),
            default => false,
        };
    }

    /**
     * ID of the Filament panel that belongs to this user's role (null for an unknown role).
     */
    public function homePanelId(): ?string
    {
        return match (true) {
            $this->isAdmin() => 'admin',
            $this->isClerk() => 'clerk',
            default => null,
        };
    }

    /**
     * URL of the panel that belongs to this user's role (null for an unknown role).
     */
    public function homePanelUrl(): ?string
    {
        $panelId = $this->homePanelId();

        return $panelId === null ? null : Filament::getPanel($panelId)?->getUrl();
    }

    public function homeUrl(): ?string
    {
        return $this->usesStarterKit() ? route('dashboard') : $this->homePanelUrl();
    }
}

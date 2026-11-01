# Backend setup: the login API (do this once in `laravel-web`)

The mobile app signs in by calling your Laravel app on Laravel Cloud. Laravel needs three small API endpoints
for that, secured with **Laravel Sanctum** personal access tokens:

| Method | URL           | Purpose                                         |
| ------ | ------------- | ----------------------------------------------- |
| POST   | `/api/login`  | Check email + password, return a token and user |
| GET    | `/api/user`   | Return the signed-in user (used on app start)   |
| POST   | `/api/logout` | Revoke the token that made the request          |

The app signs in with the same `users` table that your Filament admin panel uses, so any existing Filament user can log in.

> These files go in your **`laravel-web`** folder (this guide lives here only to keep all mobile work in one place).

---

## 1. Install the API scaffolding

From `laravel-web`:

```bash
php artisan install:api
```

This installs Sanctum, creates `routes/api.php`, registers it in `bootstrap/app.php`, and adds the
`personal_access_tokens` migration.

## 2. Let the `User` model issue tokens

`app/Models/User.php`:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable /* implements FilamentUser, etc. */
{
    use HasApiTokens, HasFactory, Notifiable; // <- add HasApiTokens
    // ...
}
```

## 3. Create the controller

```bash
php artisan make:controller Api/AuthController
```

`app/Http/Controllers/Api/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The email or password you entered is incorrect.'],
            ]);
        }

        $token = $user->createToken($credentials['device_name'] ?? 'mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
```

## 4. Add the routes

`routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// 6 attempts per minute per IP/email slows down password guessing.
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Next steps: churches and members endpoints go here.
});
```

## 5. Deploy to Laravel Cloud

1. Commit and push `laravel-web` to the branch Laravel Cloud deploys.
2. Make sure the environment's deploy commands include `php artisan migrate --force`
   (this creates the `personal_access_tokens` table).
3. Wait for the deployment to finish.

## 6. Test it before opening the app

Replace the email and password with a real Filament user:

```bash
curl -X POST https://davao-mission-barnabas-production-ivrwve.laravel.cloud/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password","device_name":"curl"}'
```

You should get back JSON with a `token` and a `user`. A wrong password returns HTTP `422` with an `errors.email` message,
which the app shows in the red banner on the login screen.

### Troubleshooting

- **404 on `/api/login`**: `routes/api.php` isn't registered or the deploy didn't finish. Re-run step 1 and redeploy.
- **500 error**: check Laravel Cloud logs; usually the migration from step 5 hasn't run.
- **App says "Can't reach the server"**: check the phone's internet and that `EXPO_PUBLIC_API_URL` in `.env` is correct.

### Optional: only allow certain users to sign in on mobile

If some Filament users should not use the app, check it in `login()` right after the password check, for example:

```php
if ($user->role !== 'admin') {
    throw ValidationException::withMessages(['email' => ['This account cannot sign in to the mobile app.']]);
}
```

# Davao Mission Barnabas: Mobile App

React Native (Expo) app for the Davao Mission Barnabas Laravel + FilamentPHP system.

**Status:** Step 1, login, is done. Next: Churches page, then Members page.

## What's in step 1

- Beautiful login screen: dawn sky, SVG church scene, twinkling stars, floating orbs, Playfair Display + Poppins fonts, animated inputs, shake-on-error, gradient button
- Real authentication against your Laravel Cloud app with Laravel Sanctum tokens
- Token stored in the device's encrypted storage (`expo-secure-store`), so users stay signed in
- Session restore and silent re-check on app start; automatic sign-out if the server rejects the token
- Home screen shown after login (Churches and Members cards are placeholders for the next steps)
- Branded app icon, adaptive icon and splash screen

## 1. Prepare the backend (once)

The app needs `/api/login`, `/api/user` and `/api/logout` in `laravel-web`.
Follow **[BACKEND-SETUP.md](./BACKEND-SETUP.md)**, then deploy to Laravel Cloud.

## 2. Run the app

```bash
cd react-native-mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (it must support Expo SDK 58), or press `a` to open an Android emulator.

The API address is set in `.env`:

```
EXPO_PUBLIC_API_URL=https://davao-mission-barnabas-production-ivrwve.laravel.cloud
```

Restart `npx expo start` after changing it (add `--clear` if the old value sticks).

If `npm install` reports version mismatches, run `npx expo install --check` and let Expo fix them.

## 3. Build the APK

The cloud build needs no Android Studio. You need a free Expo account.

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure     # first time only, links the project to your Expo account
npx eas-cli@latest build --platform android --profile preview
```

The `preview` profile in `eas.json` produces an installable **.apk**. When the build finishes, EAS gives you a
download link and QR code. Open it on the phone and install (allow "install unknown apps" if asked).

> The `production` profile builds an `.aab`, which is the format Google Play requires.
> The Android package name is `com.davaomission.barnabas`. Change it in `app.json` before your first
> store release if you want a different one.

## Project structure

```
react-native-mobile/
├── app.json              Expo config (name, icons, splash, package id)
├── eas.json              Build profiles (preview = APK)
├── .env                  EXPO_PUBLIC_API_URL
├── assets/               App icon, adaptive icon, splash image
└── src/
    ├── app/              Routes (Expo Router: one file = one screen)
    │   ├── _layout.tsx   Fonts, splash, auth gate (signed in -> index, signed out -> login)
    │   ├── login.tsx
    │   └── index.tsx     Home
    ├── screens/          Screen UIs (LoginScreen, HomeScreen)
    ├── components/       ChurchHero, Stars, FloatingOrbs, AppInput, GradientButton
    ├── context/          AuthContext (signIn, signOut, session restore)
    ├── api/              client.ts (axios + token + errors), auth.ts (login, user, logout)
    ├── utils/            session.ts (secure token storage)
    ├── config/           env.ts (API URL)
    └── theme/            Colors, gradients, font names
```

## How to add the next pages

1. Add an endpoint in `laravel-web`, for example `GET /api/churches` inside the `auth:sanctum` group.
2. Add `src/api/churches.ts` using the shared `api` client (the token is attached automatically).
3. Add `src/screens/ChurchesScreen.tsx` and a route file `src/app/churches.tsx`.
4. Register it in `src/app/_layout.tsx` inside the `Stack.Protected guard={isSignedIn}` block.

## Useful commands

| Command             | What it does          |
| ------------------- | --------------------- |
| `npx expo start`    | Start the dev server  |
| `npm run typecheck` | Type-check the code   |
| `npx expo-doctor`   | Diagnose project setup|

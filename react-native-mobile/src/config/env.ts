/**
 * Where the Laravel (FilamentPHP) backend lives.
 *
 * Override it by setting EXPO_PUBLIC_API_URL in the `.env` file
 * (for example to point at a local server while developing).
 * The production Laravel Cloud URL is used when nothing is set.
 */
const DEFAULT_API_URL = 'https://davao-mission-barnabas-production-ivrwve.laravel.cloud';

/** Base URL of the Laravel app, without a trailing slash. */
export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

/** Every API call goes through Laravel's `/api` prefix. */
export const API_BASE_URL = `${API_URL}/api`;

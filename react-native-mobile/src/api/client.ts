import axios from 'axios';

import { API_BASE_URL } from '@/config/env';

/**
 * One axios instance for the whole app.
 * The token lives in memory here (it is persisted separately in secure storage),
 * and is attached to every request as a Bearer token for Laravel Sanctum.
 */
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Called when the server answers 401 for a signed-in user (expired or revoked token). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

type LaravelErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

/** Turns any thrown error into a short, friendly sentence for the UI. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<LaravelErrorBody>(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
    if (!error.response) {
      return "Can't reach the server. Check your internet connection and try again.";
    }

    const { status, data } = error.response;
    if (status === 404) {
      return 'The login service was not found on the server. Make sure the API has been deployed.';
    }
    if (status === 429) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    if (status >= 500) {
      return 'The server ran into a problem. Please try again in a moment.';
    }

    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return firstFieldError ?? data?.message ?? 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

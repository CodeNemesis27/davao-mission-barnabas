import * as SecureStore from 'expo-secure-store';

import type { User } from '@/api/auth';

/**
 * The login token is kept in the device's encrypted storage
 * (Android Keystore / iOS Keychain) so the user stays signed in between launches.
 */
const TOKEN_KEY = 'dmb_auth_token';
const USER_KEY = 'dmb_auth_user';

export type StoredSession = {
  token: string;
  user: User;
};

export async function saveSession(token: string, user: User): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const rawUser = await SecureStore.getItemAsync(USER_KEY);
    if (!token || !rawUser) {
      return null;
    }
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    // Corrupted or unreadable data: behave as if nobody is signed in.
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // Nothing else to do; the in-memory session is already cleared by the caller.
  }
}

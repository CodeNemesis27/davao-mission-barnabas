import { Platform } from 'react-native';

import { api } from './client';

export type User = {
  id: number;
  name: string;
  email: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: User;
};

/** POST /api/login  ->  { message, token, user } */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', {
    email: email.trim(),
    password,
    device_name: `${Platform.OS}-app`,
  });
  return data;
}

/** GET /api/user  ->  { user }  (requires the Bearer token) */
export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/user');
  return data.user;
}

/** POST /api/logout  (revokes the current token on the server) */
export async function logout(): Promise<void> {
  await api.post('/logout');
}

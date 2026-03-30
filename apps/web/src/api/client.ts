import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });

export type Role = 'LISTENER' | 'ARTIST' | 'VERIFIED_ARTIST' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  isSuspended: boolean;
  termsAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  role?: Role;
  termsAccepted?: boolean;
};

export async function loginRequest(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function signupRequest(input: SignupInput) {
  const { data } = await api.post<AuthResponse>('/auth/signup', input);
  return data;
}

export function extractApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

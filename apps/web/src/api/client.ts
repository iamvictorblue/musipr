import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });
const refreshApi = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api' });

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

export type RefreshTokensResponse = Pick<AuthResponse, 'accessToken' | 'refreshToken'>;

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

type AuthClientConfig = {
  getRefreshToken: () => string | null;
  onRefresh: (tokens: RefreshTokensResponse) => void;
  onUnauthorized: () => void;
};

type RetryableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

const authClientConfig: AuthClientConfig = {
  getRefreshToken: () => null,
  onRefresh: () => undefined,
  onUnauthorized: () => undefined
};

let refreshPromise: Promise<RefreshTokensResponse> | null = null;

export function configureAuthClient(config: Partial<AuthClientConfig>) {
  if (config.getRefreshToken) authClientConfig.getRefreshToken = config.getRefreshToken;
  if (config.onRefresh) authClientConfig.onRefresh = config.onRefresh;
  if (config.onUnauthorized) authClientConfig.onUnauthorized = config.onUnauthorized;
}

export function setApiAccessToken(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & RetryableRequestConfig;
    const requestUrl = originalRequest.url ?? '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup') || requestUrl.includes('/auth/refresh');

    if (isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = authClientConfig.getRefreshToken();
    if (!refreshToken) {
      authClientConfig.onUnauthorized();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshApi
        .post<RefreshTokensResponse>('/auth/refresh', { refreshToken })
        .then((response) => response.data)
        .finally(() => {
          refreshPromise = null;
        });

      const tokens = await refreshPromise;
      authClientConfig.onRefresh(tokens);
      const nextHeaders = new axios.AxiosHeaders(originalRequest.headers);
      nextHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);
      originalRequest.headers = nextHeaders;

      return api(originalRequest);
    } catch (refreshError) {
      authClientConfig.onUnauthorized();
      return Promise.reject(refreshError);
    }
  }
);

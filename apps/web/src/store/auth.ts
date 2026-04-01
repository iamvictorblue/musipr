import { create } from 'zustand';
import {
  api,
  configureAuthClient,
  loginRequest,
  setApiAccessToken,
  signupRequest,
  type AuthResponse,
  type AuthUser,
  type LoginInput,
  type RefreshTokensResponse,
  type SignupInput
} from '../api/client';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: AuthResponse) => void;
  updateTokens: (tokens: RefreshTokensResponse) => void;
  clearSession: () => void;
  login: (input: LoginInput) => Promise<AuthResponse>;
  signup: (input: SignupInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

type PersistedAuthState = Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'>;

const STORAGE_KEY = 'musipr.auth';

function readStoredSession(): PersistedAuthState {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function writeStoredSession(session: PersistedAuthState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function setApiAuthHeader(accessToken: string | null) {
  setApiAccessToken(accessToken);
}

const initialSession = readStoredSession();
setApiAuthHeader(initialSession.accessToken);

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialSession,
  setSession: (session) => {
    const nextState: PersistedAuthState = {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    };

    writeStoredSession(nextState);
    setApiAuthHeader(nextState.accessToken);
    set(nextState);
  },
  updateTokens: (tokens) => {
    const current = get();
    const nextState: PersistedAuthState = {
      user: current.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };

    writeStoredSession(nextState);
    setApiAuthHeader(nextState.accessToken);
    set(nextState);
  },
  clearSession: () => {
    const nextState: PersistedAuthState = { user: null, accessToken: null, refreshToken: null };
    writeStoredSession(nextState);
    setApiAuthHeader(null);
    set(nextState);
  },
  async login(input) {
    const session = await loginRequest(input);
    get().setSession(session);
    return session;
  },
  async signup(input) {
    const session = await signupRequest(input);
    get().setSession(session);
    return session;
  },
  async logout() {
    const userId = get().user?.id;

    try {
      if (userId) {
        await api.post('/auth/logout', { userId });
      }
    } finally {
      get().clearSession();
    }
  }
}));

configureAuthClient({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onRefresh: (tokens) => {
    useAuthStore.getState().updateTokens(tokens);
  },
  onUnauthorized: () => {
    useAuthStore.getState().clearSession();
  }
});

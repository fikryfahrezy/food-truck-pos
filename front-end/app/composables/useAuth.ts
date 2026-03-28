import { computed, readonly } from "vue";
import { useState, useRuntimeConfig } from "#imports";
import {
  authLogin,
  authVerifyPin,
  authSelectOutlet,
  authLogout,
} from "~/api/auth";
import type { AuthUser, Outlet } from "~/types";

const AUTH_TOKEN_KEY = "fjb_auth_token";
const AUTH_USER_KEY = "fjb_auth_user";
const AUTH_OUTLET_KEY = "fjb_auth_outlet";

function readStorage<T>(key: string): T | null {
  if (import.meta.server) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (import.meta.server) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function clearStorage(...keys: string[]) {
  if (import.meta.server) return;
  keys.forEach((k) => localStorage.removeItem(k));
}

export function useAuth() {
  const config = useRuntimeConfig();
  const API = config.public.apiBase as string;

  // Shared state using useState for SSR-safe reactivity
  const token = useState<string | null>("auth.token", () =>
    readStorage<string>(AUTH_TOKEN_KEY),
  );
  const user = useState<AuthUser | null>("auth.user", () =>
    readStorage<AuthUser>(AUTH_USER_KEY),
  );
  const outlet = useState<Outlet | null>("auth.outlet", () =>
    readStorage<Outlet>(AUTH_OUTLET_KEY),
  );
  const pendingUserId = useState<string | null>(
    "auth.pendingUserId",
    () => null,
  );
  const pendingFullName = useState<string | null>(
    "auth.pendingFullName",
    () => null,
  );

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  async function login(username: string) {
    const data = await authLogin(API, username);
    pendingUserId.value = data.user_id;
    pendingFullName.value = data.full_name;
    return data;
  }

  async function verifyPin(pin: string) {
    const data = await authVerifyPin(API, pendingUserId.value, pin);
    token.value = data.access_token;
    user.value = data.user;
    writeStorage(AUTH_TOKEN_KEY, data.access_token);
    writeStorage(AUTH_USER_KEY, data.user);
    return data;
  }

  async function selectOutlet(outletId: string) {
    const data = await authSelectOutlet(API, token.value, outletId);
    token.value = data.access_token;
    outlet.value = {
      id: data.outlet.id,
      name: data.outlet.name,
      city: data.outlet.city,
    };
    writeStorage(AUTH_TOKEN_KEY, data.access_token);
    writeStorage(AUTH_OUTLET_KEY, outlet.value);
    return data;
  }

  async function logout() {
    try {
      await authLogout(API, token.value);
    } catch {
      // Ignore logout errors
    } finally {
      token.value = null;
      user.value = null;
      outlet.value = null;
      pendingUserId.value = null;
      pendingFullName.value = null;
      clearStorage(AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_OUTLET_KEY);
    }
  }

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  }

  return {
    token: readonly(token),
    user: readonly(user),
    outlet: readonly(outlet),
    pendingUserId: readonly(pendingUserId),
    pendingFullName: readonly(pendingFullName),
    isAuthenticated,
    login,
    verifyPin,
    selectOutlet,
    logout,
    authHeaders,
  };
}

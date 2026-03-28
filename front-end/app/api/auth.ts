import type {
  LoginResponse,
  AuthUser,
  SelectOutletResponse,
  City,
} from "~/types";

export function authLogin(api: string, username: string) {
  return $fetch<LoginResponse>(`${api}/v1/auth/login`, {
    method: "POST",
    body: { username },
  });
}

export function authVerifyPin(api: string, userId: string | null, pin: string) {
  return $fetch<{ access_token: string; user: AuthUser }>(
    `${api}/v1/auth/pin`,
    {
      method: "POST",
      body: { user_id: userId, pin },
    },
  );
}

export function authSelectOutlet(
  api: string,
  token: string | null,
  outletId: string,
) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return $fetch<SelectOutletResponse>(`${api}/v1/auth/select-outlet`, {
    method: "POST",
    headers,
    body: { outlet_id: outletId },
  });
}

export function authLogout(api: string, token: string | null) {
  return $fetch(`${api}/v1/auth/logout`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function authGetCities(api: string) {
  return $fetch<{ cities: City[] }>(`${api}/v1/auth/cities`);
}

export function authGetOutlets(api: string, cityId: string) {
  return $fetch<{ outlets: { id: string; name: string }[] }>(
    `${api}/v1/auth/outlets?city_id=${cityId}`,
  );
}

import { http, HttpResponse, delay } from "msw";
import { MOCK_USERS } from "../data";

function makeToken(userId: string, role: string, outletId?: string) {
  return `mock-jwt.${btoa(JSON.stringify({ sub: userId, role, outletId }))}.sig`;
}

// Track failed PIN attempts per user
const pinFailCounts: Record<string, number> = {};
const lockedUntil: Record<string, number> = {};

export function createAuthHandlers(origin: string) {
  const base = `${origin}/v1`;
  return [
    // POST /auth/login
    http.post(`${base}/auth/login`, async ({ request }) => {
      await delay(300);
      const body = (await request.json()) as { username: string };
      const user = MOCK_USERS.find((u) => u.username === body.username);
      if (!user) {
        return HttpResponse.json(
          { error: "USER_NOT_FOUND", message: "Username not found" },
          { status: 404 },
        );
      }
      return HttpResponse.json({
        user_id: user.id,
        full_name: user.full_name,
        requires_pin: true,
      });
    }),

    // POST /auth/pin
    http.post(`${base}/auth/pin`, async ({ request }) => {
      await delay(300);
      const body = (await request.json()) as { user_id: string; pin: string };
      const user = MOCK_USERS.find((u) => u.id === body.user_id);
      if (!user) {
        return HttpResponse.json(
          { error: "USER_NOT_FOUND", message: "User not found" },
          { status: 404 },
        );
      }

      const lockExpiry = lockedUntil[user.id];
      if (lockExpiry && Date.now() < lockExpiry) {
        return HttpResponse.json(
          {
            error: "ACCOUNT_LOCKED",
            message: "Account locked due to too many failed attempts",
            locked_until: new Date(lockExpiry).toISOString(),
          },
          { status: 423 },
        );
      }

      if (body.pin !== user.pin) {
        pinFailCounts[user.id] = (pinFailCounts[user.id] ?? 0) + 1;
        const remaining = 3 - (pinFailCounts[user.id] ?? 0);
        if (remaining <= 0) {
          lockedUntil[user.id] = Date.now() + 5 * 60 * 1000;
          pinFailCounts[user.id] = 0;
        }
        return HttpResponse.json(
          {
            error: "INVALID_PIN",
            message: "Incorrect PIN",
            attempts_remaining: Math.max(remaining, 0),
          },
          { status: 401 },
        );
      }

      pinFailCounts[user.id] = 0;
      return HttpResponse.json({
        access_token: makeToken(user.id, user.role),
        token_type: "Bearer",
        expires_in: 28800,
        user: { id: user.id, full_name: user.full_name, role: user.role },
      });
    }),

    // POST /auth/logout
    http.post(`${base}/auth/logout`, async () => {
      await delay(100);
      return new HttpResponse(null, { status: 204 });
    }),

    // GET /auth/cities
    http.get(`${base}/auth/cities`, async () => {
      await delay(200);
      const { MOCK_CITIES } = await import("../data");
      return HttpResponse.json({ cities: MOCK_CITIES });
    }),

    // GET /auth/outlets
    http.get(`${base}/auth/outlets`, async ({ request }) => {
      await delay(200);
      const url = new URL(request.url);
      const cityId = url.searchParams.get("city_id");
      const { MOCK_OUTLETS } = await import("../data");
      const outlets = cityId
        ? MOCK_OUTLETS.filter((o) => o.city_id === cityId)
        : MOCK_OUTLETS;
      return HttpResponse.json({
        outlets: outlets.map(({ id, name }) => ({ id, name })),
      });
    }),

    // POST /auth/select-outlet
    http.post(`${base}/auth/select-outlet`, async ({ request }) => {
      await delay(200);
      const body = (await request.json()) as { outlet_id: string };
      const { MOCK_OUTLETS, MOCK_CITIES } = await import("../data");
      const outlet = MOCK_OUTLETS.find((o) => o.id === body.outlet_id);
      if (!outlet) {
        return HttpResponse.json(
          { error: "OUTLET_NOT_FOUND", message: "Outlet not found" },
          { status: 404 },
        );
      }
      const city = MOCK_CITIES.find((c) => c.id === outlet.city_id);
      return HttpResponse.json({
        access_token: makeToken("usr_01", "cashier", outlet.id),
        outlet: { id: outlet.id, name: outlet.name, city: city?.name ?? "" },
      });
    }),
  ];
}

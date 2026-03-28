import { expect, test } from "@playwright/test";
import { flows, signInAndChooseOutlet } from "./helpers/auth";

test.describe("kitchen workflow @smoke", () => {
  test("moves a new order into pickup progression", async ({ page }) => {
    await signInAndChooseOutlet(page, flows.kitchen);

    const orderCard = page
      .locator("div.rounded-lg.bg-white")
      .filter({ hasText: "Order No #00002" })
      .first();

    await expect(orderCard).toBeVisible();
    await expect(
      orderCard.getByRole("button", { name: "Proses" }),
    ).toBeVisible();

    await orderCard.getByRole("button", { name: "Proses" }).click();
    await expect(
      orderCard.getByRole("button", { name: "Ready to Pickup" }),
    ).toBeVisible();

    await orderCard.getByRole("button", { name: "Ready to Pickup" }).click();
    await expect(
      orderCard.getByRole("button", { name: "Complete" }),
    ).toBeVisible();
    await expect(
      orderCard.getByRole("button", { name: "Remind Pickup" }),
    ).toBeVisible();
  });
});

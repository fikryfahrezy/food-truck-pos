import { expect, test } from "@playwright/test";
import { flows, signInAndChooseOutlet } from "./helpers/auth";

test.describe("report interactions @smoke", () => {
  test("shows report filters and supports granularity toggle", async ({
    page,
  }) => {
    await signInAndChooseOutlet(page, flows.admin);

    await expect(page.getByRole("heading", { name: "Report" })).toBeVisible();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
    await expect(page.getByText("Voucher Program Impact")).toBeVisible();
    await expect(page.getByText("City/Outlet Performance")).toBeVisible();

    await page.getByRole("button", { name: "Daily" }).click();

    await expect(page.getByRole("button", { name: "Hourly" })).toBeVisible();
    await expect(
      page.getByLabel(
        "Sales trends line chart showing product sales over time",
      ),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Jakarta" })).toBeVisible();
  });
});

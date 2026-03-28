import { expect, test } from "@playwright/test";
import { flows, signInAndChooseOutlet } from "./helpers/auth";

test.describe("mocked auth journeys @smoke", () => {
  test("shows an error for an unknown username", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Enter username").fill("unknown-user");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByText(/Username (not found|tidak ditemukan)/),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("routes cashier users to the POS screen", async ({ page }) => {
    await signInAndChooseOutlet(page, flows.cashier);

    await expect(page.getByText("Food Truck Jajanan Bango JKT")).toBeVisible();
    await expect(page.getByText("Pilih Item")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lanjut Bayar" }),
    ).toBeVisible();
  });

  test("routes admin users to the report screen", async ({ page }) => {
    await signInAndChooseOutlet(page, flows.admin);

    await expect(page.getByRole("heading", { name: "Report" })).toBeVisible();
    await expect(page.getByText("Summary")).toBeVisible();
    await expect(page.getByText("Product Performance")).toBeVisible();
  });

  test("routes kitchen users to the kitchen board", async ({ page }) => {
    await signInAndChooseOutlet(page, flows.kitchen);

    await expect(page.getByText("Food Truck Jajanan Bango JKT")).toBeVisible();
    await expect(page.getByText("Sisa Produk Hari Ini")).toBeVisible();
    await expect(page.getByText("NEW ORDER")).toBeVisible();
  });
});

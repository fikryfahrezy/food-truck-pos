import { expect, type Page } from "@playwright/test";

export type UserFlow = {
  username: string;
  pin: string;
  city: string;
  outlet: string;
  destination: string;
};

export const flows = {
  cashier: {
    username: "kamal",
    pin: "1234",
    city: "Jakarta",
    outlet: "Food Truck Jajanan Bango JKT",
    destination: "/cashier",
  },
  admin: {
    username: "admin",
    pin: "9999",
    city: "Jakarta",
    outlet: "Food Truck Jajanan Bango JKT",
    destination: "/report",
  },
  kitchen: {
    username: "fajar",
    pin: "5678",
    city: "Jakarta",
    outlet: "Food Truck Jajanan Bango JKT",
    destination: "/kitchen",
  },
} satisfies Record<string, UserFlow>;

export async function chooseSelectOption(
  page: Page,
  triggerId: string,
  optionName: string,
) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

export async function signInAndChooseOutlet(page: Page, flow: UserFlow) {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await page.getByPlaceholder("Enter username").fill(flow.username);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/pin$/);

  for (const digit of flow.pin) {
    await page.getByRole("button", { name: `Enter digit ${digit}` }).click();
  }

  await expect(page).toHaveURL(/\/select-outlet$/);
  await expect(page.getByText("Welcome", { exact: false })).toBeVisible();

  await chooseSelectOption(page, "city-select", flow.city);
  await chooseSelectOption(page, "outlet-select", flow.outlet);

  await page
    .getByRole("button", { name: "Continue to selected outlet" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${flow.destination}$`));
}

import { expect, test, type Page } from "@playwright/test";
import { flows, signInAndChooseOutlet } from "./helpers/auth";

test.describe("cashier checkout flows @smoke", () => {
  async function addProductAndOpenConfirmation(
    page: Page,
    productName: string,
  ) {
    await signInAndChooseOutlet(page, flows.cashier);

    const productCard = page
      .locator(
        "div.bg-white.rounded-lg.overflow-hidden.border.border-gray-100.flex.flex-col",
      )
      .filter({ hasText: productName })
      .first();

    await expect(productCard).toBeVisible();
    await productCard.getByRole("button", { name: "Tambahkan" }).click();

    const proceedButton = page.getByRole("button", { name: "Lanjut Bayar" });
    await expect(proceedButton).toBeEnabled();
    await proceedButton.click();

    await expect(page).toHaveURL(/\/cashier\/confirm$/);
    await expect(page.getByText("Confirmation")).toBeVisible();
  }

  test("completes a cash order and clears the cart", async ({ page }) => {
    await addProductAndOpenConfirmation(page, "Mienta Bakmi");

    await page.getByPlaceholder("Isi Nama Pemesan").fill("Budi");
    await page.getByRole("button", { name: "Cash" }).click();
    await page.getByRole("button", { name: "Konfirmasi Pembayaran" }).click();

    await expect(page).toHaveURL(/\/cashier$/);
    await expect(page.getByText("Belum ada item")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lanjut Bayar" }),
    ).toBeDisabled();
  });

  test.fixme("completes a QRIS order after payment is confirmed", async ({
    page,
  }) => {
    await addProductAndOpenConfirmation(page, "Jus Alpukat");

    await page.getByPlaceholder("Isi Nama Pemesan").fill("Sari");
    await page.getByRole("button", { name: "Konfirmasi Pembayaran" }).click();

    await expect(page).toHaveURL(/\/cashier\/payment\?order_id=/);
    await expect(page.getByText("Payment")).toBeVisible();
    await expect(page.getByText("Menunggu pembayaran...")).toBeVisible();
    await expect(page.getByText("Pembayaran berhasil")).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: "Selesai" }).click();

    await expect(page).toHaveURL(/\/cashier$/);
    await expect(page.getByText("Belum ada item")).toBeVisible();
  });
});

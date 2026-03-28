/**
 * Format amount in cents to Indonesian Rupiah display string.
 * API amounts are integers in IDR cents (value × 100).
 * Example: 9817500 → "Rp 98.175"
 */
export function formatRupiah(amountInCents: number): string {
  const amount = Math.round(amountInCents / 100);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a Date to Indonesian long date string.
 * Example: "Selasa, 12 Agustus 2025"
 */
export function formatTanggal(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format a Date or ISO string to HH:MM time.
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Pad order number to 5 digits, prefixed with #.
 */
export function formatOrderNumber(num: string | number): string {
  return `#${String(num).padStart(5, "0")}`;
}

/**
 * Calculate order totals from subtotal in cents.
 */
export function calculateOrderTotals(subtotalCents: number) {
  const serviceCharge = Math.round(subtotalCents * 0.05);
  const taxPb1 = Math.round(subtotalCents * 0.1);
  const total = subtotalCents + serviceCharge + taxPb1;
  return { subtotal: subtotalCents, serviceCharge, taxPb1, total };
}

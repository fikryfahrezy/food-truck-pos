import type { Product, Order, Category } from "~/types";

// ─── Users ───────────────────────────────────────────────────────────────────

export const MOCK_USERS = [
  {
    id: "usr_01",
    username: "kamal",
    pin: "1234",
    full_name: "Kamal",
    role: "cashier" as const,
  },
  {
    id: "usr_02",
    username: "fajar",
    pin: "5678",
    full_name: "Fajar",
    role: "kitchen" as const,
  },
  {
    id: "usr_03",
    username: "admin",
    pin: "9999",
    full_name: "Admin",
    role: "admin" as const,
  },
];

// ─── Cities & Outlets ────────────────────────────────────────────────────────

export const MOCK_CITIES = [
  { id: "city_01", name: "Jakarta" },
  { id: "city_02", name: "Bandung" },
  { id: "city_03", name: "Surabaya" },
  { id: "city_04", name: "Semarang" },
  { id: "city_05", name: "Solo" },
];

export const MOCK_OUTLETS = [
  { id: "out_01", city_id: "city_01", name: "Food Truck Jajanan Bango JKT" },
  { id: "out_02", city_id: "city_01", name: "Food Truck Jajanan Bango BSD" },
  {
    id: "out_03",
    city_id: "city_02",
    name: "Food Truck Jajanan Bango Bandung",
  },
  {
    id: "out_04",
    city_id: "city_03",
    name: "Food Truck Jajanan Bango Surabaya",
  },
];

// ─── Categories ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_01", name: "Makanan", display_order: 1 },
  { id: "cat_02", name: "Minuman", display_order: 2 },
];

// ─── Products ────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_01",
    name: "Mienta Bakmi",
    price: 2500000,
    category_id: "cat_01",
    category_name: "Makanan",
    image_url: null,
    stock_quantity: 20,
    is_available: true,
  },
  {
    id: "prod_02",
    name: "Nasi Goreng Saikoro",
    price: 3000000,
    category_id: "cat_01",
    category_name: "Makanan",
    image_url: null,
    stock_quantity: 20,
    is_available: true,
  },
  {
    id: "prod_03",
    name: "Roti Mochi Ayam Kecap",
    price: 2500000,
    category_id: "cat_01",
    category_name: "Makanan",
    image_url: null,
    stock_quantity: 20,
    is_available: true,
  },
  {
    id: "prod_04",
    name: "Iced Coffee Malika",
    price: 2500000,
    category_id: "cat_02",
    category_name: "Minuman",
    image_url: null,
    stock_quantity: 0,
    is_available: false,
  },
  {
    id: "prod_05",
    name: "Es Teh Manis",
    price: 1000000,
    category_id: "cat_02",
    category_name: "Minuman",
    image_url: null,
    stock_quantity: 30,
    is_available: true,
  },
  {
    id: "prod_06",
    name: "Jus Alpukat",
    price: 1500000,
    category_id: "cat_02",
    category_name: "Minuman",
    image_url: null,
    stock_quantity: 15,
    is_available: true,
  },
];

// ─── Orders (in-memory state for kitchen demo) ────────────────────────────────

let orderCounter = 2;

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    order_number: "00001",
    outlet_id: "out_01",
    source: "cashier",
    order_type: "dine_in",
    table_number: "3",
    customer_name: "Fajar Syarief",
    customer_wa: "628123456789",
    status: "processing",
    payment_status: "paid",
    payment_method: "qris",
    items: [
      {
        id: "oi_001",
        product_id: "prod_03",
        product_name: "Roti Mochi Ayam Kecap",
        product_price: 2500000,
        quantity: 1,
        notes: "",
        line_total: 2500000,
      },
      {
        id: "oi_002",
        product_id: "prod_02",
        product_name: "Nasi Goreng Saikoro",
        product_price: 3000000,
        quantity: 2,
        notes: "tidak pedas",
        line_total: 6000000,
      },
    ],
    subtotal: 8500000,
    service_charge: 425000,
    tax_pb1: 892500,
    total_amount: 9817500,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_002",
    order_number: "00002",
    outlet_id: "out_01",
    source: "cashier",
    order_type: "take_away",
    table_number: null,
    customer_name: "Budi Santoso",
    customer_wa: "628987654321",
    status: "new",
    payment_status: "paid",
    payment_method: "cash",
    items: [
      {
        id: "oi_003",
        product_id: "prod_01",
        product_name: "Mienta Bakmi",
        product_price: 2500000,
        quantity: 2,
        notes: "",
        line_total: 5000000,
      },
    ],
    subtotal: 5000000,
    service_charge: 250000,
    tax_pb1: 525000,
    total_amount: 5775000,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export function getNextOrderNumber(): string {
  orderCounter++;
  return String(orderCounter).padStart(5, "0");
}

export function addOrder(order: Order) {
  MOCK_ORDERS.push(order);
}

// ─── Active payments (in-memory) ─────────────────────────────────────────────

export const MOCK_PAYMENTS: Record<
  string,
  { status: "pending" | "paid" | "failed" | "expired"; expires_at: string }
> = {};

export function simulatePaymentSuccess(paymentId: string, delayMs = 8000) {
  setTimeout(() => {
    if (MOCK_PAYMENTS[paymentId]) {
      MOCK_PAYMENTS[paymentId].status = "paid";
      const order = MOCK_ORDERS.find(
        (o) => o.id === `ord_${paymentId.slice(-3)}`,
      );
      if (order) {
        order.payment_status = "paid";
        order.status = "new";
      }
    }
  }, delayMs);
}

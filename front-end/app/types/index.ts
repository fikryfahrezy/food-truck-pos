// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  user_id: string;
  full_name: string;
  requires_pin: boolean;
}

export interface PinResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    full_name: string;
    role: UserRole;
  };
}

export interface City {
  id: string;
  name: string;
}

export interface Outlet {
  id: string;
  name: string;
  city?: string;
}

export interface SelectOutletResponse {
  access_token: string;
  outlet: {
    id: string;
    name: string;
    city: string;
  };
}

export type UserRole = "cashier" | "kitchen" | "admin";

export interface AuthUser {
  id: string;
  full_name: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  outlet: Outlet | null;
  pendingUserId: string | null;
  pendingFullName: string | null;
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category_name: string;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
}

// ─── Cart / Order Items ───────────────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string;
}

export type OrderType = "dine_in" | "take_away";
export type PaymentMethod = "qris" | "gopay" | "cash";
export type OrderStatus =
  | "new"
  | "processing"
  | "pickup"
  | "complete"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  outlet_id: string;
  source: "cashier" | "kiosk";
  order_type: OrderType;
  table_number: string | null;
  customer_name: string;
  customer_wa: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  service_charge: number;
  tax_pb1: number;
  total_amount: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateOrderRequest {
  outlet_id: string;
  source: "cashier" | "kiosk";
  order_type: OrderType;
  table_number?: string;
  customer_name: string;
  customer_wa: string;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: string;
    quantity: number;
    notes: string;
  }>;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentInitiateResponse {
  payment_id: string;
  order_id: string;
  payment_method: PaymentMethod;
  qr_string?: string;
  qr_image_url?: string | null;
  amount: number;
  expires_at?: string;
  status?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  status: PaymentStatus;
  expires_at: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportSummary {
  period: { start: string; end: string };
  total_sales: number;
  total_transactions: number;
  total_buyers: number;
  codes_redeemed: number;
  top_city: string;
  top_outlet: string;
}

export interface ReportProduct {
  id: string;
  name: string;
  image_url: string | null;
  quantity_sold: number;
}

export interface SalesTrendPoint {
  timestamp: string;
  amount: number;
}

export interface SalesTrendSeries {
  product_id: string;
  product_name: string;
  data: SalesTrendPoint[];
}

export interface SalesTrendsResponse {
  granularity: "hourly" | "daily";
  series: SalesTrendSeries[];
}

export interface OutletReportRow {
  city: string;
  outlet: string;
  total_sales: number;
  transactions: number;
  codes_redeemed: number;
  products: Array<{ product_id: string; name: string; quantity: number }>;
}

export interface VoucherImpact {
  total_codes_used: number;
  total_sales_with_code: number;
  avg_order_with_code: number;
  avg_order_without_code: number;
  uplift_percentage: number;
}

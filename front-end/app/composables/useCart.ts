import { computed, readonly } from "vue";
import { useState } from "#imports";
import type { CartItem, OrderType } from "~/types";
import { calculateOrderTotals } from "~/utils/format";

export function useCart() {
  const items = useState<CartItem[]>("cart.items", () => []);
  const orderType = useState<OrderType>("cart.orderType", () => "dine_in");

  function addItem(product: { id: string; name: string; price: number }) {
    const existing = items.value.find((i) => i.product_id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value = [
        ...items.value,
        {
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: 1,
          notes: "",
        },
      ];
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.product_id !== productId);
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    const item = items.value.find((i) => i.product_id === productId);
    if (item) item.quantity = qty;
  }

  function updateNotes(productId: string, notes: string) {
    const item = items.value.find((i) => i.product_id === productId);
    if (item) item.notes = notes;
  }

  function clearCart() {
    items.value = [];
    orderType.value = "dine_in";
  }

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.product_price * i.quantity, 0),
  );
  const totals = computed(() => calculateOrderTotals(subtotal.value));
  const itemCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0),
  );

  return {
    items: readonly(items),
    orderType,
    subtotal,
    totals,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
  };
}

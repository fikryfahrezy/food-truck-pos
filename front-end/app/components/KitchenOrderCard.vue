<script setup lang="ts">
import { computed } from "vue";
import type { Order, OrderStatus } from "~/types";
import { formatTime } from "~/utils/format";

const props = defineProps<{
  order: Order;
  column: "new" | "processing" | "pickup" | "complete";
}>();

const emit = defineEmits<{
  action: [orderId: string, newStatus: OrderStatus];
  remind: [orderId: string];
}>();

const actionMap: Record<
  string,
  { label: string; status: OrderStatus; color: "warning" | "info" | "success" }
> = {
  new: { label: "Proses", status: "processing", color: "warning" },
  processing: { label: "Ready to Pickup", status: "pickup", color: "info" },
  pickup: { label: "Complete", status: "complete", color: "success" },
};

const action = computed(() => actionMap[props.column]);
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
    <!-- Order header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-printer" class="text-sm text-gray-400" />
        <span class="text-sm font-semibold text-gray-900"
          >Order No #{{ order.order_number }}</span
        >
      </div>
      <UIcon
        v-if="column === 'complete'"
        name="i-lucide-check-circle"
        class="text-success-500"
      />
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ order.customer_name }}</span>
      <span>{{ formatTime(order.created_at) }}</span>
    </div>

    <!-- Items -->
    <div>
      <p class="mb-1 text-xs font-semibold text-gray-700">Order List</p>
      <table class="w-full text-xs text-gray-600">
        <thead>
          <tr>
            <th class="pb-1 text-left font-medium">Item</th>
            <th class="pb-1 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id">
            <td>{{ item.product_name }}</td>
            <td class="text-right">x {{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <template v-if="column !== 'complete'">
      <UButton
        block
        :color="action!.color"
        @click="emit('action', order.id, action!.status)"
      >
        {{ action!.label }}
      </UButton>

      <UButton
        v-if="column === 'pickup'"
        block
        variant="ghost"
        color="error"
        icon="i-lucide-bell"
        size="sm"
        @click="emit('remind', order.id)"
      >
        Remind Pickup
      </UButton>
    </template>
  </div>
</template>

import type { Order, OrderPayment, PaymentStatus } from "../data/mockData";

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUND_DUE: "Refund due",
};

const neutral = "text-[var(--muted-foreground)] bg-[var(--secondary)] border-[var(--border)]";

const statusColors: Record<PaymentStatus, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  PAID: "text-green-400 bg-green-400/10 border-green-400/20",
  CANCELLED: neutral,
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
  EXPIRED: "text-red-400 bg-red-400/10 border-red-400/20",
  REFUND_DUE: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

/** The text a payment shows as, e.g. "KHQR · Paid". Unpaid cash on delivery is just "Cash on delivery". */
export function paymentLabel(payment: OrderPayment) {
  if (payment.method === "CASH_ON_DELIVERY") {
    return payment.status === "PENDING" ? "Cash on delivery" : `Cash · ${statusLabels[payment.status]}`;
  }
  return `KHQR · ${statusLabels[payment.status]}`;
}

/** Whether the customer can still pay this order's KHQR. */
export function awaitingKhqr(order: Order) {
  return order.status === "PENDING" && order.payment?.method === "KHQR" && order.payment.status === "PENDING";
}

export function PaymentBadge({ payment }: { payment?: OrderPayment }) {
  if (!payment) return null;
  // Unpaid cash on delivery is the normal case, not something to chase.
  const color = payment.method === "CASH_ON_DELIVERY" && payment.status === "PENDING" ? neutral : statusColors[payment.status];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {paymentLabel(payment)}
    </span>
  );
}

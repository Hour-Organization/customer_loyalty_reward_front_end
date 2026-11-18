import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import type { Order } from "../data/mockData";
import { apiPaymentStatus, apiSimulatePayment } from "../data/api";
import { useAccountApi } from "../data/accountApi";
import { useShop } from "../data/shop";
import { useFeedback } from "./FeedbackProvider";
import { Icon } from "./Icon";

/** How often the dialog asks the server whether the payment arrived. */
const POLL_MS = 4000;

/** Where the customer goes once they close the dialog: their orders, or back to the cart to order again. */
export type PaymentDialogExit = "orders" | "cart";

type Props = {
  order: Order;
  onClose: (next: PaymentDialogExit) => void;
  closing?: boolean;
};

const usd = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const clockText = (ms: number) => {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

/**
 * Shows an order's KHQR to scan and waits for the payment. Only the server decides it was paid: the dialog
 * polls it, and the server asks the provider. Once the time limit passes the server cancels the order.
 */
export function KhqrPaymentDialog({ order, onClose, closing = false }: Props) {
  const shop = useShop();
  const { notify } = useFeedback();
  const { token, reload } = useAccountApi();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const qrImageRef = useRef<HTMLCanvasElement>(null);
  const [current, setCurrent] = useState(order);
  const [offline, setOffline] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const payment = current.payment;
  const status = payment?.status ?? "PENDING";
  const waiting = status === "PENDING";
  const expiresAt = payment?.expiresAt ? Date.parse(payment.expiresAt) : null;
  const left = expiresAt === null ? null : Math.max(0, expiresAt - now);
  const amount = payment?.amount ?? current.total;
  const currency = payment?.currency ?? "USD";

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const check = useCallback(async () => {
    if (!token) return;
    try {
      setCurrent(await apiPaymentStatus(token, order.id));
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, [token, order.id]);

  useEffect(() => {
    if (!waiting) return;
    const poll = window.setInterval(() => void check(), POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [waiting, check]);

  // When the time runs out, ask straight away so the server expires the order now rather than at the next poll.
  const timedOut = waiting && left === 0;
  useEffect(() => {
    if (timedOut) void check();
  }, [timedOut, check]);

  // A settled payment changed the order (and, when cancelled, the stock): refresh the customer's records.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    if (!waiting) reloadRef.current().catch(() => {});
  }, [waiting]);

  const simulate = async () => {
    if (!token || simulating) return;
    setSimulating(true);
    try {
      setCurrent(await apiSimulatePayment(token, order.id));
    } catch (failure) {
      notify((failure as Error).message, "error");
    } finally {
      setSimulating(false);
    }
  };

  // On a phone the customer cannot scan their own screen; banking apps can scan a saved photo instead.
  const saveQr = () => {
    const canvas = qrImageRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `KHQR-${current.id}.png`;
    link.click();
  };

  const orderAgain = () => {
    const cart = shop.cart.map((line) => ({ ...line }));
    for (const item of current.items) {
      const inCart = cart.find((line) => line.productId === item.productId);
      if (inCart) inCart.qty += item.qty;
      else cart.push({ productId: item.productId, qty: item.qty });
    }
    shop.setCart(cart);
    onClose("cart");
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose("orders");
      }}
      aria-labelledby="khqr-title"
      className={`payment-dialog ${closing ? "modal-leaving" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Order <span className="font-mono-data">{current.id}</span>
          </p>
          <h2 id="khqr-title" className="mt-0.5 font-display text-xl font-semibold">
            {waiting
              ? "Scan to pay"
              : status === "PAID"
                ? "Payment received"
                : status === "FAILED"
                  ? "Payment failed"
                  : status === "EXPIRED"
                    ? "This QR has expired"
                    : "Order cancelled"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onClose("orders")}
          aria-label="Close"
          className="rounded-full px-2 text-2xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ×
        </button>
      </div>

      {waiting ? (
        <>
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]">
            <div className="flex items-end justify-between gap-4 px-5 pt-4 pb-3">
              <div>
                <p className="text-sm font-semibold">LoyalCart</p>
                <p className="text-xs text-[var(--muted-foreground)]">KHQR payment</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-semibold leading-none text-[var(--gold-mid)]">{usd(amount, currency)}</p>
                {shop.currency !== "USD" && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">about {shop.money(amount)}</p>
                )}
              </div>
            </div>
            <div className="border-t border-dashed border-[var(--border)]" />
            <div className="flex flex-col items-center gap-3 px-5 py-5">
              {/* Banking apps need dark modules on a light ground, whatever the page theme. */}
              <div className="rounded-xl bg-white p-3">
                {payment?.qr ? (
                  <QRCodeSVG value={payment.qr} size={208} level="M" marginSize={1} title={`KHQR for ${current.id}`} />
                ) : (
                  <div className="grid h-[208px] w-[208px] place-items-center text-sm text-neutral-500">QR unavailable</div>
                )}
              </div>
              {payment?.qr && (
                <QRCodeCanvas ref={qrImageRef} value={payment.qr} size={720} level="M" marginSize={4} className="hidden" aria-hidden="true" />
              )}
              {left !== null && (
                <p
                  className={`rounded-full px-3 py-1 text-sm ${
                    left < 60_000 ? "bg-red-400/10 font-semibold text-red-400" : "bg-[var(--card)] text-[var(--muted-foreground)]"
                  }`}
                >
                  Expires in <span className="font-mono-data">{clockText(left)}</span>
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)]" aria-live="polite">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--gold-mid)] animate-pulse" aria-hidden="true" />
            {offline ? "Can't reach the server. Retrying…" : "Waiting for your payment. This window updates by itself."}
          </p>

          <ol className="mt-4 space-y-2 text-sm">
            {[
              "Open ABA, ACLEDA, Wing or any Bakong app and choose Scan.",
              "Scan this code, or pick the saved QR image from your photos.",
              "Check the amount and confirm the payment.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--secondary)] text-xs text-[var(--muted-foreground)]"
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={!payment?.qr} onClick={saveQr} className="btn btn-primary">
              <Icon name="download" className="h-4 w-4" />
              Save QR image
            </button>
            <button type="button" onClick={() => onClose("orders")} className="btn btn-secondary">
              Pay later
            </button>
            {import.meta.env.DEV && (
              <button type="button" disabled={simulating} onClick={simulate} className="btn btn-secondary sm:col-span-2">
                {simulating ? "Paying…" : "Simulate payment (dev)"}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Unpaid orders are cancelled when the time runs out. You can pay later from My Orders until then.
          </p>
        </>
      ) : status === "PAID" ? (
        <>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-4">
            <Icon name="check" className="h-8 w-8 shrink-0 text-green-400" />
            <p className="text-sm">
              We received {usd(amount, currency)} and order <span className="font-mono-data">{current.id}</span> is
              confirmed. Your points arrive when it is delivered.
            </p>
          </div>
          <div className="mt-5 flex">
            <button type="button" onClick={() => onClose("orders")} className="btn btn-primary flex-1">
              View my orders
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-4">
            <Icon name="alert" className="h-8 w-8 shrink-0 text-red-400" />
            <p className="text-sm">
              Order <span className="font-mono-data">{current.id}</span> was cancelled
              {status === "REFUND_DUE"
                ? " after you paid. The shop will refund your payment."
                : " and nothing was charged."}{" "}
              You can put its items back in your cart and order again.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => onClose("orders")} className="btn btn-secondary flex-1">
              Close
            </button>
            <button type="button" onClick={orderAgain} className="btn btn-primary flex-1">
              Put items back in cart
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}

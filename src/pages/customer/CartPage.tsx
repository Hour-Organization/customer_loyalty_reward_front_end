import { useState, type ReactNode } from "react";
import { useShop } from "../../data/shop";
import { useAccountMutation } from "../../data/accountApi";
import { apiCheckout } from "../../data/api";
import { tierRule } from "../../data/tiers";
import { useFeedback } from "../../components/FeedbackProvider";
import { ProductCover } from "../../components/ProductImage";
import { Icon } from "../../components/Icon";
import { KhqrPaymentDialog } from "../../components/KhqrPaymentDialog";
import { useModalState } from "../../components/useModalState";
import { field } from "../../components/StockUi";
import type { Order, PaymentMethod } from "../../data/mockData";

/** The API's own rule, so a bad number is caught before the order is sent. */
const PHONE = /^\+?\d[\d\s-]{7,14}$/;

const paymentOptions: {
  method: PaymentMethod;
  icon: string;
  title: string;
  description: string;
  detail: string;
}[] = [
  {
    method: "CASH_ON_DELIVERY",
    icon: "wallet",
    title: "Cash on delivery",
    description: "Pay in cash when your order arrives.",
    detail: "Nothing to pay now",
  },
  {
    method: "KHQR",
    icon: "qr",
    title: "KHQR",
    description: "Scan with ABA, ACLEDA, Wing or any Bakong app.",
    detail: "Confirmed as soon as you pay",
  },
];

/** A numbered checkout step. The number turns into a tick once the step is filled in. */
function Step({ number, title, done, children }: { number: number; title: string; done: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={`checkout-step-${number}`} className="space-y-4 p-5">
      <h2 id={`checkout-step-${number}`} className="flex items-center gap-3 font-semibold">
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm transition-colors ${
            done
              ? "border-[var(--gold-mid)] bg-[var(--gold-mid)] text-[var(--background)]"
              : "border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)]"
          }`}
        >
          {done ? <Icon name="check" className="h-4 w-4" /> : number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CartPage({
  onNav,
  guest = false,
  onSignIn,
}: {
  onNav: (page: string) => void;
  guest?: boolean;
  onSignIn?: () => void;
}) {
  const shop = useShop();
  const { notify } = useFeedback();
  const run = useAccountMutation();
  // Start from where the customer had their last order delivered.
  const lastAddress = guest
    ? ""
    : (shop.orders.find((order) => order.customerId === shop.currentUser.id && order.deliveryAddress)?.deliveryAddress ?? "");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState(lastAddress);
  const [phone, setPhone] = useState(guest ? "" : shop.currentUser.phone);
  const [touched, setTouched] = useState({ address: false, phone: false });
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [payingOrder, setPayingOrder, payingClosing] = useModalState<Order | null>(null);

  const items = shop.cart
    .map((item) => ({
      ...item,
      product: shop.products.find((p) => p.id === item.productId),
    }))
    .filter((item) => item.product !== undefined);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product!.price * item.qty, 0);
  const tier = guest ? null : tierRule(shop.tiers, shop.currentUser.tier);
  const multiplier = tier?.multiplier ?? 1;
  const today = new Date().toISOString().slice(0, 10);
  const campaign = shop.campaigns
    .filter((c) => c.active && c.startDate <= today && (!c.endDate || c.endDate >= today))
    .sort((a, b) => b.multiplier - a.multiplier)[0];
  const campaignMultiplier = Math.max(1, campaign?.multiplier ?? 1);
  const points = Math.floor(
    items.reduce((sum, item) => sum + item.product!.normalPoints * item.product!.bonusMultiplier * item.qty, 0) *
      multiplier *
      campaignMultiplier,
  );
  const boosts = [
    multiplier > 1 ? `${shop.currentUser.tier} ×${multiplier}` : null,
    campaignMultiplier > 1 ? `${campaign!.name} ×${campaignMultiplier}` : null,
  ].filter(Boolean);

  const addressError = address.trim() ? "" : "Enter the address we should deliver to.";
  const phoneError = !phone.trim()
    ? "Enter a phone number the rider can call."
    : PHONE.test(phone.trim())
      ? ""
      : "Use 8 to 15 digits, for example 012 345 678.";
  const deliveryDone = !addressError && !phoneError;
  const khqr = paymentMethod === "KHQR";

  const setQty = (id: string, qty: number) =>
    shop.setCart(
      shop.cart
        .map((c) =>
          c.productId === id
            ? { ...c, qty: Math.max(0, Math.min(qty, shop.products.find((p) => p.id === id)?.stock ?? 0)) }
            : c,
        )
        .filter((c) => c.qty > 0),
    );

  const placeOrder = async () => {
    if (placing) return;
    setTouched({ address: true, phone: true });
    if (!deliveryDone) {
      setError("");
      document.getElementById(addressError ? "checkout-address" : "checkout-phone")?.focus();
      return;
    }
    setPlacing(true);
    const placed: { order?: Order } = {};
    const result = await run(async (token) => {
      placed.order = await apiCheckout(token, shop.cart, address.trim(), phone.trim(), paymentMethod);
    });
    setPlacing(false);
    if (result) {
      setError(result);
      notify(result, "error");
    } else if (placed.order?.payment?.method === "KHQR") {
      shop.setCart([]);
      setError("");
      setPayingOrder(placed.order);
    } else {
      shop.setCart([]);
      notify("Order placed. Your points arrive when it is delivered.", "success");
      onNav("orders");
    }
  };

  // Placing a KHQR order empties the cart, so the dialog has to show over the empty-cart view too.
  const paymentDialog = payingOrder && (
    <KhqrPaymentDialog
      order={payingOrder}
      closing={payingClosing}
      onClose={(next) => {
        setPayingOrder(null);
        if (next === "orders") onNav("orders");
      }}
    />
  );

  if (!items.length)
    return (
      <>
        {paymentDialog}
        <div className="text-center py-24 space-y-4">
          <Icon name="cart" className="mx-auto h-12 w-12 text-[var(--gold-mid)]" />
          <h1 className="font-display text-2xl">Your cart is empty</h1>
          <button onClick={() => onNav("products")} className="btn btn-primary">
            Browse products
          </button>
        </div>
      </>
    );

  return (
    <div className="w-full space-y-5">
      {paymentDialog}
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">{guest ? "Your cart" : "Checkout"}</h1>
        <span className="text-sm text-[var(--muted-foreground)]">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <ul aria-label="Items in your cart" className="divide-y divide-[var(--border)]">
            {items.map(({ product, productId, qty }) => (
              <li key={productId} className="flex flex-wrap items-center gap-4 p-4">
                <ProductCover images={product!.images} alt={product!.name} className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="min-w-32 flex-1">
                  <div className="font-semibold">{product!.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {shop.money(product!.price)} each, {product!.stock} in stock
                  </div>
                </div>
                <div className="flex items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
                  <button
                    type="button"
                    aria-label={`Decrease ${product!.name}`}
                    onClick={() => setQty(productId, qty - 1)}
                    className="px-3 py-1.5 hover:text-[var(--gold-mid)]"
                  >
                    −
                  </button>
                  <span className="min-w-8 border-x border-[var(--border)] py-1.5 text-center text-sm" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${product!.name}`}
                    disabled={qty >= product!.stock}
                    onClick={() => setQty(productId, qty + 1)}
                    className="px-3 py-1.5 hover:text-[var(--gold-mid)] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <strong className="w-20 text-right">{shop.money(product!.price * qty)}</strong>
                <button
                  type="button"
                  aria-label={`Remove ${product!.name}`}
                  title={`Remove ${product!.name}`}
                  onClick={() => setQty(productId, 0)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-red-400 hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                >
                  <Icon name="trash" className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>

          {!guest && (
            <form
              id="checkout-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void placeOrder();
              }}
              className="divide-y divide-[var(--border)] border-t border-[var(--border)]"
            >
              <Step number={1} title="Delivery" done={deliveryDone}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium">Address</span>
                    <textarea
                      id="checkout-address"
                      rows={2}
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                      aria-invalid={touched.address && !!addressError}
                      aria-describedby={touched.address && addressError ? "checkout-address-error" : undefined}
                      placeholder="House, street, khan, city"
                      className={`${field} resize-none aria-invalid:border-red-400`}
                    />
                    {touched.address && addressError && (
                      <span id="checkout-address-error" className="block text-xs text-red-400">
                        {addressError}
                      </span>
                    )}
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium">Phone</span>
                    <input
                      id="checkout-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                      aria-invalid={touched.phone && !!phoneError}
                      aria-describedby={touched.phone && phoneError ? "checkout-phone-error" : "checkout-phone-hint"}
                      placeholder="012 345 678"
                      className={`${field} aria-invalid:border-red-400`}
                    />
                    {touched.phone && phoneError ? (
                      <span id="checkout-phone-error" className="block text-xs text-red-400">
                        {phoneError}
                      </span>
                    ) : (
                      <span id="checkout-phone-hint" className="block text-xs text-[var(--muted-foreground)]">
                        The rider calls this number on arrival.
                      </span>
                    )}
                  </label>
                </div>
              </Step>

              <Step number={2} title="Payment" done>
                <div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-2">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.method}
                      className="group relative flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 transition-colors hover:border-[color-mix(in_srgb,var(--gold-mid)_35%,transparent)] has-checked:border-[color-mix(in_srgb,var(--gold-mid)_60%,transparent)] has-checked:bg-[color-mix(in_srgb,var(--gold-mid)_10%,var(--secondary))] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--ring)]"
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={option.method}
                        checked={paymentMethod === option.method}
                        onChange={() => setPaymentMethod(option.method)}
                        className="sr-only"
                      />
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] group-has-checked:text-[var(--gold-mid)]">
                        <Icon name={option.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{option.title}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{option.description}</span>
                        <span className="mt-2 block text-xs font-medium text-[var(--gold-mid)]">{option.detail}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[var(--border)] group-has-checked:border-[var(--gold-mid)]"
                      >
                        <span className="h-2.5 w-2.5 scale-0 rounded-full bg-[var(--gold-mid)] transition-transform group-has-checked:scale-100" />
                      </span>
                    </label>
                  ))}
                </div>
              </Step>
            </form>
          )}
        </div>

        <aside
          aria-labelledby="order-summary"
          className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 lg:sticky lg:top-24"
        >
          <h2 id="order-summary" className="font-semibold">
            Order summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Items ({count})</dt>
              <dd>{shop.money(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl font-semibold">{shop.money(subtotal)}</dd>
            </div>
            {khqr && !guest && shop.currency !== "USD" && (
              <p className="text-xs text-[var(--muted-foreground)]">KHQR charges the amount in US dollars.</p>
            )}
          </dl>

          <div className="flex gap-3 rounded-lg bg-[color-mix(in_srgb,var(--gold-mid)_10%,transparent)] p-3">
            <Icon name="star" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-mid)]" />
            <div className="text-sm">
              <p>
                {guest ? "Earn" : "You earn"} <strong className="text-[var(--gold-mid)]">{points} points</strong> when this
                order is delivered.
              </p>
              {boosts.length > 0 && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Includes {boosts.join(" and ")}.</p>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {guest ? (
            <button type="button" onClick={onSignIn} className="btn btn-primary h-11 w-full">
              Sign in to check out
            </button>
          ) : (
            <>
              <button type="submit" form="checkout-form" disabled={placing} className="btn btn-primary h-11 w-full">
                {placing ? "Placing order…" : khqr ? `Pay ${shop.money(subtotal)} with KHQR` : "Place order"}
              </button>
              <p className="text-xs text-[var(--muted-foreground)]">
                {khqr
                  ? "A QR code opens as soon as you place the order. Unpaid orders are cancelled when it expires."
                  : "We confirm your order, then deliver it. You pay the rider in cash."}
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useShop } from "../../data/shop";
import { nextTier, tierOrder, tierRule } from "../../data/tiers";
import { useModalState } from "../../components/useModalState";
import { ImagePreviewDialog } from "../../components/ImagePreviewDialog";
import { ProductCover, ProductGallery } from "../../components/ProductImage";

interface Props {
  productId: string;
  onAddToCart: (productId: string) => void;
  /** Adds the chosen quantity straight to the cart. */
  onAddQuantity: (productId: string, qty: number) => void;
  onViewProduct: (productId: string) => void;
  onBack: () => void;
  guest?: boolean;
}

const relatedLimit = 4;

export function ProductDetailPage({
  productId,
  onAddToCart,
  onAddQuantity,
  onViewProduct,
  onBack,
  guest = false,
}: Props) {
  const shop = useShop();
  const { storefrontProducts: products, money } = shop;
  const product = products.find((p) => p.id === productId);
  const [qty, setQty] = useState(1);
  // The index of the image open in the full-size preview, or null when it is closed.
  const [previewIndex, setPreviewIndex, previewClosing] = useModalState<
    number | null
  >(null);
  if (!product) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">
          Product not found
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          This product may have been removed or is no longer for sale.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-[var(--gold-mid)] px-5 py-2 font-semibold text-[var(--background)]"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, relatedLimit);
  const inCart = shop.cart.find((item) => item.productId === product.id)?.qty ?? 0;
  const maxQty = Math.max(0, product.stock - inCart);
  const soldOut = product.stock < 1;
  const count = Math.min(qty, Math.max(1, maxQty));

  // What this purchase earns, by the same rule checkout uses when the order completes:
  // base points × the product's bonus, then × the shopper's tier and the best running campaign.
  const today = new Date().toISOString().slice(0, 10);
  const campaign = shop.campaigns
    .filter((c) => c.active && c.startDate <= today && (!c.endDate || c.endDate >= today))
    .sort((a, b) => b.multiplier - a.multiplier)[0];
  const campaignMultiplier = campaign && campaign.multiplier > 1 ? campaign.multiplier : 1;
  const user = guest ? null : shop.currentUser;
  const tier = user?.tier ?? tierOrder(shop.tiers)[0];
  const tierMultiplier = tier ? tierRule(shop.tiers, tier).multiplier : 1;
  const earned = Math.floor(
    product.normalPoints * product.bonusMultiplier * count * tierMultiplier * campaignMultiplier,
  );
  const multipliers = [
    product.bonusMultiplier !== 1 && `Product bonus ${product.bonusMultiplier}×`,
    tier && tierMultiplier !== 1 && `${tier} ${tierMultiplier}×`,
    campaign && campaignMultiplier > 1 && `${campaign.name} ${campaignMultiplier}×`,
  ].filter(Boolean);

  // Progress towards the next tier once these points land. Locked tiers don't move, so they get no nudge.
  const locked = !!user && !!shop.tierOverrides[user.id];
  const qualifying = user ? (shop.qualifyingPoints[user.id] ?? user.points) : 0;
  const upNext = user && !locked ? nextTier(user.tier, shop.tiers) : null;
  const target = upNext ? shop.tiers[upNext].min : 0;
  const after = qualifying + earned;
  const progress = target ? Math.min(100, Math.round((after / target) * 100)) : 100;

  const stockLabel =
    product.stock < 1
      ? "Out of stock"
      : product.stock < 20
        ? `Only ${product.stock} left`
        : `${product.stock} in stock`;

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-[var(--muted-foreground)] hover:text-[var(--gold-mid)]"
      >
        ← Back to products
      </button>

      <article className="grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery
          images={product.images}
          name={product.name}
          onOpen={setPreviewIndex}
          className="aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
        />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--gold-mid)]">
              {product.category}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {product.nameKh}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <strong className="text-3xl text-[var(--gold-mid)]">
              {money(product.price)}
            </strong>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock < 20 ? "bg-red-500/15 text-red-400" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
            >
              {stockLabel}
            </span>
          </div>

          <section
            aria-label="Points for this item"
            className="rounded-xl border border-[var(--gold-mid)]/25 bg-[var(--gold-mid)]/[0.06] p-4"
          >
            <p className="text-sm text-[var(--secondary-foreground)]">
              {guest ? "Members earn" : "You'll earn"}{" "}
              <strong className="font-display text-xl font-semibold text-[var(--gold-mid)]">
                {earned.toLocaleString()} pts
              </strong>
              {count > 1 && <span className="text-[var(--muted-foreground)]"> for {count}</span>}
            </p>
            {multipliers.length > 0 && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {product.normalPoints} base pts each, with {multipliers.join(", ")}
              </p>
            )}
            {user && upNext && (
              <div className="mt-3">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress to ${upNext}`}
                >
                  <div className="h-full rounded-full bg-[var(--gold-mid)]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  {after >= target
                    ? `This order would move you up to ${upNext}.`
                    : `Takes you ${progress}% of the way to ${upNext}, ${(target - after).toLocaleString()} pts to go.`}
                </p>
              </div>
            )}
            {user && !upNext && !locked && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">You're at {user.tier}, the top tier.</p>
            )}
            {guest && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">Sign in to collect points and move up the tiers.</p>
            )}
          </section>

          {product.description && (
            <section>
              <h2 className="mb-1 text-sm font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted-foreground)]">
                {product.description}
              </p>
            </section>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              {!guest && !soldOut && (
                <div className="flex h-12 shrink-0 items-center rounded-lg border border-[var(--border)] bg-[var(--card)]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={count <= 1}
                    onClick={() => setQty(count - 1)}
                    className="grid h-full w-10 place-items-center text-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite" aria-label="Quantity">
                    {count}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={count >= maxQty}
                    onClick={() => setQty(count + 1)}
                    className="grid h-full w-10 place-items-center text-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                disabled={soldOut || (!guest && maxQty < 1)}
                onClick={() => (guest ? onAddToCart(product.id) : onAddQuantity(product.id, count))}
                className="h-12 flex-1 rounded-lg bg-[var(--gold-mid)] font-semibold text-[var(--background)] hover:bg-[var(--gold-light)] disabled:opacity-40 sm:max-w-xs"
              >
                {soldOut
                  ? "Out of Stock"
                  : guest
                    ? "Sign in to add"
                    : maxQty < 1
                      ? "All in your cart"
                      : "Add to Cart"}
              </button>
            </div>
            {!guest && inCart > 0 && maxQty > 0 && (
              <p className="text-xs text-[var(--muted-foreground)]">{inCart} already in your cart.</p>
            )}
            <p className="text-xs text-[var(--muted-foreground)]">Points are added when your order is completed.</p>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">
            More in {product.category}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onViewProduct(p.id)}
                className="card-glow group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] text-left"
              >
                <ProductCover
                  images={p.images}
                  alt={p.name}
                  className="h-36 w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-3">
                  <p className="text-sm font-medium leading-snug group-hover:text-[var(--gold-mid)]">
                    {p.name}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--gold-mid)]">
                    {money(p.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {previewIndex !== null && (
        <ImagePreviewDialog
          images={product.images.map((image) => image.url)}
          startIndex={previewIndex}
          name={product.name}
          onClose={() => setPreviewIndex(null)}
          closing={previewClosing}
        />
      )}
    </div>
  );
}

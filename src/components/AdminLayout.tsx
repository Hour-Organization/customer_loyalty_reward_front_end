import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { type AdminPage } from "../data/adminAccess";

export type { AdminPage } from "../data/adminAccess";

const navItems: {
  id: AdminPage;
  label: string;
  icon: string;
  group?: string;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: "◉", group: "Overview" },
  { id: "analytics", label: "Analytics", icon: "chart", group: "Overview" },
  { id: "customers", label: "Customers", icon: "users", group: "Customers" },
  { id: "referrals", label: "Referrals", icon: "users", group: "Customers" },
  { id: "orders", label: "Orders", icon: "orders", group: "Orders" },
  { id: "products", label: "Products", icon: "products", group: "Catalog" },
  { id: "categories", label: "Categories", icon: "category", group: "Catalog" },
  { id: "points", label: "Points", icon: "star", group: "Points & tiers" },
  { id: "tiers", label: "Tiers", icon: "trophy", group: "Points & tiers" },
  { id: "campaigns", label: "Campaigns", icon: "tag", group: "Promotions" },
  { id: "badges", label: "Badges", icon: "medal", group: "Promotions" },
  { id: "rewards", label: "Rewards", icon: "gift", group: "Rewards" },
  { id: "fulfillment", label: "Fulfilment", icon: "truck", group: "Rewards" },
  { id: "stock", label: "Stock Levels", icon: "warehouse", group: "Inventory" },
  { id: "stock-alerts", label: "Low Stock", icon: "alert", group: "Inventory" },
  { id: "stock-movements", label: "Movements", icon: "swap", group: "Inventory" },
  { id: "stocktake", label: "Stocktake", icon: "clipboard", group: "Stock control" },
  { id: "stock-reports", label: "Stock Reports", icon: "chart", group: "Stock control" },
  { id: "suppliers", label: "Suppliers", icon: "supplier", group: "Suppliers" },
  { id: "users", label: "User Management", icon: "users", group: "Team & access" },
  { id: "roles", label: "Role Permissions", icon: "lock", group: "Team & access" },
  { id: "exchange-rate", label: "Exchange Rate", icon: "wallet", group: "System" },
  { id: "logs", label: "Activity Logs", icon: "list", group: "System" },
  { id: "profile", label: "My Profile", icon: "user", group: "Account" },
];

/** Sidebar groups, in order. "Account" (My Profile) is reached from the top bar's profile button instead.
 *  A group the admin can see only one page of is shown as a plain link to that page. */
const groups = [
  "Overview",
  "Customers",
  "Orders",
  "Catalog",
  "Points & tiers",
  "Promotions",
  "Rewards",
  "Inventory",
  "Stock control",
  "Suppliers",
  "Team & access",
  "System",
];

const groupIcons: Record<string, string> = {
  Overview: "dashboard",
  Customers: "users",
  Orders: "orders",
  Catalog: "products",
  "Points & tiers": "star",
  Promotions: "tag",
  Rewards: "gift",
  Inventory: "warehouse",
  "Stock control": "clipboard",
  Suppliers: "supplier",
  "Team & access": "lock",
  System: "monitor",
};

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/60";

const openGroupKey = "khmershop-admin-open-group";

/** The sidebar group left open last time. Storage can be blocked; the sidebar then simply starts closed. */
function readOpenGroup(): string | null {
  try {
    return localStorage.getItem(openGroupKey);
  } catch {
    return null;
  }
}

function saveOpenGroup(group: string | null) {
  try {
    if (group) localStorage.setItem(openGroupKey, group);
    else localStorage.removeItem(openGroupKey);
  } catch {
    /* Remembering the open group is only a convenience. */
  }
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

interface Props {
  page: AdminPage;
  onNav: (p: AdminPage) => void;
  onLogout: () => void;
  allowedPages: AdminPage[];
  userName: string;
  userRoleLabel: string;
  children: ReactNode;
}

export function AdminLayout({ page, onNav, onLogout, allowedPages, userName, userRoleLabel, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentItem = navItems.find((item) => item.id === page);
  const activeGroup = currentItem?.group;
  // Accordion: at most one group is open. Going to a page opens that page's group; pages outside
  // the sidebar, like My Profile, keep the group the admin last left open.
  const sidebarGroup = activeGroup && groups.includes(activeGroup) ? activeGroup : null;
  const [openGroup, setOpenGroup] = useState<string | null>(() => sidebarGroup ?? readOpenGroup());

  useEffect(() => {
    if (sidebarGroup) setOpenGroup(sidebarGroup);
  }, [sidebarGroup]);

  useEffect(() => saveOpenGroup(openGroup), [openGroup]);

  const toggleGroup = (group: string) => setOpenGroup((current) => (current === group ? null : group));

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navigate = (next: AdminPage) => {
    setMenuOpen(false);
    setQuery("");
    onNav(next);
  };

  // "Find a page": filters the sidebar to matching pages, with every matching group shown open.
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const needle = query.trim().toLowerCase();
  const visibleItems = (group: string) =>
    navItems.filter(
      (n) =>
        n.group === group &&
        allowedPages.includes(n.id) &&
        (!needle ||
          n.label.toLowerCase().includes(needle) ||
          n.id.includes(needle) || // "stock-movements" still turns up for "stock"
          group.toLowerCase().includes(needle)),
    );
  const matches = needle ? groups.flatMap(visibleItems) : [];

  // "/" jumps to the desktop search, unless the admin is already typing somewhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** The brand and grouped page links, shared by the desktop sidebar and the mobile drawer. */
  const renderSidebar = (placement: "desktop" | "drawer") => (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 px-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gold-mid)]/15 text-[var(--gold-mid)] ring-1 ring-inset ring-[var(--gold-mid)]/25">
          <Icon name="logo" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-display text-[15px] font-semibold text-[var(--foreground)]">LoyalCart</div>
          <div className="text-xs text-[var(--muted-foreground)]">Admin console</div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className={`rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] md:hidden ${focusRing}`}
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pb-2 pt-1">
        <label className="relative block">
          <span className="sr-only">Find a page</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            ref={placement === "desktop" ? searchRef : undefined}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && matches[0]) navigate(matches[0].id);
              if (event.key === "Escape") {
                event.stopPropagation();
                setQuery("");
              }
            }}
            placeholder="Find a page"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] pl-8 pr-8 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--gold-mid)]/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {placement === "desktop" && !query && (
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[var(--border)] px-1.5 text-[11px] leading-5 text-[var(--muted-foreground)]">
              /
            </kbd>
          )}
        </label>
      </div>

      <nav aria-label="Admin pages" className="flex flex-1 flex-col gap-0.5 px-3 pb-4 pt-1">
        {groups.map((group) => {
          const items = visibleItems(group);
          if (!items.length) return null;
          const open = needle ? true : openGroup === group;
          const holdsPage = group === activeGroup;
          const listId = `admin-nav-${placement}-${group.toLowerCase().replace(/[^a-z]+/g, "-")}`;
          // One page in the group: a direct link, so there is nothing to expand.
          if (items.length === 1 && !needle) {
            const [only] = items;
            const current = page === only.id;
            return (
              <button
                key={group}
                type="button"
                onClick={() => navigate(only.id)}
                aria-current={current ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${focusRing} ${current ? "bg-[var(--gold-mid)]/10 text-[var(--gold-mid)]" : "text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]"}`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${current ? "bg-[var(--gold-mid)]/15 text-[var(--gold-mid)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                >
                  <Icon name={groupIcons[group]} className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left">{only.label}</span>
              </button>
            );
          }
          return (
            <div key={group}>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                aria-expanded={open}
                aria-controls={listId}
                disabled={!!needle}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:hover:bg-transparent ${focusRing} ${holdsPage ? "text-[var(--foreground)]" : "text-[var(--secondary-foreground)]"}`}
              >
                {/* The tile turns gold for the group holding the current page, open or closed. */}
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${holdsPage ? "bg-[var(--gold-mid)]/15 text-[var(--gold-mid)]" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"}`}
                >
                  <Icon name={groupIcons[group]} className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left">{group}</span>
                {!needle && (
                  <Icon
                    name="chevron"
                    className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none ${open ? "" : "-rotate-90"}`}
                  />
                )}
              </button>
              <div
                id={listId}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  {/* Pages line up under their group's name, not its icon. */}
                  <ul className="flex flex-col gap-px pb-1.5 pl-[42px] pt-0.5">
                    {items.map((item) => {
                      const current = page === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => navigate(item.id)}
                            aria-current={current ? "page" : undefined}
                            className={`relative w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors md:py-1.5 ${focusRing} ${current ? "bg-[var(--gold-mid)]/10 font-medium text-[var(--gold-mid)]" : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"}`}
                          >
                            {current && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-1.5 -left-[9px] w-[3px] rounded-full bg-[var(--gold-mid)]"
                              />
                            )}
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {needle && !matches.length && (
          <p className="px-2 py-3 text-sm text-[var(--muted-foreground)]">
            No page matches “{query.trim()}”. Try a section name, like Stock.
          </p>
        )}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] sticky top-0 h-screen overflow-y-auto">
        {renderSidebar("desktop")}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] shadow-2xl"
          >
            {renderSidebar("drawer")}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: page title on the left; theme, profile and sign out on the right. */}
        <header className="sticky top-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm">
          <div className="page-container flex h-full items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="-ml-2 rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] md:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 truncate text-sm">
              {activeGroup && activeGroup !== "Account" && activeGroup !== currentItem?.label && (
                <span className="hidden text-[var(--muted-foreground)] sm:inline">{activeGroup} / </span>
              )}
              <span className="font-display font-semibold text-[var(--foreground)] sm:text-base">
                {currentItem?.label ?? "LoyalCart Admin"}
              </span>
            </div>

            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate("profile")}
              aria-label="My profile"
              title="My profile"
              className={`flex shrink-0 items-center gap-2 rounded-lg p-1 transition-colors sm:pr-2.5 ${page === "profile" ? "bg-[var(--gold-mid)]/10" : "hover:bg-[var(--secondary)]"}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold-mid)]/15 text-xs font-semibold text-[var(--gold-mid)] ring-1 ring-[var(--gold-mid)]/30">
                {initialsOf(userName) || <Icon name="user" className="h-4 w-4" />}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-36 truncate text-sm font-medium text-[var(--foreground)]">{userName}</span>
                <span className="block max-w-36 truncate text-xs text-[var(--muted-foreground)]">{userRoleLabel}</span>
              </span>
            </button>
            <span className="hidden h-6 w-px bg-[var(--border)] sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--gold-mid)]/40 hover:text-[var(--foreground)]"
            >
              Sign out
            </button>
          </div>
        </header>

        <main
          key={page}
          className="admin-content animate-page-enter flex-1 min-w-0 py-6 overflow-auto"
        >
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}

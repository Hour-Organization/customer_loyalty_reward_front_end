"""Assemble captured KhmerShop screens + a foundations sheet into self-contained HTML for Figma import."""
import re, sys, os, base64, html
from urllib.parse import urlparse, parse_qs, unquote

D = sys.argv[1]          # dir with captured fragments
OUT = sys.argv[2]        # output dir
VW = 1440

css = open(os.path.join(D, "styles.html"), encoding="utf-8").read()

# 1. Viewport units -> per-screen variable (each screen sets --screen-h).
css = re.sub(r"100(d|s|l)?vh", "var(--screen-h, 900px)", css)

# 2. Resolve width media queries as if the viewport were 1440px wide, so the renderer's own viewport can't change layout.
def px(v, unit):
    v = float(v)
    return v * 16 if unit in ("rem", "em") else v

def media(m):
    cond = m.group(1)
    def term(t):
        t = t.group(0)
        mm = re.match(r"\(\s*(?:width\s*(>=|<|>|<=)\s*|(min|max)-width\s*:\s*)([\d.]+)(px|rem|em)\s*\)", t)
        if not mm:
            return t
        op, mn, v, u = mm.groups()
        x = px(v, u)
        if mn == "min": op = ">="
        if mn == "max": op = "<="
        ok = {">=": VW >= x, ">": VW > x, "<": VW < x, "<=": VW <= x}[op]
        return "(min-width: 0px)" if ok else "(max-width: 0px)"
    return "@media " + re.sub(r"\([^()]*width[^()]*\)", term, cond) + "{"
css = re.sub(r"@media ([^{]+)\{", media, css)

# 3. Let the light theme apply to a subtree, not only :root.
css = css.replace(':root[data-theme="light"]', '[data-theme="light"]')
# 4. Drop the remote font @import (Figma maps the families to its own Fraunces/Outfit/JetBrains Mono).
# (font @import kept so the preview and Figma import measure text with the real fonts)


def avatar(url):
    q = parse_qs(urlparse(html.unescape(url)).query)
    name = q.get("name", ["?"])[0]
    bg = "#" + q.get("background", ["262a36"])[0]
    fg = "#" + q.get("color", ["e8a634"])[0]
    initials = "".join(w[0] for w in name.split()[:2]).upper()
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">'
           f'<rect width="128" height="128" fill="{bg}"/><text x="64" y="64" dy=".36em" text-anchor="middle" '
           f'font-family="Outfit, sans-serif" font-size="52" font-weight="600" fill="{fg}">{initials}</text></svg>')
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()

failed_left = []
def fix_imgs(frag):
    def rep(m):
        tag = m.group(0)
        f = re.search(r'data-failed="([^"]+)"', tag)
        if not f:
            return tag
        src = f.group(1)
        if "ui-avatars.com" in src:
            tag = re.sub(r'\ssrc="[^"]*"', "", tag)
            return tag.replace("<img", f'<img src="{avatar(src)}"', 1)
        failed_left.append(src)
        return tag
    return re.sub(r"<img\b[^>]*>", rep, frag)


def frag(name):
    return fix_imgs(open(os.path.join(D, name + ".html"), encoding="utf-8").read())


def screen(label, body, h=900, theme=None):
    t = f' data-theme="{theme}"' if theme else ""
    return (f'<section class="fig-screen" id="{re.sub(r"[^a-z0-9]+", "-", label.lower())}" aria-label="{html.escape(label)}" '
            f'data-name="{html.escape(label)}"{t} style="--screen-h:{h}px;min-height:{h}px">{body}</section>')


# ---------- Foundations sheet ----------
ICONS = {
    "shop": '<path d="M3 10h18l-1.5-6h-15L3 10Z"/><path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 3 4.5 1 1.5 2 4.5 2 6 0 1.5 2 4.5 1 6-1"/>',
    "home": '<path d="m3 10 9-7 9 7v11H3V10Z"/><path d="M9 21v-7h6v7"/>',
    "products": '<path d="M4 8h16l-1 13H5L4 8ZM8 9V6a4 4 0 0 1 8 0v3"/>',
    "cart": '<path d="M3 4h2l2 12h12l2-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    "orders": '<path d="m3 7 9-4 9 4v11l-9 4-9-4V7ZM3 7l9 4 9-4M12 11v11"/>',
    "gift": '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M2 9h20M12 9v12M12 9C7 9 5 7 6 5c2-3 6 1 6 4Zm0 0c5 0 7-2 6-4-2-3-6 1-6 4Z"/>',
    "star": '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/>',
    "trophy": '<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4M12 15v4m-4 2h8m-8-2h8"/>',
    "medal": '<circle cx="12" cy="15" r="5"/><path d="m8 11-2-8h4l2 6 2-6h4l-2 8m-4 1 1 2 2 .3-1.5 1.5.3 2.2-1.8-1-1.8 1 .3-2.2L9 14.3l2-.3 1-2Z"/>',
    "users": '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5h-4"/>',
    "gem": '<path d="M6 3h12l4 6-10 12L2 9l4-6ZM2 9h20M6 3l6 18L18 3"/>',
    "check": '<path d="m4 12 5 5L20 6"/>',
    "trash": '<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
}
def icon(n, size=20, color="currentColor"):
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICONS[n]}</svg>')

DARK = dict(background="#0d0f14", foreground="#f0ece3", card="#161a22", primary="#e8a634", **{"primary-foreground": "#0d0f14"},
            secondary="#1e2330", **{"secondary-foreground": "#c8c2b4"}, muted="#1a1e28", **{"muted-foreground": "#7a7568"},
            accent="#f0c55a", border="rgba(232,166,52,.12)", **{"gold-light": "#f5d78e", "gold-mid": "#e8a634", "gold-dark": "#b87c1c",
            "silver-tier": "#94a3b8", "platinum-tier": "#e2d9f3"}, canvas="#090b0f", field="#0b0d12")
LIGHT = dict(background="#f7f4ee", foreground="#1d1a14", card="#ffffff", primary="#a5680f", **{"primary-foreground": "#ffffff"},
             secondary="#f0ebe1", **{"secondary-foreground": "#4a4436"}, muted="#f2eee6", **{"muted-foreground": "#6e6757"},
             accent="#c98a1e", border="rgba(165,104,15,.18)", **{"gold-light": "#8a560a", "gold-mid": "#a5680f", "gold-dark": "#d29a3a",
             "silver-tier": "#64748b", "platinum-tier": "#7c3aed"}, canvas="#ece7dd", field="#fbfaf7")
TIERS = [("Bronze", "#CD7F32", "medal", "0 – 999 pts · ×1"), ("Silver", "#C0C0C0", "medal", "1,000 – 4,999 pts · ×1.25"),
         ("Gold", "#FFD700", "medal", "5,000 – 9,999 pts · ×1.5"), ("Platinum", "#E5E4E2", "gem", "10,000+ pts · ×2")]

S = {  # inline style helpers (the sheet avoids Tailwind utilities that may not be in the compiled CSS)
    "h2": "font-family:Fraunces,serif;font-size:22px;font-weight:600;margin:0 0 4px;color:var(--foreground)",
    "sub": "font-size:13px;color:var(--muted-foreground);margin:0 0 20px",
    "card": "background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px",
    "row": "display:flex;flex-wrap:wrap;gap:16px;align-items:center",
    "lbl": "font-size:12px;color:var(--muted-foreground)",
}

def swatches(tokens, theme):
    items = "".join(
        f'<div style="width:150px"><div style="height:64px;border-radius:10px;background:{v};border:1px solid var(--hairline)"></div>'
        f'<div style="font-size:13px;font-weight:600;margin-top:8px;color:var(--foreground)">--{k}</div>'
        f'<div class="font-mono-data" style="{S["lbl"]}">{v}</div></div>' for k, v in tokens.items())
    return (f'<div data-theme="{theme}" style="background:var(--background);color:var(--foreground);border:1px solid var(--border);'
            f'border-radius:16px;padding:24px;flex:1"><div style="font-weight:600;margin-bottom:16px">{theme.title()} theme</div>'
            f'<div style="display:flex;flex-wrap:wrap;gap:16px 14px">{items}</div></div>')

def tier_badge(name, tint, ic, size="md"):
    pad = {"sm": "2px 8px;font-size:12px", "md": "4px 12px;font-size:12px", "lg": "6px 16px;font-size:14px"}[size]
    return (f'<span style="display:inline-flex;align-items:center;gap:4px;border-radius:999px;border:1px solid {tint}99;'
            f'background:{tint}33;font-weight:600;color:var(--foreground);padding:{pad}">'
            f'<span style="display:inline-flex;color:{tint}">{icon(ic, 14)}</span> {name}</span>')

found = f"""
<div style="padding:56px 64px;display:flex;flex-direction:column;gap:32px;color:var(--foreground)">
  <div style="display:flex;align-items:center;gap:14px">
    <span style="display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:rgba(232,166,52,.15);color:var(--gold-mid)">{icon('shop', 26)}</span>
    <div><div class="font-display" style="font-size:34px;font-weight:600;line-height:1.1;color:var(--gold-mid)">KhmerShop</div>
    <div style="{S['lbl']};font-size:14px">Design foundations · taken from src/index.css, TierBadge, Icon</div></div>
  </div>

  <div style="{S['card']}"><h2 style="{S['h2']}">Color tokens</h2><p style="{S['sub']}">CSS custom properties on :root (dark, default) and :root[data-theme="light"].</p>
    <div style="display:flex;gap:20px">{swatches(DARK, 'dark')}{swatches(LIGHT, 'light')}</div></div>

  <div style="display:flex;gap:32px">
    <div style="{S['card']};flex:1.2"><h2 style="{S['h2']}">Typography</h2><p style="{S['sub']}">Fraunces for headings, Outfit for body (15px / 1.6), JetBrains Mono for data.</p>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div><div class="font-display" style="font-size:36px;font-weight:600;line-height:1.15">Double points on every order</div><div style="{S['lbl']}">Display / Fraunces 600 · 36</div></div>
        <div><div class="font-display" style="font-size:24px;font-weight:600">Discover Cambodian products</div><div style="{S['lbl']}">H2 / Fraunces 600 · 24</div></div>
        <div><div class="font-display" style="font-size:18px;font-weight:600">Order summary</div><div style="{S['lbl']}">H3 / Fraunces 600 · 18</div></div>
        <div><div style="font-size:15px">Earn points on every purchase and climb from Bronze to Platinum.</div><div style="{S['lbl']}">Body / Outfit 400 · 15</div></div>
        <div><div style="font-size:13px;color:var(--muted-foreground)">Prices include VAT. Points post once the order is delivered.</div><div style="{S['lbl']}">Caption / Outfit 400 · 13 · muted</div></div>
        <div><div style="font-size:15px">ទំព័រដើម · ផលិតផល · រង្វាន់</div><div style="{S['lbl']}">Khmer labels (labelKh)</div></div>
        <div><div class="font-mono-data" style="font-size:15px;font-weight:600;color:var(--gold-mid)">2,895 pts · $20.00 · ៛82,000</div><div style="{S['lbl']}">Data / JetBrains Mono 500 · 15</div></div>
      </div></div>
    <div style="{S['card']};flex:1"><h2 style="{S['h2']}">Buttons &amp; chips</h2><p style="{S['sub']}">.btn .btn-primary (gold main action), .btn-secondary (outlined), .btn-sm, .chip / .chip-active.</p>
      <div style="display:flex;flex-direction:column;gap:22px">
        <div style="{S['row']}"><button class="btn btn-primary">Place order</button><button class="btn btn-secondary">Continue shopping</button><button class="btn btn-primary" disabled>Disabled</button></div>
        <div style="{S['row']}"><button class="btn btn-primary btn-sm">Save</button><button class="btn btn-secondary btn-sm">Edit</button><button class="btn btn-secondary btn-sm">{icon('trash', 14)} Delete</button></div>
        <div style="{S['row']}"><button class="chip chip-active">All</button><button class="chip">Food &amp; drink</button><button class="chip">Crafts</button><button class="chip">Wellness</button></div>
        <div><div style="{S['lbl']};margin-bottom:8px">Field</div>
          <div style="background:var(--field);border:1px solid var(--hairline);border-radius:10px;padding:10px 14px;font-size:14px;color:var(--muted-foreground)">you@example.com</div></div>
        <div><div style="{S['lbl']};margin-bottom:8px">Icons (24 grid, 1.8 stroke, currentColor)</div>
          <div style="{S['row']};color:var(--gold-mid)">{''.join(icon(n, 22) for n in ICONS)}</div></div>
      </div></div>
  </div>

  <div style="display:flex;gap:32px">
    <div style="{S['card']};flex:1"><h2 style="{S['h2']}">Membership tiers</h2><p style="{S['sub']}">TierBadge tints the pill with the tier colour (20% fill, 60% border).</p>
      <div style="display:flex;flex-direction:column;gap:14px">
        {''.join(f'<div style="display:flex;align-items:center;gap:16px">{tier_badge(n, c, i, "lg")}{tier_badge(n, c, i, "md")}{tier_badge(n, c, i, "sm")}<span style="{S["lbl"]}">{r}</span></div>' for n, c, i, r in TIERS)}
        <div style="{S['row']};margin-top:6px"><span class="tier-badge-silver" style="padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600">Silver</span>
          <span class="tier-badge-gold" style="padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600">Gold</span>
          <span class="tier-badge-platinum" style="padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600">Platinum</span>
          <span style="{S['lbl']}">gradient variants (.tier-badge-*)</span></div>
      </div></div>
    <div style="{S['card']};flex:1"><h2 style="{S['h2']}">Loyalty pieces</h2><p style="{S['sub']}">Progress bar, points, stat card, toast.</p>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span style="color:var(--muted-foreground)">Progress to Silver</span><span class="font-mono-data" style="color:var(--gold-mid)">650 / 1,000</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:65%"></div></div></div>
        <div style="display:flex;gap:14px">
          <div class="card-glow" style="flex:1;background:var(--secondary);border:1px solid var(--border);border-radius:12px;padding:16px">
            <div style="color:var(--gold-mid)">{icon('star', 20)}</div><div class="font-mono-data" style="font-size:24px;font-weight:600;color:var(--gold-mid)">2,895</div><div style="{S['lbl']}">Points issued</div></div>
          <div style="flex:1;background:var(--secondary);border:1px solid var(--border);border-radius:12px;padding:16px">
            <div style="color:var(--gold-mid)">{icon('gift', 20)}</div><div class="font-mono-data" style="font-size:24px;font-weight:600;color:var(--gold-mid)">8</div><div style="{S['lbl']}">Rewards redeemed</div></div>
        </div>
        <div class="feedback-toast feedback-toast-success" style="animation:none"><span class="feedback-icon">✓</span><span style="flex:1">1 × Cambodian Coffee Drip Bag Box added to your cart</span><span class="feedback-close">×</span></div>
        <div class="feedback-toast" style="animation:none"><span class="feedback-icon">!</span><span style="flex:1">You earn <b style="color:var(--gold-mid)">40 points</b> when this order is delivered.</span></div>
      </div></div>
  </div>
</div>"""

BASE = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>{{title}}</title><style>{css}</style><style>
html,body{{margin:0;background:#06070a}}
body{{width:{{bodyw}}px;padding:120px;display:flex;flex-wrap:wrap;gap:160px 120px;align-items:flex-start}}
.fig-screen{{position:relative;width:{VW}px;overflow:hidden;transform:translate(0,0);background:var(--background);color:var(--foreground);
  font-family:"Outfit",sans-serif;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}}
.fig-screen *{{animation:none!important;transition:none!important}}
</style></head><body>{{body}}</body></html>"""

def page(title, screens, cols):
    bodyw = cols * VW + (cols - 1) * 120 + 240
    return BASE.replace("{title}", title).replace("{bodyw}", str(bodyw)).replace("{body}", "\n".join(screens))

H = {"c02_home": 1738, "c05_rewards": 1435, "c01_home_guest": 1367, "c03_products": 1558, "c04_product_detail": 1135, "c06_points": 1168,
     "a01_dashboard": 1091, "a02_analytics": 1258, "a03_customers": 923, "a04_products": 1178, "a05_orders": 1211,
     "a07_rewards": 1085, "a09_stock": 929, "a10_roles": 2189}
cust = [("Foundations", None, None), ("Customer · Login", "c00_login", None), ("Customer · Home (guest)", "c01_home_guest", None),
        ("Customer · Home", "c02_home", None), ("Customer · Home (light)", "c02_home", "light"), ("Customer · Products", "c03_products", None),
        ("Customer · Product detail", "c04_product_detail", None), ("Customer · Cart & checkout", "c12_cart_checkout", None),
        ("Customer · Rewards", "c05_rewards", None), ("Customer · My points", "c06_points", None), ("Customer · My tier", "c07_tier", None),
        ("Customer · Badges", "c08_badges", None), ("Customer · Orders", "c09_orders", None), ("Customer · Referrals", "c10_referrals", None),
        ("Customer · Profile", "c11_profile", None)]
adm = [("Admin · Login", "a00_backend_login"), ("Admin · Dashboard", "a01_dashboard"), ("Admin · Analytics", "a02_analytics"),
       ("Admin · Customers", "a03_customers"), ("Admin · Products", "a04_products"), ("Admin · Orders", "a05_orders"),
       ("Admin · Tiers", "a06_tiers"), ("Admin · Rewards", "a07_rewards"), ("Admin · Campaigns", "a08_campaigns"),
       ("Admin · Stock levels", "a09_stock"), ("Admin · Role permissions", "a10_roles")]

cs = [screen("Foundations", found, 900)] + [screen(l, frag(f), H.get(f, 900), t) for l, f, t in cust[1:]]
as_ = [screen(l, frag(f), H.get(f, 900)) for l, f in adm]
os.makedirs(OUT, exist_ok=True)
for name, title, scr in [("khmershop_customer.html", "KhmerShop · Customer", cs), ("khmershop_admin.html", "KhmerShop · Admin", as_)]:
    s = page(title, scr, 4)
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(s)
    print(name, len(scr), "screens", round(len(s) / 1024), "KB")
print("unresolved images:", sorted(set(failed_left)))

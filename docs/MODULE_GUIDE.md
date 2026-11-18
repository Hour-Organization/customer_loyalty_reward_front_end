# KhmerShop module guide

This guide explains what each part of KhmerShop does **as you see it on screen**: where to find it, who can use it, what it shows, and how to do the common tasks. It does not cover code; for that, see [FUNCTIONS.md](FUNCTIONS.md).

KhmerShop has two sides:

- **The shop** (address `/`) is for customers. They browse products, buy, earn points, move up tiers and redeem rewards.
- **The back office** (address `/backend`) is for staff. They run the shop, the loyalty program and the reward stock.

## Contents

**Part A: The shop (customers)**

1. [Signing in and registering](#1-signing-in-and-registering)
2. [Shopping: Home, Products, Cart](#2-shopping-home-products-cart)
3. [Paying with KHQR or cash](#3-paying-with-khqr-or-cash)
4. [My Orders](#4-my-orders)
5. [My Points](#5-my-points)
6. [My Tier](#6-my-tier)
7. [Rewards](#7-rewards)
8. [Badges](#8-badges)
9. [Referrals](#9-referrals)
10. [My Profile and currency](#10-my-profile-and-currency)

**Part B: The back office (staff)**

11. [Staff roles: who sees what](#11-staff-roles-who-sees-what)
12. [Overview: Dashboard and Analytics](#12-overview-dashboard-and-analytics)
13. [Customers and Referrals](#13-customers-and-referrals)
14. [Orders](#14-orders)
15. [Catalog: Products and Categories](#15-catalog-products-and-categories)
16. [Points and Tiers](#16-points-and-tiers)
17. [Promotions: Campaigns and Badges](#17-promotions-campaigns-and-badges)
18. [Rewards and Fulfilment](#18-rewards-and-fulfilment)
19. [Inventory (stock) module](#19-inventory-stock-module)
20. [Team and access: Users and Role Permissions](#20-team-and-access-users-and-role-permissions)
21. [System: Exchange Rate and Activity Logs](#21-system-exchange-rate-and-activity-logs)
22. [My Profile (staff)](#22-my-profile-staff)

---

# Part A: The shop (customers)

The customer menu has **Home, Products, Cart, Orders, Rewards, My Points, My Tier, Badges, Referrals** and **Profile**. Each item also has a Khmer label.

**Guests** (not signed in) can use only Home, Products and Cart. Opening any other page asks them to sign in, then takes them back to that page.

## 1. Signing in and registering

**Where:** the **Sign in or register** button, or any page that needs an account.

**Register** with full name, email, password (at least 8 characters), phone, province and, optionally, a **referral code** from a friend. The new account is signed in straight away ("Welcome to KhmerShop! Your account is ready.").

**Sign in** with email and password. **Continue browsing the shop** goes back without signing in.

Rules:

- Each browser tab signs in on its own.
- A customer account that staff have disabled cannot sign in.

## 2. Shopping: Home, Products, Cart

**Home** shows:

- the campaign banner slider (for example "Double points on every order");
- **Featured Products**, each with **Add to Cart**;
- for signed-in customers: their **Points Balance**, **Current Tier**, order count and **Recent Point Transactions**.

**Products** is the full product list with a search box. Every product shows its price and the points it earns. Products in a hidden category are not shown.

**Product details** (click a product) shows:

- the photo gallery (click a photo to see it full size);
- the description and price;
- **Points for this item**;
- for signed-in customers, their **Progress to** the next tier.

**Adding to cart:** **Add to Cart** opens a small window to choose the **Quantity**, then **Confirm & Add**. You cannot add more than the stock on hand.

**Cart:**

1. Change quantities with **+** and **−**, or remove a line.
2. Under **Delivery**, enter the **Address** (house, street, khan, city) and **Phone**. The rider calls this number on arrival.
3. Under **Payment**, choose **KHQR** or **Cash on delivery**.
4. Check the **Order summary** and place the order.

After the order is placed you see "Order placed. Your points arrive when it is delivered." **Points are added only when the order is completed**, not when it is placed.

## 3. Paying with KHQR or cash

**KHQR** is Cambodia's national QR payment (Bakong). It works with any Cambodian banking app.

1. After checkout, a **KHQR payment** window shows the QR code and an **Expires in** countdown (15 minutes).
2. Scan it with a banking app and pay. The amount is charged in US dollars.
3. The window keeps checking with the server and confirms the order once it is paid.

Other buttons in the window:

- **Save QR image**: download the QR to pay from another device.
- **Pay later**: close the window. You can pay from **My Orders** with **Pay now** until the QR expires.
- **Put items back in cart**: abandon this payment and refill the cart.

If the QR expires unpaid, the order is cancelled automatically. If a payment arrives after the deadline, the order is marked for a refund.

**Cash on delivery** needs no extra step; you pay the rider.

## 4. My Orders

A list of the customer's orders with items, **Order Total**, status and payment state (for example "KHQR · Paid" or "Cash on delivery").

Order statuses run **Pending → Confirmed → Processing → Shipped → Completed**. An order can be **Cancelled** before it ships. Unpaid KHQR orders show a **Pay now** button.

## 5. My Points

- **Current Balance**, **Current Tier** and **Total Spent**.
- **How to Earn Points**: the earning rules.
- **Transaction History**: every change to the balance (earned from orders, referral bonuses, spent on rewards, refunds, staff adjustments), with the balance after each one.

**How points are earned:**

> Points = product base points × product bonus × tier multiplier × campaign multiplier

For example, a Gold member (×1.5) buys a $40 item (40 base points, no product bonus) during Double Points Week (×2) and earns 40 × 1 × 1.5 × 2 = **120 points**.

## 6. My Tier

Shows the customer's tier, membership benefits, progress to the next tier, and **Tier History** (every move up or down, and why).

| Tier | Qualifying points | Points multiplier |
| --- | --- | --- |
| Bronze | 0 – 999 | ×1.00 |
| Silver | 1,000 – 4,999 | ×1.25 |
| Gold | 5,000 – 9,999 | ×1.50 |
| Platinum | 10,000+ | ×2.00 |

These are the starting values. Staff can change them on the **Tiers** page.

- Spending points on rewards does **not** lower your tier. Tiers follow qualifying points.
- At the top, the page says "You have reached the highest tier."
- If staff have fixed your tier by hand, it says "Your tier has an admin override."

## 7. Rewards

**Rewards Catalog** lists what points can buy: vouchers, free products, free shipping and gifts. Each reward shows its point cost, minimum tier, image and options (such as size or colour). A filter switches between rewards you can redeem now and all rewards.

**To redeem:**

1. Choose a reward (and an option, if it has any).
2. Redeem it. The points are taken from your balance straight away.
3. The reward is **reserved** for you at a store or warehouse until staff hand it over or ship it.

When you cannot redeem:

- you don't have enough points;
- your tier is too low ("Requires Gold tier");
- you already have an open redemption of the same reward;
- the reward is out of stock. Some rewards then let you **backorder** (you get it when stock arrives). Others offer **notify me**: you get a "back in stock" notice, which you can **Dismiss**.

**My Redemption History** lists your redemptions and their status. You can **Cancel** one that is still reserved or backordered, and your points are refunded.

## 8. Badges

**My Badges** shows the badges you have earned and the ones still locked, with **Collection Progress**.

| Badge | How to earn it |
| --- | --- |
| First Purchase | Complete your first order |
| 5 Orders | Complete 5 orders |
| 10 Orders | Complete 10 orders |
| Big Spender | Spend over $500 in total |
| Loyal Customer | Be a member for 6+ months |
| Referral Champion | Refer 5 friends successfully |
| Point Collector | Earn 1,000+ loyalty points |

Badges are awarded automatically. Staff can add more on the **Badges** page.

## 9. Referrals

**Referral Program** ("Invite Friends, Earn Together") shows your personal **referral code**, with a button to copy it.

1. A friend enters your code when they register.
2. When the friend's **first order is completed**, you get **+100 points** and the friend gets **+50 points**.

The page shows **Successful referrals**, **Referral points earned** and **My Referrals** (each friend and whether their referral has completed).

## 10. My Profile and currency

**My Profile:** **Edit profile** lets you change name, phone and province; then **Save Profile**. The page also shows your badges.

**Currency:** the top bar switches prices between **USD** and **KHR (riel)**. It shows the current rate, for example "1 USD = 4,000 KHR". Prices are kept in dollars and converted for display only.

---

# Part B: The back office (staff)

Staff sign in at **`/backend/login`** ("Staff portal"). Every staff sign-in is recorded in the activity log.

The sidebar groups pages into **Overview, Customers, Orders, Catalog, Points & tiers, Promotions, Rewards, Inventory, Stock control, Suppliers, Team & access** and **System**. Only one group is open at a time. **My Profile** is opened from the profile button in the top bar.

Common controls on admin pages:

- **Tables** have search and filter boxes and a footer with page numbers and a rows-per-page choice. The rows-per-page choice is remembered.
- **Row action buttons** are coloured by what they do: gold to edit, green to activate, amber to deactivate, red to delete.
- **Forms** open in a pop-up window, with **Cancel** and **Save** at the bottom.
- **Changes are confirmed** with a short message (for example "Reward saved."). Risky actions (delete, cancel) ask for confirmation first.

## 11. Staff roles: who sees what

A staff member sees only the pages their **role** allows. These are the starting roles; a Super Admin can change them on **Role Permissions**.

| Role | Pages they can open |
| --- | --- |
| **Super Admin** | Everything (all 24 pages). This cannot be reduced. |
| **Marketing Manager** | Dashboard, Analytics, Products, Categories, Campaigns, Rewards, My Profile |
| **Loyalty Program Manager** | Dashboard, Customers, Points, Tiers, Rewards, Badges, Referrals, Activity Logs, Analytics, My Profile |
| **Stock Manager** | Dashboard, Rewards, all Inventory pages, My Profile |
| **Stock Clerk** | Low Stock, Stock Levels, Movements, Fulfilment, Stocktake, My Profile |

Customer tiers (Bronze to Platinum) are **not** staff roles. They only decide which rewards and points multiplier a customer gets.

## 12. Overview: Dashboard and Analytics

**Dashboard** ("KhmerShop Platform Overview") shows:

- headline figures: customers, orders, points issued, rewards redeemed;
- **Tier Distribution**: how many customers are in each tier;
- **Recent Activity**: the latest events;
- **Recent Orders**: order id, customer, date, total and status.

**Analytics** ("Customer retention & loyalty program performance") shows:

- **Top Customers by Spend**;
- **Customer Engagement Indicator**: each customer's risk of leaving, based only on days since their last order (rule-based, not AI):
  - **Low Risk**: ordered in the last 30 days;
  - **Medium Risk**: no purchase for 30–60 days;
  - **High Risk**: no purchase for 60+ days;
- **Inactivity Breakdown**: customers inactive for 30, 60 and 90 days, repeat vs. one-time buyers, and referral conversions.

## 13. Customers and Referrals

**Customers** lists every customer with province, tier, points, amount spent, order count and **Retention** (the Low / Medium / High Risk label above). Search by name.

**To fix a customer's tier by hand (tier override):**

1. Click the edit button on the customer's row.
2. Choose a tier, or **Auto** to let their points decide again.
3. Enter a **Reason** (required).
4. Click **Save Override**.

The change appears in the customer's tier history.

**Referrals** ("Referral Program") shows program totals and the **Referral Log**: who invited whom, and whether the referral has completed (the friend's first order).

## 14. Orders

A list of every order with customer, total, status and payment.

**To move an order forward:**

1. Click **Change status** on the order.
2. Choose the **New status**. Only valid next steps are offered:

   | From | Can go to |
   | --- | --- |
   | Pending | Confirmed, Cancelled |
   | Confirmed | Processing, Cancelled |
   | Processing | Shipped, Cancelled |
   | Shipped | Completed |

3. Click **Save Status**.

Notes:

- **Completing** an order awards the customer's points, updates their tier, pays any referral bonus and checks badges.
- An unpaid KHQR order cannot be confirmed by hand ("Waiting for the customer's KHQR payment"). It confirms itself once paid.
- Cancelling an order already paid by KHQR marks the payment for a refund.

## 15. Catalog: Products and Categories

**Products** is the product table (product, price, points, stock, actions).

- **Add or edit** a product: name, Khmer name, category, **Price (USD)**, stock, **Base points**, **Bonus multiplier** (for example ×2 for a promoted product), description and photos (upload several, remove old ones).
- **Inspect images** shows the photos full size.
- **Delete** asks for confirmation first.
- A product needs an active category; create one first if there is none.

**Categories** groups products for the shop's filter. Each category has a name, Khmer name, optional parent category and description; the table shows how many products it holds.

- **Deactivate** hides a category, and every product in it, from customers.
- Inactive categories cannot be given to products.

## 16. Points and Tiers

**Points** ("Points Ledger") is the history of every points change for every customer. Filter by customer (name, email or ID), type, direction (**Earned (+)** / **Deducted (−)**) and date range. Each row shows date, customer, type, reason, points and **Balance After**.

**To give or remove points by hand:**

1. Click **Manual Adjustment**.
2. Find the customer.
3. Enter the points, for example `+200` or `-100`.
4. Enter a **Reason for adjustment**.
5. Save. The message shows the new balance, and the adjustment is logged.

**Tiers** ("Membership Tiers") lists each tier with its qualifying points range, multiplier and number of customers. Add or edit a tier with:

- **Name**;
- **Minimum qualifying points**;
- **Maximum points** (blank for no limit);
- **Point multiplier**;
- **Badge color**.

Rules: ranges cannot overlap, and only the top tier can have no maximum. Saving recalculates every customer's tier ("Tier saved. Customer tiers were recalculated.").

## 17. Promotions: Campaigns and Badges

**Campaigns** ("Bonus Campaigns") are time-limited promotions. Each has:

- name and Khmer name;
- **Multiplier** (for example ×2 for double points);
- **Start date** and **End date** (blank for no end);
- description;
- an optional **Home-page banner**: banner title, subtitle, **Button label** (for example "Shop now"), **Button link** (for example `/products`), image (URL or upload, JPG/PNG/WebP up to 4 MB) and **Display order**.

Active campaigns within their dates multiply the points of every completed order. If several are running, the highest multiplier applies. Campaigns can be activated, deactivated or deleted.

**Badges** lists the achievements customers can earn. Each badge has a **Code**, name, Khmer name, **Icon**, description, and a rule made of a **Condition** and a **Threshold**:

| Condition | Example |
| --- | --- |
| Completed orders | 5 → "5 Orders" |
| Total spend (USD) | 500 → "Big Spender" |
| Successful referrals | 5 → "Referral Champion" |
| Qualifying points | 1000 → "Point Collector" |
| Days as a member | 180 → "Loyal Customer" |

## 18. Rewards and Fulfilment

**Rewards** ("Rewards Catalog") is what customers can redeem. Each reward has:

- name and Khmer name;
- category (Discount, Free Product, Shipping…);
- **Point cost**;
- **Minimum tier**;
- description;
- **Expires on** date;
- image.

Rewards can be activated, deactivated or deleted. A reward that still has stock or open redemptions cannot be deleted. Stock quantities are **not** set here but in **Inventory → Stock Levels**.

**Fulfilment** ("Redemption fulfilment") is where staff hand rewards to customers. It has four tabs, each with a count:

| Tab | What is in it | What you can do |
| --- | --- | --- |
| **To fulfil** | Reserved redemptions waiting to be handed over, with location and time left on the hold | **Ship** or **Picked up** (for serial-tracked items choose the serial, or use **Auto serial**); **Cancel**; extend the hold |
| **Backordered** | Redemptions waiting for stock, oldest first | **Cancel & refund** |
| **Notify me** | Customers waiting for a "back in stock" notice | View only |
| **History** | Fulfilled, cancelled, expired and returned redemptions | **Return** a fulfilled item to stock |

Cancelling asks for a reason, releases the reserved stock and refunds the customer's points.

## 19. Inventory (stock) module

The inventory module tracks the **physical stock of rewards**: vouchers, coffee, gift boxes, kramas and so on. It answers how many units there are, where they are, which ones are promised to customers, and which batches are expiring.

### Key ideas

| Term | Meaning |
| --- | --- |
| **On hand** | Units physically at a location. |
| **Reserved** | Units held for customers who redeemed but have not received them yet. |
| **Expired** | Units in batches past their expiry date. |
| **Available** | On hand − reserved − expired. Only available units can be redeemed. |
| **Location** | A warehouse, store or pickup point. |
| **Ledger (movements)** | The permanent record of every stock change. Entries are never edited; a mistake is fixed with a new entry. |
| **Tracking** | How units are tracked: **Quantity only**, **Batch / expiry** (lot codes with expiry dates, issued first-expiry-first-out), or **Serial** (one serial number per unit). |
| **Variants** | Options of a reward, such as size and colour, each with its own stock. |

### Clerk vs. manager

Every stock action checks the staff member's **stock authority**, which is set per role on **Role Permissions**.

| Action | Clerk | Stock Manager / Super Admin |
| --- | :---: | :---: |
| Receive, Transfer, Return | ✓ | ✓ |
| Fulfil and extend reservations | ✓ | ✓ |
| Start a stocktake and enter counts | ✓ | ✓ |
| Adjust, Write off | | ✓ |
| Cancel redemptions, post or cancel stocktakes | | ✓ |
| Edit stock rules, suppliers, locations | | ✓ |
| Change the reservation timeout | | Super Admin only |

Buttons a user may not use are shown greyed out with the note "Needs stock manager authority".

### How redemptions use stock

1. A customer redeems a reward. One unit is **reserved** at the active location with the most available stock.
2. The hold lasts a set number of hours (the **Reservation timeout**, 72 by default). Staff can extend it.
3. Staff **fulfil** it (Ship / Picked up). The unit leaves stock.
4. If the hold runs out unfulfilled, the unit is released and the points are refunded automatically.
5. If nothing was in stock and the reward allows backorders, the redemption waits. When stock is received, it is reserved for the oldest backorder first, and "notify me" customers are told it is back.

### Stock Levels

On hand, reserved and available stock for every reward. Search by SKU or name, and filter by category, location, status and tracking type. Columns: SKU, item, category, points, on hand, reserved, available, **Status** and **Value**.

Statuses:

- **Out of stock**: nothing available.
- **Low stock**: at or below the low-stock threshold.
- **Reorder**: at or below the reorder point.
- **In stock**: above the reorder point.

Click an item to see:

- **Levels by location**: on hand, reserved, expired and available at each location;
- **Stock rules** (**Edit** to change):
  - unit cost (USD) and supplier;
  - **Low-stock threshold**, **Reorder point** and **Reorder quantity**;
  - tracking type;
  - **When out of stock**: *Show as disabled*, *Hide from storefront* or *Allow backorders*;
  - **Variants**;
- **Batches**, with expiry dates;
- **Serial numbers in stock**;
- **Movement history**, with the running balance after each entry.

The stock action buttons (**Receive, Transfer, Return, Adjust, Write off**) appear on this page and open the stock form described below.

### The stock form: five actions

| Action | Use it when | What you enter |
| --- | --- | --- |
| **Receive stock** | Stock arrives | Item, variant, location, quantity; **Source**: *Purchase* (with supplier and unit cost) or *Partner donation*; **PO / donation ref.** (for example `PO-2026-120`); batch code and expiry, or serial numbers, for tracked items |
| **Transfer between locations** | Moving stock from one place to another | Item, variant, from location, **To location**, quantity (batches or serials if tracked) |
| **Return to stock** | A customer returns an item, or stock is found | Item, location, quantity; optionally the **Linked redemption** (which becomes *Returned*) |
| **Manual adjustment** *(manager)* | Correcting a known error | **Adjustment direction** (in / out), quantity and a reason |
| **Write off stock** *(manager)* | Stock is unusable | **Write-off type**: *Damage*, *Loss / theft* or *Expiry*; quantity; batch if tracked |

The form shows how much is **At this location** before you save. Saving adds an entry to the ledger ("Receive stock recorded in the stock ledger.").

### Low Stock

The "Low-stock dashboard" shows what needs attention:

- **Summary tiles**: Out of stock, Low or reorder, Expiring in 30 days, Backorders & notify-me.
- **Reorder suggestions**: each item at or below its reorder point, with a **Suggested** quantity (enough to reach the reorder point plus the reorder quantity, plus open backorders), its supplier, and a **Receive** button.
- **Expiry watch**: batches expired or expiring within 30 days, with a **Write off** button.
- **Reservations timing out**: holds that end within 24 hours, with a link to Fulfilment.
- **Reservation timeout (hours)**: how long new redemptions hold their unit (Super Admin).

### Movements

"Stock movements" is the full ledger, newest first. Filter by date, **Movement type**, location, **Reward item** and **Recorded by**. Each row shows:

- when and type;
- item and location;
- lot or serial;
- **On hand Δ** and **Reserved Δ** (the change);
- reference and reason.

Movement types include Receive, Reserve, Release, Fulfil, Transfer out/in, Return, Adjust, Write-off and Count.

### Stocktake

Stocktakes are cycle counts: compare what the system expects with what is really on the shelf.

1. Click **Start stocktake** and choose a **Location**, a **Category** (or *All categories* for a full count) and an optional **Note** (for example "Monthly voucher count"). Then click **Start count**.
2. **Blind count**: staff count each line and enter the **Counted** quantity. Expected and counted are compared and the **Variance** and its value are shown.
3. A stock manager clicks **Post variances**. The differences are written to the ledger as *Count* entries, and stock now matches the shelf.
4. **Cancel count** drops the stocktake. The counts are kept for reference, but nothing is posted.

### Stock Reports

Values use each item's standard unit cost, in USD and KHR.

- **Stock value** (USD and KHR), units held by reservations, and expired units not yet written off.
- **By item**: on hand, unit cost, value and each item's share of the total.
- **By location**: on hand, reserved and value per location.
- **By movement type**: entries, units and net change for a chosen date range.
- **Rewards ranked by units issued**: units issued per week, days of cover, and a class (**Fast** = top quarter; **Slow** = more than 180 days of cover).
- **Redemptions vs stock ledger**: checks that redemption records and ledger units agree; any **Mismatch** points to stock moved outside the redemption flow.

### Suppliers

"Suppliers & locations" has two lists:

- **Suppliers and sourcing partners**: name, type (*Supplier* sells stock; *Sourcing partner* donates it), contact person, phone, email, items supplied, units received in the last 90 days, active/inactive. Both can be chosen when receiving stock.
- **Stock locations**: warehouses, stores and pickup points, with name, Khmer name, on hand, reserved and value. A location that still holds stock cannot be deactivated. Redemptions reserve from the active location with the most available stock.

Only stock managers and Super Admin can edit these lists.

## 20. Team and access: Users and Role Permissions

**User Management** (Super Admin):

- **Staff users**: **Add staff user** with name, email, password and role. Edit, or disable an account; disabling signs it out everywhere. Leaving the password blank when editing keeps the current one.
- **Customer users**: search customers and enable or disable their accounts.

**Role Permissions** ("Access control"):

- The **Staff roles** list, with **Create staff role** (for example "Store Supervisor").
- For each role, tick the admin pages it can open (**Select all** / **Clear all**) and set its **Stock authority** (clerk or manager).
- **Save permissions** applies the changes to signed-in staff immediately; **Discard** undoes unsaved changes.

## 21. System: Exchange Rate and Activity Logs

**Exchange Rate** controls how USD prices appear in Cambodian riel.

1. Check the **Current rate** and **Last updated**.
2. Click **Update rate** and enter the **New rate** (riel for 1 US dollar, a whole number).
3. Check the **Preview for $10** and the **Conversion preview** examples.
4. Click **Save rate**.

Only the displayed price changes; prices are always stored in USD.

**Activity Logs** is the audit trail: registrations, logins, orders, points earned, spent and adjusted, tier changes, badges awarded, redemptions, referrals, stock actions and staff changes. Each entry shows who, what and when. Filter by date, event and person.

## 22. My Profile (staff)

Shows your account and **Your admin access** (your role and the pages it allows). **Edit profile** changes your name and email; then **Save changes**.

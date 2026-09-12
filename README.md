# Observe

Observe is the internal operations dashboard for Chosen. It is intentionally broader than Treasury: Treasury records company cash, Credits, obligations and revenue; Observe records the complete user + system lifecycle that produced those financial consequences.

The current repository is a dependency-free static prototype with realistic demo data. It can be opened directly or deployed as a static site.

## Dashboard sections

- **Activity** — universal append-only event stream across every domain.
- **Purchases** — crate and stock-pack entry, batch quantity, rail, Crate Bonus, XP and reveal linkage.
- **Reveal Monitor** — locked outcomes, pity, duplicate rerolls, commit/reveal hashes, FMV, user decision and exceptions.
- **Secondary Market** — offer-only inventory, listings, repricing, offers, counters, sales, ownership transfer and marketplace fees.
- **Portfolios** — per-user Cash, USDC, Credits, stock positions, stock basis/P&L, physical inventory and pending vault exposure.
- **Wallet & Payments** — deposits, withdrawals, whitelists, processor/network state and balance movement.
- **Fee Tracker** — actual network/execution cost, configured user fee, recovered cost, subsidy and net platform exposure.
- **Rewards & Credits** — Credit Spend, Credit Back, Crate Bonus, Lulu, promotions, XP, streaks, raffles, referral claims and earn tasks.
- **Reconciliation** — internal state versus wallets, custody/provider, vault, marketplace, Credits and reveal sources of truth.
- **Event Catalog** — canonical registry of all operational, financial and analytics events the platform should emit.

## Important operating rules represented

1. Cash, USDC and Credits are separate rails/economies. The original funding rail stays attached to the full lifecycle.
2. A Cash-funded collectible crate may only cash out to Cash.
3. A USDC-funded collectible crate may only cash out to USDC.
4. A Credits-funded crate may only settle through Credits / Credit Back.
5. Stock packs are Cash-only.
6. A stock win triggers a stock purchase. Once filled and assigned, the stock principal belongs to the user portfolio.
7. When the user later sells stock, Observe treats execution/network cost as the company exposure. The stock principal is not counted as a new company payout.
8. Crate Bonus and Credit Back are separate events. Crate Bonus is a reward emission; Credit Back is outcome settlement.
9. A kept physical item stores initial FMV, live FMV, the original funding rail and the 365-day state.
10. The pending liquidation option is `70% × min(initial FMV, current live FMV)` during the configured 365-day window.
11. If an unresolved item expires, the expiry / Auto Credit Back event is explicit and the vault ownership state is closed.
12. Shipping collected, carrier/handling cost and actual item/supplier cost basis are separate financial events.
13. Gross marketplace sale value is not company revenue; only Chosen's marketplace fee belongs in company revenue reporting.
14. Failed on-chain actions can still have real fees, so failed transactions remain in the fee ledger.
15. Admin overrides and manual adjustments must include operator identity, reason and before/after values.

## Correlation IDs

The most important observability primitive is `correlation_id`. Related events should share one ID so an operator can see the whole lifecycle rather than isolated rows.

Example marketplace settlement:

```text
Offer Accepted
→ Buyer Funds Debited
→ Marketplace Fee Collected
→ Seller Proceeds Credited
→ Ownership Transferred
→ Listing Closed
→ Network / Settlement Fee Recorded
```

Every one of those events should use the same correlation ID.

Example stock pack:

```text
Stock Pack Purchased
→ Reveal Commitment Created
→ Stock Outcome Revealed
→ Stock Buy Submitted
→ Stock Buy Filled
→ Stock Lot Assigned
→ Portfolio Updated
```

## Recommended backend event envelope

```ts
interface ObserveEvent {
  event_id: string;
  event_type: string;
  category: string;
  level: 'operational' | 'financial' | 'analytics';

  user_id?: string;
  counterparty_user_id?: string;
  admin_user_id?: string;

  correlation_id: string;
  idempotency_key: string;

  asset_id?: string;
  purchase_id?: string;
  reveal_id?: string;
  inventory_item_id?: string;
  listing_id?: string;
  offer_id?: string;
  stock_order_id?: string;
  stock_lot_id?: string;
  shipment_id?: string;

  payment_rail?: 'cash' | 'usdc' | 'credits' | 'onchain' | 'internal';
  currency?: string;
  amount?: number;

  network?: string;
  provider?: string;
  tx_hash?: string;
  external_reference?: string;

  actual_network_fee?: number;
  user_fee_charged?: number;
  fee_recovered?: number;
  fee_subsidy?: number;

  initial_fmv?: number;
  live_fmv?: number;
  funding_rail?: string;

  status: string;
  reason?: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
  ingested_at: string;
}
```

The event table should be append-only. Current balances, portfolios, marketplace listings, vault state, fee aggregates and treasury projections should be derived/read-optimized projections, not destructive rewrites of historical events.

## Domain coverage

The Event Catalog in the UI contains the full tracking list across:

- Wallet & Funding
- Purchases
- Reveal Monitor
- Prize Settlement
- Vault
- Marketplace
- Stocks
- Fees
- Shipping
- Rewards & Credits
- Treasury
- Reconciliation
- Admin
- Product Analytics

Product analytics events such as item-detail views, marketplace filters, public-profile views and share-card actions are intentionally tagged **Analytics**. They can be retained without polluting the default operational or financial reports.

## Production integration

Replace the demo arrays in `app.js` with API queries plus a live event stream. A practical implementation is:

- append events server-side into an immutable events table;
- stream new events to Observe with WebSocket or SSE;
- maintain read models for purchases, reveals, vault items, marketplace, balances, stock positions, rewards and fee aggregates;
- preserve external/provider IDs for processor, chain, brokerage/custody, shipping and supplier systems;
- snapshot market values with source and timestamp;
- preserve the original crate funding rail on the resulting vault item or stock lifecycle;
- run scheduled reconciliation checks against independent sources of truth;
- alert on stale price quotes, fairness mismatches, rail-integrity violations, negative/incorrect balances, unrecovered fees, stuck settlements and custody mismatches.

## Files

- `index.html` — all Observe views and drawer shell
- `styles.css` — responsive internal-admin UI
- `app.js` — demo data, complete event catalog, filters, metrics, correlation timelines, CSV export and detail drawers

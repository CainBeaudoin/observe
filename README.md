# Observe

Internal operations dashboard for tracking the full lifecycle of activity on the Chosen platform: crate purchases, reveals, cashback, vault ownership, user transfers, secondary-market actions, stock positions, balances, and transaction fees.

The repository currently contains a dependency-free frontend prototype with realistic demo data. Open `index.html` directly or deploy the repository as a static site.

## Dashboard sections

- **Activity** — one global event ledger for every state-changing action.
- **Purchases** — cash / USDC crate purchases and cash-only stock packs.
- **Reveal Monitor** — commit/reveal, FMV snapshot, outcome, user decision and exception state.
- **Secondary Market** — listings, offers, declines, acceptances, cancellations, sales and transfers.
- **Portfolios** — per-user cash, USDC, stock positions, cost basis, P&L and physical inventory count.
- **Fee Tracker** — actual network/execution cost, fee collected from the user and unrecovered platform exposure.

## Core accounting rules represented in the UI

1. A cash-funded sneaker/streetwear crate can only settle cashback/proceeds back to the cash rail.
2. A USDC-funded sneaker/streetwear crate can only settle cashback/proceeds back to USDC.
3. Stock packs are cash-only.
4. When a stock is won, the stock is purchased and attributed to the user's portfolio. It is user-owned value from that point forward.
5. When a user sells a stock, sale proceeds come from liquidating that user's holding. The dashboard therefore treats the execution/network fee as platform exposure rather than treating stock principal as a fresh platform payout.
6. Every state transition should be append-only and addressable by event ID, user ID, business reference, payment/transaction reference and idempotency key.

## Recommended backend event schema

Every event should include, at minimum:

```ts
interface ObserveEvent {
  event_id: string;
  event_type: string;       // purchase.created, reveal.completed, offer.accepted, stock.sold, etc.
  category: string;         // purchases, reveals, marketplace, stocks, fees...
  user_id: string;
  counterparty_user_id?: string;
  asset_id?: string;
  purchase_id?: string;
  reveal_id?: string;
  listing_id?: string;
  offer_id?: string;
  order_id?: string;
  payment_rail: 'cash' | 'usdc' | 'onchain' | 'internal';
  amount?: number;
  currency?: string;
  network?: string;
  tx_hash?: string;
  actual_network_fee?: number;
  user_fee_collected?: number;
  status: string;
  metadata: Record<string, unknown>;
  idempotency_key: string;
  created_at: string;
}
```

Keep the event ledger append-only. Build derived views for balances, portfolios, marketplace state, reveal state and fee accounting from these events rather than overwriting history.

## Events worth tracking

### Purchases / payments
`purchase.created`, `purchase.authorized`, `purchase.settled`, `purchase.failed`, `purchase.refunded`, `crate.opened`, `stock_pack.opened`.

### Reveal lifecycle
`reveal.committed`, `reveal.requested`, `reveal.completed`, `reveal.failed`, `reveal.exception`, `fmv.snapshot`, `prize.assigned`, `cashback.selected`, `vault.keep_selected`.

### Ownership / inventory
`inventory.assigned`, `inventory.vaulted`, `asset.transfer_initiated`, `asset.transfer_completed`, `asset.transfer_failed`.

### Marketplace
`listing.created`, `listing.updated`, `listing.cancelled`, `offer.sent`, `offer.declined`, `offer.accepted`, `offer.expired`, `sale.created`, `sale.settled`, `sale.failed`.

### Stocks / portfolio
`stock.order_submitted`, `stock.buy_executed`, `stock.position_assigned`, `stock.mark_updated`, `stock.sell_requested`, `stock.sell_executed`, `stock.position_closed`, `cash.balance_credited`.

### Cashout / settlement
`cashout.requested`, `cashout.processing`, `cashout.settled`, `cashout.failed`, `usdc.payout_submitted`, `usdc.payout_confirmed`.

### Fee accounting
`fee.observed`, `fee.assessed`, `fee.collected`, `fee.recovered`, `fee.unrecovered`, including failed on-chain transactions that still consumed gas/network cost.

## Production integration

Replace the demo arrays in `app.js` with API calls or a websocket stream. A practical setup is:

- append events server-side into an immutable `events` table;
- broadcast new events over websocket/SSE to the Activity page;
- maintain read-optimized projections for purchases, reveals, marketplace state, balances, stock positions and fee aggregates;
- snapshot external market prices with timestamp + source so historical portfolio/reveal values can be reconstructed;
- reconcile payment processor, USDC/on-chain and brokerage transaction IDs against internal events;
- alert when rail integrity, ownership, stale-price, fee-recovery or settlement invariants fail.

## Files

- `index.html` — dashboard shell and all views
- `styles.css` — responsive dark admin UI based on the supplied Observe navigation reference
- `app.js` — demo ledger data, metrics, filters, CSV export and detail drawers

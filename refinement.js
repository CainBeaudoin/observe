(() => {
  if (window.__observeRefinementAudit) return;
  window.__observeRefinementAudit = true;

  const profileEvents = [
    { mins: 18, user: 'usr_01HZX9', type: 'Username changed', before: '@andrel', after: '@andre', ref: 'usrchg_001', status: 'Confirmed' },
    { mins: 44, user: 'usr_01HZX2', type: 'Primary wallet linked', before: '—', after: '0x7A4F…92C1', ref: 'walletlink_014', status: 'Confirmed' },
    { mins: 77, user: 'usr_01HZZ4', type: 'Withdrawal address added', before: '0 addresses', after: '1 whitelisted address', ref: 'wl_ari_004', status: 'Confirmed' },
    { mins: 126, user: 'usr_01J001', type: 'Primary wallet changed', before: '0x29B1…103A', after: '0x51F2…66B4', ref: 'walletchg_031', status: 'Confirmed' },
    { mins: 211, user: 'usr_01HZYA', type: 'Account status changed', before: 'Review', after: 'Active', ref: 'acct_219', status: 'Confirmed' },
    { mins: 288, user: 'usr_01HZYQ', type: 'Region eligibility changed', before: 'Pending', after: 'Eligible', ref: 'region_071', status: 'Confirmed' },
    { mins: 337, user: 'usr_01HZX2', type: 'Withdrawal address removed', before: '2 addresses', after: '1 whitelisted address', ref: 'wl_rm_122', status: 'Confirmed' },
    { mins: 418, user: 'usr_01HZZ4', type: 'Account risk hold released', before: 'Held', after: 'Active', ref: 'risk_ari_09', status: 'Confirmed' }
  ];
  window.observeUserProfileEvents = profileEvents;

  profileEvents.forEach((e, i) => {
    if (activities.some(a => a.ref === e.ref)) return;
    activities.push({
      id: `evt_user_${String(i + 1).padStart(3, '0')}`,
      mins: e.mins,
      type: e.type,
      category: 'User',
      user: e.user,
      asset: 'Account profile / permissions',
      ref: e.ref,
      corr: `corr_${e.ref}`,
      amount: 0,
      rail: 'Internal',
      status: e.status,
      fee: 0,
      note: `${e.before} → ${e.after}. User-specific changes remain visible inside the portfolio/account history.`
    });
  });
  activities.sort((a, b) => a.mins - b.mins);

  const activityCategory = document.getElementById('activityCategory');
  if (activityCategory && ![...activityCategory.options].some(o => o.value === 'User')) activityCategory.add(new Option('User', 'User'));
  const quick = document.getElementById('activityQuickFilters');
  if (quick && !quick.querySelector('[data-filter="User"]')) {
    const b = document.createElement('button');
    b.className = 'filter-chip'; b.dataset.filter = 'User'; b.textContent = 'User';
    b.addEventListener('click', () => {
      quick.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); renderActivity();
    });
    quick.appendChild(b);
  }

  function normalizedUserRows(userId) {
    const rows = [];
    const seen = new Set();
    const add = (source, mins, type, ref, amount, statusValue, detail, corr = '') => {
      const key = `${source}|${ref || type}|${mins}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ source, mins: Number(mins || 0), type, ref: ref || '—', amount, status: statusValue || 'Recorded', detail: detail || '', corr });
    };

    activities.filter(x => x.user === userId || x.counterparty === userId).forEach(x => add('Activity', x.mins, x.type, x.ref, x.amount, x.status, x.note || x.asset, x.corr));
    purchases.filter(x => x.user === userId).forEach(x => add('Purchases', x.mins, `${x.product} purchase`, x.id, -x.entry, x.status, `${x.qty}× · ${x.rail} · reveal ${x.reveal}`, x.corr));
    reveals.filter(x => x.user === userId).forEach(x => add('Reveal Monitor', x.mins, `Reveal · ${x.decision}`, x.id, x.fmv, x.status, `${x.outcome} · ${x.rarity} · ${x.fair}`, x.corr));
    marketEvents.filter(x => x.actor === userId || x.counter === userId).forEach(x => add('Secondary Market', x.mins, x.action, x.ref, x.value, x.status, `${x.item} · ${x.kind}`, x.corr));
    walletEvents.filter(x => x.user === userId).forEach(x => add('Wallet & Payments', x.mins, x.action, x.ref, x.amount, x.status, `${x.rail} · ${x.provider}`));
    fees.filter(x => x.user === userId).forEach(x => add('Fee Tracker', x.mins, x.action, x.ref, -x.cost, x.status, `${x.network} · user fee ${money(x.userFee, 4)} · recovered ${money(x.recovered, 4)}`, x.corr));
    rewardEvents.filter(x => x.user === userId).forEach(x => add('Rewards & Credits', x.mins, x.event, x.ref, x.dir === 'Out' ? -x.amount : x.amount, x.status, `${x.dir} · balance ${num(x.balance)} cr`));
    (window.observeSwaps || []).filter(x => x.user === userId).forEach(x => add('Swaps / Bridge', x.mins, `${x.source} → Robinhood Chain`, x.id, x.sent, x.status, `Received ${x.received == null ? 'pending' : money(x.received)} · Chosen cost ${money(x.platformCost, 4)}`, x.corr));
    profileEvents.filter(x => x.user === userId).forEach(x => add('Portfolio / User', x.mins, x.type, x.ref, 0, x.status, `${x.before} → ${x.after}`));

    return rows.sort((a, b) => a.mins - b.mins);
  }

  const basePortfolioRender = renderers.portfolios;
  renderers.portfolios = function () {
    basePortfolioRender();
    const intro = document.querySelector('#view-portfolios .section-intro p');
    if (intro) intro.textContent = 'Each user is a complete account ledger: profile changes, balances, deposits, swaps, purchases, reveals, vault actions, marketplace activity, stocks, fees, rewards and admin/risk changes.';
    document.querySelectorAll('#portfolioGrid .portfolio-card').forEach(card => {
      const id = card.dataset.id;
      const count = normalizedUserRows(id).length;
      const meta = card.querySelector('.user-meta span');
      if (meta && !meta.dataset.auditCount) {
        meta.dataset.auditCount = '1';
        meta.textContent += ` · ${count} tracked events`;
      }
    });
  };

  const priorOpenDrawer = openDrawer;
  openDrawer = function (type, id) {
    if (type !== 'user') return priorOpenDrawer(type, id);
    const u = userById[id];
    if (!u) return;
    const pos = positions[u.id] || [];
    const ledger = normalizedUserRows(id);
    const financial = ledger.filter(x => Number(x.amount)).length;
    const stockMoves = ledger.filter(x => /stock|AAPL|NVDA|TSLA|AMZN|META/i.test(`${x.type} ${x.detail}`)).length;
    const marketMoves = ledger.filter(x => x.source === 'Secondary Market').length;
    const fundingMoves = ledger.filter(x => ['Wallet & Payments','Swaps / Bridge'].includes(x.source)).length;

    document.getElementById('drawerTitle').textContent = u.name;
    document.getElementById('drawerEyebrow').textContent = 'USER / PORTFOLIO LEDGER';
    document.getElementById('drawerBody').innerHTML = `
      <div class="drawer-section">
        <div class="drawer-user-head"><div class="user-avatar">${initials(u.name)}</div><div><strong>${esc(u.name)}</strong><span>${esc(u.handle)} · ${esc(u.id)}<br>${esc(u.wallet)}</span></div></div>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Account snapshot</div>
        <div class="detail-grid">${kv('Cash',money(u.cash))}${kv('USDC',money(u.usdc))}${kv('Credits',`${num(u.credits)} cr`)}${kv('Stocks',money(u.stocks))}${kv('Stock cost basis',money(u.stockCost))}${kv('Vault market value',money(u.vaultValue))}${kv('Inventory items',u.inventory)}${kv('Pending exposure',money(u.pending))}</div>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Unified user tracking</div>
        <div class="detail-grid">${kv('All tracked movements',ledger.length)}${kv('Financial movements',financial)}${kv('Stock-related events',stockMoves)}${kv('Marketplace events',marketMoves)}${kv('Funding / swap events',fundingMoves)}${kv('Profile / account changes',profileEvents.filter(x=>x.user===id).length)}</div>
        <div class="detail-note">This user timeline is globalized across the rest of Observe. Every event still lives on its dedicated page, but the Portfolio user record is the single account-level view.</div>
      </div>
      <div class="drawer-section"><div class="drawer-section-title">Stock positions</div>${pos.length ? `<div class="timeline">${pos.map(p=>`<div class="timeline-row"><strong>${esc(p[0])} · ${p[1]} sh · ${money(p[2])}</strong><span>Acquisition basis ${money(p[3])} · unrealized ${money(p[2]-p[3])}</span></div>`).join('')}</div>` : '<div class="detail-note">No stock positions.</div>'}</div>
      <div class="drawer-section">
        <div class="drawer-section-title">All user movements · newest first</div>
        <div class="table-wrap"><table style="min-width:760px"><thead><tr><th>When</th><th>Page</th><th>Event</th><th>Amount / value</th><th>Status</th><th>Reference</th></tr></thead><tbody>${ledger.slice(0,80).map(x=>`<tr style="cursor:default"><td>${timeAgo(x.mins)}</td><td><span class="tag internal">${esc(x.source)}</span></td><td><span class="cell-primary">${esc(x.type)}</span><span class="cell-secondary">${esc(x.detail)}</span></td><td>${x.amount ? (x.amount > 0 ? '+' : '') + money(x.amount) : '—'}</td><td>${status(x.status)}</td><td class="mono">${esc(short(x.ref))}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    document.getElementById('detailDrawer').classList.add('open');
    document.getElementById('drawerBackdrop').classList.add('open');
    document.getElementById('detailDrawer').setAttribute('aria-hidden', 'false');
  };

  setTimeout(() => {
    if (typeof window.observeRegisterTransactionTypes !== 'function') return;
    const reg = window.observeRegisterTransactionTypes;

    reg({ domain:'User Account', page:'Portfolios', level:'Operational', names:[
      'Account created','Username changed','Primary wallet linked','Wallet unlinked','Primary wallet changed','Withdrawal address added','Withdrawal address removed','Account status changed','Account frozen','Account unfrozen','Region eligibility changed','Provider/KYC eligibility changed','Account closed'
    ], description:'Track the affected user, field/state changed, before/after values, actor (user/admin/system), reason, timestamp and correlation/reference IDs. Avoid storing unnecessary raw PII in the event payload.' });

    reg({ domain:'Stock Execution & Custody', page:'Portfolios', level:'Financial', names:[
      'Stock price quote requested','Stock price quote received','Stock quote expired','Stock outcome notional locked','Market-hours order queued','Stock buy order submitted','Stock order acknowledged','Stock buy partially filled','Stock buy fill completed','Stock buy rejected','Stock buy cancelled','Stock execution retried','Average fill price recorded','Execution slippage recorded','Reveal-to-fill exposure recorded','Stock lot assigned','Stock custody transfer confirmed','Stock position reconciled','Stock sell requested','Stock sell quote received','Stock sell order submitted','Stock sell partially filled','Stock sell fill completed','Sale proceeds credited','Realized P&L recorded'
    ], description:'Track symbol, user, quoted notional/share quantity, quote timestamp/source, provider order ID, every fill, average execution price, slippage, fees, tx hash, custody/lot ID, proceeds and resulting position/balance.' });

    reg({ domain:'Stock Corporate Actions', page:'Portfolios', level:'Operational', names:[
      'Dividend received','Stock split applied','Reverse split applied','Symbol mapping changed','Token/contract mapping changed','Trading halt received','Delisting/corporate action received'
    ], description:'If supported by the stock provider, track corporate actions that alter user quantity, cash entitlement, symbol/token mapping or tradeability.' });

    reg({ domain:'Price & Oracle', page:'Reveal Monitor', level:'Operational', names:[
      'Market price snapshot stored','Stock quote stale','StockX FMV snapshot stored','Price source degraded','Fallback price source used','Price divergence threshold exceeded','Price source switched'
    ], description:'Track the price source, source timestamp, value, symbol/item, freshness, fallback reason and reference. Store continuous marks as time-series data rather than turning every market tick into a user activity event.' });

    reg({ domain:'Marketplace Settlement', page:'Secondary Market', level:'Financial', names:[
      'Buyer funds reserved','Buyer reserve released','Item custody locked','Marketplace settlement submitted on-chain','Marketplace settlement confirmed','Marketplace settlement reverted','Marketplace fee recognized','Seller balance credited','Buyer ownership finalized','Marketplace refund issued'
    ], description:'Track the full settlement chain separately from the offer/listing UI: buyer reserve, custody lock, chain/provider refs, company fee, seller proceeds, ownership finality and rollback/refund states.' });

    reg({ domain:'Bridge Exceptions', page:'Swaps / Bridge', level:'Financial', names:[
      'USDC token contract validated','Unsupported asset received','Unsupported USDC contract received','Duplicate deposit ignored','Source transaction reorged','Bridge quote expired','Destination credit delayed','Bridge recovery started','Bridge refund completed','Bridge provider degraded','Bridge amount discrepancy detected'
    ], description:'Track inbound token/contract, source chain and tx, confirmations, expected vs observed amount, route/provider, company-paid costs, recovery/refund and final user credit state.' });

    reg({ domain:'Inventory & Supplier', page:'Portfolios / Activity', level:'Financial', names:[
      'Prize inventory reserved','Inventory reservation released','Supplier purchase order created','Supplier invoice received','Supplier payout sent','Item received at warehouse','SKU/size mapping changed','Item cost basis updated','Inventory discrepancy detected','Item unavailable','Item damaged/lost','Return received'
    ], description:'Track the physical item/SKU, size, supplier, reservation, actual cost basis, warehouse state and any exception. These events can stay in Activity/User history without requiring a separate Fulfillment page.' });

    reg({ domain:'Treasury Exposure', page:'Reconciliation', level:'Financial', names:[
      'User deposit liability created','User deposit liability resolved','Prize obligation created','Prize obligation resolved','Stock acquisition cash outflow','Stock assignment liability resolved','Bridge subsidy expense recorded','Cashout obligation created','Cashout obligation resolved','Marketplace escrow liability created','Marketplace escrow liability resolved','Inventory reserve created','Inventory reserve released','Refund outflow recorded','Chargeback reserve created'
    ], description:'Track company cash versus user/customer liabilities and reserves. Distinguish principal held for users from real revenue, real cost and unresolved obligations.' });

    reg({ domain:'Risk & Disputes', page:'Portfolios / Activity', level:'Operational', names:[
      'Payment chargeback opened','Payment chargeback won','Payment chargeback lost','Deposit reversed','Refund issued','Withdrawal held','Withdrawal released','Account risk hold placed','Account risk hold released','Suspicious activity flag created','Duplicate funding event detected'
    ], description:'Track the affected user/transaction, amount, provider case/reference, reason, state transitions and financial consequence. Keep it in the user timeline plus the relevant financial page.' });

    reg({ domain:'Platform Configuration', page:'Activity', level:'Operational', names:[
      'Crate odds version changed','Prize pool changed','Pity threshold changed','Duplicate-prevention rule changed','Cashout haircut changed','Marketplace fee changed','Stock execution fee changed','Bridge routing configuration changed','Supported network added','Supported network removed','Price source changed','Vault expiry/liquidation rule changed','Shipping pricing rule changed'
    ], description:'Track operator, old/new configuration, version, effective time and reason. These settings directly change user outcomes or platform economics and need an audit trail.' });

    reg({ domain:'Provider / System Exceptions', page:'Reconciliation', level:'Operational', names:[
      'Provider API degraded','Provider webhook failed','Webhook retry exhausted','Chain transaction dropped','Chain reorg detected','Orphaned external transaction','Idempotency collision detected','Custody provider mismatch'
    ], description:'Track external provider/chain failures that can create duplicate, missing, delayed or inconsistent business events.' });

    const sam = document.getElementById('view-sam');
    if (sam && !document.getElementById('samCoreNote')) {
      const firstPanel = sam.querySelector('.panel');
      const note = document.createElement('div');
      note.id = 'samCoreNote'; note.className = 'fee-note'; note.style.marginBottom = '12px';
      note.innerHTML = '<strong>Build priority:</strong> Financial + Operational events are the core refined build. Product Analytics such as theme changes, search/filter clicks and page views are optional telemetry and should not block launch.';
      firstPanel?.before(note);
    }
  }, 0);

  renderers.portfolios();
  if (document.getElementById('view-activity')?.classList.contains('active')) renderActivity();
})();

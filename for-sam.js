(() => {
  if (window.__observeForSam) return;
  window.__observeForSam = true;

  const pageMap = {
    'Wallet & Funding': 'Wallet & Payments',
    'Purchases': 'Purchases',
    'Reveal Monitor': 'Reveal Monitor',
    'Prize Settlement': 'Reveal Monitor / Activity',
    'Vault': 'Portfolios / Activity',
    'Marketplace': 'Secondary Market',
    'Stocks': 'Portfolios',
    'Fees': 'Fee Tracker',
    'Shipping': 'Activity',
    'Rewards & Credits': 'Rewards & Credits',
    'Treasury': 'Activity / Reconciliation',
    'Reconciliation': 'Reconciliation',
    'Admin': 'Activity',
    'Product Analytics': 'Activity',
    'Swaps & Bridge': 'Swaps / Bridge'
  };

  const defaultDescriptions = {
    'Wallet & Funding': 'Track source/destination, rail, provider/network, amount, fees, external reference and resulting balance.',
    'Purchases': 'Track user, product, quantity, original funding rail, amount, payment reference, bonus, XP and downstream reveal.',
    'Reveal Monitor': 'Track commit, locked outcomes, selection, rarity, FMV snapshot, fairness state, flags and final decision.',
    'Prize Settlement': 'Track the user choice and the resulting balance, ownership or stock assignment consequence.',
    'Vault': 'Track item ownership, initial/live FMV, funding rail, 365-day state, listing state, transfer and final settlement.',
    'Marketplace': 'Track listing, offer, counterparty, amount, status, fees, custody transfer and sale settlement.',
    'Stocks': 'Track order/fill, shares, basis, position ownership, transfer, sale proceeds, execution cost and resulting cash balance.',
    'Fees': 'Track actual cost, fee charged, amount recovered, subsidy, network/provider and net platform exposure.',
    'Shipping': 'Track shipping quote, amount collected, label/carrier cost, supplier/item cost and delivery state.',
    'Rewards & Credits': 'Track non-cash Credits movement, referral/reward source, status, balance after and linked activity.',
    'Treasury': 'Track real company inflow/outflow, obligation/reserve changes, supplier settlement and revenue/cost classification.',
    'Reconciliation': 'Track internal value, independently observed value, difference, severity, source of truth and resolution state.',
    'Admin': 'Track operator, reason, before/after values, affected user/object and approval/audit reference.',
    'Product Analytics': 'Track useful product behavior separately from the financial ledger.',
    'Swaps & Bridge': 'Track source chain/tx, sent USDC, route/provider, destination Robinhood tx, received USDC, company-paid gas/bridge costs and status.'
  };

  const supplemental = [];
  window.observeRegisterTransactionTypes = function ({ domain, page, level = 'Operational', names = [], description = '' }) {
    names.forEach(name => {
      if (!supplemental.some(x => x.domain === domain && x.name === name)) {
        supplemental.push({ domain, page: page || pageMap[domain] || domain, level, name, description: description || defaultDescriptions[domain] || 'Track this state change with its full audit context.' });
      }
    });
    if (document.getElementById('view-sam')?.classList.contains('active')) renderForSam();
  };

  function inferPage(domain, fallback = 'Activity') {
    return pageMap[domain] || fallback;
  }

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function liveObservedTypes() {
    const rows = [];
    const push = (page, domain, level, name, description) => {
      if (!name) return;
      rows.push({ page, domain, level, name, description });
    };

    try {
      activities.forEach(x => push('Activity', x.category || 'Activity', ['Funding','Purchases','Fees','Treasury','Swaps'].includes(x.category) ? 'Financial' : x.category === 'Analytics' ? 'Analytics' : 'Operational', x.type, 'Observed in the live Activity dataset. Track the complete event context and correlation chain.'));
      marketEvents.forEach(x => push('Secondary Market', 'Marketplace', x.kind === 'Sale' ? 'Financial' : 'Operational', x.action, defaultDescriptions['Marketplace']));
      walletEvents.forEach(x => push('Wallet & Payments', 'Wallet & Funding', 'Financial', x.action, defaultDescriptions['Wallet & Funding']));
      fees.forEach(x => push('Fee Tracker', 'Fees', 'Financial', x.action, defaultDescriptions['Fees']));
      rewardEvents.forEach(x => push('Rewards & Credits', 'Rewards & Credits', 'Operational', x.event, defaultDescriptions['Rewards & Credits']));
      reveals.forEach(x => {
        if (x.flags && x.flags !== '—') push('Reveal Monitor', 'Reveal Monitor', 'Operational', x.flags, defaultDescriptions['Reveal Monitor']);
        if (x.decision) push('Reveal Monitor', 'Prize Settlement', /Cash|USDC|Credit Back/i.test(x.decision) ? 'Financial' : 'Operational', `${x.decision} decision`, defaultDescriptions['Prize Settlement']);
      });
      (window.observeSwaps || []).forEach(x => {
        push('Swaps / Bridge', 'Swaps & Bridge', 'Financial', `${x.status} bridge route`, defaultDescriptions['Swaps & Bridge']);
      });
      recon.forEach(x => push('Reconciliation', 'Reconciliation', 'Operational', `${x.result}: ${x.scope}`, defaultDescriptions['Reconciliation']));
    } catch (_) {
      // If a future build removes one demo dataset, the canonical catalog below still renders.
    }
    return rows;
  }

  function registry() {
    const out = [];
    try {
      eventCatalog.forEach(x => out.push({
        page: inferPage(x.domain),
        domain: x.domain,
        level: x.level || 'Operational',
        name: x.name,
        description: x.description || defaultDescriptions[x.domain] || 'Track this state change with its full audit context.',
        source: 'Canonical'
      }));
    } catch (_) {}

    supplemental.forEach(x => out.push({ ...x, source: 'Registered' }));

    const known = new Set(out.map(x => normalize(`${x.domain}|${x.name}`)));
    liveObservedTypes().forEach(x => {
      const key = normalize(`${x.domain}|${x.name}`);
      if (!known.has(key)) {
        known.add(key);
        out.push({ ...x, source: 'Observed' });
      }
    });

    return out.sort((a,b) => a.page.localeCompare(b.page) || a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
  }

  function buildSamPrompt() {
    const all = registry();
    const grouped = new Map();
    all.forEach(x => {
      if (!grouped.has(x.page)) grouped.set(x.page, new Map());
      const domains = grouped.get(x.page);
      if (!domains.has(x.domain)) domains.set(x.domain, []);
      domains.get(x.domain).push(x);
    });

    const eventSections = [...grouped.entries()].map(([page, domains]) => {
      const domainText = [...domains.entries()].map(([domain, items]) => {
        const rows = items.map(x => `- [${x.level}] ${x.name}\n  Capture: ${x.description}`).join('\n');
        return `### ${domain}\n${rows}`;
      }).join('\n\n');
      return `## PAGE: ${page}\n${domainText}`;
    }).join('\n\n');

    return `You are implementing the refined production version of Observe for Chosen, an on-chain gacha / marketplace / stock platform. Use the following as the tracking and observability specification. Do not treat this as UI-only work: design the backend event model, immutable ledger, projections, reconciliation and page-level views needed to make every lifecycle auditable. Preserve existing product behavior unless a requirement below explicitly changes it.

CORE ARCHITECTURE
- Use an append-only event ledger. Never overwrite or destroy historical state transitions.
- Every meaningful lifecycle must have an event_id, event_type, user_id when applicable, created_at/occurred_at, status and idempotency key.
- Use correlation_id to connect multi-step flows end-to-end across pages and providers.
- Preserve provider/order/transaction/reference IDs from payment processors, blockchains, bridge routers, stock execution/custody providers, marketplace settlement, suppliers and shipping systems.
- Build read-optimized projections for balances, portfolios, marketplace state, vault state, stock positions, rewards, fees and Treasury; derive these from the event history.
- Portfolios is the user 360 view. Any event involving a specific user should remain visible on its dedicated operational page AND be queryable in that user's unified Portfolio timeline.
- Track before/after values for account/config/admin changes.
- Keep financial, operational and analytics events distinguishable. Financial + operational tracking is core; analytics is secondary.

CORE PLATFORM RULES
- Cash, USDC and Credits are distinct rails/economies and must not be accidentally merged.
- Preserve the original funding rail throughout each crate lifecycle.
- Cash-funded collectible crate cashout returns Cash; USDC-funded collectible crate cashout returns USDC; Credits-funded crate settlement returns Credits/Credit Back.
- Stock packs are Cash-only.
- A stock win is not merely a balance number: quote, order submission, provider acknowledgement, fills, average execution price, slippage, execution/network fees, lot assignment, custody confirmation and reconciliation should be traceable.
- Once stock is acquired and assigned, principal belongs to the user. A later sell liquidates that user's holding; platform exposure is execution/network cost and any configured fee/recovery, not the stock principal again.
- Multi-chain USDC deposits may arrive from supported networks and are normalized to Robinhood Chain. Chosen pays bridge/gas/routing costs, while user principal remains separate from those company expenses.
- Gross marketplace sale value is not company revenue. Only Chosen's marketplace fee is revenue. Buyer reserve, seller proceeds, ownership transfer and settlement finality should be independently traceable.
- Failed blockchain actions may still incur real gas/route costs and must remain in fee accounting.
- Physical prizes need ownership, FMV, supplier/inventory cost basis, pending exposure and 365-day state.
- Treasury must distinguish user principal/liabilities/reserves from actual revenue and real expenses.
- Continuous market price ticks should live in time-series data; create operational events for meaningful price snapshots, stale quotes, provider failover or divergence rather than flooding the activity ledger with every tick.

MINIMUM FIELDS ON EVERY EVENT
Identity: event_id, event_type, user_id where applicable, created_at/occurred_at.
Linkage: correlation_id, idempotency_key, parent/reference IDs, counterparty_user_id when applicable.
Financial context when relevant: amount, currency, payment rail, source/destination network, provider, tx hash, actual network/execution fee, user fee, recovered amount, subsidy, before/after balance.
State: status, before/after values, error/reason, metadata, external/provider reference.
Domain-specific IDs when relevant: purchase_id, reveal_id, inventory_item_id, listing_id, offer_id, stock_order_id, stock_lot_id, shipment_id, swap_id.

IMPLEMENTATION REQUIREMENTS
1. Implement all Financial and Operational event types below as first-class trackable states where they are applicable to the product.
2. Keep Analytics events separate from financial/operational reporting.
3. Do not collapse multi-step flows into one opaque row. For example, an accepted marketplace offer should still show reserve/debit, fee, seller credit, ownership transfer and settlement finality as correlated events.
4. Every user-specific event should also be discoverable in that user's Portfolio ledger, including username/wallet/account status/risk changes.
5. Reconciliation should compare internal projections against independent sources of truth and surface mismatches, orphan transactions, stale quotes, custody differences and stuck flows.
6. If a listed event does not apply to the current implementation, preserve it in the event registry/spec instead of silently deleting it.
7. When adding a new product flow later, register its new transaction/event types so the For Sam handoff remains automatically synchronized.

TRACKING CHECKLIST (${all.length} CURRENT TYPES)

${eventSections}

DELIVERABLE
Refine the existing implementation around this event model. Map each current product action to the relevant event types, define the schemas/state transitions, implement or preserve the page-level views, and make Portfolios the unified per-user audit trail. Prioritize correctness, traceability, idempotency, reconciliation and accurate separation of user principal vs platform revenue/cost. Do not remove existing working features simply because they are not explicitly repeated in this prompt.`;
  }

  async function copySamPrompt() {
    const button = document.getElementById('samCopyPrompt');
    const prompt = buildSamPrompt();
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt);
        copied = true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = prompt;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        textarea.remove();
      }
    } catch (_) {
      copied = false;
    }

    if (button) {
      const original = button.dataset.originalText || 'Copy AI prompt';
      button.dataset.originalText = original;
      button.textContent = copied ? `Copied ${registry().length} types ✓` : 'Copy failed — try again';
      setTimeout(() => { button.textContent = original; }, 2200);
    }
    if (copied && typeof toast === 'function') toast('Full For Sam AI prompt copied');
  }

  function injectUI() {
    const subnav = document.querySelector('.subnav');
    if (subnav && !subnav.querySelector('[data-view="sam"]')) {
      const divider = document.createElement('div');
      divider.className = 'nav-group-label';
      divider.textContent = 'BUILD HANDOFF';
      divider.style.marginTop = '10px';
      divider.style.paddingLeft = '14px';
      subnav.appendChild(divider);

      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.view = 'sam';
      btn.innerHTML = '<span>For Sam</span><span style="font-size:10px;color:#66717a">↗</span>';
      btn.addEventListener('click', () => showView('sam'));
      subnav.appendChild(btn);
    }

    const main = document.querySelector('main.content');
    if (main && !document.getElementById('view-sam')) {
      const section = document.createElement('section');
      section.className = 'view';
      section.id = 'view-sam';
      section.dataset.title = 'For Sam';
      section.dataset.eyebrow = 'BUILD HANDOFF / TRANSACTION MAP';
      section.innerHTML = `
        <div class="section-intro">
          <div>
            <h2>Everything Sam should track</h2>
            <p>This page is the implementation handoff: every transaction, state change and operational event currently defined or observed across Observe. It is generated from the same canonical event catalog and live page datasets, so new registered event types automatically appear here.</p>
          </div>
          <div class="panel-tools" style="justify-content:flex-end">
            <div class="timestamp">Auto-generated from Observe</div>
            <button class="outline-button" id="samCopyPrompt" type="button">Copy AI prompt</button>
          </div>
        </div>
        <div class="metric-grid four" id="samMetrics"></div>
        <div class="panel">
          <div class="panel-header"><div><h3>Minimum fields on every event</h3><p>Regardless of page, these fields make the system traceable instead of just visually informative.</p></div></div>
          <div class="control-list">
            <div><strong>Identity</strong><span>event_id · event_type · user_id · created_at</span></div>
            <div><strong>Linkage</strong><span>correlation_id · parent/reference IDs · counterparty when relevant</span></div>
            <div><strong>Financial context</strong><span>amount · currency · payment rail · network/provider · actual fee · user fee</span></div>
            <div><strong>State</strong><span>status · before/after values · error/reason · metadata · idempotency key</span></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header wrap">
            <div><h3>Full transaction & event checklist</h3><p>Use this as the backend tracking checklist when rebuilding the refined version.</p></div>
            <div class="panel-tools">
              <label class="search-box"><span>⌕</span><input id="samSearch" placeholder="Search transaction type…" /></label>
              <select id="samPage" class="select-control"><option value="all">All pages</option></select>
              <select id="samLevel" class="select-control"><option value="all">All types</option><option value="Financial">Financial</option><option value="Operational">Operational</option><option value="Analytics">Analytics</option></select>
            </div>
          </div>
          <div id="samChecklist"></div>
        </div>`;
      main.appendChild(section);
    }
  }

  function renderForSam() {
    const host = document.getElementById('samChecklist');
    if (!host) return;
    const all = registry();
    const pages = [...new Set(all.map(x => x.page))].sort();
    const pageSelect = document.getElementById('samPage');
    if (pageSelect && pageSelect.options.length === 1) pages.forEach(p => pageSelect.add(new Option(p, p)));

    const q = (document.getElementById('samSearch')?.value || '').toLowerCase();
    const page = pageSelect?.value || 'all';
    const level = document.getElementById('samLevel')?.value || 'all';
    const rows = all.filter(x => (page === 'all' || x.page === page) && (level === 'all' || x.level === level) && Object.values(x).join(' ').toLowerCase().includes(q));

    const financial = all.filter(x => x.level === 'Financial').length;
    const operational = all.filter(x => x.level === 'Operational').length;
    const analytics = all.filter(x => x.level === 'Analytics').length;
    document.getElementById('samMetrics').innerHTML =
      metric('Total transaction / event types', num(all.length), `${pages.length} page groups`)+
      metric('Financial', num(financial), 'Moves or measures money, Credits, fees or exposure')+
      metric('Operational', num(operational), 'Ownership, lifecycle, state and exceptions')+
      metric('Analytics', num(analytics), 'Behavioral telemetry kept separate from accounting');

    const grouped = new Map();
    rows.forEach(x => {
      if (!grouped.has(x.page)) grouped.set(x.page, []);
      grouped.get(x.page).push(x);
    });

    host.innerHTML = grouped.size ? [...grouped.entries()].map(([pageName, items]) => `
      <div style="border-bottom:1px solid var(--border)">
        <div class="panel-header" style="background:#0e1418;border-top:1px solid var(--border)">
          <div><h3>${esc(pageName)}</h3><p>${items.length} tracked type${items.length === 1 ? '' : 's'}</p></div>
        </div>
        <div class="table-wrap">
          <table style="min-width:980px">
            <thead><tr><th style="width:22%">Domain</th><th style="width:28%">Transaction / event type</th><th style="width:10%">Class</th><th>What Sam should capture</th><th style="width:9%">Source</th></tr></thead>
            <tbody>${items.map(x => `<tr style="cursor:default"><td><span class="cell-primary">${esc(x.domain)}</span></td><td><span class="cell-primary">${esc(x.name)}</span></td><td>${status(x.level)}</td><td style="white-space:normal;min-width:320px;line-height:1.45">${esc(x.description)}</td><td><span class="tag internal">${esc(x.source)}</span></td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`).join('') : '<div class="empty-state">No transaction types match these filters.</div>';
  }

  injectUI();
  renderers.sam = renderForSam;
  document.getElementById('samCopyPrompt')?.addEventListener('click', copySamPrompt);
  document.getElementById('samSearch')?.addEventListener('input', renderForSam);
  document.getElementById('samPage')?.addEventListener('change', renderForSam);
  document.getElementById('samLevel')?.addEventListener('change', renderForSam);
  renderForSam();
})();

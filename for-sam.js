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
          <div class="timestamp">Auto-generated from Observe</div>
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
  document.getElementById('samSearch')?.addEventListener('input', renderForSam);
  document.getElementById('samPage')?.addEventListener('change', renderForSam);
  document.getElementById('samLevel')?.addEventListener('change', renderForSam);
  renderForSam();
})();

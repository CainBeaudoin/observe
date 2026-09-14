(() => {
  if (window.__observeReferralsPage) return;
  window.__observeReferralsPage = true;

  const profiles = window.observeReferralProfiles || {};
  const tiers = [
    { min:1, max:10, rate:.01, label:'Starter' },
    { min:11, max:25, rate:.0125, label:'Builder' },
    { min:26, max:50, rate:.015, label:'Growth' },
    { min:51, max:100, rate:.0175, label:'Partner' },
    { min:101, max:null, rate:.02, label:'Top Partner' }
  ];

  const logs = [
    { mins:7, referrer:'usr_01HZYQ', referred:'usr_01HZX9', action:'Cashout share finalized', entry:50, win:1000, cashout:800, rate:.015, earning:12, status:'Claimable', ref:'refearn_288', note:'$1,000 displayed win → 80% cashout → $800 realized. Referral is based on the $800 actually credited.' },
    { mins:14, referrer:'usr_01HZX2', referred:'usr_01HZYA', action:'Cashout share accrued', entry:50, win:37.50, cashout:30, rate:.0125, earning:.375, status:'Pending', ref:'refearn_301', note:'The friend lost on the open, so the realized cashout and referral earning are both smaller.' },
    { mins:31, referrer:'usr_01HZX9', referred:'usr_01HZYA', action:'No earning · item kept', entry:100, win:430, cashout:0, rate:.01, earning:0, status:'No payout', ref:'refkeep_051', note:'Keeping an item does not create cash referral earnings. A later Chosen buyout can.' },
    { mins:52, referrer:'usr_01HZX2', referred:'usr_01J001', action:'Later vault buyout finalized', entry:100, win:950, cashout:760, rate:.0125, earning:9.50, status:'Claimable', ref:'refvault_211', note:'The item was kept first, then later bought out by Chosen for $760. The commission is created at that realized payout.' },
    { mins:78, referrer:'usr_01J001', referred:'usr_01HZZ4', action:'Cashout share clawback', entry:250, win:630, cashout:504, rate:.0125, earning:-6.30, status:'Review', ref:'refclaw_044', note:'The original card-funded transaction was charged back, so its referral earning was reversed.' },
    { mins:110, referrer:'usr_01HZX2', referred:'—', action:'Tier changed', entry:null, win:null, cashout:null, rate:.0125, earning:0, status:'Active', ref:'reftier_018', note:'18 active referrals moved the account from 1.00% to 1.25%. Existing openings keep their snapshotted rate.' },
    { mins:143, referrer:'usr_01HZX2', referred:'—', action:'Referral claim paid', entry:null, win:null, cashout:null, rate:.0125, earning:151.75, status:'Paid', ref:'refclaim_092', note:'Claimable referral balance paid. Pending earnings remain separate.' },
    { mins:188, referrer:'usr_01HZYA', referred:'usr_01HZZ4', action:'Referral activated', entry:50, win:null, cashout:null, rate:.01, earning:0, status:'Active', ref:'refact_033', note:'The referred account completed its first qualifying paid open and now counts toward the referrer tier.' }
  ];
  window.observeReferralLogs = logs;

  const navAnchor = document.querySelector('.nav-item[data-view="recon"]');
  if (navAnchor && !document.querySelector('.nav-item[data-view="referrals"]')) {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.dataset.view = 'referrals';
    btn.textContent = 'Referrals';
    navAnchor.parentNode.insertBefore(btn, navAnchor);
    btn.addEventListener('click', () => showView('referrals'));
  }

  const reconView = document.getElementById('view-recon');
  if (reconView && !document.getElementById('view-referrals')) {
    const section = document.createElement('section');
    section.className = 'view';
    section.id = 'view-referrals';
    section.dataset.title = 'Referrals';
    section.dataset.eyebrow = 'ACTIVITY / REFERRALS';
    reconView.parentNode.insertBefore(section, reconView);
  }

  const style = document.createElement('style');
  style.textContent = `
    #view-referrals .referral-callout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:8px}
    #view-referrals .referral-rule{padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--panel)}
    #view-referrals .referral-rule strong{display:block;font-size:13px;margin-bottom:4px}
    #view-referrals .referral-rule p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
    #view-referrals .formula-box{display:flex;align-items:center;justify-content:center;min-height:100%;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--panel);text-align:center}
    #view-referrals .formula-main{font-size:15px;font-weight:700;line-height:1.5}
    #view-referrals .formula-sub{display:block;color:var(--muted);font-size:11px;font-weight:500;margin-top:4px}
    #view-referrals .referral-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:12px}
    #view-referrals .referral-step{padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--panel2)}
    #view-referrals .referral-step span{display:block;color:var(--muted);font-size:10px;margin-bottom:6px}
    #view-referrals .referral-step strong{display:block;font-size:12px;margin-bottom:4px}
    #view-referrals .referral-step p{margin:0;color:var(--muted);font-size:11px;line-height:1.45}
    #view-referrals .working-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;padding:5px 8px;border:1px solid var(--border);border-radius:999px;color:var(--muted)}
    #view-referrals .referral-two-col{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:start}
    #view-referrals .scenario-grid{display:grid;grid-template-columns:repeat(4,minmax(110px,1fr));gap:8px;padding:12px 12px 0}
    #view-referrals .scenario-field{display:flex;flex-direction:column;gap:5px}
    #view-referrals .scenario-field span{font-size:10px;color:var(--muted);font-weight:600}
    #view-referrals .scenario-field input{width:100%;height:34px;border:1px solid var(--border2);border-radius:8px;background:#0d1318;color:var(--text);padding:0 9px;font:inherit;outline:none}
    #view-referrals .scenario-field input:focus{border-color:#3a4a56}
    #view-referrals .scenario-results{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px;padding:0 12px}
    #view-referrals .scenario-result{padding:10px;border:1px solid var(--border);border-radius:9px;background:var(--panel2)}
    #view-referrals .scenario-result span{display:block;color:var(--muted);font-size:10px;margin-bottom:4px}
    #view-referrals .scenario-result strong{font-size:14px}
    #view-referrals .referral-note{margin:9px 12px 12px;padding:9px 10px;border-left:2px solid var(--muted);background:var(--panel2);font-size:11px;color:var(--muted);line-height:1.5}
    #view-referrals .adapt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:12px}
    #view-referrals .adapt-item{padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--panel2)}
    #view-referrals .adapt-item strong{display:block;font-size:11px;margin-bottom:4px}
    #view-referrals .adapt-item span{font-size:10px;color:var(--muted);line-height:1.4;display:block}
    #view-referrals table{font-size:11px}
    #view-referrals .table-wrap{max-height:330px}
    #view-referrals .logic-table-wrap{max-height:285px}
    @media(max-width:1100px){#view-referrals .referral-callout,#view-referrals .referral-two-col{grid-template-columns:1fr}#view-referrals .referral-steps{grid-template-columns:repeat(2,1fr)}#view-referrals .adapt-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:720px){#view-referrals .referral-steps,#view-referrals .scenario-grid,#view-referrals .scenario-results,#view-referrals .adapt-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  const rateLabel = r => `${(r * 100).toFixed(2).replace(/\.00$/,'').replace(/0$/,'')}%`;
  const tierFor = active => tiers.find(t => active >= t.min && (t.max == null || active <= t.max)) || { label:'Not active', rate:0 };
  const sum = (arr, key) => arr.reduce((a,x)=>a+Number(x[key]||0),0);

  function profileRows() {
    return Object.entries(profiles).map(([id,p]) => ({ id, ...p, user:userById[id] })).sort((a,b)=>b.activeReferrals-a.activeReferrals);
  }

  function renderReferrals() {
    const view = document.getElementById('view-referrals');
    if (!view) return;
    const rows = profileRows();
    const totalActive = sum(rows,'activeReferrals');
    const totalCashout = sum(rows,'cashoutVolume30d');
    const totalPending = sum(rows,'pending');
    const totalClaimable = sum(rows,'claimable');

    view.innerHTML = `
      <div class="section-intro">
        <div><div class="working-badge">WORKING MODEL · DEMO ECONOMICS</div><h2 style="margin-top:7px">Referral cashout share</h2><p>This page is both an operations view and a plain-English model of how the referral system could work. The core idea: the referrer earns when their friend actually realizes a cashout — not simply because the friend spent money.</p></div>
        <div class="timestamp">Illustrative rules · adaptable before launch</div>
      </div>

      <div class="metric-grid four">
        ${metric('Active referrals',num(totalActive),'Across demo referrers')}
        ${metric('Referred cashouts · 30d',money(totalCashout),'The actual commission basis')}
        ${metric('Pending commission',money(totalPending),'Waiting on payment / cashout finality')}
        ${metric('Claimable commission',money(totalClaimable),'Finalized referral liability')}
      </div>

      <div class="referral-callout">
        <div class="panel">
          <div class="panel-header"><div><h3>The simple idea</h3><p>A good referral should feel better when the friend hits something big.</p></div></div>
          <div class="referral-steps">
            <div class="referral-step"><span>01 · REFER</span><strong>Friend becomes active</strong><p>They count once they complete their first qualifying paid open.</p></div>
            <div class="referral-step"><span>02 · OPEN</span><strong>Rate gets snapshotted</strong><p>The referrer’s current tier is attached to that opening so future tier changes do not rewrite history.</p></div>
            <div class="referral-step"><span>03 · CASH OUT</span><strong>Use actual payout</strong><p>The displayed win is context. The commission basis is the cash or USDC actually credited.</p></div>
            <div class="referral-step"><span>04 · FINALIZE</span><strong>Pending → claimable</strong><p>Wait for finality. Refunds, fraud or chargebacks can cancel or reverse the related earning.</p></div>
          </div>
        </div>
        <div class="formula-box">
          <div><div class="formula-main">Referral earning =<br>realized eligible cashout × tier rate</div><span class="formula-sub">No realized cashout = no cash referral earning yet.</span></div>
        </div>
      </div>

      <div class="referral-two-col">
        <div class="panel">
          <div class="panel-header"><div><h3>Illustrative tier ladder</h3><p>Active referrals are the default tier metric. These percentages are examples, not final launch settings.</p></div></div>
          <div class="table-wrap logic-table-wrap"><table><thead><tr><th>Tier</th><th>Active referrals</th><th>Cashout share</th><th>What changes</th><th></th></tr></thead><tbody>
            ${tiers.map(t=>`<tr><td><strong>${t.label}</strong></td><td>${t.max==null?`${t.min}+`:`${t.min}–${t.max}`}</td><td><strong>${rateLabel(t.rate)}</strong></td><td>${t.max==null?'Highest standard share':'Rate applies to future qualifying opens'}</td><td></td></tr>`).join('')}
          </tbody></table></div>
          <div class="referral-note"><strong>Why active referrals?</strong> It prevents empty-account farming. A referral only starts helping the tier after the referred user completes a qualifying paid open.</div>
        </div>

        <div class="panel">
          <div class="panel-header"><div><h3>Scenario calculator</h3><p>Change the assumptions to see what the referred user and referrer would receive.</p></div></div>
          <div class="scenario-grid">
            <label class="scenario-field"><span>Crate entry</span><input id="refCalcEntry" type="number" min="0" step="1" value="50"></label>
            <label class="scenario-field"><span>Win FMV</span><input id="refCalcWin" type="number" min="0" step="1" value="1000"></label>
            <label class="scenario-field"><span>Cashout %</span><input id="refCalcCashout" type="number" min="0" max="100" step="1" value="80"></label>
            <label class="scenario-field"><span>Referral share %</span><input id="refCalcRate" type="number" min="0" max="10" step="0.25" value="1"></label>
          </div>
          <div class="scenario-results">
            <div class="scenario-result"><span>Actual cashout</span><strong id="refCalcPayout">—</strong></div>
            <div class="scenario-result"><span>Referrer earns</span><strong id="refCalcEarn">—</strong></div>
            <div class="scenario-result"><span>Cashout vs entry</span><strong id="refCalcVsEntry">—</strong></div>
            <div class="scenario-result"><span>Commission basis</span><strong>Cashout only</strong></div>
          </div>
          <div class="referral-note" id="refCalcNote"></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><div><h3>How the math feels in real examples</h3><p>The referral scales with the friend’s realized outcome. A small cashout creates cents; a big hit can create a meaningful referral payout.</p></div></div>
        <div class="table-wrap logic-table-wrap"><table><thead><tr><th>Entry</th><th>Displayed win / FMV</th><th>User decision</th><th>Actual cashout</th><th>Referral rate</th><th>Referrer earns</th><th>Explanation</th><th></th></tr></thead><tbody>
          <tr><td>$50</td><td>$37.50</td><td>Cash Out</td><td>$30.00</td><td>1.00%</td><td><strong>$0.30</strong></td><td>Friend loses on the open, so the referral payout is naturally small.</td><td></td></tr>
          <tr><td>$50</td><td>$56.25</td><td>Cash Out</td><td>$45.00</td><td>1.00%</td><td><strong>$0.45</strong></td><td>Near-normal outcome at an 80% collectible cashout rate.</td><td></td></tr>
          <tr><td>$50</td><td>$1,000</td><td>Cash Out</td><td>$800.00</td><td>1.00%</td><td><strong>$8.00</strong></td><td>The friend hits big, so the referrer feels the win too.</td><td></td></tr>
          <tr><td>$50</td><td>$1,000</td><td>Keep</td><td>$0 now</td><td>1.00%</td><td><strong>$0 now</strong></td><td>No money realized yet. A later Chosen buyout can create the earning then.</td><td></td></tr>
          <tr><td>$50</td><td>$1,000</td><td>Later buyout</td><td>$760.00</td><td>1.25%</td><td><strong>$9.50</strong></td><td>Commission follows the actual later payout and the snapshotted opening rate.</td><td></td></tr>
        </tbody></table></div>
      </div>

      <div class="referral-two-col">
        <div class="panel">
          <div class="panel-header"><div><h3>What it costs the platform</h3><p>Illustrative $50 crate with 90% expected payout / 10% house edge before referral cost.</p></div></div>
          <div class="table-wrap logic-table-wrap"><table><thead><tr><th>Cashout share</th><th>Expected payout</th><th>Expected referral cost</th><th>House edge before</th><th>House edge after</th><th>% of house edge used</th><th></th></tr></thead><tbody>
            ${tiers.map(t=>{const payout=45,cost=payout*t.rate,edge=5-cost;return `<tr><td>${rateLabel(t.rate)}</td><td>${money(payout)}</td><td>${money(cost)}</td><td>$5.00</td><td><strong>${money(edge)}</strong></td><td>${((cost/5)*100).toFixed(2).replace(/\.00$/,'')}%</td><td></td></tr>`}).join('')}
          </tbody></table></div>
          <div class="referral-note">This is expected-value math, not a promise that every individual open is profitable. A $1,000 hit can be a large loss on that one open; the economics are managed across the whole prize pool.</div>
        </div>
        <div class="panel">
          <div class="panel-header"><div><h3>What can stay adaptable</h3><p>The system should be configurable instead of hard-coding one forever-rule.</p></div></div>
          <div class="adapt-grid">
            <div class="adapt-item"><strong>Tier metric</strong><span>Active referrals by default; could later use 30d referred opens or volume.</span></div>
            <div class="adapt-item"><strong>Rate ladder</strong><span>1% → 2% example ladder can be versioned without repricing old openings.</span></div>
            <div class="adapt-item"><strong>Eligible products</strong><span>Collectible crates, stocks, promotions or specific tiers can have different rules.</span></div>
            <div class="adapt-item"><strong>Eligible payout rails</strong><span>Cash / USDC can qualify; Credit Back can be included, excluded or use a separate Credits reward.</span></div>
            <div class="adapt-item"><strong>Hold / finality</strong><span>Pending period can depend on Coinflow, chain finality, fraud risk or payment method.</span></div>
            <div class="adapt-item"><strong>Caps & campaigns</strong><span>Optional per-open caps, partner overrides, temporary boosts or creator-specific rates.</span></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><div><h3>Referrer profiles · demo</h3><p>Profile-side metrics show both acquisition activity and the actual cashout volume producing referral earnings.</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>Referrer</th><th>Active / total refs</th><th>Current tier</th><th>Share</th><th>Referred opens · 30d</th><th>Entry volume · 30d</th><th>Cashout volume · 30d</th><th>Pending</th><th>Claimable</th><th>Lifetime paid</th><th></th></tr></thead><tbody>
          ${rows.map(r=>{const t=tierFor(r.activeReferrals);return `<tr data-detail="user" data-id="${r.id}"><td><span class="cell-primary">${esc(r.user?.name||r.id)}</span><span class="cell-secondary">${esc(r.user?.handle||r.id)}</span></td><td>${num(r.activeReferrals)} / ${num(r.referredUsers)}</td><td>${t.label}</td><td><strong>${rateLabel(r.shareRate)}</strong></td><td>${num(r.opens30d)}</td><td>${money(r.referredVolume30d)}</td><td>${money(r.cashoutVolume30d)}</td><td>${money(r.pending)}</td><td>${money(r.claimable)}</td><td>${money(r.lifetimePaid)}</td><td>›</td></tr>`}).join('')}
        </tbody></table></div>
      </div>

      <div class="panel">
        <div class="panel-header wrap"><div><h3>Example referral ledger</h3><p>Artificial activity to show how attribution, cashouts, tier changes, claims and reversals would look operationally.</p></div><label class="search-box"><span>⌕</span><input id="referralSearch" placeholder="Referrer, user, status, reference…"></label></div>
        <div class="table-wrap"><table><thead><tr><th>Time</th><th>Event</th><th>Referrer</th><th>Referred user</th><th>Entry</th><th>Win FMV</th><th>Realized cashout</th><th>Rate</th><th>Commission</th><th>Status</th><th>Reference</th><th></th></tr></thead><tbody id="referralLedger"></tbody></table></div>
      </div>
    `;

    const calc = () => {
      const entry = Math.max(0,Number(document.getElementById('refCalcEntry')?.value||0));
      const win = Math.max(0,Number(document.getElementById('refCalcWin')?.value||0));
      const cashoutPct = Math.max(0,Number(document.getElementById('refCalcCashout')?.value||0))/100;
      const rate = Math.max(0,Number(document.getElementById('refCalcRate')?.value||0))/100;
      const payout = win*cashoutPct;
      const earning = payout*rate;
      const vs = entry ? (payout/entry)*100 : 0;
      document.getElementById('refCalcPayout').textContent = money(payout);
      document.getElementById('refCalcEarn').textContent = money(earning);
      document.getElementById('refCalcVsEntry').textContent = `${vs.toFixed(1)}%`;
      document.getElementById('refCalcNote').innerHTML = `<strong>${money(entry)} was spent, but spend is not the commission basis.</strong> A ${money(win)} win at ${(cashoutPct*100).toFixed(0)}% creates ${money(payout)} of realized cashout. At ${rateLabel(rate)}, the referrer earns ${money(earning)}.`;
    };
    ['refCalcEntry','refCalcWin','refCalcCashout','refCalcRate'].forEach(id=>document.getElementById(id)?.addEventListener('input',calc));
    calc();

    const renderLedger = () => {
      const q = (document.getElementById('referralSearch')?.value||'').trim().toLowerCase();
      const filtered = logs.filter(x=>!q || `${x.action} ${userName(x.referrer)} ${x.referred==='—'?'':userName(x.referred)} ${x.status} ${x.ref} ${x.note}`.toLowerCase().includes(q));
      document.getElementById('referralLedger').innerHTML = filtered.map(x=>`<tr><td>${timeAgo(x.mins)}</td><td><span class="cell-primary">${esc(x.action)}</span><span class="cell-secondary">${esc(x.note)}</span></td><td>${esc(userName(x.referrer))}</td><td>${x.referred==='—'?'—':esc(userName(x.referred))}</td><td>${x.entry==null?'—':money(x.entry)}</td><td>${x.win==null?'—':money(x.win)}</td><td>${x.cashout==null?'—':money(x.cashout)}</td><td>${rateLabel(x.rate)}</td><td>${x.earning ? `${x.earning>0?'+':''}${money(x.earning)}` : '—'}</td><td>${status(x.status)}</td><td class="mono">${esc(x.ref)}</td><td></td></tr>`).join('');
    };
    document.getElementById('referralSearch')?.addEventListener('input',renderLedger);
    renderLedger();
  }

  renderers.referrals = renderReferrals;
  if (document.getElementById('view-referrals')?.classList.contains('active')) renderReferrals();
})();

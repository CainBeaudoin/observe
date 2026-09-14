(() => {
  if (window.__observeCoinflowPayments) return;
  window.__observeCoinflowPayments = true;

  const cfRand = (() => { let s = 0xc01f10; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const cfPick = xs => xs[Math.floor(cfRand() * xs.length)];
  const cfRound = (n, d = 2) => Number(n.toFixed(d));
  const cfId = (p, i) => `${p}_${String(i).padStart(4, '0')}`;
  const cfUsers = users.filter(Boolean);

  const coinflowEvents = [];
  let cfSeq = 1;
  const addCF = (event, method, family, statusValue, opts = {}) => {
    const u = opts.user || cfPick(cfUsers);
    const amount = opts.amount ?? cfRound(15 + cfRand() * 850);
    const fee = opts.fee ?? cfRound(amount * (method === 'ACH' || method === 'SEPA' || method === 'UK Faster Payments' ? 0.006 : 0.026) + (method.includes('Card') || /Pay$/.test(method) ? 0.25 : 0), 2);
    const id = opts.id || cfId('cfpay', cfSeq++);
    const corr = opts.corr || `corr_${id}`;
    const row = {
      mins: opts.mins ?? (6 + cfSeq * 9), user: u.id, event, method, family, status: statusValue,
      amount, fee, id, corr,
      paymentId: opts.paymentId || id,
      refundId: opts.refundId || '',
      chargebackId: opts.chargebackId || '',
      presentmentCurrency: opts.presentmentCurrency || 'USD',
      settlementCurrency: opts.settlementCurrency || 'USD',
      presentmentTotal: opts.presentmentTotal ?? amount,
      settlementTotal: opts.settlementTotal ?? amount,
      providerFee: opts.providerFee ?? fee,
      gasFee: opts.gasFee ?? 0,
      chargebackProtectionFee: opts.chargebackProtectionFee ?? 0,
      networkFee: opts.networkFee ?? 0,
      fxFee: opts.fxFee ?? 0,
      payInFee: opts.payInFee ?? 0,
      last4: opts.last4 || (method === 'Credit Card' || method === 'Debit Card' ? String(1000 + Math.floor(cfRand() * 8999)) : ''),
      bin: opts.bin || (method === 'Credit Card' || method === 'Debit Card' ? String(400000 + Math.floor(cfRand() * 99999)) : ''),
      detail: opts.detail || 'Coinflow provider event',
      direction: opts.direction || 'Info'
    };
    coinflowEvents.push(row);
    return row;
  };

  // Card, Apple Pay and Google Pay share Coinflow's card-payment lifecycle. The payment method remains a separate field.
  const cardMethods = ['Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay'];
  for (let i = 0; i < 10; i++) {
    const method = cfPick(cardMethods), u = cfPick(cfUsers), amount = cfRound(25 + cfRand() * 700), paymentId = cfId('cf_card', i + 1), corr = `corr_${paymentId}`;
    addCF('Card Payment Authorized', method, 'Card / Wallet Pay-in', 'Authorized', { user:u, amount, paymentId, corr, mins: 8 + i * 23, direction:'Info', detail:'Issuer authorization received; payment not yet captured.' });
    if (i === 2) {
      addCF('Payment Pending Review', method, 'Risk / Review', 'Review', { user:u, amount, paymentId, corr, mins: 7 + i * 23, direction:'Info', detail:'Chargeback-protection review requires merchant decision.' });
      continue;
    }
    if (i === 4) {
      addCF('Card Payment Declined', method, 'Card / Wallet Pay-in', 'Failed', { user:u, amount, paymentId, corr, mins: 7 + i * 23, direction:'Info', detail:'Issuer declined the authorization; preserve decline code/description.' });
      continue;
    }
    if (i === 6) {
      addCF('Card Payment Suspected Fraud', method, 'Risk / Review', 'Failed', { user:u, amount, paymentId, corr, mins: 7 + i * 23, direction:'Info', detail:'Coinflow chargeback-protection provider rejected the payment as suspected fraud.' });
      continue;
    }
    addCF('Settled', method, 'Card / Wallet Pay-in', 'Settled', { user:u, amount, paymentId, corr, mins: 6 + i * 23, direction:'In', detail:'Payment captured and settled to the configured merchant settlement location.' });
  }

  // Card lifecycle / dispute examples.
  {
    const u = cfPick(cfUsers), amount = 184.22, paymentId = 'cf_card_dispute_01', corr = `corr_${paymentId}`;
    addCF('Settled', 'Credit Card', 'Card / Wallet Pay-in', 'Settled', {user:u,amount,paymentId,corr,mins:31,direction:'In',chargebackProtectionFee:3.20,detail:'Settled card purchase with chargeback protection.'});
    addCF('Card Payment Chargeback Opened', 'Credit Card', 'Dispute', 'Review', {user:u,amount,paymentId,corr,mins:20,chargebackId:'cb_91Q2',direction:'Info',detail:'Chargeback opened. Track case ID, reason code/description and respond-by deadline.'});
    addCF('Card Payment Chargeback Won', 'Credit Card', 'Dispute', 'Resolved', {user:u,amount,paymentId,corr,mins:3,chargebackId:'cb_91Q2',direction:'Info',detail:'Chargeback resolved for merchant; release dispute reserve if applicable.'});
  }
  {
    const u = cfPick(cfUsers), amount = 96.40, paymentId = 'cf_card_dispute_02', corr = `corr_${paymentId}`;
    addCF('Card Payment Chargeback Opened', 'Apple Pay', 'Dispute', 'Review', {user:u,amount,paymentId,corr,mins:102,chargebackId:'cb_A14P',direction:'Info',detail:'Apple Pay uses the same underlying card dispute lifecycle.'});
    addCF('Card Payment Chargeback Lost', 'Apple Pay', 'Dispute', 'Failed', {user:u,amount,paymentId,corr,mins:55,chargebackId:'cb_A14P',direction:'Out',detail:'Chargeback lost; record balance/treasury consequence separately from the original purchase.'});
  }

  // Refund examples. Keep refundId distinct from paymentId because one payment can have multiple partial refunds.
  {
    const u = cfPick(cfUsers), paymentId = 'cf_ref_pay_01', corr = `corr_${paymentId}`;
    addCF('Refund', 'Google Pay', 'Refund', 'Pending', {user:u,amount:62.00,paymentId,refundId:'refund_01a',corr,mins:71,direction:'Info',detail:'Refund initiated; refundId is the idempotency identity for this refund.'});
    addCF('Refund Complete', 'Google Pay', 'Refund', 'Refunded', {user:u,amount:62.00,paymentId,refundId:'refund_01a',corr,mins:42,direction:'Out',providerFee:1.86,detail:'Refund completed back to original payment method.'});
  }
  {
    const u = cfPick(cfUsers), paymentId = 'cf_ref_pay_02', corr = `corr_${paymentId}`;
    addCF('Refund', 'Credit Card', 'Refund', 'Pending', {user:u,amount:125.00,paymentId,refundId:'refund_02a',corr,mins:160,direction:'Info',detail:'Partial refund initiated.'});
    addCF('Refund Failure', 'Credit Card', 'Refund', 'Failed', {user:u,amount:125.00,paymentId,refundId:'refund_02a',corr,mins:144,direction:'Info',detail:'Refund processing failed; retain outstanding/refund-source state for reconciliation.'});
    addCF('Refund Returned', 'Credit Card', 'Refund', 'Returned', {user:u,amount:125.00,paymentId,refundId:'refund_02b',corr,mins:118,direction:'Info',detail:'Refund was returned; maintain separate refund identity and final disposition.'});
  }

  // ACH: Pending/Initiated -> Batched -> Settled, with Returned/Failed exception paths.
  for (let i = 0; i < 5; i++) {
    const u = cfPick(cfUsers), amount = cfRound(75 + cfRand() * 1450), paymentId = cfId('cf_ach', i + 1), corr = `corr_${paymentId}`;
    addCF('ACH Initiated', 'ACH', 'Bank Pay-in', 'Pending', {user:u,amount,paymentId,corr,mins:210+i*27,direction:'Info',detail:'ACH payment started; bank authorization/processing is not instant.'});
    addCF('ACH Batched', 'ACH', 'Bank Pay-in', 'Processing', {user:u,amount,paymentId,corr,mins:205+i*27,direction:'Info',detail:'ACH accepted into bank processing batch.'});
    if (i === 2) addCF('ACH Returned', 'ACH', 'Bank Pay-in', 'Returned', {user:u,amount,paymentId,corr,mins:186+i*27,direction:'Info',detail:'Bank returned the ACH after batching; reverse any provisional entitlement if relevant.'});
    else if (i === 4) addCF('ACH Failed', 'ACH', 'Bank Pay-in', 'Failed', {user:u,amount,paymentId,corr,mins:186+i*27,direction:'Info',detail:'ACH denied by the bank.'});
    else addCF('Settled', 'ACH', 'Bank Pay-in', 'Settled', {user:u,amount,paymentId,corr,mins:180+i*27,direction:'In',detail:'ACH fully cleared and settled to merchant location.'});
  }

  // SEPA / UK Faster Payments statuses Coinflow documents separately.
  ['SEPA','UK Faster Payments'].forEach((method, idx) => {
    for (let i = 0; i < 3; i++) {
      const u = cfPick(cfUsers), amount = cfRound(40 + cfRand()*920), paymentId = cfId(method === 'SEPA' ? 'cf_sepa' : 'cf_ukfp', i+1), corr = `corr_${paymentId}`;
      addCF('Initiated', method, 'Bank Pay-in', 'Pending', {user:u,amount,paymentId,corr,mins:360+idx*90+i*22,direction:'Info',detail:'Customer confirmed payment; waiting for completion in banking app.'});
      addCF('Deposited', method, 'Bank Pay-in', 'Processing', {user:u,amount,paymentId,corr,mins:355+idx*90+i*22,direction:'Info',detail:'Customer completed payment in banking app; funds await settlement.'});
      if (i === 1 && method === 'SEPA') addCF('Payment Expiration', method, 'Bank Pay-in', 'Expired', {user:u,amount,paymentId,corr,mins:340+idx*90+i*22,direction:'Info',detail:'Payment window expired before completion.'});
      else if (i === 2 && method === 'UK Faster Payments') addCF('Failed', method, 'Bank Pay-in', 'Failed', {user:u,amount,paymentId,corr,mins:340+idx*90+i*22,direction:'Info',detail:'Bank payment failed while settling to merchant location.'});
      else addCF('Settled', method, 'Bank Pay-in', 'Settled', {user:u,amount,paymentId,corr,mins:340+idx*90+i*22,direction:'In',detail:'Bank payment settled to merchant location.'});
    }
  });

  // Wire reconciliation example.
  addCF('Unknown Wire Payment Received', 'Wire', 'Bank Pay-in', 'Review', {amount:775.00,mins:514,direction:'Info',detail:'Incoming wire could not be matched to a pending payment. Reconcile or return manually.'});

  // Payout/KYC webhook examples. Coinflow exposes the same Withdraw Pending/Success/Failure lifecycle across payout methods.
  const payoutUser = cfPick(cfUsers), payoutCorr = 'corr_cf_withdraw_01';
  addCF('KYC Created', 'Bank Payout', 'KYC / Payout', 'Pending', {user:payoutUser,amount:0,fee:0,paymentId:'cf_kyc_01',corr:payoutCorr,mins:88,direction:'Info',detail:'Coinflow KYC process started.'});
  addCF('KYC Success', 'Bank Payout', 'KYC / Payout', 'Confirmed', {user:payoutUser,amount:0,fee:0,paymentId:'cf_kyc_01',corr:payoutCorr,mins:84,direction:'Info',detail:'Coinflow KYC passed.'});
  addCF('Withdraw Pending', 'RTP', 'KYC / Payout', 'Pending', {user:payoutUser,amount:420.00,fee:2.02,paymentId:'cf_withdraw_01',corr:payoutCorr,mins:80,direction:'Info',detail:'Payout initiated. Track userFees, userGasFees, merchantGasFees and idempotency key.'});
  addCF('Withdraw Success', 'RTP', 'KYC / Payout', 'Confirmed', {user:payoutUser,amount:420.00,fee:2.02,paymentId:'cf_withdraw_01',corr:payoutCorr,mins:78,direction:'Out',detail:'Withdrawal submitted successfully to payout rail.'});
  addCF('Withdraw Failure', 'Push-to-Card', 'KYC / Payout', 'Failed', {amount:185.00,fee:1.50,paymentId:'cf_withdraw_02',corr:'corr_cf_withdraw_02',mins:239,direction:'Info',detail:'Payout failed. Preserve Coinflow error/reference and do not finalize user debit.'});

  // Operational security/risk telemetry worth keeping without treating it as money movement.
  addCF('3DS challenge required', 'Credit Card', 'Security / Risk', 'Action Required', {amount:214.00,fee:0,mins:132,direction:'Info',detail:'Issuer requires a 3DS challenge before payment can proceed; retain provider transaction ID.'});
  addCF('3DS challenge failed', 'Credit Card', 'Security / Risk', 'Failed', {amount:214.00,fee:0,mins:129,direction:'Info',detail:'Customer failed issuer challenge.'});
  addCF('AVS result received', 'Credit Card', 'Security / Risk', 'Recorded', {amount:0,fee:0,mins:322,direction:'Info',detail:'Store normalized AVS result/code, not raw card details.'});
  addCF('Checkout velocity limit hit', 'Credit Card', 'Security / Risk', 'Blocked', {amount:0,fee:0,mins:407,direction:'Info',detail:'Coinflow velocity/card-attempt rule blocked checkout.'});
  addCF('Coinflow webhook duplicate ignored', 'Provider', 'Provider / Webhook', 'Deduplicated', {amount:0,fee:0,mins:19,direction:'Info',detail:'Coinflow notes webhooks may be delivered more than once; dedupe by event/reference/idempotency identity.'});

  coinflowEvents.sort((a,b)=>a.mins-b.mins);
  window.observeCoinflowEvents = coinflowEvents;

  const signedAmount = e => {
    if (e.direction === 'In') return e.amount;
    if (e.direction === 'Out') return -e.amount;
    return 0;
  };

  coinflowEvents.forEach((e, i) => {
    if (!activities.some(a => a.ref === `${e.id}:${e.event}`)) {
      activities.push({
        id:`evt_coinflow_${String(i+1).padStart(3,'0')}`, mins:e.mins, type:e.event, category:'Coinflow', user:e.user,
        asset:`${e.method} · Coinflow`, ref:`${e.id}:${e.event}`, corr:e.corr, amount:signedAmount(e), rail:'Cash', status:e.status,
        fee:e.providerFee || 0, note:`${e.detail} Presentment ${money(e.presentmentTotal)} ${e.presentmentCurrency}; settlement ${money(e.settlementTotal)} ${e.settlementCurrency}.`
      });
    }
  });
  activities.sort((a,b)=>a.mins-b.mins);

  // Only balance-final events are copied into the legacy wallet ledger so authorizations/reviews are not double-counted as movement.
  coinflowEvents.filter(e =>
    (e.event === 'Settled' && e.direction === 'In') || e.event === 'Refund Complete' || e.event === 'Card Payment Chargeback Lost' || e.event === 'Withdraw Success'
  ).forEach((e, i) => {
    const ref = `${e.id}:${e.event}`;
    if (walletEvents.some(w => w.ref === ref)) return;
    walletEvents.push({ mins:e.mins, action:`Coinflow · ${e.event}`, user:e.user, rail:'Cash', provider:`Coinflow · ${e.method}`, amount:signedAmount(e), fee:e.providerFee || 0, ref, status:e.status });
  });
  walletEvents.sort((a,b)=>a.mins-b.mins);

  const activityCategory = document.getElementById('activityCategory');
  if (activityCategory && ![...activityCategory.options].some(o => o.value === 'Coinflow')) activityCategory.add(new Option('Coinflow', 'Coinflow'));

  function injectCoinflowUI() {
    const view = document.getElementById('view-wallets');
    if (!view || document.getElementById('coinflowPaymentsPanel')) return;
    const existingLedger = view.querySelector('.panel:last-child');
    const panel = document.createElement('div');
    panel.className = 'panel'; panel.id = 'coinflowPaymentsPanel';
    panel.innerHTML = `
      <div class="panel-header wrap">
        <div><h3>Coinflow payment rail activity</h3><p>Credit/debit cards, Apple Pay, Google Pay, bank pay-ins, refunds, disputes and payouts. Provider lifecycle events stay separate from actual balance movement.</p></div>
        <div class="panel-tools">
          <label class="search-box"><span>⌕</span><input id="coinflowSearch" placeholder="User, payment, event, method…" /></label>
          <select id="coinflowFamily" class="select-control"><option value="all">All Coinflow activity</option></select>
        </div>
      </div>
      <div class="metric-grid four" id="coinflowMetrics" style="padding:0 18px 18px"></div>
      <div class="two-col" style="padding:0 18px 18px">
        <div class="panel" style="margin:0"><div class="panel-header"><div><h3>Core lifecycles</h3><p>The states Chosen should preserve instead of collapsing into one payment row.</p></div></div><div class="control-list">
          <div><strong>Cards / Apple Pay / Google Pay</strong><span>Authorized → risk/review → captured/settled or declined/voided</span></div>
          <div><strong>ACH</strong><span>Initiated → Batched → Settled / Returned / Failed</span></div>
          <div><strong>SEPA / UK Faster Payments</strong><span>Initiated → Deposited → Settled / Expired / Failed</span></div>
          <div><strong>Refunds / disputes</strong><span>Refund ID + payment ID · chargeback opened → won/lost</span></div>
        </div></div>
        <div class="panel" style="margin:0"><div class="panel-header"><div><h3>Coinflow fields to retain</h3><p>Enough provider context to reconcile every customer payment.</p></div></div><div class="control-list">
          <div><strong>IDs</strong><span>paymentId · refundId · chargebackId · customerId · correlation/idempotency</span></div>
          <div><strong>Amounts</strong><span>presentmentTotals · settlementTotals · subtotal · total</span></div>
          <div><strong>Fees</strong><span>processing · gas · network · FX · pay-in · chargeback protection</span></div>
          <div><strong>Card safety</strong><span>token/reference · last4 · BIN only; never raw PAN/CVV</span></div>
        </div></div>
      </div>
      <div class="table-wrap" style="max-height:720px"><table><thead><tr><th>Time</th><th>Coinflow event</th><th>User</th><th>Method</th><th>Amount</th><th>Provider fee</th><th>Presentment</th><th>Settlement</th><th>Status</th><th>Reference</th></tr></thead><tbody id="coinflowTable"></tbody></table></div>`;
    if (existingLedger) existingLedger.before(panel); else view.appendChild(panel);

    const controls = view.querySelector('.control-list');
    if (controls && !controls.querySelector('[data-coinflow-control]')) {
      const row = document.createElement('div'); row.dataset.coinflowControl = '1';
      row.innerHTML = '<strong>Fiat/card processor</strong><span class="status success">Coinflow</span>';
      controls.appendChild(row);
    }
    const intro = view.querySelector('.section-intro p');
    if (intro) intro.textContent = 'Coinflow handles card, Apple Pay, Google Pay and bank payment rails; Observe preserves every provider state, fee, refund/dispute and resulting balance movement.';
  }

  function renderCoinflow() {
    const host = document.getElementById('coinflowTable'); if (!host) return;
    const q = (document.getElementById('coinflowSearch')?.value || '').toLowerCase();
    const family = document.getElementById('coinflowFamily')?.value || 'all';
    const families = [...new Set(coinflowEvents.map(e=>e.family))].sort();
    const select = document.getElementById('coinflowFamily');
    if (select && select.options.length === 1) families.forEach(x=>select.add(new Option(x,x)));
    const rows = coinflowEvents.filter(e => (family==='all'||e.family===family) && Object.values(e).join(' ').toLowerCase().includes(q));
    const settled = coinflowEvents.filter(e=>e.event==='Settled'&&e.direction==='In');
    const settledVol = settled.reduce((a,e)=>a+e.amount,0);
    const attention = coinflowEvents.filter(e=>['Failed','Review','Returned','Expired','Blocked','Action Required'].includes(e.status)).length;
    const refundsDisputes = coinflowEvents.filter(e=>['Refund','Dispute'].includes(e.family)).length;
    const methodCount = new Set(coinflowEvents.map(e=>e.method)).size;
    document.getElementById('coinflowMetrics').innerHTML = metric('Settled pay-ins',money(settledVol),`${settled.length} settled provider payments`)+metric('Payment methods',methodCount,'Card, wallets, banks and payouts')+metric('Needs attention',attention,'Failed, review, returned, expired or blocked','warning')+metric('Refund / dispute events',refundsDisputes,'Tracked with their own provider IDs');
    host.innerHTML = rows.map(e=>`<tr style="cursor:default"><td>${timeAgo(e.mins)}</td><td><span class="cell-primary">${esc(e.event)}</span><span class="cell-secondary">${esc(e.family)}</span></td><td>${esc(userName(e.user))}</td><td>${esc(e.method)}${e.last4?`<span class="cell-secondary">•••• ${esc(e.last4)}</span>`:''}</td><td>${e.amount?money(e.amount):'—'}</td><td>${e.providerFee?money(e.providerFee):'$0.00'}</td><td>${money(e.presentmentTotal)} ${esc(e.presentmentCurrency)}</td><td>${money(e.settlementTotal)} ${esc(e.settlementCurrency)}</td><td>${status(e.status)}</td><td><span class="mono">${esc(short(e.refundId||e.chargebackId||e.paymentId||e.id))}</span></td></tr>`).join('');
  }

  injectCoinflowUI();
  const baseWalletRender = renderers.wallets;
  renderers.wallets = function(){ baseWalletRender(); renderCoinflow(); };
  document.getElementById('coinflowSearch')?.addEventListener('input',renderCoinflow);
  document.getElementById('coinflowFamily')?.addEventListener('change',renderCoinflow);

  if (typeof window.observeRegisterTransactionTypes === 'function') {
    const reg = window.observeRegisterTransactionTypes;
    reg({domain:'Coinflow Card & Wallet Pay-ins',page:'Wallet & Payments',level:'Financial',names:[
      'Card Payment Authorized','Card Payment Declined','Card Payment Suspected Fraud','Payment Pending Review','Card Payment Voided','Settled'
    ],description:'Track Coinflow paymentId/customer reference, payment method (credit/debit card, Apple Pay, Google Pay), status, presentmentTotals, settlementTotals, subtotal/total, fee legs, card token/reference, last4/BIN where supplied, timestamps and the linked Chosen user/correlation ID.'});
    reg({domain:'Coinflow Refunds & Chargebacks',page:'Wallet & Payments',level:'Financial',names:[
      'Refund','Refund Complete','Refund Failure','Refund Returned','Card Payment Chargeback Opened','Card Payment Chargeback Won','Card Payment Chargeback Lost'
    ],description:'Track paymentId and a distinct refundId or chargebackId. Preserve refund basis, fees, amount, outstanding/fronted amount/source when available, chargeback reason/deadline/outcome and the resulting user/Treasury balance consequence. One payment can have multiple partial refunds, so refundId must be independently idempotent.'});
    reg({domain:'Coinflow ACH',page:'Wallet & Payments',level:'Financial',names:[
      'ACH Initiated','ACH Batched','ACH Settled','ACH Returned','ACH Failed'
    ],description:'Track ACH from initiation through batching and final clearing. Do not treat initiated/batched ACH as final cash. Record bank/provider reference, amount, fees, final settlement or return/failure and resulting user balance state.'});
    reg({domain:'Coinflow Bank Pay-ins',page:'Wallet & Payments',level:'Financial',names:[
      'SEPA initiated','SEPA deposited','SEPA settled','SEPA expired','SEPA failed','UK Faster Payment initiated','UK Faster Payment deposited','UK Faster Payment settled','UK Faster Payment expired','UK Faster Payment failed','Unknown Wire Payment Received'
    ],description:'Track Coinflow bank-payment progression and reconciliation: payment record, customer completion, settlement, expiry/failure, amount/currency, provider references and unmatched wires requiring manual reconciliation or return.'});
    reg({domain:'Coinflow Payouts & KYC',page:'Wallet & Payments',level:'Financial',names:[
      'KYC Created','KYC Success','KYC Failure','Withdraw Pending','Withdraw Success','Withdraw Failure'
    ],description:'Track Coinflow payout/KYC lifecycle with user reference, payout method, amount, userFees, userGasFees, merchantGasFees, provider signature/reference and idempotency key. A failed payout must not be finalized as a successful user debit.'});
    reg({domain:'Coinflow Payment Security',page:'Wallet & Payments',level:'Operational',names:[
      '3DS challenge required','3DS challenge completed','3DS challenge failed','AVS result received','Checkout velocity limit hit','Card reuse blocked','CVV revalidation required','Coinflow webhook signature verified','Coinflow webhook signature failed','Coinflow webhook duplicate ignored'
    ],description:'Track normalized Coinflow security/provider outcomes needed to debug or audit a checkout without storing raw PAN/CVV. Webhooks may be delivered more than once, so verify signatures and deduplicate before applying state changes.'});
    reg({domain:'Coinflow Fee Breakdown',page:'Fee Tracker',level:'Financial',names:[
      'Coinflow processing fee recorded','Coinflow gas fee recorded','Coinflow network fee recorded','Coinflow FX fee recorded','Coinflow pay-in fee recorded','Coinflow chargeback-protection fee recorded','Coinflow refund processing fee recorded','Coinflow merchant outstanding amount recorded'
    ],description:'Retain Coinflow fee legs separately. Prefer explicit presentmentTotals and settlementTotals rather than inferring currency; distinguish user-paid fees, merchant-paid fees, Coinflow-fronted/outstanding refund amounts and platform expense.'});
  }

  renderCoinflow();
  if (document.getElementById('view-wallets')?.classList.contains('active')) renderers.wallets();
  if (document.getElementById('view-activity')?.classList.contains('active')) renderActivity();
})();

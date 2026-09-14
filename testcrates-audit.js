(() => {
  if (window.__observeTestCratesAudit) return;
  window.__observeTestCratesAudit = true;

  const reg = window.observeRegisterTransactionTypes;
  if (typeof reg !== 'function') return;

  reg({ domain:'Funding Address & Withdrawal Authorization', page:'Wallet & Payments', level:'Financial', names:[
    'Deposit address issued','Deposit address rotated','Deposit address assignment failed','Withdrawal address validation requested','Withdrawal address validation passed','Withdrawal address validation failed','Withdrawal balance reserved','Withdrawal transaction broadcast','Withdrawal debit finalized','Withdrawal reserve released'
  ], description:'Track assigned deposit destination/network, user and provider reference; for withdrawals retain destination validation, reserve/hold, provider or chain submission, final debit or reserve release, fees and correlation IDs. Never treat a failed withdrawal as a final debit.' });

  reg({ domain:'Batch Purchase Lifecycle', page:'Purchases', level:'Financial', names:[
    'Batch child purchase linked','Batch purchase completed','Batch purchase partially failed','Batch purchase cancelled'
  ], description:'A multi-crate checkout needs a parent batch ID plus one child purchase/reveal per crate. Track quantity, per-child rail/amount/status and partial failure/recovery instead of representing an eight-crate order as one opaque purchase.' });

  reg({ domain:'Fairness Detail', page:'Reveal Monitor', level:'Operational', names:[
    'Pity counter updated','Fairness nonce disclosed','Fairness proof recomputed','Unselected outcomes disclosed'
  ], description:'Keep the before/after pity counters and the complete commit-reveal audit chain. Store commitment, disclosed nonce/seed material only when safe to reveal, recomputed hash/result, selected index and the locked unselected outcomes under the same correlation ID.' });

  reg({ domain:'Referral Attribution & Qualification', page:'Referrals', level:'Financial', names:[
    'Referral code detected','Referral attribution recorded','Referral attribution rejected','Referred user first qualifying open','Referral activated','Referral tier changed','Referral rate version changed'
  ], description:'Track referrer, referred user, referral source/code, attribution time, first qualifying paid open, active-referral count, tier, rate and the version of the referral rules that produced the rate.' });

  reg({ domain:'Referral Cashout Share', page:'Referrals', level:'Financial', names:[
    'Referred opening recorded','Referral rate snapshotted','Referred cashout detected','Referral cashout eligibility calculated','Referral cashout share accrued','Referral cashout share held pending finality','Referral cashout share finalized','Referral cashout share not earned','Referral cashout share adjusted','Referral cashout share clawback created','Referral cashout share clawback resolved','Referral claim requested','Referral claim paid','Referral claim failed'
  ], description:'Recommended working model: the referrer earns only when the referred user realizes an eligible cashout. referral_earning = actual cashout credited × the referral rate snapshotted for that opening. Entry spend and displayed prize FMV are context, not the commission basis. If the user keeps the item there is no referral cash earning yet; if that item is later bought out by Chosen, calculate on the actual amount paid then. Hold earnings until payment/cashout finality and support reversals, adjustments and clawbacks for refunds, fraud or chargebacks. Eligibility by product, funding rail, cashout type and campaign should be configurable.' });

  reg({ domain:'Referral Treasury Liability', page:'Referrals / Reconciliation', level:'Financial', names:[
    'Referral commission liability created','Referral commission liability finalized','Referral commission liability released','Referral commission payout recorded','Referral commission clawback recorded'
  ], description:'Keep pending, claimable, paid and clawed-back referral balances separate. Reconcile every commission liability to the exact referred opening and realized cashout that created it.' });

  reg({ domain:'Stock Lot & Transfer Lifecycle', page:'Portfolios', level:'Financial', names:[
    'Stock lot partially depleted','Stock cost basis allocated to sale','Position basis recalculated','Stock transfer recipient validation requested','Stock transfer recipient validated','Stock transfer recipient validation failed','Stock transfer requested','Stock transfer submitted','Stock transfer completed','Stock transfer failed','Internal stock transfer completed'
  ], description:'The product can sell an arbitrary dollar amount from a consolidated position and can send an entire holding. Track which FIFO lots were reduced/closed, basis allocated to the sale, resulting position basis, recipient validation, custody/network submission, fees and final ownership.' });

  reg({ domain:'Market Data Provider Lifecycle', page:'Reveal Monitor / Portfolios', level:'Operational', names:[
    'Market data credential connected','Market data credential validation failed','Market data credential removed','Market product lookup requested','Market product match accepted','Market product match rejected','Market data cache hit','Market data cache miss','Market snapshot received','Sales history access denied','Market data provider quota exceeded','Simulated price fallback used'
  ], description:'Track provider, product/query/reference, match confidence, cache age, source timestamp, response status and fallback reason. Never log raw API credentials. A bad product match is an observability event because it can create a wrong FMV.' });

  reg({ domain:'Notifications & Live Activity', page:'Activity', level:'Operational', names:[
    'Notification created','Notification delivered','Notification marked seen','Notification cleared','Live Activity started','Live Activity item result updated','Live Activity cashout updated','Live Activity end requested','Live Activity ended','Live Activity push requested','Live Activity push delivered','Live Activity push failed','Live Activity push token invalidated','Live Activity deep link opened'
  ], description:'Track user/device, notification or activity ID, event phase, source correlation, APNs/provider response, stale/dismissal state and delivery result. Do not store raw push tokens in ordinary activity payloads; reference a secured token record instead.' });

  reg({ domain:'Raffle Lifecycle', page:'Rewards & Credits', level:'Operational', names:[
    'Raffle draw created','Raffle draw executed','Raffle winner selected','Raffle prize awarded','Raffle prize claimed','Raffle draw failed'
  ], description:'Qualification and entry creation are not the end of the lifecycle. Track draw version, eligible entry set/hash, winner selection, prize obligation, award/claim state and failure/retry.' });

  reg({ domain:'Clips & Generated Media', page:'Portfolios / Activity', level:'Operational', names:[
    'Clip generation requested','Clip generation completed','Clip generation failed','Clip published','Clip deleted'
  ], description:'The Clips surface implies an asynchronous media job in production. Track source reveal/item, job ID, generation status, storage reference, publish/delete state and failure reason; views/shares can remain Analytics.' });

  reg({ domain:'User Identity Validation', page:'Portfolios', level:'Operational', names:[
    'Username change requested','Username change rejected'
  ], description:'In addition to the successful Username changed event, retain request/rejection reason and actor. Never log secrets or unnecessary PII.' });

  // Demo referral profile metrics. These are illustrative numbers, not a final program.
  // The page uses realized cashout volume as the commission basis, never gross spend.
  const referralProfiles = {
    usr_01HZX2:{ referredUsers:23, activeReferrals:18, opens30d:146, referredVolume30d:18250, cashoutVolume30d:12140, shareRate:.0125, pending:38.20, claimable:151.75, lifetimePaid:492.40 },
    usr_01HZX9:{ referredUsers:12, activeReferrals:9,  opens30d:67,  referredVolume30d:8900,  cashoutVolume30d:5960,  shareRate:.01,   pending:16.40, claimable:59.60,  lifetimePaid:184.10 },
    usr_01HZYA:{ referredUsers:6,  activeReferrals:4,  opens30d:22,  referredVolume30d:2250,  cashoutVolume30d:1320,  shareRate:.01,   pending:4.80,  claimable:13.20,  lifetimePaid:39.20 },
    usr_01HZYQ:{ referredUsers:38, activeReferrals:31, opens30d:241, referredVolume30d:31100, cashoutVolume30d:21850, shareRate:.015,  pending:72.30, claimable:327.75, lifetimePaid:934.60 },
    usr_01HZZ4:{ referredUsers:3,  activeReferrals:2,  opens30d:9,   referredVolume30d:825,   cashoutVolume30d:510,   shareRate:.01,   pending:0,     claimable:5.10,   lifetimePaid:12.50 },
    usr_01J001:{ referredUsers:17, activeReferrals:14, opens30d:98,  referredVolume30d:12750, cashoutVolume30d:8740,  shareRate:.0125, pending:27.65, claimable:109.25, lifetimePaid:311.80 }
  };
  window.observeReferralProfiles = referralProfiles;

  const sample = [
    {id:'evt_audit_01',mins:13,type:'Deposit address issued',category:'Funding',user:'usr_01HZX2',asset:'Base USDC deposit route',ref:'depaddr_1042',corr:'corr_dep_1042',amount:0,rail:'USDC',status:'Confirmed',fee:0,note:'Unique deposit destination/route issued before funds arrive.'},
    {id:'evt_audit_02',mins:24,type:'Batch child purchase linked',category:'Purchases',user:'usr_01HZYQ',asset:'Bronze crate · child 3 of 6',ref:'pur_batch_77_03',corr:'corr_batch_77',amount:-100,rail:'Cash',status:'Confirmed',fee:0,note:'Child purchase retains the parent batch ID so partial failure is explainable.'},
    {id:'evt_audit_03',mins:33,type:'Fairness nonce disclosed',category:'Reveals',user:'usr_01HZYQ',asset:'Bronze reveal',ref:'fair_7719',corr:'corr_batch_77',amount:0,rail:'Internal',status:'Verified',fee:0,note:'Commit-reveal disclosure recorded after the outcome was locked.'},
    {id:'evt_audit_04',mins:48,type:'Referral attribution recorded',category:'Rewards',user:'usr_01HZYA',asset:'Referrer @maya',ref:'refattr_083',corr:'corr_ref_083',amount:0,rail:'Internal',status:'Confirmed',fee:0,note:'Inbound referral code resolved to the referrer before qualifying activity.'},
    {id:'evt_audit_05',mins:64,type:'Stock lot partially depleted',category:'Stocks',user:'usr_01J001',asset:'NVDA · FIFO lot lot_552',ref:'lotred_552',corr:'corr_stocksell_552',amount:38.50,rail:'Internal',status:'Confirmed',fee:0,note:'Partial sell reduced one lot without closing it; cost basis was reallocated.'},
    {id:'evt_audit_06',mins:81,type:'Market product match rejected',category:'Reconciliation',user:'usr_01HZX2',asset:'StockX/KicksDB lookup · AJ1 UNC Patent',ref:'mdmatch_044',corr:'corr_price_044',amount:0,rail:'Internal',status:'Review',fee:0,note:'Search result failed confidence threshold; simulated/fallback FMV remained active.'},
    {id:'evt_audit_07',mins:96,type:'Live Activity push delivered',category:'System',user:'usr_01HZX9',asset:'Pack result · item won',ref:'lapush_702',corr:'corr_crate_72118',amount:0,rail:'Internal',status:'Confirmed',fee:0,note:'Remote APNs Live Activity update delivered after authoritative result.'},
    {id:'evt_audit_08',mins:119,type:'Stock transfer recipient validation failed',category:'Stocks',user:'usr_01HZZ4',asset:'AAPL · destination 0x91…bad',ref:'stkxfr_290',corr:'corr_stkxfr_290',amount:0,rail:'On-chain',status:'Failed',fee:0,note:'Transfer stopped before custody submission because the recipient was invalid.'},
    {id:'evt_refcash_01',mins:15,type:'Referred cashout detected',category:'Rewards',user:'usr_01HZX2',counterparty:'usr_01HZYA',asset:'$50 crate · $30 actual cashout credited',ref:'refcash_301',corr:'corr_refopen_301',amount:30,rail:'Cash',status:'Confirmed',fee:0,note:'Referral basis is the actual $30 cashout, not the $50 entry or displayed prize value.'},
    {id:'evt_refcash_02',mins:14,type:'Referral cashout share accrued',category:'Rewards',user:'usr_01HZX2',counterparty:'usr_01HZYA',asset:'1.25% × $30 cashout',ref:'refearn_301',corr:'corr_refopen_301',amount:.375,rail:'Cash',status:'Pending',fee:0,note:'The opening snapshotted Maya’s 1.25% referral tier. Commission remains pending until finality.'},
    {id:'evt_refcash_03',mins:58,type:'Referral cashout share finalized',category:'Rewards',user:'usr_01HZYQ',counterparty:'usr_01HZX9',asset:'$1,000 FMV win · $800 cashout · 1.5% share',ref:'refearn_288',corr:'corr_refopen_288',amount:12,rail:'Cash',status:'Confirmed',fee:0,note:'The referred user realized an $800 cashout, creating a $12 finalized referral earning.'},
    {id:'evt_refcash_04',mins:173,type:'Referral cashout share clawback created',category:'Rewards',user:'usr_01J001',counterparty:'usr_01HZZ4',asset:'Referred card-funded cashout later charged back',ref:'refclaw_044',corr:'corr_refopen_044',amount:-6.30,rail:'Cash',status:'Review',fee:0,note:'A downstream chargeback invalidated the original cashout economics, so the related referral commission was reversed.'},
    {id:'evt_refcash_05',mins:205,type:'Referral cashout share not earned',category:'Rewards',user:'usr_01HZX9',counterparty:'usr_01HZYA',asset:'Referred user kept item in vault',ref:'refkeep_051',corr:'corr_refopen_051',amount:0,rail:'Internal',status:'Confirmed',fee:0,note:'No realized cashout means no cash referral earning yet. A later platform buyout can create the commission then.'}
  ];

  sample.forEach(e => {
    if (!activities.some(x => x.id === e.id || x.ref === e.ref)) activities.push(e);
  });
  activities.sort((a,b)=>a.mins-b.mins);

  const categorySelect = document.getElementById('activityCategory');
  ['System'].forEach(c => {
    if (categorySelect && ![...categorySelect.options].some(o => o.value === c)) categorySelect.add(new Option(c,c));
  });

  // Keep referral performance visible in the user/profile area too.
  const priorPortfolioRender = renderers.portfolios;
  renderers.portfolios = function () {
    priorPortfolioRender();
    document.querySelectorAll('#portfolioGrid .portfolio-card').forEach(card => {
      const p = referralProfiles[card.dataset.id];
      if (!p) return;
      const meta = card.querySelector('.user-meta span');
      if (meta && !meta.dataset.referralMetric) {
        meta.dataset.referralMetric = '1';
        meta.textContent += ` · ${p.activeReferrals} active refs · ${(p.shareRate*100).toFixed(2).replace(/\.00$/,'')}% cashout share`;
      }
    });
  };

  const priorOpenDrawer = openDrawer;
  openDrawer = function (type, id) {
    priorOpenDrawer(type, id);
    if (type !== 'user') return;
    const p = referralProfiles[id];
    const body = document.getElementById('drawerBody');
    if (!p || !body || body.querySelector('[data-referral-profile]')) return;
    const section = document.createElement('div');
    section.className = 'drawer-section';
    section.dataset.referralProfile = '1';
    section.innerHTML = `
      <div class="drawer-section-title">Referral performance</div>
      <div class="detail-grid">
        ${kv('Current cashout share',`${(p.shareRate*100).toFixed(2).replace(/\.00$/,'')}%`)}
        ${kv('Referred users',num(p.referredUsers))}
        ${kv('Active referrals',num(p.activeReferrals))}
        ${kv('Referred opens · 30d',num(p.opens30d))}
        ${kv('Referred entry volume · 30d',money(p.referredVolume30d))}
        ${kv('Realized cashout volume · 30d',money(p.cashoutVolume30d))}
        ${kv('Pending earnings',money(p.pending))}
        ${kv('Claimable earnings',money(p.claimable))}
        ${kv('Lifetime paid',money(p.lifetimePaid))}
      </div>
      <div class="detail-note"><strong>Working model:</strong> the user’s tier percentage applies to the referred user’s actual eligible cashout. Gross crate spend and displayed win FMV do not directly create commission. If the friend keeps the item, the referrer earns $0 at that moment; a later Chosen buyout can create the earning when money is actually paid.</div>`;
    body.insertBefore(section, body.children[2] || null);
  };

  if (document.getElementById('view-activity')?.classList.contains('active')) renderActivity();
  if (document.getElementById('view-sam')?.classList.contains('active') && renderers.sam) renderers.sam();
})();

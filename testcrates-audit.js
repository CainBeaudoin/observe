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

  reg({ domain:'Referral Attribution & Claims', page:'Rewards & Credits', level:'Financial', names:[
    'Referral code detected','Referral attribution recorded','Referral attribution rejected','Referred user first qualifying open','Referral Cash claim liability resolved','Referral Credits claim base resolved','Referral Credits bonus issued','Referral claim failed'
  ], description:'Track the referrer code/source, referred user, attribution timestamp, first qualifying activity, accrued liability and claim method. Separate the base referral liability from any extra Credits bonus so Treasury and Credits issuance remain auditable.' });

  reg({ domain:'Referral Profit Share', page:'Rewards & Credits / Portfolios', level:'Financial', names:[
    'Referred opening recorded','Referred opening gross volume updated','Referred opening direct costs calculated','Referred opening contribution margin calculated','Referral profit-share rate snapshotted','Referral profit-share accrued','Referral profit-share held pending finality','Referral profit-share finalized','Referral profit-share not earned','Referral profit-share adjusted','Referral profit-share clawback created','Referral profit-share clawback resolved','Referral claim requested','Referral claim paid'
  ], description:'Recommended economics: reward the referrer from positive contribution margin, not from gross opening spend. For each referred open calculate eligible_margin = max(0, recognized entry revenue - prize/stock acquisition obligation or reserve - processor/bridge/network/execution costs - direct fulfillment/subsidy costs - attributable refunds or chargebacks). Then referral_earning = eligible_margin × the referral rate snapshotted for that open. Store referrer, referred user, purchase/reveal IDs, entry amount/rail, every direct-cost leg, eligible margin, rate + rate-version, earning, pending/finalized state and correlation ID. Pure Credits-funded opens should default to no cash profit-share unless an explicit campaign says otherwise. Hold earnings pending payment/outcome finality and support adjustments/clawbacks so a later refund or chargeback cannot leave Chosen paying commission on profit it never kept.' });

  reg({ domain:'Referral Treasury Liability', page:'Reconciliation', level:'Financial', names:[
    'Referral commission liability created','Referral commission liability finalized','Referral commission liability released','Referral commission payout recorded','Referral commission clawback recorded'
  ], description:'Referral earnings are a platform liability once earned. Keep pending, claimable and paid balances separate; reconcile them to the per-opening profit-share ledger and never expense commission from gross marketplace or user principal.' });

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

  // Referral performance belongs on the user/profile record as well as Rewards.
  // Numbers below are deterministic demo data; the fields are the important part.
  const referralProfiles = {
    usr_01HZX2:{ referredUsers:23, activeReferrals:18, opens30d:146, volume30d:18250, eligibleMargin30d:4120, shareRate:.15, pending:84.30, claimable:533.70, lifetimePaid:928.50 },
    usr_01HZX9:{ referredUsers:12, activeReferrals:9,  opens30d:67,  volume30d:8900,  eligibleMargin30d:1720, shareRate:.12, pending:42.00, claimable:164.40, lifetimePaid:380.00 },
    usr_01HZYA:{ referredUsers:6,  activeReferrals:4,  opens30d:22,  volume30d:2250,  eligibleMargin30d:480,  shareRate:.10, pending:12.00, claimable:36.00,  lifetimePaid:74.00 },
    usr_01HZYQ:{ referredUsers:38, activeReferrals:31, opens30d:241, volume30d:31100, eligibleMargin30d:6980, shareRate:.18, pending:125.64,claimable:910.80, lifetimePaid:1844.00 },
    usr_01HZZ4:{ referredUsers:3,  activeReferrals:2,  opens30d:9,   volume30d:825,   eligibleMargin30d:130,  shareRate:.10, pending:0,     claimable:13.00,  lifetimePaid:20.00 },
    usr_01J001:{ referredUsers:17, activeReferrals:14, opens30d:98,  volume30d:12750, eligibleMargin30d:2600, shareRate:.15, pending:48.75, claimable:341.25, lifetimePaid:611.00 }
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
    {id:'evt_refprofit_01',mins:15,type:'Referred opening contribution margin calculated',category:'Rewards',user:'usr_01HZX2',counterparty:'usr_01HZYA',asset:'Bronze open · $100 entry · $32.00 eligible margin',ref:'refopen_301',corr:'corr_refopen_301',amount:32,rail:'Cash',status:'Confirmed',fee:0,note:'Contribution margin was calculated after the outcome obligation and direct payment/platform costs; gross $100 spend is not the referral basis.'},
    {id:'evt_refprofit_02',mins:14,type:'Referral profit-share accrued',category:'Rewards',user:'usr_01HZX2',counterparty:'usr_01HZYA',asset:'15% × $32.00 eligible margin',ref:'refearn_301',corr:'corr_refopen_301',amount:4.80,rail:'Cash',status:'Pending',fee:0,note:'Referral rate was snapshotted for this opening. Earning stays pending until payment/outcome finality.'},
    {id:'evt_refprofit_03',mins:58,type:'Referral profit-share finalized',category:'Rewards',user:'usr_01HZYQ',counterparty:'usr_01HZX9',asset:'18% profit share · referred Gold open',ref:'refearn_288',corr:'corr_refopen_288',amount:21.42,rail:'Cash',status:'Confirmed',fee:0,note:'Positive referred-open contribution margin finalized and became claimable referral liability.'},
    {id:'evt_refprofit_04',mins:173,type:'Referral profit-share clawback created',category:'Rewards',user:'usr_01J001',counterparty:'usr_01HZZ4',asset:'Referred card open later charged back',ref:'refclaw_044',corr:'corr_refopen_044',amount:-6.30,rail:'Cash',status:'Review',fee:0,note:'A downstream chargeback removed profit from the referred open, so the related commission was reversed before/against payout.'}
  ];

  sample.forEach(e => {
    if (!activities.some(x => x.id === e.id || x.ref === e.ref)) activities.push(e);
  });
  activities.sort((a,b)=>a.mins-b.mins);

  const categorySelect = document.getElementById('activityCategory');
  ['System'].forEach(c => {
    if (categorySelect && ![...categorySelect.options].some(o => o.value === c)) categorySelect.add(new Option(c,c));
  });

  // Add referral performance to the compact portfolio cards without turning
  // the directory into a separate rewards dashboard.
  const priorPortfolioRender = renderers.portfolios;
  renderers.portfolios = function () {
    priorPortfolioRender();
    document.querySelectorAll('#portfolioGrid .portfolio-card').forEach(card => {
      const p = referralProfiles[card.dataset.id];
      if (!p) return;
      const meta = card.querySelector('.user-meta span');
      if (meta && !meta.dataset.referralMetric) {
        meta.dataset.referralMetric = '1';
        meta.textContent += ` · ${p.activeReferrals} active refs · ${Math.round(p.shareRate*100)}% share`;
      }
    });
  };

  // The detailed user drawer is the profile-side source of truth for referral
  // performance. Keep gross referred volume separate from eligible margin and
  // from the actual commission liability.
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
        ${kv('Current profit share',`${Math.round(p.shareRate*100)}%`)}
        ${kv('Referred users',num(p.referredUsers))}
        ${kv('Active referrals',num(p.activeReferrals))}
        ${kv('Referred opens · 30d',num(p.opens30d))}
        ${kv('Referred volume · 30d',money(p.volume30d))}
        ${kv('Eligible margin · 30d',money(p.eligibleMargin30d))}
        ${kv('Pending earnings',money(p.pending))}
        ${kv('Claimable earnings',money(p.claimable))}
        ${kv('Lifetime paid',money(p.lifetimePaid))}
      </div>
      <div class="detail-note"><strong>Recommended basis:</strong> referral earnings should be a configurable percentage of positive contribution margin from each referred opening, not a percentage of gross spend. Snapshot the rate per open, keep earnings pending until the underlying payment/outcome is final, and claw back/adjust if that open is later refunded or charged back.</div>`;
    const unifiedTitle = [...body.querySelectorAll('.drawer-section-title')].find(x => /Unified user tracking/i.test(x.textContent));
    const anchor = unifiedTitle?.closest('.drawer-section');
    if (anchor) body.insertBefore(section, anchor); else body.appendChild(section);
  };

  // The original search listener can render cards through the base renderer;
  // schedule our wrapper afterward so referral/card annotations stay present.
  const portfolioSearch = document.getElementById('portfolioSearch');
  if (portfolioSearch && !portfolioSearch.dataset.referralRefresh) {
    portfolioSearch.dataset.referralRefresh = '1';
    portfolioSearch.addEventListener('input', () => setTimeout(() => renderers.portfolios(), 0));
  }

  if (document.getElementById('view-activity')?.classList.contains('active')) renderActivity();
  if (document.getElementById('view-portfolios')?.classList.contains('active')) renderers.portfolios();
  if (document.getElementById('view-sam')?.classList.contains('active') && renderers.sam) renderers.sam();
})();

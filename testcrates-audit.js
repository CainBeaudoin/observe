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

  const sample = [
    {id:'evt_audit_01',mins:13,type:'Deposit address issued',category:'Funding',user:'usr_01HZX2',asset:'Base USDC deposit route',ref:'depaddr_1042',corr:'corr_dep_1042',amount:0,rail:'USDC',status:'Confirmed',fee:0,note:'Unique deposit destination/route issued before funds arrive.'},
    {id:'evt_audit_02',mins:24,type:'Batch child purchase linked',category:'Purchases',user:'usr_01HZYQ',asset:'Bronze crate · child 3 of 6',ref:'pur_batch_77_03',corr:'corr_batch_77',amount:-100,rail:'Cash',status:'Confirmed',fee:0,note:'Child purchase retains the parent batch ID so partial failure is explainable.'},
    {id:'evt_audit_03',mins:33,type:'Fairness nonce disclosed',category:'Reveals',user:'usr_01HZYQ',asset:'Bronze reveal',ref:'fair_7719',corr:'corr_batch_77',amount:0,rail:'Internal',status:'Verified',fee:0,note:'Commit-reveal disclosure recorded after the outcome was locked.'},
    {id:'evt_audit_04',mins:48,type:'Referral attribution recorded',category:'Rewards',user:'usr_01HZYA',asset:'Referrer @maya',ref:'refattr_083',corr:'corr_ref_083',amount:0,rail:'Internal',status:'Confirmed',fee:0,note:'Inbound referral code resolved to the referrer before qualifying activity.'},
    {id:'evt_audit_05',mins:64,type:'Stock lot partially depleted',category:'Stocks',user:'usr_01J001',asset:'NVDA · FIFO lot lot_552',ref:'lotred_552',corr:'corr_stocksell_552',amount:38.50,rail:'Internal',status:'Confirmed',fee:0,note:'Partial sell reduced one lot without closing it; cost basis was reallocated.'},
    {id:'evt_audit_06',mins:81,type:'Market product match rejected',category:'Reconciliation',user:'usr_01HZX2',asset:'StockX/KicksDB lookup · AJ1 UNC Patent',ref:'mdmatch_044',corr:'corr_price_044',amount:0,rail:'Internal',status:'Review',fee:0,note:'Search result failed confidence threshold; simulated/fallback FMV remained active.'},
    {id:'evt_audit_07',mins:96,type:'Live Activity push delivered',category:'System',user:'usr_01HZX9',asset:'Pack result · item won',ref:'lapush_702',corr:'corr_crate_72118',amount:0,rail:'Internal',status:'Confirmed',fee:0,note:'Remote APNs Live Activity update delivered after authoritative result.'},
    {id:'evt_audit_08',mins:119,type:'Stock transfer recipient validation failed',category:'Stocks',user:'usr_01HZZ4',asset:'AAPL · destination 0x91…bad',ref:'stkxfr_290',corr:'corr_stkxfr_290',amount:0,rail:'On-chain',status:'Failed',fee:0,note:'Transfer stopped before custody submission because the recipient was invalid.'}
  ];

  sample.forEach(e => {
    if (!activities.some(x => x.id === e.id || x.ref === e.ref)) activities.push(e);
  });
  activities.sort((a,b)=>a.mins-b.mins);

  const categorySelect = document.getElementById('activityCategory');
  ['System'].forEach(c => {
    if (categorySelect && ![...categorySelect.options].some(o => o.value === c)) categorySelect.add(new Option(c,c));
  });

  if (document.getElementById('view-activity')?.classList.contains('active')) renderActivity();
  if (document.getElementById('view-sam')?.classList.contains('active') && renderers.sam) renderers.sam();
})();

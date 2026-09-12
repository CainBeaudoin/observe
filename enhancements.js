(() => {
  if (window.__observeBridgeEnhancements) return;
  window.__observeBridgeEnhancements = true;

  const seedRand = (() => {
    let s = 0x0b5e7e;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  })();
  const pick = xs => xs[Math.floor(seedRand() * xs.length)];
  const round = (n, d = 2) => Number(n.toFixed(d));
  const uid = (prefix, i) => `${prefix}_${String(i).padStart(4, '0')}`;
  const sourceChains = ['Solana', 'Base', 'BNB Chain', 'Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'Avalanche', 'Robinhood Chain'];
  const bridgeProviders = ['Chosen Router', 'Across', 'CCTP', 'Li.Fi Route', 'Relay'];
  const swapStatuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Bridging', 'Confirming', 'Failed'];
  const products = [
    ['Sneaker 100', 'Sneakers', 100], ['Sneaker 250', 'Sneakers', 250], ['Streetwear 50', 'Streetwear', 50],
    ['Streetwear 100', 'Streetwear', 100], ['Equity Pack 25', 'Stocks', 25], ['Equity Pack 50', 'Stocks', 50], ['Equity Pack 100', 'Stocks', 100]
  ];
  const revealOutcomes = [
    ['Nike SB Dunk Low', 'Rare', 188], ['Jordan 4 Retro', 'Epic', 412], ['Supreme Tee', 'Uncommon', 92],
    ['Chrome Hearts Hoodie', 'Legendary', 1180], ['AAPL position', 'Uncommon', 49.72], ['NVDA position', 'Rare', 96.38],
    ['Credit Back', 'Common', 64], ['Cashback', 'Common', 78]
  ];
  const marketItems = ['Nike SB Dunk Low', 'Air Jordan 4 Military Blue', 'Supreme Box Logo Tee', 'New Balance 9060', 'Travis Scott Reverse Mocha', 'Chrome Hearts Hoodie', 'ASICS Gel-Kayano 14'];
  const marketActions = [['Listing created','Listing'],['Listing repriced','Listing'],['Offer sent','Offer'],['Offer received','Offer'],['Offer countered','Offer'],['Offer declined','Offer'],['Offer accepted','Offer'],['Buy Now completed','Sale'],['Ownership transferred','Transfer']];
  const rewardKinds = ['Crate Bonus','Credit Spend','Credit Back','Promotional Credits','Referral claim · Credits','Lulu emission','Earn task submitted','XP earned','Daily streak incremented','Weekly raffle qualified'];

  const names = ['Ava Morgan','Ethan Wong','Layla Hassan','Mason Reed','Zoe Turner','Lucas Silva','Nora Young','Omar Faris','Mia Laurent','Elijah Ross','Isla Brooks','Mateo Cruz','Amara Singh','Henry Cole','Yuna Sato','Adam Klein','Leah Martin','Samir Khan'];
  names.forEach((name, i) => {
    const id = `usr_demo_${String(i + 1).padStart(2, '0')}`;
    const cash = round(40 + seedRand() * 3200);
    const usdc = round(seedRand() * 2400);
    const credits = Math.round(seedRand() * 6200);
    const stocks = round(seedRand() * 1800);
    const stockCost = round(stocks * (0.78 + seedRand() * 0.22));
    const inventory = Math.floor(seedRand() * 9);
    const vaultValue = round(inventory * (80 + seedRand() * 420));
    const pending = round(vaultValue * (0.42 + seedRand() * 0.28));
    const u = {id,name,handle:`@${name.toLowerCase().replace(/[^a-z]/g,'').slice(0,10)}`,wallet:`0x${(10000000+i*7919).toString(16).toUpperCase()}…${(9000+i*31).toString(16).toUpperCase()}`,cash,usdc,credits,stocks,stockCost,inventory,vaultValue,pending};
    users.push(u); userById[id] = u;
    positions[id] = stocks < 20 ? [] : [[pick(['AAPL','NVDA','TSLA','AMZN','META']), round(0.2 + seedRand()*5,3), stocks, stockCost]];
  });

  for (let i = 0; i < 28; i++) {
    const u = pick(users), p = pick(products), mins = 165 + i * 17 + Math.floor(seedRand()*9), rail = p[1] === 'Stocks' ? 'Cash' : pick(['Cash','USDC','Credits']);
    purchases.push({id:uid('pur_demo',i+1),mins,user:u.id,product:p[0],kind:p[1],qty:pick([1,1,1,2,3,5,8]),entry:p[2],rail,bonus:round(p[2]*.05),xp:p[2],payment:rail==='USDC'?`0xdep${i.toString(16)}…${(i+400).toString(16)}`:`pay_demo_${i+1}`,reveal:uid('rev_demo',i+1),corr:uid('corr_purchase',i+1),status:pick(['Settled','Settled','Settled','Settled','Review'])});
  }
  purchases.forEach(p => { if (p.qty > 1 && p.entry === products.find(x=>x[0]===p.product)?.[2]) p.entry *= p.qty; });

  for (let i = 0; i < 28; i++) {
    const p = purchases[purchases.length - 28 + i], o = pick(revealOutcomes), decision = p.kind==='Stocks'?pick(['Hold stock','Hold stock','Sell to Cash']):pick(['Vault','Vault','Cashback','List','Credit Back']);
    reveals.push({id:p.reveal,mins:p.mins+2,user:p.user,pack:`${p.product}${p.qty>1?` · batch ${pick([1,p.qty])}/${p.qty}`:''}`,outcome:o[0],rarity:o[1],fmv:round(o[2]*(.88+seedRand()*.28)),decision,fair:pick(['Verified','Verified','Verified','Verified','Verified','Review']),flags:pick(['—','—','—','Pity trigger','Duplicate reroll','—']),status:pick(['Complete','Complete','Complete','Complete','Exception']),commit:`0xcommit${(1000+i).toString(16)}`,hash:`0xreveal${(8000+i).toString(16)}`,corr:p.corr,note:'Simulated production-style reveal record with pricing, fairness and user decision linkage.'});
  }

  for (let i = 0; i < 42; i++) {
    const actor = pick(users), counter = pick(users), action = pick(marketActions), value = round(55 + seedRand()*1280), fee = action[1]==='Sale'?round(value*.01):0;
    marketEvents.push({mins:170+i*13,action:action[0],kind:action[1],item:pick(marketItems),actor:actor.id,counter:counter.id,value,fee,status:pick(['Active','Open','Settled','Closed','Accepted']),corr:uid('corr_market',i+1),ref:uid(action[1].toLowerCase(),i+1)});
  }

  for (let i = 0; i < 36; i++) {
    const u=pick(users), rail=pick(['Cash','USDC']), deposit=seedRand()>.42, amt=round(25+seedRand()*2400), provider=rail==='USDC'?pick(sourceChains):pick(['Card','Apple Pay','Bank ACH','Wire']);
    walletEvents.push({mins:180+i*19,action:deposit?(rail==='USDC'?'USDC deposit confirmed':'Cash deposit completed'):(rail==='USDC'?'USDC withdrawal confirmed':'Cash withdrawal completed'),user:u.id,rail,provider,amount:deposit?amt:-amt,fee:round(rail==='USDC'?.0005+seedRand()*.8:amt*(.002+seedRand()*.02)),ref:`${rail==='USDC'?'0x':'pi_'}demo_${i+1}`,status:pick(['Confirmed','Confirmed','Confirmed','Pending','Failed'])});
  }

  for (let i = 0; i < 36; i++) {
    const u=pick(users), network=pick(['Robinhood Chain','Robinhood Chain','Base','Solana','Ethereum','BNB Chain','Processor']), notional=round(15+seedRand()*1600), cost=round(.0004+seedRand()*(network==='Processor'?2.5:.08),4), userFee=round(cost*(seedRand()>.22?1+seedRand()*5:0),4), recovered=round(Math.min(cost,userFee),4);
    fees.push({mins:190+i*21,action:pick(['Stock buy execution','Stock sell execution','Marketplace custody transfer','USDC settlement','Withdrawal','Failed transaction gas','Bridge execution']),user:u.id,network,notional,cost,userFee,recovered,status:pick(['Confirmed','Confirmed','Confirmed','Pending','Failed']),ref:`fee_demo_${i+1}`,corr:uid('corr_fee',i+1)});
  }

  for (let i = 0; i < 34; i++) {
    const u=pick(users), event=pick(rewardKinds), out=event==='Credit Spend', amountVal=/submitted|qualified|incremented|XP earned/i.test(event)?0:round(5+seedRand()*420), balance=Math.max(0,Math.round(u.credits+(out?-amountVal:amountVal)));
    rewardEvents.push({mins:200+i*23,event,user:u.id,dir:amountVal===0?'—':out?'Out':'In',amount:amountVal,balance,ref:uid('reward_demo',i+1),status:pick(['Confirmed','Confirmed','Approved','Submitted','Qualified'])});
  }

  for (let i = 0; i < 18; i++) {
    const matched = seedRand()>.18, diff=matched?'$0.00':`${seedRand()>.5?'-':'+'}$${round(1+seedRand()*38)}`;
    recon.push({mins:210+i*31,scope:pick(['Cash ledger totals','USDC bridge custody','Credits balance','Pending vault register','Stock custody provider','Marketplace settlement','Reveal quote freshness','Fee recovery aggregate','Shipping supplier ledger']),internal:matched?'Matched value':money(1000+seedRand()*22000),observed:matched?'Matched value':money(1000+seedRand()*22000),diff,severity:matched?'Info':pick(['Medium','High']),result:matched?'Matched':'Mismatch',ref:uid('recon_demo',i+1)});
  }

  const swaps = [];
  for (let i = 0; i < 32; i++) {
    const user = pick(users), source = pick(sourceChains), sent = round(20 + seedRand()*2500), status = pick(swapStatuses), provider = source==='Robinhood Chain'?'Internal route':pick(bridgeProviders);
    const sourceGas = source==='Robinhood Chain'?0:round(.0005+seedRand()*(source==='Ethereum'?1.8:.16),4);
    const bridgeFee = source==='Robinhood Chain'?0:round(.004+sent*(.00005+seedRand()*.00035),4);
    const destinationGas = source==='Robinhood Chain'?0:round(.0004+seedRand()*.012,4);
    const platformCost = round(sourceGas+bridgeFee+destinationGas,4);
    const received = status==='Completed' ? sent : status==='Failed' ? 0 : null;
    const mins = 2 + i*11;
    const s = {id:uid('swp',i+1),mins,user:user.id,source,destination:'Robinhood Chain',sent,received,provider,sourceTx:`0xsrc${(5000+i).toString(16)}…${(9000+i).toString(16)}`,destTx:status==='Completed'?`0xrh${(7000+i).toString(16)}…${(12000+i).toString(16)}`:'—',sourceGas,bridgeFee,destinationGas,platformCost,userFee:0,status,corr:uid('corr_swap',i+1)};
    swaps.push(s);

    const activityStatus = status==='Completed'?'Confirmed':status;
    activities.push({id:uid('evt_swap_detect',i+1),mins:mins+1,type:'Cross-chain USDC received',category:'Swaps',user:user.id,asset:`USDC · ${source}`,ref:s.sourceTx,corr:s.corr,amount:sent,rail:'USDC',status:'Confirmed',fee:0,note:`User deposit detected on ${source}. Route targets Robinhood Chain.`});
    activities.push({id:uid('evt_swap_route',i+1),mins,type:'Bridge route executed',category:'Swaps',user:user.id,asset:`${source} → Robinhood Chain`,ref:s.id,corr:s.corr,amount:sent,rail:'On-chain',status:activityStatus,fee:platformCost,note:'Chosen covers bridge, gas and destination execution cost; user bridge fee is $0.'});
    if(status==='Completed') activities.push({id:uid('evt_swap_credit',i+1),mins:Math.max(0,mins-1),type:'Robinhood USDC credited',category:'Swaps',user:user.id,asset:'USDC · Robinhood Chain',ref:s.destTx,corr:s.corr,amount:sent,rail:'USDC',status:'Confirmed',fee:0,note:'Full sent USDC amount credited on Robinhood Chain after route completion.'});
    if(status==='Failed') activities.push({id:uid('evt_swap_fail',i+1),mins:Math.max(0,mins-1),type:'Bridge failed · recovery queued',category:'Swaps',user:user.id,asset:`USDC · ${source}`,ref:s.id,corr:s.corr,amount:sent,rail:'On-chain',status:'Failed',fee:platformCost,note:'Bridge failure retained as an exception. User principal is not treated as platform revenue.'});
    if(platformCost>0) fees.push({mins,action:'USDC bridge subsidy',user:user.id,network:source==='Robinhood Chain'?'Robinhood Chain':`${source} → Robinhood`,notional:sent,cost:platformCost,userFee:0,recovered:0,status:activityStatus,ref:s.id,corr:s.corr});
  }
  window.observeSwaps = swaps;

  addEvents('Swaps & Bridge','Financial',['Cross-chain USDC deposit detected','Source confirmations reached','Bridge quote created','Bridge route selected','Bridge initiated','Bridge completed','Bridge failed','Bridge retry submitted','Bridge refund initiated','Robinhood USDC credited','Source gas subsidized','Bridge fee subsidized','Destination gas subsidized','Swap platform cost recorded','Swap reconciliation matched','Swap reconciliation mismatch'],'Track source chain, source tx, sent amount, route/provider, destination tx, received amount, company-paid costs and correlation ID.');

  purchases.slice(-28).forEach((p,i)=>activities.push({id:uid('evt_purchase_demo',i+1),mins:p.mins,type:`${p.rail} ${p.kind==='Stocks'?'stock pack':'crate'} purchase`,category:'Purchases',user:p.user,asset:p.product,ref:p.id,corr:p.corr,amount:-p.entry,rail:p.rail,status:p.status==='Settled'?'Confirmed':p.status,fee:0,note:`Demo purchase record · qty ${p.qty} · ${p.bonus} Crate Bonus · ${p.xp} XP.`}));
  reveals.slice(-28).forEach((r,i)=>activities.push({id:uid('evt_reveal_demo',i+1),mins:r.mins,type:r.status==='Exception'?'Reveal exception':'Reveal completed',category:'Reveals',user:r.user,asset:r.outcome,ref:r.id,corr:r.corr,amount:r.fmv,rail:'Internal',status:r.status==='Complete'?r.fair:r.status,fee:0,note:`${r.pack} · ${r.decision} · ${r.flags}.`}));
  marketEvents.slice(-42).forEach((m,i)=>activities.push({id:uid('evt_market_demo',i+1),mins:m.mins,type:m.action,category:'Marketplace',user:m.actor,counterparty:m.counter,asset:m.item,ref:m.ref,corr:m.corr,amount:m.value,rail:'Cash',status:m.status,fee:m.fee,note:`${m.kind} event linked to full marketplace lifecycle.`}));
  walletEvents.slice(-36).forEach((w,i)=>activities.push({id:uid('evt_wallet_demo',i+1),mins:w.mins,type:w.action,category:'Funding',user:w.user,asset:`${w.rail} · ${w.provider}`,ref:w.ref,corr:uid('corr_wallet_demo',i+1),amount:w.amount,rail:w.rail,status:w.status,fee:w.fee,note:'Funding event with provider/network and fee attached.'}));
  rewardEvents.slice(-34).forEach((r,i)=>activities.push({id:uid('evt_reward_demo',i+1),mins:r.mins,type:r.event,category:'Rewards',user:r.user,asset:'Rewards account',ref:r.ref,corr:uid('corr_reward_demo',i+1),amount:r.dir==='Out'?-r.amount:r.amount,rail:'Credits',status:r.status,fee:0,note:'Credits/rewards activity retained in the universal event ledger.'}));

  activities.sort((a,b)=>a.mins-b.mins);
  purchases.sort((a,b)=>a.mins-b.mins);
  reveals.sort((a,b)=>a.mins-b.mins);
  marketEvents.sort((a,b)=>a.mins-b.mins);
  walletEvents.sort((a,b)=>a.mins-b.mins);
  fees.sort((a,b)=>a.mins-b.mins);
  rewardEvents.sort((a,b)=>a.mins-b.mins);
  recon.sort((a,b)=>a.mins-b.mins);
  swaps.sort((a,b)=>a.mins-b.mins);

  function injectSwapUI(){
    const subnav=document.querySelector('.subnav');
    const walletBtn=subnav?.querySelector('[data-view="wallets"]');
    if(subnav && !subnav.querySelector('[data-view="swaps"]')){
      const btn=document.createElement('button');btn.className='nav-item';btn.dataset.view='swaps';btn.textContent='Swaps / Bridge';
      walletBtn?.after(btn); btn.addEventListener('click',()=>showView('swaps'));
    }
    const feesView=document.getElementById('view-fees');
    if(feesView && !document.getElementById('view-swaps')){
      const section=document.createElement('section');section.className='view';section.id='view-swaps';section.dataset.title='Swaps / Bridge';section.dataset.eyebrow='ACTIVITY / SWAPS';
      section.innerHTML=`
        <div class="section-intro"><div><h2>USDC bridge & swaps</h2><p>Users can send USDC from supported networks. Chosen detects the deposit, routes it into Robinhood Chain, covers bridge/gas costs, and credits the user the normalized Robinhood USDC amount.</p></div><div class="fee-live"><span class="health-dot"></span>User bridge fee: $0</div></div>
        <div class="metric-grid four" id="swapMetrics"></div>
        <div class="two-col">
          <div class="panel"><div class="panel-header"><div><h3>Inbound USDC by source network</h3><p>What users are actually sending into Chosen.</p></div></div><div id="swapNetworkBars" class="bar-list"></div></div>
          <div class="panel"><div class="panel-header"><div><h3>Routing policy</h3><p>SimpleSwap-style operational flow, with Chosen absorbing route costs.</p></div></div><div class="control-list"><div><strong>Accepted asset</strong><span>USDC</span></div><div><strong>Source networks</strong><span>Multi-chain</span></div><div><strong>Destination</strong><span>Robinhood Chain</span></div><div><strong>User bridge fee</strong><span class="status success">$0</span></div><div><strong>Gas / route costs</strong><span>Paid by Chosen</span></div></div></div>
        </div>
        <div class="panel"><div class="panel-header"><div><h3>Bridge lifecycle</h3><p>Every swap keeps the user's incoming transfer separate from company-paid routing costs.</p></div></div><div class="flow-strip"><div class="flow-step"><span>01</span><strong>USDC detected</strong><p>Source chain + source tx recorded.</p></div><i>→</i><div class="flow-step"><span>02</span><strong>Confirm & route</strong><p>Best supported bridge route selected.</p></div><i>→</i><div class="flow-step"><span>03</span><strong>Chosen pays costs</strong><p>Bridge, gas and destination execution are company expenses.</p></div><i>→</i><div class="flow-step"><span>04</span><strong>Robinhood USDC credited</strong><p>User receives the normalized amount.</p></div></div></div>
        <div class="panel"><div class="panel-header wrap"><div><h3>Swap ledger</h3><p>Sent amount, received amount, source/destination transactions and company subsidy.</p></div><div class="panel-tools"><label class="search-box"><span>⌕</span><input id="swapSearch" placeholder="User, swap, tx, chain…" /></label><select id="swapStatus" class="select-control"><option value="all">All statuses</option><option>Completed</option><option>Bridging</option><option>Confirming</option><option>Failed</option></select></div></div><div class="table-wrap" style="max-height:760px"><table><thead><tr><th>Time</th><th>Swap</th><th>User</th><th>From</th><th>Sent</th><th>Provider</th><th>To</th><th>Received</th><th>Cost to Chosen</th><th>User fee</th><th>Status</th><th></th></tr></thead><tbody id="swapTable"></tbody></table></div></div>`;
      feesView.before(section);
    }
    const quick=document.getElementById('activityQuickFilters');
    if(quick&&!quick.querySelector('[data-filter="Swaps"]')){const b=document.createElement('button');b.className='filter-chip';b.dataset.filter='Swaps';b.textContent='Swaps';quick.appendChild(b)}
    const cat=document.getElementById('activityCategory');if(cat&&![...cat.options].some(o=>o.value==='Swaps'))cat.add(new Option('Swaps','Swaps'));
    const controls=document.querySelector('#view-wallets .control-list');if(controls){const rows=controls.querySelectorAll(':scope > div');const last=rows[rows.length-1];if(last)last.innerHTML='<strong>Cross-chain USDC</strong><span class="status success">Auto-route to Robinhood</span>'}
    const walletIntro=document.querySelector('#view-wallets .timestamp');if(walletIntro)walletIntro.textContent='USDC deposits normalize to Robinhood Chain; Cash remains separate';
  }

  function renderSwaps(){
    const q=(document.getElementById('swapSearch')?.value||'').toLowerCase(), statusFilter=document.getElementById('swapStatus')?.value||'all';
    const completed=swaps.filter(s=>s.status==='Completed'), volume=completed.reduce((a,s)=>a+s.sent,0), cost=swaps.reduce((a,s)=>a+s.platformCost,0), pending=swaps.filter(s=>['Bridging','Confirming'].includes(s.status)).length;
    document.getElementById('swapMetrics').innerHTML=metric('Completed bridge volume',money(volume),`${completed.length} completed routes`)+metric('Platform-paid route cost',money(cost,4),'Bridge + source/destination execution','warning')+metric('User bridge fees',money(0),'Chosen absorbs route costs','positive')+metric('In flight',pending,'Confirming or bridging');
    const by={};completed.forEach(s=>by[s.source]=(by[s.source]||0)+s.sent);renderBars('swapNetworkBars',Object.entries(by).map(([k,v])=>[k,v,money(v)]));
    const rows=swaps.filter(s=>(statusFilter==='all'||s.status===statusFilter)&&Object.values(s).join(' ').toLowerCase().includes(q));
    document.getElementById('swapTable').innerHTML=rows.map(s=>`<tr data-detail="swap" data-id="${s.id}"><td>${timeAgo(s.mins)}</td><td><span class="cell-primary mono">${s.id}</span><span class="cell-secondary mono">${short(s.corr)}</span></td><td>${esc(userName(s.user))}</td><td><span class="cell-primary">${esc(s.source)}</span><span class="cell-secondary mono">${short(s.sourceTx)}</span></td><td>${money(s.sent)}</td><td>${esc(s.provider)}</td><td><span class="cell-primary">Robinhood Chain</span><span class="cell-secondary mono">${short(s.destTx)}</span></td><td>${s.received==null?'Pending':money(s.received)}</td><td class="amount-negative">${money(s.platformCost,4)}</td><td class="positive">$0.00</td><td>${status(s.status)}</td><td>${rowAction('swap',s.id)}</td></tr>`).join('');
  }
  renderers.swaps=renderSwaps;

  const oldOpenDrawer=openDrawer;
  openDrawer=function(type,id){
    if(type!=='swap') return oldOpenDrawer(type,id);
    const s=swaps.find(x=>x.id===id);if(!s)return;
    document.getElementById('drawerTitle').textContent=s.id;document.getElementById('drawerEyebrow').textContent='SWAP / BRIDGE';
    document.getElementById('drawerBody').innerHTML=`<div class="drawer-section"><div class="drawer-section-title">${esc(s.source)} → Robinhood Chain</div><div class="detail-grid">${kv('User',userName(s.user))}${kv('Sent',money(s.sent))}${kv('Received',s.received==null?'Pending':money(s.received))}${kv('Provider',s.provider)}${kv('Source tx',s.sourceTx)}${kv('Destination tx',s.destTx)}${kv('Source gas',money(s.sourceGas,4))}${kv('Bridge fee',money(s.bridgeFee,4))}${kv('Destination gas',money(s.destinationGas,4))}${kv('Total cost to Chosen',money(s.platformCost,4))}${kv('User fee','$0.00')}${kv('Status',s.status)}${kv('Correlation',s.corr)}</div><div class="detail-note">User principal is tracked separately from Chosen-paid routing costs. Completed swaps credit the full sent USDC amount on Robinhood Chain in this demo model.</div></div>${timelineDrawer(activities.filter(a=>a.corr===s.corr).sort((a,b)=>b.mins-a.mins))}`;
    document.getElementById('detailDrawer').classList.add('open');document.getElementById('drawerBackdrop').classList.add('open');document.getElementById('detailDrawer').setAttribute('aria-hidden','false');
  };

  injectSwapUI();
  document.getElementById('swapSearch')?.addEventListener('input',renderSwaps);
  document.getElementById('swapStatus')?.addEventListener('change',renderSwaps);
  Object.values(renderers).forEach(fn=>fn());

  let liveSwapIndex=1000;
  setInterval(()=>{
    const user=pick(users), source=pick(sourceChains.filter(x=>x!=='Robinhood Chain')), sent=round(25+seedRand()*900), cost=round(.01+seedRand()*.09,4), id=uid('swp_live',liveSwapIndex++), corr=`corr_${id}`;
    const s={id,mins:0,user:user.id,source,destination:'Robinhood Chain',sent,received:sent,provider:pick(bridgeProviders),sourceTx:`0xlive${liveSwapIndex.toString(16)}src`,destTx:`0xlive${liveSwapIndex.toString(16)}rh`,sourceGas:round(cost*.25,4),bridgeFee:round(cost*.6,4),destinationGas:round(cost*.15,4),platformCost:cost,userFee:0,status:'Completed',corr};
    swaps.unshift(s);activities.unshift({id:`evt_${id}`,mins:0,type:'Robinhood USDC credited',category:'Swaps',user:user.id,asset:`${source} → Robinhood Chain`,ref:id,corr,amount:sent,rail:'USDC',status:'Confirmed',fee:cost,note:'Live demo bridge completion. Chosen absorbed route cost.'});fees.unshift({mins:0,action:'USDC bridge subsidy',user:user.id,network:`${source} → Robinhood`,notional:sent,cost,userFee:0,recovered:0,status:'Confirmed',ref:id,corr});
    if(document.getElementById('view-swaps')?.classList.contains('active'))renderSwaps();
    if(document.getElementById('view-activity')?.classList.contains('active'))renderActivity();
    if(document.getElementById('view-fees')?.classList.contains('active'))renderFees();
  },15000);
})();

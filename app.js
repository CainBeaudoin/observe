const now = new Date();

const money = (n, digits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
const compactMoney = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtNum = n => new Intl.NumberFormat('en-US').format(n);
const timeAgo = mins => {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const shortHash = v => v.length > 14 ? `${v.slice(0, 7)}…${v.slice(-5)}` : v;
const escapeHtml = str => String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

const users = [
  { id:'usr_01HZX2', name:'Maya Chen', handle:'@maya', wallet:'0x7A4F…92C1', cash:842.16, usdc:1250.00, stocks:378.42, inventory:2, stockCost:332.10 },
  { id:'usr_01HZX9', name:'Andre Lewis', handle:'@andre', wallet:'0xA930…118D', cash:194.50, usdc:0, stocks:1234.18, inventory:5, stockCost:1018.45 },
  { id:'usr_01HZYA', name:'Sofia Patel', handle:'@sofia', wallet:'0x4C11…E0A8', cash:55.22, usdc:480.25, stocks:0, inventory:1, stockCost:0 },
  { id:'usr_01HZYQ', name:'Noah Kim', handle:'@noah', wallet:'0xD033…77A2', cash:2231.01, usdc:72.90, stocks:521.37, inventory:3, stockCost:489.11 },
  { id:'usr_01HZZ4', name:'Ari Brooks', handle:'@ari', wallet:'0x88BE…1431', cash:18.46, usdc:902.44, stocks:86.12, inventory:0, stockCost:95.00 },
  { id:'usr_01J001', name:'Leo Park', handle:'@leo', wallet:'0x51F2…66B4', cash:711.90, usdc:150.00, stocks:694.31, inventory:4, stockCost:620.00 }
];
const userById = Object.fromEntries(users.map(u => [u.id, u]));

const activities = [
  {id:'evt_9F4A12',mins:0,type:'Stock sold',category:'Stocks',user:'usr_01HZX9',asset:'NVDA · 0.132 sh',ref:'ord_STK_8821',amount:31.74,rail:'On-chain',status:'Confirmed',tone:'success',fee:0.0128,note:'User liquidated owned NVDA position. Proceeds credited to cash balance after execution.'},
  {id:'evt_9F4A11',mins:1,type:'Fee recovered',category:'Fees',user:'usr_01HZX9',asset:'NVDA sell fee',ref:'fee_44329',amount:-0.20,rail:'Internal',status:'Settled',tone:'success',fee:0,note:'Configured sell fee collected from user and matched against execution/network cost.'},
  {id:'evt_9F4A10',mins:2,type:'Offer accepted',category:'Marketplace',user:'usr_01HZYQ',asset:'Air Jordan 1 Chicago',ref:'off_11983',amount:412.00,rail:'Cash',status:'Settling',tone:'pending',fee:8.24,note:'Seller accepted buyer offer. Custody transfer is awaiting final settlement.'},
  {id:'evt_9F4A09',mins:3,type:'USDC crate opened',category:'Purchases',user:'usr_01HZYA',asset:'Streetwear 100',ref:'pur_72119',amount:-100.00,rail:'USDC',status:'Confirmed',tone:'success',fee:0.0007,note:'USDC funded crate. Any cashout from this reveal is restricted to USDC.'},
  {id:'evt_9F4A08',mins:4,type:'Reveal completed',category:'Reveals',user:'usr_01HZYA',asset:'Supreme Box Logo Tee',ref:'rev_55102',amount:128.00,rail:'Internal',status:'Verified',tone:'success',fee:0,note:'Commit/reveal verification passed. FMV snapshot captured at reveal time.'},
  {id:'evt_9F4A07',mins:5,type:'Kept in vault',category:'Inventory',user:'usr_01HZYA',asset:'Supreme Box Logo Tee',ref:'itm_77201',amount:128.00,rail:'Internal',status:'Owned',tone:'info',fee:0,note:'User elected to keep the physical item. Ownership ledger updated.'},
  {id:'evt_9F4A06',mins:8,type:'Marketplace listed',category:'Marketplace',user:'usr_01HZX2',asset:'Nike SB Dunk Jarritos',ref:'lst_10892',amount:510.00,rail:'Internal',status:'Active',tone:'info',fee:0,note:'Item listed on secondary market. Original reveal and custody chain remain linked.'},
  {id:'evt_9F4A05',mins:10,type:'Stock pack purchased',category:'Purchases',user:'usr_01HZX9',asset:'Equity Pack 50',ref:'pur_72118',amount:-50.00,rail:'Cash',status:'Confirmed',tone:'success',fee:0,note:'Stock packs are cash-only. Purchase is linked to the resulting stock acquisition.'},
  {id:'evt_9F4A04',mins:11,type:'Stock assigned',category:'Stocks',user:'usr_01HZX9',asset:'AAPL · 0.209 sh',ref:'pos_55218',amount:49.86,rail:'Internal',status:'Owned',tone:'success',fee:0.0016,note:'Winning stock was purchased and attributed to user portfolio. Principal is user-owned.'},
  {id:'evt_9F4A03',mins:14,type:'Cashback settled',category:'Cashouts',user:'usr_01J001',asset:'Sneaker 100 · reveal rev_55094',ref:'cb_09331',amount:78.00,rail:'Cash',status:'Settled',tone:'success',fee:0.0032,note:'Cash-funded crate cashback returned to cash balance.'},
  {id:'evt_9F4A02',mins:17,type:'Offer sent',category:'Marketplace',user:'usr_01HZX2',asset:'Air Jordan 1 Chicago',ref:'off_11982',amount:395.00,rail:'Cash',status:'Open',tone:'pending',fee:0,note:'Offer submitted and reserved according to marketplace rules.'},
  {id:'evt_9F4A01',mins:19,type:'Transfer completed',category:'Transfers',user:'usr_01J001',counterparty:'usr_01HZX2',asset:'New Balance 990v6',ref:'xfr_00221',amount:220.00,rail:'On-chain',status:'Confirmed',tone:'success',fee:0.0011,note:'Asset ownership transferred user-to-user. Sender and receiver histories updated.'},
  {id:'evt_9F49FF',mins:22,type:'Reveal exception',category:'Reveals',user:'usr_01HZZ4',asset:'Stock Pack 100',ref:'rev_55099',amount:0,rail:'Internal',status:'Review',tone:'flagged',fee:0,note:'FMV quote timestamp exceeded configured freshness threshold. Manual review required.'},
  {id:'evt_9F49FE',mins:28,type:'USDC cashback',category:'Cashouts',user:'usr_01HZZ4',asset:'Streetwear 50',ref:'cb_09328',amount:39.50,rail:'USDC',status:'Settled',tone:'success',fee:0.0007,note:'USDC-funded crate settled cashback in USDC, preserving rail integrity.'},
  {id:'evt_9F49FD',mins:34,type:'Offer declined',category:'Marketplace',user:'usr_01HZYQ',asset:'Nike SB Dunk Jarritos',ref:'off_11977',amount:460.00,rail:'Cash',status:'Closed',tone:'success',fee:0,note:'Offer declined by seller. Buyer reserve released.'},
  {id:'evt_9F49FC',mins:39,type:'Cash crate opened',category:'Purchases',user:'usr_01HZYQ',asset:'Sneaker 250',ref:'pur_72110',amount:-250.00,rail:'Cash',status:'Confirmed',tone:'success',fee:0,note:'Cash-funded sneaker crate. Any cashback is restricted to cash.'},
  {id:'evt_9F49FB',mins:46,type:'Item sold',category:'Marketplace',user:'usr_01HZX2',counterparty:'usr_01J001',asset:'Supreme MM6 Hoodie',ref:'sale_99120',amount:286.00,rail:'Cash',status:'Settled',tone:'success',fee:5.72,note:'Secondary sale settled, marketplace fee captured, ownership reassigned.'},
  {id:'evt_9F49FA',mins:52,type:'Listing cancelled',category:'Marketplace',user:'usr_01HZX9',asset:'Travis Scott Reverse Mocha',ref:'lst_10871',amount:980.00,rail:'Internal',status:'Closed',tone:'success',fee:0,note:'Seller cancelled active listing. Item remains in seller inventory.'},
  {id:'evt_9F49F9',mins:61,type:'Stock buy executed',category:'Stocks',user:'usr_01HZYQ',asset:'TSLA · 1.478 sh',ref:'ord_STK_8791',amount:521.37,rail:'On-chain',status:'Confirmed',tone:'success',fee:0.0091,note:'Stock purchased after reveal and attributed to user portfolio.'},
  {id:'evt_9F49F8',mins:73,type:'Cashout requested',category:'Cashouts',user:'usr_01HZX2',asset:'Cash balance',ref:'wd_22019',amount:-320.00,rail:'Cash',status:'Processing',tone:'pending',fee:0.20,note:'Cash withdrawal requested. Source balance and settlement reference recorded.'},
  {id:'evt_9F49F7',mins:92,type:'Transaction failed',category:'Fees',user:'usr_01HZZ4',asset:'Marketplace transfer',ref:'tx_7c91a',amount:0,rail:'On-chain',status:'Failed',tone:'failed',fee:0.0023,note:'On-chain transfer failed. Cost is tracked even though business action did not complete.'}
];

const purchases = [
  {id:'pur_72119',user:'usr_01HZYA',product:'Streetwear 100',kind:'Streetwear',entry:100,rail:'USDC',payment:'0x93a…120f',reveal:'rev_55102',status:'Settled'},
  {id:'pur_72118',user:'usr_01HZX9',product:'Equity Pack 50',kind:'Stocks',entry:50,rail:'Cash',payment:'pi_3Q91…z8H',reveal:'rev_55101',status:'Settled'},
  {id:'pur_72117',user:'usr_01HZX2',product:'Sneaker 100',kind:'Sneakers',entry:100,rail:'Cash',payment:'pi_3Q90…mF2',reveal:'rev_55100',status:'Settled'},
  {id:'pur_72116',user:'usr_01HZZ4',product:'Equity Pack 100',kind:'Stocks',entry:100,rail:'Cash',payment:'pi_3Q8y…jC7',reveal:'rev_55099',status:'Review'},
  {id:'pur_72115',user:'usr_01J001',product:'Streetwear 50',kind:'Streetwear',entry:50,rail:'USDC',payment:'0x881…19ce',reveal:'rev_55098',status:'Settled'},
  {id:'pur_72114',user:'usr_01HZYQ',product:'Sneaker 250',kind:'Sneakers',entry:250,rail:'Cash',payment:'pi_3Q8u…pL4',reveal:'rev_55097',status:'Settled'},
  {id:'pur_72113',user:'usr_01HZX9',product:'Sneaker 100',kind:'Sneakers',entry:100,rail:'USDC',payment:'0x71b…c398',reveal:'rev_55096',status:'Settled'},
  {id:'pur_72112',user:'usr_01HZYA',product:'Streetwear 100',kind:'Streetwear',entry:100,rail:'Cash',payment:'pi_3Q8o…qD1',reveal:'rev_55095',status:'Settled'},
  {id:'pur_72111',user:'usr_01J001',product:'Sneaker 100',kind:'Sneakers',entry:100,rail:'Cash',payment:'pi_3Q8j…sN3',reveal:'rev_55094',status:'Settled'}
];

const reveals = [
  {id:'rev_55102',user:'usr_01HZYA',pack:'Streetwear 100',outcome:'Supreme Box Logo Tee',rarity:'Rare',fmv:128,decision:'Vault',fair:'Verified',status:'Complete',commit:'0xd21b5e47f81d5f6a9c',revealHash:'0xa9d33c882791b027ef',note:'User kept item in vault.'},
  {id:'rev_55101',user:'usr_01HZX9',pack:'Equity Pack 50',outcome:'AAPL · 0.209 sh',rarity:'Uncommon',fmv:49.86,decision:'Hold stock',fair:'Verified',status:'Complete',commit:'0x14ab8729f2b06a7711',revealHash:'0x33ac1041decb859fa2',note:'Stock acquired and assigned to user portfolio.'},
  {id:'rev_55100',user:'usr_01HZX2',pack:'Sneaker 100',outcome:'Nike SB Dunk Jarritos',rarity:'Epic',fmv:486,decision:'Vault',fair:'Verified',status:'Complete',commit:'0x997e11f3c17d01aa42',revealHash:'0x0f7cd82a8129cba314',note:'Item later listed on marketplace.'},
  {id:'rev_55099',user:'usr_01HZZ4',pack:'Equity Pack 100',outcome:'Quote refresh required',rarity:'—',fmv:0,decision:'Pending',fair:'Review',status:'Exception',commit:'0x51c71e64a0e2dd7720',revealHash:'pending',note:'Price source timestamp exceeded freshness threshold; outcome held before assignment.'},
  {id:'rev_55098',user:'usr_01J001',pack:'Streetwear 50',outcome:'Cashback',rarity:'Common',fmv:39.5,decision:'USDC cashback',fair:'Verified',status:'Complete',commit:'0x229adfa8155dd8b5c2',revealHash:'0x57ff997c81d57d920a',note:'USDC rail preserved.'},
  {id:'rev_55097',user:'usr_01HZYQ',pack:'Sneaker 250',outcome:'Air Jordan 1 Chicago',rarity:'Rare',fmv:430,decision:'List',fair:'Verified',status:'Complete',commit:'0xe3f0a861bcf116212a',revealHash:'0x7ab2ea31ed9fe41a67',note:'Item listed and received marketplace offers.'},
  {id:'rev_55096',user:'usr_01HZX9',pack:'Sneaker 100',outcome:'Cashback',rarity:'Common',fmv:82,decision:'USDC cashback',fair:'Verified',status:'Complete',commit:'0xb4310ae9da01c7c384',revealHash:'0x44bdcaff72a1fb1c77',note:'Cashback in USDC because entry was USDC.'},
  {id:'rev_55094',user:'usr_01J001',pack:'Sneaker 100',outcome:'Cashback',rarity:'Common',fmv:78,decision:'Cash cashback',fair:'Verified',status:'Complete',commit:'0x2d8fe4c2bb810cc811',revealHash:'0xf89474d71eb74bcaa8',note:'Cash rail preserved.'}
];

const marketEvents = [
  {mins:2,type:'Offer',action:'Offer accepted',item:'Air Jordan 1 Chicago',actor:'usr_01HZYQ',counterparty:'usr_01HZX2',value:412,fee:8.24,status:'Settling',ref:'off_11983'},
  {mins:8,type:'Listing',action:'Listing created',item:'Nike SB Dunk Jarritos',actor:'usr_01HZX2',counterparty:'—',value:510,fee:0,status:'Active',ref:'lst_10892'},
  {mins:17,type:'Offer',action:'Offer sent',item:'Air Jordan 1 Chicago',actor:'usr_01HZX2',counterparty:'usr_01HZYQ',value:395,fee:0,status:'Open',ref:'off_11982'},
  {mins:19,type:'Transfer',action:'User transfer',item:'New Balance 990v6',actor:'usr_01J001',counterparty:'usr_01HZX2',value:220,fee:.0011,status:'Confirmed',ref:'xfr_00221'},
  {mins:34,type:'Offer',action:'Offer declined',item:'Nike SB Dunk Jarritos',actor:'usr_01HZYQ',counterparty:'usr_01HZX2',value:460,fee:0,status:'Closed',ref:'off_11977'},
  {mins:46,type:'Sale',action:'Marketplace sale',item:'Supreme MM6 Hoodie',actor:'usr_01HZX2',counterparty:'usr_01J001',value:286,fee:5.72,status:'Settled',ref:'sale_99120'},
  {mins:52,type:'Listing',action:'Listing cancelled',item:'Travis Scott Reverse Mocha',actor:'usr_01HZX9',counterparty:'—',value:980,fee:0,status:'Closed',ref:'lst_10871'},
  {mins:115,type:'Offer',action:'Offer expired',item:'Palace x Gap Varsity',actor:'usr_01HZZ4',counterparty:'usr_01J001',value:174,fee:0,status:'Closed',ref:'off_11912'}
];

const fees = [
  {mins:0,action:'Stock sell',user:'usr_01HZX9',network:'Robinhood Chain',notional:31.74,cost:.0128,collected:.20,status:'Recovered',tx:'0x98f21c5a…712e'},
  {mins:2,action:'Marketplace settlement',user:'usr_01HZYQ',network:'Robinhood Chain',notional:412,cost:.0048,collected:8.24,status:'Recovered',tx:'0xb1a93419…cc08'},
  {mins:3,action:'USDC crate payment',user:'usr_01HZYA',network:'Robinhood Chain',notional:100,cost:.0007,collected:0,status:'Platform paid',tx:'0xc72ef901…039a'},
  {mins:19,action:'User item transfer',user:'usr_01J001',network:'Robinhood Chain',notional:220,cost:.0011,collected:.25,status:'Recovered',tx:'0xfbb931ae…271c'},
  {mins:28,action:'USDC cashback',user:'usr_01HZZ4',network:'Robinhood Chain',notional:39.5,cost:.0007,collected:0,status:'Platform paid',tx:'0x1248ffac…33e1'},
  {mins:46,action:'Marketplace settlement',user:'usr_01HZX2',network:'Robinhood Chain',notional:286,cost:.0039,collected:5.72,status:'Recovered',tx:'0x50ab2219…a800'},
  {mins:61,action:'Stock buy',user:'usr_01HZYQ',network:'Robinhood Chain',notional:521.37,cost:.0091,collected:0,status:'Platform paid',tx:'0x92a77031…192e'},
  {mins:73,action:'Cash withdrawal',user:'usr_01HZX2',network:'Payment processor',notional:320,cost:.20,collected:.25,status:'Recovered',tx:'wd_22019'},
  {mins:92,action:'Failed marketplace transfer',user:'usr_01HZZ4',network:'Robinhood Chain',notional:0,cost:.0023,collected:0,status:'Unrecovered',tx:'0x7c91af11…290c'},
  {mins:143,action:'Stock sell',user:'usr_01J001',network:'Robinhood Chain',notional:88.21,cost:.0134,collected:.20,status:'Recovered',tx:'0x9af817a1…333d'},
  {mins:205,action:'USDC cashback',user:'usr_01HZX9',network:'Robinhood Chain',notional:82,cost:.0008,collected:0,status:'Platform paid',tx:'0xd3af9181…46b0'}
];

const positions = {
  usr_01HZX2:[{ticker:'MSFT',shares:.71,basis:291.20,value:307.09}],
  usr_01HZX9:[{ticker:'NVDA',shares:3.21,basis:733.45,value:814.66},{ticker:'AAPL',shares:1.77,basis:285,value:419.52}],
  usr_01HZYQ:[{ticker:'TSLA',shares:1.478,basis:489.11,value:521.37}],
  usr_01HZZ4:[{ticker:'AMD',shares:.53,basis:95,value:86.12}],
  usr_01J001:[{ticker:'AMZN',shares:2.86,basis:620,value:694.31}]
};

function userName(id){ const u=userById[id]; return u ? u.name : id || '—'; }
function initials(name){ return name.split(' ').map(x=>x[0]).join('').slice(0,2); }
function statusClass(status){
  if(/failed|exception|review|unrecovered/i.test(status)) return 'flagged';
  if(/pending|processing|settling|open|platform paid/i.test(status)) return 'pending';
  if(/active|owned|verified/i.test(status)) return 'info';
  return 'success';
}
function railTag(rail){
  const c = rail==='Cash'?'cash':rail==='USDC'?'usdc':rail==='On-chain'?'chain':'internal';
  return `<span class="tag ${c}">${escapeHtml(rail)}</span>`;
}
function metricCard(label,value,sub='',trend='',tag=''){
  return `<div class="metric-card"><div class="metric-label"><span>${label}</span>${tag?`<span class="mini-tag ${trend}">${tag}</span>`:''}</div><div class="metric-value">${value}</div><div class="metric-sub ${trend}">${sub}</div></div>`;
}
function detailButton(id,type){ return `<button class="row-action" data-detail-id="${id}" data-detail-type="${type}" aria-label="View details">→</button>`; }

function renderActivity(){
  const totalCash = activities.filter(a=>a.rail==='Cash').reduce((s,a)=>s+Math.abs(a.amount),0);
  const totalUsdc = activities.filter(a=>a.rail==='USDC').reduce((s,a)=>s+Math.abs(a.amount),0);
  const totalFees = activities.reduce((s,a)=>s+(a.fee||0),0);
  document.querySelector('#activityMetrics').innerHTML = [
    metricCard('Events · visible window',fmtNum(activities.length),'Across every tracked category','neutral','LIVE'),
    metricCard('Cash movement',money(totalCash), 'Gross activity, not net revenue',''),
    metricCard('USDC movement',money(totalUsdc), 'Rail remains segregated end-to-end',''),
    metricCard('Tracked fees',money(totalFees,4), 'Execution + chain + marketplace costs','positive','AUDITED')
  ].join('');

  const cats = [...new Set(activities.map(a=>a.category))].sort();
  const categorySelect=document.querySelector('#activityCategory');
  categorySelect.innerHTML='<option value="all">All categories</option>'+cats.map(c=>`<option>${c}</option>`).join('');
  document.querySelector('#activityQuickFilters').innerHTML=['All','Purchases','Reveals','Marketplace','Stocks','Cashouts','Transfers','Fees'].map((x,i)=>`<button class="filter-chip ${i===0?'active':''}" data-category="${x==='All'?'all':x}">${x}</button>`).join('');
  filterActivity();
}
function filterActivity(){
  const q=document.querySelector('#activitySearch').value.trim().toLowerCase();
  const cat=document.querySelector('#activityCategory').value;
  const rail=document.querySelector('#activityRail').value;
  const rows=activities.filter(a=>{
    const u=userById[a.user];
    const hay=[a.id,a.type,a.category,a.asset,a.ref,a.rail,a.status,u?.name,u?.id,u?.wallet].join(' ').toLowerCase();
    return (!q||hay.includes(q)) && (cat==='all'||a.category===cat) && (rail==='all'||a.rail===rail);
  });
  document.querySelector('#activityTable').innerHTML=rows.length?rows.map(a=>`<tr data-detail-id="${a.id}" data-detail-type="activity"><td><span class="cell-primary">${timeAgo(a.mins)}</span><span class="cell-secondary">${a.id}</span></td><td><span class="cell-primary">${escapeHtml(a.type)}</span><span class="cell-secondary">${escapeHtml(a.category)}</span></td><td><span class="cell-primary">${userName(a.user)}</span><span class="cell-secondary mono">${a.user}</span></td><td><span class="cell-primary">${escapeHtml(a.asset)}</span><span class="cell-secondary mono">${escapeHtml(a.ref)}</span></td><td class="${a.amount>0?'amount-positive':a.amount<0?'amount-negative':''}">${a.amount?money(a.amount):'—'}</td><td>${railTag(a.rail)}</td><td><span class="status ${statusClass(a.status)}">${a.status}</span></td><td>${detailButton(a.id,'activity')}</td></tr>`).join(''):`<tr><td class="empty-state" colspan="8">No events match these filters.</td></tr>`;
  bindRows();
}

function renderPurchases(){
  const volume=purchases.reduce((s,p)=>s+p.entry,0), cash=purchases.filter(p=>p.rail==='Cash').reduce((s,p)=>s+p.entry,0), usdc=purchases.filter(p=>p.rail==='USDC').reduce((s,p)=>s+p.entry,0), stock=purchases.filter(p=>p.kind==='Stocks').reduce((s,p)=>s+p.entry,0);
  document.querySelector('#purchaseMetrics').innerHTML=[metricCard('Gross entry volume',money(volume),'Visible purchase sample'),metricCard('Cash entries',money(cash),`${purchases.filter(p=>p.rail==='Cash').length} purchases`,'positive'),metricCard('USDC entries',money(usdc),`${purchases.filter(p=>p.rail==='USDC').length} purchases`,'neutral'),metricCard('Stock pack entries',money(stock),'Cash-only by policy')].join('');
  const byKind=Object.entries(purchases.reduce((o,p)=>{o[p.kind]=(o[p.kind]||0)+p.entry;return o;},{})).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(...byKind.map(x=>x[1]));
  document.querySelector('#purchaseBars').innerHTML=byKind.map(([k,v])=>`<div class="bar-row"><div class="bar-label"><strong>${k}</strong><span>${purchases.filter(p=>p.kind===k).length} entries</span></div><div class="bar-track"><div class="bar-fill" style="width:${(v/max)*100}%"></div></div><div class="bar-value">${money(v)}</div></div>`).join('');
  filterPurchases();
}
function filterPurchases(){
  const q=document.querySelector('#purchaseSearch').value.trim().toLowerCase();
  const rows=purchases.filter(p=>[p.id,p.product,p.kind,p.rail,p.payment,p.reveal,userName(p.user),p.user].join(' ').toLowerCase().includes(q));
  document.querySelector('#purchaseTable').innerHTML=rows.map(p=>`<tr data-detail-id="${p.id}" data-detail-type="purchase"><td><span class="cell-primary mono">${p.id}</span></td><td><span class="cell-primary">${userName(p.user)}</span><span class="cell-secondary mono">${p.user}</span></td><td><span class="cell-primary">${p.product}</span><span class="cell-secondary">${p.kind}</span></td><td>${money(p.entry)}</td><td>${railTag(p.rail)}</td><td class="mono">${shortHash(p.payment)}</td><td class="mono">${p.reveal}</td><td><span class="status ${statusClass(p.status)}">${p.status}</span></td><td>${detailButton(p.id,'purchase')}</td></tr>`).join('')||`<tr><td class="empty-state" colspan="9">No purchases found.</td></tr>`;
  bindRows();
}

let revealExceptionsOnly=false;
function renderReveals(){
  const completed=reveals.filter(r=>r.status==='Complete').length, exceptions=reveals.filter(r=>r.status==='Exception').length, totalFmv=reveals.reduce((s,r)=>s+r.fmv,0), verified=reveals.filter(r=>r.fair==='Verified').length;
  document.querySelector('#revealMetrics').innerHTML=[metricCard('Reveals monitored',fmtNum(reveals.length),'Commit → outcome → decision'),metricCard('Verified fairness',`${Math.round(verified/reveals.length*100)}%`,`${verified} verified`,'positive'),metricCard('Outcome FMV',money(totalFmv),'Snapshot at reveal time'),metricCard('Exceptions',fmtNum(exceptions),exceptions?'Requires review':'No open issues',exceptions?'negative':'positive')].join('');
  filterReveals();
}
function filterReveals(){
  const q=document.querySelector('#revealSearch').value.trim().toLowerCase();
  const rows=reveals.filter(r=>(!revealExceptionsOnly||r.status==='Exception')&&[r.id,r.pack,r.outcome,r.decision,r.fair,userName(r.user),r.user].join(' ').toLowerCase().includes(q));
  document.querySelector('#revealTable').innerHTML=rows.map(r=>`<tr data-detail-id="${r.id}" data-detail-type="reveal"><td><span class="cell-primary mono">${r.id}</span><span class="cell-secondary">${shortHash(r.commit)}</span></td><td><span class="cell-primary">${userName(r.user)}</span><span class="cell-secondary mono">${r.user}</span></td><td>${r.pack}</td><td><span class="cell-primary">${r.outcome}</span><span class="cell-secondary">${r.rarity}</span></td><td>${r.fmv?money(r.fmv):'—'}</td><td>${r.decision}</td><td><span class="status ${statusClass(r.fair)}">${r.fair}</span></td><td><span class="status ${statusClass(r.status)}">${r.status}</span></td><td>${detailButton(r.id,'reveal')}</td></tr>`).join('')||`<tr><td class="empty-state" colspan="9">No reveal records found.</td></tr>`;
  bindRows();
}

let marketType='all';
function renderMarket(){
  const listings=marketEvents.filter(x=>x.type==='Listing'&&x.status==='Active').length, openOffers=marketEvents.filter(x=>x.type==='Offer'&&x.status==='Open').length, sales=marketEvents.filter(x=>x.type==='Sale').reduce((s,x)=>s+x.value,0), feesTotal=marketEvents.reduce((s,x)=>s+x.fee,0);
  document.querySelector('#marketMetrics').innerHTML=[metricCard('Active listings',fmtNum(listings),'Current visible sample'),metricCard('Open offers',fmtNum(openOffers),'Buyer intent outstanding'),metricCard('Settled sales',money(sales),'Gross marketplace value','positive'),metricCard('Fees captured',money(feesTotal,4),'Marketplace + transfer fees','positive')].join('');
  filterMarket();
}
function filterMarket(){
  const rows=marketEvents.filter(x=>marketType==='all'||x.type===marketType);
  document.querySelector('#marketTable').innerHTML=rows.map((x,i)=>`<tr data-detail-id="${x.ref}" data-detail-type="market"><td>${timeAgo(x.mins)}</td><td><span class="cell-primary">${x.action}</span><span class="cell-secondary mono">${x.ref}</span></td><td>${x.item}</td><td>${userName(x.actor)}</td><td>${x.counterparty==='—'?'—':userName(x.counterparty)}</td><td>${money(x.value)}</td><td>${x.fee?money(x.fee,4):'—'}</td><td><span class="status ${statusClass(x.status)}">${x.status}</span></td><td>${detailButton(x.ref,'market')}</td></tr>`).join('');
  bindRows();
}

function renderPortfolios(){
  const totalCash=users.reduce((s,u)=>s+u.cash,0), totalUsdc=users.reduce((s,u)=>s+u.usdc,0), totalStocks=users.reduce((s,u)=>s+u.stocks,0), totalInventory=users.reduce((s,u)=>s+u.inventory,0);
  document.querySelector('#portfolioMetrics').innerHTML=[metricCard('User cash balances',money(totalCash),'Custodial cash ledger'),metricCard('User USDC balances',money(totalUsdc),'On-chain user value','neutral'),metricCard('Equities marked value',money(totalStocks),'User-owned stock positions','positive'),metricCard('Physical items held',fmtNum(totalInventory),'Vault ownership records')].join('');
  filterPortfolios();
}
function filterPortfolios(){
  const q=document.querySelector('#portfolioSearch').value.trim().toLowerCase();
  const rows=users.filter(u=>[u.id,u.name,u.handle,u.wallet].join(' ').toLowerCase().includes(q));
  document.querySelector('#portfolioGrid').innerHTML=rows.map(u=>{
    const total=u.cash+u.usdc+u.stocks;
    const pnl=u.stocks-u.stockCost;
    return `<article class="portfolio-card" data-detail-id="${u.id}" data-detail-type="portfolio"><div class="user-row"><div class="user-avatar">${initials(u.name)}</div><div class="user-meta"><strong>${u.name}</strong><span>${u.handle} · ${u.wallet}</span></div><div class="user-total"><strong>${money(total)}</strong><span>ACCOUNT VALUE*</span></div></div><div class="portfolio-mini-grid"><div class="mini-balance"><span>Cash</span><strong>${money(u.cash)}</strong></div><div class="mini-balance"><span>USDC</span><strong>${money(u.usdc)}</strong></div><div class="mini-balance"><span>Stocks</span><strong>${money(u.stocks)}</strong></div><div class="mini-balance"><span>Stock P&L</span><strong class="${pnl>=0?'positive':'negative'}">${pnl>=0?'+':''}${money(pnl)}</strong></div></div></article>`;
  }).join('')||`<div class="empty-state">No portfolios found.</div>`;
  bindRows();
}

function renderFees(){
  const cost=fees.reduce((s,f)=>s+f.cost,0), collected=fees.reduce((s,f)=>s+f.collected,0), exposure=fees.reduce((s,f)=>s+Math.max(f.cost-f.collected,0),0), recoveredCost=fees.reduce((s,f)=>s+Math.min(f.cost,f.collected),0), coverage=cost?Math.round(recoveredCost/cost*100):0;
  document.querySelector('#feeMetrics').innerHTML=[metricCard('Actual fees paid',money(cost,4),'All tracked execution / network costs'),metricCard('Fees collected',money(collected,4),'Configured charges to users','positive'),metricCard('Net platform exposure',money(exposure,4),'Unrecovered costs only',exposure>.05?'negative':'positive'),metricCard('Cost coverage',`${coverage}%`,'Recovered cost / total cost','positive')].join('');
  document.querySelector('#coveragePct').textContent=`${coverage}%`;
  document.querySelector('#coverageRing').style.setProperty('--coverage',`${Math.min(coverage,100)*3.6}deg`);
  document.querySelector('#coverageRecovered').textContent=`${money(recoveredCost,4)} cost recovered`;
  document.querySelector('#coverageExposure').textContent=`${money(exposure,4)} net platform exposure`;
  const byNet=Object.entries(fees.reduce((o,f)=>{o[f.network]=(o[f.network]||0)+f.cost;return o;},{}));
  const max=Math.max(...byNet.map(x=>x[1]));
  document.querySelector('#feeNetworkBars').innerHTML=byNet.map(([net,val])=>`<div class="bar-row"><div class="bar-label"><strong>${net}</strong><span>${fees.filter(f=>f.network===net).length} transactions</span></div><div class="bar-track"><div class="bar-fill" style="width:${val/max*100}%"></div></div><div class="bar-value">${money(val,4)}</div></div>`).join('');
  filterFees();
}
function filterFees(){
  const q=document.querySelector('#feeSearch').value.trim().toLowerCase();
  const rows=fees.filter(f=>[f.action,f.network,f.tx,f.status,userName(f.user),f.user].join(' ').toLowerCase().includes(q));
  document.querySelector('#feeTable').innerHTML=rows.map((f,i)=>{const net=Math.max(f.cost-f.collected,0);return `<tr data-detail-id="${f.tx}" data-detail-type="fee"><td>${timeAgo(f.mins)}</td><td><span class="cell-primary">${f.action}</span><span class="cell-secondary mono">${shortHash(f.tx)}</span></td><td>${userName(f.user)}</td><td>${f.network}</td><td>${f.notional?money(f.notional):'—'}</td><td>${money(f.cost,4)}</td><td class="${f.collected?'amount-positive':''}">${money(f.collected,4)}</td><td class="${net?'amount-negative':'positive'}">${money(net,4)}</td><td><span class="status ${statusClass(f.status)}">${f.status}</span></td><td>${detailButton(f.tx,'fee')}</td></tr>`}).join('')||`<tr><td class="empty-state" colspan="10">No fee transactions found.</td></tr>`;
  bindRows();
}

function pair(label,value){ return `<div class="detail-pair"><span>${escapeHtml(label)}</span><strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong></div>`; }
function detailSection(title,content){ return `<section class="detail-section"><h4>${title}</h4>${content}</section>`; }
function timeline(items){ return `<div class="timeline">${items.map(i=>`<div class="timeline-item"><div class="timeline-mark"></div><div><strong>${i[0]}</strong><span>${i[1]}</span></div></div>`).join('')}</div>`; }

function openDrawer(type,id){
  let title='Record details', eyebrow=type.toUpperCase(), html='';
  if(type==='activity'){
    const a=activities.find(x=>x.id===id); if(!a)return;
    title=a.type; eyebrow=`${a.category.toUpperCase()} · ${a.id}`;
    html=detailSection('Event',`<div class="detail-grid">${pair('User',`${userName(a.user)} · ${a.user}`)}${pair('Time',timeAgo(a.mins))}${pair('Asset',a.asset)}${pair('Reference',a.ref)}${pair('Amount',a.amount?money(a.amount):'—')}${pair('Rail',a.rail)}${pair('Status',a.status)}${pair('Tracked fee',money(a.fee||0,4))}</div><div class="detail-note">${escapeHtml(a.note)}</div>`)+detailSection('Audit trail',timeline([['Event accepted','Normalized into platform event schema'],['Business rule checked',`${a.rail} rail and ownership constraints evaluated`],['Ledger persisted','Event available for reconciliation and support lookup']]))+`<div class="code-box">event_id=${a.id}\nreference=${a.ref}\nidempotency_key=idem_${a.id.slice(-6)}\ncreated_at=${new Date(now-a.mins*60000).toISOString()}</div>`;
  }
  if(type==='purchase'){
    const p=purchases.find(x=>x.id===id); if(!p)return;
    title=p.product; eyebrow=`PURCHASE · ${p.id}`;
    const rule=p.kind==='Stocks'?'Cash-only stock pack. The stock outcome becomes a user-owned position.':`${p.rail} entry locks downstream cashout to the same rail.`;
    html=detailSection('Purchase',`<div class="detail-grid">${pair('User',userName(p.user))}${pair('Account',p.user)}${pair('Entry',money(p.entry))}${pair('Payment rail',p.rail)}${pair('Payment reference',p.payment)}${pair('Reveal ID',p.reveal)}${pair('Product type',p.kind)}${pair('Status',p.status)}</div><div class="detail-note">${rule}</div>`)+detailSection('Lifecycle',timeline([['Purchase authorized',`${p.rail} source recorded`],['Payment settled','Entry balance updated'],['Reveal linked',p.reveal],['Outcome restriction saved',p.kind==='Stocks'?'Stock pack: cash-only liquidation path':`${p.rail} cashout only`]]));
  }
  if(type==='reveal'){
    const r=reveals.find(x=>x.id===id); if(!r)return;
    title=r.outcome; eyebrow=`REVEAL · ${r.id}`;
    html=detailSection('Outcome',`<div class="detail-grid">${pair('User',userName(r.user))}${pair('Pack',r.pack)}${pair('Rarity',r.rarity)}${pair('FMV snapshot',r.fmv?money(r.fmv):'—')}${pair('Decision',r.decision)}${pair('Fairness',r.fair)}${pair('Status',r.status)}${pair('Reveal ID',r.id)}</div><div class="detail-note">${r.note}</div>`)+detailSection('Provable fairness',`<div class="detail-grid">${pair('Commit',r.commit)}${pair('Reveal hash',r.revealHash)}</div><div class="detail-note">Keep commit, reveal, inventory selection and FMV snapshots independently addressable so an operator can reconstruct the exact outcome.</div>`)+detailSection('Lifecycle',timeline([['Commit stored','Pre-reveal commitment persisted'],['Outcome resolved',r.status==='Exception'?'Held for exception review':r.outcome],['FMV captured',r.fmv?money(r.fmv):'Awaiting fresh quote'],['User decision',r.decision]]));
  }
  if(type==='market'){
    const x=marketEvents.find(v=>v.ref===id); if(!x)return;
    title=x.action; eyebrow=`SECONDARY MARKET · ${x.ref}`;
    html=detailSection('Market event',`<div class="detail-grid">${pair('Item',x.item)}${pair('Type',x.type)}${pair('Actor',userName(x.actor))}${pair('Counterparty',x.counterparty==='—'?'—':userName(x.counterparty))}${pair('Value',money(x.value))}${pair('Fee',money(x.fee,4))}${pair('Status',x.status)}${pair('Reference',x.ref)}</div>`)+detailSection('Custody chain',timeline([['Original ownership resolved','Item linked to reveal / prior owner'],[x.action,`${money(x.value)} marketplace action recorded`],['Fees accounted',x.fee?`${money(x.fee,4)} captured`:'No fee at this step'],['Ownership state',/sale|transfer/i.test(x.action)?'Ownership updated after settlement':'No ownership change yet']]));
  }
  if(type==='portfolio'){
    const u=userById[id]; if(!u)return;
    title=u.name; eyebrow=`PORTFOLIO · ${u.id}`;
    const pos=positions[u.id]||[];
    const posHtml=pos.length?`<div class="detail-grid">${pos.map(p=>pair(`${p.ticker} · ${p.shares} sh`,`${money(p.value)} value · ${money(p.basis)} basis`)).join('')}</div>`:`<div class="detail-note">No open stock positions.</div>`;
    const relevant=activities.filter(a=>a.user===u.id).slice(0,6).map(a=>[a.type,`${timeAgo(a.mins)} · ${a.asset}`]);
    html=detailSection('Balances',`<div class="detail-grid">${pair('Cash',money(u.cash))}${pair('USDC',money(u.usdc))}${pair('Equities',money(u.stocks))}${pair('Physical inventory',`${u.inventory} items`)}${pair('Wallet',u.wallet)}${pair('Account',u.id)}</div>`)+detailSection('Stock positions',posHtml)+detailSection('Recent account ledger',timeline(relevant.length?relevant:[['No recent events','No matching activity in visible sample']]))+`<div class="fee-note">Portfolio value is user-owned value. For stock liquidation, the dashboard treats the execution/network cost—not the stock principal—as platform fee exposure.</div>`;
  }
  if(type==='fee'){
    const f=fees.find(x=>x.tx===id); if(!f)return;
    title=f.action; eyebrow=`FEE · ${shortHash(f.tx)}`;
    const net=Math.max(f.cost-f.collected,0);
    html=detailSection('Cost accounting',`<div class="detail-grid">${pair('User',userName(f.user))}${pair('Network',f.network)}${pair('Notional',f.notional?money(f.notional):'—')}${pair('Actual cost',money(f.cost,4))}${pair('Fee collected',money(f.collected,4))}${pair('Net exposure',money(net,4))}${pair('Status',f.status)}${pair('Transaction',f.tx)}</div>`)+detailSection('Accounting logic',timeline([['Transaction observed',f.tx],['Actual cost recorded',money(f.cost,4)],['Recovery matched',f.collected?`${money(f.collected,4)} fee collected`:'No user fee collected'],['Exposure calculated',`${money(net,4)} unrecovered platform cost`]]));
  }
  document.querySelector('#drawerTitle').textContent=title;
  document.querySelector('#drawerEyebrow').textContent=eyebrow;
  document.querySelector('#drawerBody').innerHTML=html;
  document.querySelector('#detailDrawer').classList.add('open');
  document.querySelector('#drawerBackdrop').classList.add('open');
  document.querySelector('#detailDrawer').setAttribute('aria-hidden','false');
}
function closeDrawer(){document.querySelector('#detailDrawer').classList.remove('open');document.querySelector('#drawerBackdrop').classList.remove('open');document.querySelector('#detailDrawer').setAttribute('aria-hidden','true');}

function bindRows(){
  document.querySelectorAll('[data-detail-id]').forEach(el=>{
    el.onclick=e=>{ if(e.target.closest('button')||el.classList.contains('portfolio-card')) openDrawer(el.dataset.detailType,el.dataset.detailId); else openDrawer(el.dataset.detailType,el.dataset.detailId); };
  });
}
function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  const active=document.querySelector(`#view-${name}`);
  document.querySelector('#pageTitle').textContent=active.dataset.title;
  document.querySelector('#sectionEyebrow').textContent=active.dataset.eyebrow;
  document.querySelector('#sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function exportCurrent(){
  const view=document.querySelector('.view.active').id.replace('view-','');
  const map={activity:activities,purchases, reveals, market:marketEvents, portfolios:users, fees};
  const data=map[view]||activities;
  const keys=[...new Set(data.flatMap(Object.keys))];
  const csv=[keys.join(','),...data.map(row=>keys.map(k=>`"${String(row[k]??'').replaceAll('"','""')}"`).join(','))].join('\n');
  const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`observe-${view}-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href); toast(`Exported ${view} CSV`);
}

function init(){
  renderActivity(); renderPurchases(); renderReveals(); renderMarket(); renderPortfolios(); renderFees();
  document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>switchView(n.dataset.view)));
  document.querySelector('#activitySearch').addEventListener('input',filterActivity);
  document.querySelector('#activityCategory').addEventListener('change',()=>{document.querySelectorAll('.filter-chip').forEach(c=>c.classList.toggle('active',c.dataset.category===document.querySelector('#activityCategory').value));filterActivity();});
  document.querySelector('#activityRail').addEventListener('change',filterActivity);
  document.querySelector('#activityQuickFilters').addEventListener('click',e=>{const b=e.target.closest('.filter-chip');if(!b)return;document.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#activityCategory').value=b.dataset.category;filterActivity();});
  document.querySelector('#purchaseSearch').addEventListener('input',filterPurchases);
  document.querySelector('#revealSearch').addEventListener('input',filterReveals);
  document.querySelector('#onlyExceptions').addEventListener('click',e=>{revealExceptionsOnly=!revealExceptionsOnly;e.currentTarget.textContent=revealExceptionsOnly?'Show all reveals':'Show exceptions';e.currentTarget.classList.toggle('negative',revealExceptionsOnly);filterReveals();});
  document.querySelector('#marketFilter').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#marketFilter button').forEach(x=>x.classList.remove('active'));b.classList.add('active');marketType=b.dataset.filter;filterMarket();});
  document.querySelector('#portfolioSearch').addEventListener('input',filterPortfolios);
  document.querySelector('#feeSearch').addEventListener('input',filterFees);
  document.querySelector('#closeDrawer').addEventListener('click',closeDrawer); document.querySelector('#drawerBackdrop').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  document.querySelector('#exportButton').addEventListener('click',exportCurrent);
  document.querySelector('#openSidebar').addEventListener('click',()=>document.querySelector('#sidebar').classList.add('open'));
  document.querySelector('#closeSidebar').addEventListener('click',()=>document.querySelector('#sidebar').classList.remove('open'));
  setInterval(()=>document.querySelector('#lastUpdated').textContent='just now',30000);
  bindRows();
}

document.addEventListener('DOMContentLoaded',init);

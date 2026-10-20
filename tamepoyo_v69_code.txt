import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.76.1';
const SB_URL='https://nkgtiazjoagznibjjohl.supabase.co';
const SB_KEY='sb_publishable__MOz2IgpDTkoZSi9iQYd3A_zEtqz8A5';
const sb=createClient(SB_URL,SB_KEY,{db:{schema:'tamepoyo'},auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
const api=sb.schema('tamepoyo');
const $=q=>document.querySelector(q), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen=n=>`${Number(n||0).toLocaleString('ja-JP')}円`, money=n=>Number.isFinite(+n)&&+n>=0?Math.round(+n):null;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const ym=d=>String(d).slice(0,7), firstDay=m=>m+'-01';
let current=null, page='home', month=ym(today()), tab='calendar', wishTab='pool', partner=null, pair=null, viewBusy=false, modal='', editing=null, notice='', data={profiles:[],categories:[],entries:[],wishes:[],wish_months:[],recurring_rules:[],budgets:[],comments:[]};
let categoryExpanded=false;
let shareView='received', sharedFold={wishes:false,ledger:false}, sharedDays=new Set();
let authMode='sign-in', draftType='expense', draftDate=today(), calcAmount='', shownDay=today(), quickTitle='', quickCategory='';

const DEFAULT_CATS=['食費','ファッション','日用品','家賃','交際費','通信料','交通費','コスメ・美容','学用品','光熱費','旅費','医療費','趣味','娯楽','サブスク','その他'];
const POYO_STYLES=['smile','happy','think','wave','cheer','book','walk','sparkle','rest','care'];
const POYO_PICS={smile:'pose-home.png',happy:'pose-ledger.png',think:'pose-wishes.png',wave:'pose-shared.png',cheer:'pose-settings.png',book:'poyo-transparent-v61.png',walk:'pose-home.png',sparkle:'pose-ledger.png',rest:'pose-wishes.png',care:'pose-shared.png'};
const CAT_DEFAULT_ICONS={'食費':'happy','ファッション':'sparkle','日用品':'smile','家賃':'book','交際費':'wave','通信料':'think','交通費':'walk','コスメ・美容':'sparkle','学用品':'book','光熱費':'cheer','旅費':'walk','医療費':'care','趣味':'happy','娯楽':'cheer','サブスク':'think','その他':'smile'};
const WISH_CATS=['ファッション','コスメ・美容','趣味','家電','日用品','本・学用品','旅行','グルメ','インテリア','その他'];
const WISH_CAT_POYO=['sparkle','care','happy','think','smile','book','walk','happy','wave','smile'];
function wishCatChoices(value){return `<div class="wish-categories">${WISH_CATS.map((cat,i)=>`<label class="wish-cat-option"><input type="radio" name="wish_category" value="${esc(cat)}" ${value===cat?'checked':''}><span>${poyoIcon(WISH_CAT_POYO[i],'wish-cat-poyo')}<b>${esc(cat)}</b></span></label>`).join('')}</div>`}
const PALETTE=['#77a8dc','#93b1b9','#ebb6a8','#c9aad5','#93c5a6','#ecbf79','#7ea9aa','#d7a2b9','#b8b488','#a1a9da','#efc9a6','#76beb8','#d5b0a0','#b2b2cd','#c1cfa2','#97b5db'];
function poyoIcon(icon,cls='cat-poyo'){const key=POYO_PICS[icon]?icon:'smile';return `<img class="${cls}" src="./${POYO_PICS[key]}" alt="ぽよ">`}
function catIcon(c){return poyoIcon(c?.icon||CAT_DEFAULT_ICONS[c?.name]||'smile')}
let catPick='smile';
async function ensureDefaults(){if(!current)return;const existing=new Set(own(data.categories).map(c=>c.name));const missing=DEFAULT_CATS.filter(n=>!existing.has(n));if(!missing.length)return;const rows=missing.map((name,i)=>({user_id:current.id,name,icon:CAT_DEFAULT_ICONS[name],sort_order:i}));try{await request(api.from('categories').upsert(rows,{onConflict:'user_id,name',ignoreDuplicates:true}));data.categories=await request(api.from('categories').select('*'))}catch(err){console.warn('category defaults',err)}}
function categoryChart(){const es=allEntries().filter(e=>e.kind==='expense'&&e.status==='actual');const sums=new Map();for(const e of es){const c=data.categories.find(x=>x.id===e.category_id),name=c?.name||'未分類';sums.set(name,(sums.get(name)||0)+Number(e.amount||0))}const total=[...sums.values()].reduce((a,b)=>a+b,0);const values=[...sums].filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);if(!total)return `<div class="card chart-card"><div class="chart-heading">今月の支出の内訳</div><div class="empty">まだ支出の記録がないぽよ。<br>入力すると円グラフになるよ！</div></div>`;let cursor=0;const grad=values.map(([name,n],i)=>{const from=cursor;cursor+=n/total*100;return `${PALETTE[i%PALETTE.length]} ${from}% ${cursor}%`}).join(',');return `<section class="card chart-card"><div class="chart-heading">今月の支出の内訳</div><div class="donut-layout"><div class="poyo-donut" role="img" aria-label="今月の支出内訳、合計${yen(total)}" style="background:conic-gradient(${grad})"><div class="donut-center"><span>支出合計</span><strong>${yen(total)}</strong></div></div><div class="chart-list">${values.map(([name,n],i)=>{const c=data.categories.find(x=>x.name===name);return `<div class="chart-line">${catIcon(c||{name})}<span class="legend-color" style="background:${PALETTE[i%PALETTE.length]}"></span><span class="chart-name">${esc(name)}</span><b>${Math.round(n/total*100)}%</b><small>${yen(n)}</small></div>`}).join('')}</div></div><p class="tiny chart-foot">支払い済みの支出のみを集計。予定額は含まないよ。</p></section>`}
function categoryCards(cats,chosen,formId){return `<div class="category-tiles" role="group" aria-label="カテゴリを選ぶ"><input type="hidden" name="category" value="${esc(chosen||'')}"><button type="button" class="category-tile ${!chosen?'selected':''}" data-act="pick-category" data-v="" aria-pressed="${!chosen}">${poyoIcon('smile')}<span>未分類</span></button>${cats.map(c=>`<button type="button" class="category-tile ${String(chosen)===String(c.id)?'selected':''}" data-act="pick-category" data-v="${esc(c.id)}" aria-pressed="${String(chosen)===String(c.id)}">${catIcon(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>`}
function pickPanel(value){return `<div class="poyo-picker" role="group" aria-label="ぽよのイラストを選ぶ">${POYO_STYLES.map(k=>`<button type="button" class="poyo-choice ${value===k?'picked':''}" data-act="cat-icon" data-v="${k}" aria-label="ぽよアイコン ${k}">${poyoIcon(k,'pick-poyo')}</button>`).join('')}</div>`}

const own=rows=>(rows||[]).filter(x=>x.user_id===current?.id);
const categories=()=>own(data.categories);
// 同じ自動予定（recurring_key）から生まれた二重記録を画面上で1件にまとめる。
// 入出金済みを予定より優先し、Supabase上の元データは勝手に削除しない。
function uniqueEntries(rows){
  const seen=new Map(), regular=[];
  for(const e of rows){
    if(!e.recurring_key){regular.push(e);continue;}
    const key=`${e.user_id}:${e.recurring_key}`;
    const previous=seen.get(key);
    if(!previous || (previous.status!=='actual' && e.status==='actual'))seen.set(key,e);
  }
  return [...regular,...seen.values()];
}
const allEntries=()=>uniqueEntries(own(data.entries).filter(e=>ym(e.entry_date)===month));
const entriesBy=day=>allEntries().filter(e=>e.entry_date===day);
const wishes=()=>own(data.wishes);
const selectedIds=()=>new Set((data.wish_months||[]).filter(w=>w.user_id===current?.id&&ym(w.target_month)===month).map(w=>w.wish_id));
const showMessage=(s)=>{notice=s;render();};
function el(tag,attrs={},text=''){const n=document.createElement(tag);Object.assign(n,attrs);n.textContent=text;return n;}
function errorText(err){return err?.message||String(err||'エラーが発生したよ')}
async function request(query){const {data:d,error}=await query;if(error)throw error;return d}
async function write(table,obj,match=null){return request(match?api.from(table).update(obj).match(match).select():api.from(table).insert(obj).select())}
async function remove(table,match){return request(api.from(table).delete().match(match))}
const opts=(items,val)=>items.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(val)?'selected':''}>${esc(label)}</option>`).join('');
const bg=(name)=>`<img class="fixed-icon" src="./${name}.png" alt="">`;
let loadSequence=0;
const loadTimeout=(promise,ms=12000)=>Promise.race([
  promise,
  new Promise((_,reject)=>setTimeout(()=>reject(new Error('通信に時間がかかっています。電波状況を確認して「更新」を押してね。')),ms))
]);
async function load(){
  if(!current)return;
  const seq=++loadSequence;
  viewBusy=true;render();
  try{
    const tables=['profiles','categories','entries','wishes','wish_months','recurring_rules','budgets','comments'];
    const rows=await loadTimeout(Promise.all(tables.map(t=>request(api.from(t).select('*')))));
    if(seq!==loadSequence||!current)return;
    data=Object.fromEntries(tables.map((t,i)=>[t,rows[i]||[]]));
    notice='';
    viewBusy=false;
    render();
    // 非必須の処理で初期画面を待たせない。読み込み完了後に非同期で実行。
    void (async()=>{
      try{await loadPair()}catch(e){console.warn('pair load',e)}
      if(seq!==loadSequence||!current)return;
      render();
      try{await ensureDefaults()}catch(e){console.warn('categories',e)}
      if(seq!==loadSequence||!current)return;
      try{await generateRecurring()}catch(e){console.warn('recurring',e)}
      if(seq!==loadSequence||!current)return;
      render();
    })();
  }catch(e){
    if(seq!==loadSequence)return;
    notice='クラウドの読み込みに失敗したよ：'+errorText(e);
    viewBusy=false;render();
  }
}
async function loadPair(){const memberships=await request(api.from('pair_members').select('pair_id,user_id'));const mine=(memberships||[]).find(m=>m.user_id===current.id);pair=null;partner=null;if(!mine)return;const pairs=await request(api.from('pairs').select('id,invite_code,created_by').eq('id',mine.pair_id));pair=pairs?.[0]||null;const p=memberships.find(m=>m.pair_id===mine.pair_id&&m.user_id!==current.id);partner=p?.user_id||null;}
let recurringBusy=false;
async function generateRecurring(){if(recurringBusy)return;recurringBusy=true;try{const rules=own(data.recurring_rules).filter(r=>r.enabled);const existing=new Set(own(data.entries).map(e=>e.recurring_key).filter(Boolean));const last=new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate();const rows=rules.filter(r=>!existing.has(`rule:${r.id}:${month}`)).map(r=>({user_id:current.id,kind:r.kind,title:r.title,amount:r.amount,entry_date:month+'-'+String(Math.min(last,r.day_of_month)).padStart(2,'0'),category_id:r.category_id,recurring_key:`rule:${r.id}:${month}`,status:'planned',shared:false}));if(!rows.length)return;try{await request(api.from('entries').upsert(rows,{onConflict:'user_id,recurring_key',ignoreDuplicates:true}));data.entries=await request(api.from('entries').select('*'))}catch(e){console.warn('recurring',e)}}finally{recurringBusy=false}}
function guestScreen(){return `<div class="auth-page"><img class="auth-logo" src="./poyo-transparent-v61.png" alt="ぽよ"><h1 class="auth-title">ためぽよ</h1><p class="helper" style="text-align:center">ふたりで使える、やさしいかけいぼ</p><div class="card"><div class="switcher"><button class="btn ${authMode==='sign-in'?'':'sub'}" data-act="authmode" data-v="sign-in">ログイン</button><button class="btn ${authMode==='sign-up'?'':'sub'}" data-act="authmode" data-v="sign-up">新規登録</button></div><form id="auth-form"><label>メールアドレス</label><input class="input" type="email" name="email" autocomplete="email" required placeholder="example@gmail.com"><label>パスワード（6文字以上）</label><input class="input" type="password" name="password" autocomplete="${authMode==='sign-in'?'current-password':'new-password'}" minlength="6" required><button class="btn full" type="submit">${authMode==='sign-in'?'ログインする':'アカウントを作る'}</button></form><p class="hint">読書の杜と同じSupabaseのログイン基盤を使うため、同じメールアドレスを登録済みなら既存のパスワードでログインできるよ。</p></div>${notice?`<div class="note alert">${esc(notice)}</div>`:''}</div>`}
function header(){return `<header class="head"><div class="topline"><div class="brand">ためぽよ <img class="brand-poyo" src="./poyo-transparent-v61.png" alt="ぽよ"></div><button class="profile" data-act="nav" data-v="settings">${esc(data.profiles.find(p=>p.user_id===current.id)?.display_name||current.email?.split('@')[0]||'わたし')} ▾</button></div></header>`}
function navbar(){return `<nav class="tabbar">${[['home','pose-home','ホーム'],['ledger','pose-ledger','かけいぼ'],['wishes','pose-wishes','ほしいもの'],['shared','pose-shared','共有'],['settings','pose-settings','設定']].map(([id,img,label])=>`<button class="nav ${id===page?'active':''}" data-act="nav" data-v="${id}"><img class="nav-poyo" src="./${img}.png" alt=""><span>${label}</span></button>`).join('')}</nav>`}
function monthbar(){return `<div class="monthnav"><button data-act="month" data-v="-1">‹</button><strong>${Number(month.slice(0,4))}年${Number(month.slice(5))}月</strong><button data-act="month" data-v="1">›</button></div>`}
function summary(){const es=allEntries();const sum=(kind,status)=>es.filter(e=>e.kind===kind&&(!status||e.status===status)).reduce((n,e)=>n+Number(e.amount),0);const selected=selectedIds();const future=wishes().filter(w=>w.status==='open'&&selected.has(w.id)).reduce((n,w)=>n+Number(w.estimated_price),0);const budget=data.budgets.find(b=>b.user_id===current.id&&ym(b.target_month)===month);const income=sum('income'),expense=sum('expense'),extra=Number(budget?.misc_budget||0),food=Math.max(Number(budget?.food_budget||0),es.filter(e=>e.kind==='expense'&&data.categories.some(c=>c.id===e.category_id&&c.name==='食費')).reduce((n,e)=>n+Number(e.amount),0));const predicted=income-expense-future-extra-food;return {income,expense,predicted,actualIncome:sum('income','actual'),actualExpense:sum('expense','actual'),wishTotal:future,wishBudget:Number(budget?.wish_budget||0),budget}}
function pageTitle(t,desc=''){return `<h2 class="page-title">${t}</h2>${desc?`<p class="helper">${desc}</p>`:''}`}
function home(){const s=summary(),rate=s.wishBudget?s.wishTotal/s.wishBudget:0;return `${pageTitle('ホーム')}${monthbar()}<div class="poyo-card"><img class="poyo-face" src="./poyo-transparent-v61.png" alt="ぽよ"><div><div class="poyo-title">ぽよからひとこと</div><div class="poyo-msg">${s.predicted<0?'予定の支出が多めだぽよ。見直してみよう！':rate>1?'ほしいもの予算を超えているぽよ。':'今月の予定をまとめたぽよ！'}</div></div></div><div class="card"><div class="eyebrow">今月の予想残額</div><div class="big-num ${s.predicted<0?'danger':''}">${yen(s.predicted)}</div><div class="grid2"><div class="mini"><div class="eyebrow">収入予定</div><strong class="green">${yen(s.income)}</strong></div><div class="mini"><div class="eyebrow">支出見込み</div><strong>${yen(s.expense+s.wishTotal)}</strong></div></div></div><div class="card"><div class="row"><strong>ほしいもの予算</strong><span class="chip ${rate>1?'p3':''}">${rate>1?'予算オーバー':rate>=.8?'80%以上':'予算内'}</span></div><div class="big-num" style="font-size:23px">${yen(s.wishTotal)} <span style="font-size:13px;color:#7c8faa">/ ${yen(s.wishBudget)}</span></div><div class="meter"><span style="width:${Math.min(rate*100,100)}%;background:${rate>1?'#da7782':'#7ca6dc'}"></span></div><button class="btn sub full" style="margin-top:12px" data-act="nav" data-v="wishes">ほしいものを見る</button></div>${categoryChart()}<div class="card"><strong>今月のかけいぼ</strong><div class="grid2" style="margin:15px 0"><div class="mini"><div class="eyebrow">収入</div><strong class="green">${yen(s.actualIncome)}</strong></div><div class="mini"><div class="eyebrow">支出</div><strong>${yen(s.actualExpense)}</strong></div></div><button class="btn light full" data-act="nav" data-v="ledger">かけいぼを開く</button></div>`}
function shareBulkButton(kind){const items=kind==='entries'?allEntries():wishes().filter(w=>w.status==='open'&&selectedIds().has(w.id));const unshared=items.filter(x=>!x.shared);return `<div class="bulk-sharing"><div class="bulk-sharing-copy"><strong>${kind==='entries'?'今月のかけいぼをまとめて共有':'今月のほしいものをまとめて共有'}</strong><small>対象 ${items.length}件・未共有 ${unshared.length}件</small></div><button type="button" class="btn sub small" data-act="bulk-share" data-v="${kind}" ${!unshared.length?'disabled':''}>${unshared.length?'一括共有する':'共有済み'}</button></div>`}
function ledger(){const es=allEntries().sort((a,b)=>b.entry_date.localeCompare(a.entry_date)), cats=categories();return `${pageTitle('かけいぼ')}${monthbar()}<div class="card quick-card"><div class="quick-title">今日の収支</div><form id="quick-form"><div class="quick-type"><button type="button" class="${draftType==='expense'?'active':''}" data-act="type" data-v="expense">支出</button><button type="button" class="${draftType==='income'?'active':''}" data-act="type" data-v="income">収入</button></div><label>金額</label><button type="button" class="amount-trigger poyo-amount" data-act="calc"><span class="amount-copy"><strong>${calcAmount?yen(calcAmount):'金額入力'}</strong></span>${poyoIcon("happy","amount-poyo")}</button><label>日付</label><input type="date" class="input" name="date" value="${esc(draftDate)}" required><label>カテゴリ</label>${categoryCards(cats,quickCategory,"quick-form")}<label>内容</label><input class="input" name="title" value="${esc(quickTitle)}" maxlength="120" required><button class="btn full" type="submit">入力する</button></form></div>${categoryChart()}${shareBulkButton('entries')}<div class="ledger-head"><strong>かけいぼを見る</strong><div class="ledger-modes"><button class="mode-button ${tab==='calendar'?'active':''}" data-act="tab" data-v="calendar">カレンダー</button><button class="mode-button ${tab==='list'?'active':''}" data-act="tab" data-v="list">一覧</button></div></div>${tab==='calendar'?calendar(es):`<div class="card">${es.length?dayGroups(es):'<div class="empty">まだ記録がないぽよ</div>'}</div>`}`}
function dayGroups(entries){
  const byDate=new Map();
  for(const e of entries){if(!byDate.has(e.entry_date))byDate.set(e.entry_date,[]);byDate.get(e.entry_date).push(e)}
  return [...byDate].map(([day,rows])=>{
    const [year,mon,dd]=day.split('-').map(Number);
    const label=`${mon}月${dd}日`;
    const actual=rows.filter(e=>e.status==='actual');
    const total=kind=>actual.filter(e=>e.kind===kind).reduce((n,e)=>n+Number(e.amount||0),0);
    const inc=total('income'),exp=total('expense');
    return `<details class="ledger-day"><summary class="ledger-day-head"><span class="ledger-day-title">${label}<small>${rows.length}件</small></span><span class="ledger-day-total">${inc?`<span class="green">＋${yen(inc)}</span>`:''}${exp?`<span>－${yen(exp)}</span>`:''}<span class="ledger-day-chevron" aria-hidden="true">⌄</span></span></summary><div class="ledger-day-items">${rows.map(entryRow).join('')}</div></details>`;
  }).join('')
}
function entryRow(e){return `<div class="item"><div class="row"><div><div class="item-name">${esc(e.title)}</div><div class="item-sub">${esc(e.entry_date)} ・ ${esc(data.categories.find(c=>c.id===e.category_id)?.name||'未分類')} ・ ${e.status==='planned'?'予定':'実績'}</div></div><div class="amount ${e.kind==='income'?'green':''}">${e.kind==='income'?'+':'−'}${yen(e.amount)}</div></div><div class="actions"><button class="btn small sub" data-act="edit-entry" data-v="${e.id}">編集</button>${e.status==='planned'?`<button class="btn small light" data-act="done" data-v="${e.id}">入出金済み</button>`:''}<button class="btn small warn" data-act="delete-entry" data-v="${e.id}">削除</button><label class="tiny">共有 <input class="share-toggle" type="checkbox" data-act="share-entry" data-v="${e.id}" ${e.shared?'checked':''}></label></div></div>`}
function calendar(es){const yy=Number(month.slice(0,4)),mm=Number(month.slice(5)),first=(new Date(yy,mm-1,1).getDay()+6)%7,last=new Date(yy,mm,0).getDate(),days=[...Array(first).fill(null),...Array.from({length:last},(_,i)=>i+1)];while(days.length%7)days.push(null);const list=entriesBy(shownDay);const sum=k=>list.filter(e=>e.kind===k&&e.status==='actual').reduce((n,e)=>n+Number(e.amount),0);return `<div class="card calendar-wrap"><div class="calendar-head">${['月','火','水','木','金','土','日'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${days.map(d=>{if(!d)return '<div></div>';const date=month+'-'+String(d).padStart(2,'0'),arr=es.filter(e=>e.entry_date===date);const n=k=>arr.filter(e=>e.kind===k&&e.status==='actual').reduce((a,e)=>a+Number(e.amount),0);return `<button class="calendar-day ${shownDay===date?'selected':''}" data-act="day" data-v="${date}"><span class="day-num">${d}</span>${n('income')?`<span class="cal-money plus">+${n('income').toLocaleString()}</span>`:''}${n('expense')?`<span class="cal-money minus">−${n('expense').toLocaleString()}</span>`:''}${arr.some(e=>e.status==='planned')?'<span class="cal-plan">予定あり</span>':''}</button>`}).join('')}</div></div><div class="card"><strong>${Number(shownDay.slice(5,7))}月${Number(shownDay.slice(8))}日</strong><div class="grid2" style="margin:12px 0"><div class="mini"><div class="eyebrow">収入</div><strong class="green">${yen(sum('income'))}</strong></div><div class="mini"><div class="eyebrow">支出</div><strong>${yen(sum('expense'))}</strong></div></div>${list.length?list.map(entryRow).join(''):'<div class="empty">この日の記録はまだないぽよ</div>'}</div>`}
function wishRow(w){const chosen=selectedIds().has(w.id);return `<div class="item"><div class="row"><div style="min-width:0"><div class="item-name">${esc(w.title)}</div><div class="item-sub"><span class="chip p${w.priority}">${['','いつか','できれば','絶対'][w.priority]}</span> ・ ${esc(w.category_name||'未分類')} ・ ${w.status==='bought'?'購入済み':w.shared?'共有中':'非公開'}</div></div><strong>${yen(w.status==='bought'?w.bought_price:w.estimated_price)}</strong></div><div class="actions">${w.status==='open'?`<button class="btn small ${chosen?'sub':'light'}" data-act="wish-month" data-v="${w.id}">${chosen?'今月から外す':'+ 今月に追加'}</button><button class="btn small sub" data-act="buy" data-v="${w.id}">購入済みに</button>`:''}<button class="btn small light" data-act="edit-wish" data-v="${w.id}">編集</button><button class="btn small warn" data-act="delete-wish" data-v="${w.id}">削除</button><label class="tiny">共有 <input type="checkbox" class="share-toggle" data-act="share-wish" data-v="${w.id}" ${w.shared?'checked':''}></label></div></div>`}
function wishesPage(){let ws=wishes(),sel=selectedIds();let chosen=ws.filter(w=>w.status==='open'&&sel.has(w.id));let total=chosen.reduce((n,w)=>n+Number(w.estimated_price||0),0);let filtered=wishTab==='pool'?ws.filter(w=>w.status==='open'):wishTab==='month'?chosen:ws.filter(w=>w.status==='bought');let monthBanner=`<div class="wish-month-banner"><img src="./pose-wishes.png" alt="ぽよ"><div class="wish-month-copy"><strong>今月のほしいものリスト</strong><small>${chosen.length}件のほしいもの</small></div><div class="wish-month-sum"><small>合計</small><b>${yen(total)}</b></div></div>`;return `${pageTitle('ほしいもの')}${monthbar()}<div class="toolbar">${[['pool','プール'],['month','今月'],['bought','購入済み']].map(([v,l])=>`<button class="${wishTab===v?'active':''}" data-act="wtab" data-v="${v}">${l}</button>`).join('')}</div><div class="card" style="text-align:center"><button class="wishes-add" data-act="new-wish">＋ ほしいものを追加</button></div>${wishTab==='month'?monthBanner+shareBulkButton('wishes'):''}<div class="card">${filtered.length?filtered.map(wishRow).join(''):'<div class="empty">ここにはまだ何もないぽよ</div>'}</div>`}

function sharedSummary(entries){
 const income=entries.filter(e=>e.kind==='income').reduce((a,e)=>a+Number(e.amount||0),0);
 const expense=entries.filter(e=>e.kind==='expense').reduce((a,e)=>a+Number(e.amount||0),0);
 return `<div class="shared-totals"><div class="shared-stat">収入<strong class="green">＋${yen(income)}</strong></div><div class="shared-stat">支出<strong>−${yen(expense)}</strong></div></div>`;
}
function sharedChart(entries){
 const sums=new Map();for(const e of entries.filter(e=>e.kind==='expense')){
 const cat=data.categories.find(c=>c.id===e.category_id && c.user_id===e.user_id);
 const name=cat?.name||'未分類';sums.set(name,(sums.get(name)||0)+Number(e.amount||0));
 }
 const items=[...sums].filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]),total=items.reduce((n,[,amount])=>n+amount,0);
 if(!total)return `<p class="hint">共有された支出がまだないぽよ。</p>`;
 let pos=0;const gradient=items.map(([,n],i)=>{const a=pos;pos+=n/total*100;return `${PALETTE[i%PALETTE.length]} ${a}% ${pos}%`}).join(',');
 return `<div class="shared-chart"><div class="shared-pie" role="img" aria-label="共有された支出のカテゴリ別割合" style="background:conic-gradient(${gradient})"><span>支出内訳</span></div><div class="shared-legend">${items.map(([name,n],i)=>`<div><i style="background:${PALETTE[i%PALETTE.length]}"></i><span>${esc(name)}</span><b>${Math.round(n/total*100)}%</b></div>`).join('')}</div></div>`;
}
function sharedEntryDays(entries){
 if(!entries.length)return `<div class="empty">この月の共有記録はまだないぽよ</div>`;
 const days=[...new Set(entries.map(e=>e.entry_date))].sort().reverse();
 return days.map(day=>{const records=entries.filter(e=>e.entry_date===day),open=sharedDays.has(day);
 return `<div class="shared-day"><button type="button" class="shared-day-head" data-act="shared-day" data-v="${esc(day)}" aria-expanded="${open}"><span>${Number(day.slice(5,7))}月${Number(day.slice(8,10))}日 <small>${records.length}件</small></span><span>${open?'▲':'▼'}</span></button>${open?records.map(e=>`<div class="shared-record"><div><b>${esc(e.title)}</b><small>${e.kind==='income'?'収入':'支出'} ・ ${e.status==='planned'?'予定':'実績'}</small></div><strong class="${e.kind==='income'?'green':''}">${e.kind==='income'?'+':'−'}${yen(e.amount)}</strong></div>`).join(''):''}</div>`}).join('');
}
function shared(){
 const received=shareView==='received', uid=received?partner:current.id;
 const ws=data.wishes.filter(w=>w.user_id===uid&&w.shared), es=data.entries.filter(e=>e.user_id===uid&&e.shared&&ym(e.entry_date)===month);
 const total=ws.reduce((n,w)=>n+Number(w.status==='bought'?(w.bought_price??w.estimated_price):w.estimated_price||0),0);
 const wTitle=received?'相手から共有されたほしいもの':'自分が共有しているほしいもの';
 const eTitle=received?'相手から共有されたかけいぼ':'自分が共有しているかけいぼ';
 return `${pageTitle('共有','選んだものだけ相手に見えるよ')}${pair?`<div class="card"><strong>ふたりの連携</strong><p class="hint">${partner?'ペア連携済みだぽよ！':'招待コードを相手に伝えてね。'}</p><div class="pair-box"><div class="eyebrow">招待コード</div><div class="pair-code">${esc(pair.invite_code)}</div></div><button class="btn sub full" data-act="copy-code">コードをコピー</button></div>`:`<div class="card"><strong>相手と繋がる！</strong><p class="helper">片方がペアを作り、もう片方が招待コードを入力してね。</p><button class="btn full" data-act="create-pair">ペアを作成</button><div style="height:10px"></div><button class="btn sub full" data-act="join-pair">招待コードで参加</button></div>`}
 <div class="shared-switch"><button data-act="share-view" data-v="received" class="${received?'active':''}" aria-pressed="${received}">相手から共有</button><button data-act="share-view" data-v="sent" class="${!received?'active':''}" aria-pressed="${!received}">自分が共有中</button></div>
 <div class="card"><button type="button" class="shared-heading" data-act="share-fold" data-v="wishes" aria-expanded="${sharedFold.wishes}"><span><img src="./pose-wishes.png" alt="ぽよ">${wTitle}</span><span>${sharedFold.wishes?'▲':'▼'}</span></button><div class="shared-wish-total">${ws.length}件 <b>合計 ${yen(total)}</b></div>${sharedFold.wishes?(ws.length?ws.map(w=>`<div class="item"><div class="row"><div><b>${esc(w.title)}</b><div class="item-sub">${esc(w.category_name||'未分類')}</div></div><strong>${yen(w.status==='bought'?(w.bought_price??w.estimated_price):w.estimated_price)}</strong></div>${received?`<button class="btn small light" data-act="comments" data-v="${w.id}">コメント</button>`:`<span class="chip">共有中</span>`}</div>`).join(''):'<div class="empty">共有されたほしいものはまだないぽよ</div>'):''}</div>
 <div class="card"><button type="button" class="shared-heading" data-act="share-fold" data-v="ledger" aria-expanded="${sharedFold.ledger}"><span><img src="./pose-ledger.png" alt="ぽよ">${eTitle}</span><span>${sharedFold.ledger?'▲':'▼'}</span></button>${monthbar()}${sharedSummary(es)}${sharedFold.ledger?`${sharedChart(es)}<div class="shared-list-title">日付ごとの一覧</div>${sharedEntryDays(es)}`:''}</div>
 <div class="note">共有画面の金額・円グラフは共有ONの記録だけで計算するよ。非公開の記録は含めないぽよ。</div>`;
}
function settings(){const b=data.budgets.find(x=>x.user_id===current.id&&ym(x.target_month)===month)||{};return `${pageTitle('設定')}<div class="card"><strong>自分のプロフィール</strong><form id="profile-form"><label>ニックネーム</label><p class="hint">アプリ内で表示する名前だよ。いつでも変更できるぽよ！</p><input class="input" name="display" maxlength="30" required placeholder="例：ぽよちゃん" value="${esc(data.profiles.find(p=>p.user_id===current.id)?.display_name||'わたし')}"><button class="btn full" type="submit">保存する</button></form></div><div class="card"><strong>月ごとの予算</strong>${monthbar()}<form id="budget-form">${[['wish_budget','ほしいもの予算'],['food_budget','食費予算'],['misc_budget','その他の予算']].map(([k,t])=>`<label>${t}</label><input class="input" name="${k}" type="number" min="0" value="${b[k]??0}">`).join('')}<button class="btn full" type="submit">予算を保存</button></form></div><div class="card category-manager"><button type="button" class="fold-heading" data-act="toggle-categories" aria-expanded="${categoryExpanded}"><span>カテゴリ管理 <small>${categories().length}件</small></span><span>${categoryExpanded?'▲ 閉じる':'▼ 開く'}</span></button>${categoryExpanded?`<p class="hint">好きなぽよの絵を選んで、カテゴリを追加できるよ。</p>${categories().map(c=>`<div class="item row"><div class="cat-item">${catIcon(c)}<span>${esc(c.name)}</span></div><div class="cat-actions"><button type="button" class="btn small light" data-act="edit-cat" data-v="${c.id}">編集</button><button class="btn small warn" data-act="delete-cat" data-v="${c.id}">削除</button></div></div>`).join('')}<form id="category-form"><label>新しいカテゴリ名</label><input class="input" name="name" maxlength="40" required placeholder="例：カフェ"><label>ぽよの絵を選ぶ</label>${pickPanel(catPick)}<button class="btn sub full" type="submit">＋ カテゴリを追加する</button></form>`:``}</div><div class="card"><strong>毎月の自動予定</strong>${own(data.recurring_rules).map(r=>`<div class="item recurring-item"><button type="button" class="recurring-open" data-act="rule-detail" data-v="${r.id}"><span class="recurring-title">${catIcon(data.categories.find(c=>c.id===r.category_id))}<span><b>${esc(r.title)}</b><small>${r.kind==='income'?'収入':'支出'} ・ 毎月${Number(r.day_of_month)}日</small></span></span><span class="recurring-price">${yen(r.amount)} <span aria-hidden="true">›</span></span></button></div>`).join('')}<button class="btn sub full" data-act="new-rule">＋ 毎月の予定を追加</button></div><div class="card"><strong>アプリについて</strong><p class="hint">GitHub Pagesの公開URLをスマホのSafari/Chromeで開き、メニューから「ホーム画面に追加」を選ぶとアプリのように使えるよ。</p><button class="btn light full" data-act="install">インストール方法を見る</button></div><div class="card"><button class="btn full logout" data-act="logout">ログアウト</button></div>`}
function calcModal(){return `<div class="modal-back"><div class="modal"><div class="row"><h3>金額を入力</h3><button class="btn light small" data-act="close">閉じる</button></div><div class="calc-screen">${yen(calcAmount)}</div><div class="calc-grid">${['7','8','9','4','5','6','1','2','3','00','0','←'].map(v=>`<button class="calc-key" data-act="digit" data-v="${v}">${v}</button>`).join('')}</div><div class="actions"><button class="btn light" data-act="clear">クリア</button><button class="btn" data-act="close">OK</button></div></div></div>`}
function formModal(){let b='',title='';if(modal==='edit-entry'||modal==='new-entry'){const e=editing||{},cats=categories();title=e.id?'収支を編集':'収支を入力';b=`<form id="entry-form"><label>収支</label><select name="kind">${opts([['expense','支出'],['income','収入']],e.kind||'expense')}</select><label>金額（円）</label><input class="input" type="number" min="0" name="amount" value="${e.amount??''}" required><label>日付</label><input class="input" type="date" name="date" value="${e.entry_date||shownDay}" required><label>カテゴリ</label>${categoryCards(cats,e.category_id||"","entry-form")}<label>内容</label><input class="input" name="title" maxlength="120" value="${esc(e.title||'')}" required><button type="submit" class="btn full">保存する</button></form>`}
else if(modal==='edit-wish'||modal==='new-wish'){const w=editing||{};title=w.id?'ほしいものを編集':'ほしいものを追加';b=`<form id="wish-form"><label>ほしいもの</label><input name="title" class="input" maxlength="120" required value="${esc(w.title||'')}"><label>価格（円）</label><input type="number" min="0" class="input" name="price" value="${w.estimated_price??0}"><label>カテゴリ</label>${wishCatChoices(w.category_name||'その他')}<label>優先度</label><select name="priority">${opts([[3,'絶対ほしい'],[2,'できればほしい'],[1,'いつかほしい']],w.priority||2)}</select><label>商品URL（任意）</label><input class="input" name="url" value="${esc(w.product_url||'')}"><label>メモ（任意）</label><textarea name="note" class="input">${esc(w.note||'')}</textarea><button class="btn full" type="submit">保存する</button></form>`}
else if(modal==='buy'){title='購入済みにする';b=`<form id="buy-form"><label>実際に払った金額（円）</label><input type="number" class="input" name="price" min="0" value="${editing?.estimated_price||0}" required><label>購入日</label><input type="date" class="input" name="date" value="${today()}" required><button class="btn full" type="submit">購入済みにする</button></form>`}
else if(modal==='join-pair'){title='ペアに参加';b=`<form id="join-form"><label>招待コード</label><input class="input" name="code" required maxlength="128" placeholder="招待されたコードを貼り付け"><button class="btn full" type="submit">参加する</button></form>`}
else if(modal==='comments'){title='ほしいものへのコメント';let cs=data.comments.filter(c=>c.wish_id===editing.id);b=`<div class="helper">${esc(editing.title)}</div>${cs.map(c=>`<div class="item"><div class="item-name">${c.author_id===current.id?'わたし':'相手'}</div>${esc(c.body)}</div>`).join('')||'<div class="empty">まだコメントがないぽよ</div>'}<form id="comment-form"><textarea name="body" class="input" maxlength="1000" placeholder="コメントを書く" required></textarea><button class="btn full">送信する</button></form>`}
else if(modal==='edit-cat'){const c=editing||{};title='カテゴリを編集';b=`<form id="edit-cat-form"><label>カテゴリ名</label><input class="input" name="name" maxlength="40" required value="${esc(c.name||'')}"><label>ぽよの絵</label>${pickPanel(catPick)}<button class="btn full" type="submit">変更を保存する</button></form>`}
else if(modal==='new-rule'||modal==='edit-rule'){const r=modal==='edit-rule'?(editing||{}):{};title=r.id?'自動予定を編集':'毎月の自動予定を追加';b=`<form id="rule-form"><label>項目名</label><input class="input" name="title" required maxlength="120" value="${esc(r.title||'')}"><label>収入・支出</label><select name="kind">${opts([['expense','支出'],['income','収入']],r.kind||'expense')}</select><label>金額（円）</label><input class="input" name="amount" type="number" min="0" required value="${r.amount??''}"><label>毎月の日付</label><input class="input" name="day" type="number" min="1" max="31" value="${r.day_of_month||1}" required><label>カテゴリ</label>${categoryCards(categories(),r.category_id||'','rule-form')}<button class="btn full">${r.id?'変更を保存する':'登録する'}</button></form>`}
else if(modal==='rule-detail'){const r=editing||{}, c=data.categories.find(c=>c.id===r.category_id);title='毎月の自動予定・詳細';b=`<div class="rule-detail"><div class="rule-detail-title">${catIcon(c)}<strong>${esc(r.title)}</strong></div><div class="rule-detail-row"><span>区分</span><b>${r.kind==='income'?'収入':'支出'}</b></div><div class="rule-detail-row"><span>金額</span><b>${yen(r.amount)}</b></div><div class="rule-detail-row"><span>日付</span><b>毎月${Number(r.day_of_month)}日${Number(r.day_of_month)>28?'（存在しない日は月末）':''}</b></div><div class="rule-detail-row"><span>カテゴリ</span><b>${esc(c?.name||'未分類')}</b></div><div class="rule-detail-row"><span>状態</span><b>${r.enabled?'有効':'停止中'}</b></div><p class="hint">変更はこれから作成される予定に反映されるよ。すでに作られた月の記録は自動では書き換えないよ。</p><button class="btn full" data-act="edit-rule" data-v="${r.id}">編集する</button><button class="btn warn full" data-act="del-rule" data-v="${r.id}">この自動予定を削除</button></div>`}
return `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true"><div class="row"><h3>${title}</h3><button class="btn light small" data-act="close">閉じる</button></div>${b}</div></div>`}
function render(){const app=$('#app');if(!current){app.innerHTML=guestScreen();return}if(viewBusy){app.innerHTML='<div class="loading"><img class="loader-img" src="./poyo-transparent-v61.png">クラウドとつないでいるぽよ…</div>';return}const pages={home,ledger,wishes:wishesPage,shared,settings};app.innerHTML=header()+`<main class="main">${notice?`<div class="note alert">${esc(notice)} <button class="btn small" data-act="retry-load">更新</button></div>`:''}${pages[page]()}</main>`+`<p class="footer-note">ためぽよ v6.9 ・ 収支はクラウドに保存されるよ</p>`+navbar()+(modal?(modal==='calc'?calcModal():formModal()):'');}
async function refresh(){await load()}
async function tryWrite(task){if(viewBusy)return;viewBusy=true;try{await task();notice='';modal='';editing=null;await load()}catch(e){notice=errorText(e);viewBusy=false;render()}}
function toForm(e){return Object.fromEntries(new FormData(e).entries())}
async function handleSubmit(ev){const form=ev.target;if(!form.id)return;ev.preventDefault();const f=toForm(form);if(form.id==='auth-form'){viewBusy=true;render();try{const res=authMode==='sign-in'?await sb.auth.signInWithPassword({email:f.email,password:f.password}):await sb.auth.signUp({email:f.email,password:f.password});if(res.error)throw res.error;if(res.data.session){current=res.data.user;await load()}else{current=null;notice='確認メールを送信したよ。メールのリンクから認証してね。';viewBusy=false;render()}}catch(e){viewBusy=false;current=null;notice=errorText(e);render()}return}
if(!current)return;
if(form.id==='quick-form'){if(calcAmount===''||money(calcAmount)===null){notice='金額を入力してね';render();return}const obj={user_id:current.id,kind:draftType,title:f.title,amount:money(calcAmount),entry_date:f.date,status:'actual',category_id:f.category||null,shared:false};await tryWrite(async()=>{await write('entries',obj);draftDate=f.date;calcAmount='';quickTitle='';quickCategory=f.category||'';month=ym(f.date);shownDay=f.date});return}
if(form.id==='entry-form'){await tryWrite(async()=>{const obj={kind:f.kind,title:f.title,amount:money(f.amount),entry_date:f.date,category_id:f.category||null};if(editing?.id)await write('entries',obj,{id:editing.id,user_id:current.id});else await write('entries',{...obj,user_id:current.id,status:'actual'});month=ym(f.date);shownDay=f.date});return}
if(form.id==='wish-form'){await tryWrite(async()=>{const obj={title:f.title,estimated_price:money(f.price),priority:Number(f.priority),category_name:f.wish_category||'その他',product_url:f.url||null,note:f.note||null};if(editing?.id)await write('wishes',obj,{id:editing.id,user_id:current.id});else await write('wishes',{...obj,user_id:current.id});});return}
if(form.id==='buy-form'){await tryWrite(async()=>{const w=editing;await write('wishes',{status:'bought',bought_price:money(f.price),bought_date:f.date},{id:w.id,user_id:current.id});await write('entries',{user_id:current.id,kind:'expense',title:w.title,amount:money(f.price),entry_date:f.date,status:'actual',shared:false});});return}
if(form.id==='join-form'){await tryWrite(async()=>{await request(api.rpc('join_pair',{code:f.code.trim()}));});return}
if(form.id==='comment-form'){await tryWrite(async()=>{await write('comments',{wish_id:editing.id,author_id:current.id,body:f.body});});return}
if(form.id==='budget-form'){await tryWrite(async()=>{const obj={user_id:current.id,target_month:firstDay(month),wish_budget:money(f.wish_budget),food_budget:money(f.food_budget),misc_budget:money(f.misc_budget)};await request(api.from('budgets').upsert(obj,{onConflict:'user_id,target_month'}))});return}
if(form.id==='profile-form'){const nickname=String(f.display||'').trim();if(!nickname){notice='ニックネームを入力してね';render();return}await tryWrite(async()=>{await request(api.from('profiles').upsert({user_id:current.id,display_name:nickname},{onConflict:'user_id'}))});return}
if(form.id==='category-form'){await tryWrite(async()=>{await write('categories',{user_id:current.id,name:f.name.trim(),icon:catPick});catPick='smile'});return}
if(form.id==='edit-cat-form'){await tryWrite(async()=>{await write('categories',{name:f.name.trim(),icon:catPick},{id:editing.id,user_id:current.id});catPick='smile'});return}
if(form.id==='rule-form'){await tryWrite(async()=>{const obj={title:f.title,kind:f.kind,amount:money(f.amount),day_of_month:Number(f.day),category_id:f.category||null};if(editing?.id)await write('recurring_rules',obj,{id:editing.id,user_id:current.id});else await write('recurring_rules',{...obj,user_id:current.id,enabled:true});});return}
}
async function handleClick(ev){const t=ev.target.closest('[data-act]');if(!t)return;const a=t.dataset.act,v=t.dataset.v||'';if(t.matches('input[type=checkbox]'))ev.preventDefault();
if(a==='share-view'){shareView=v;sharedDays.clear();render();return}
if(a==='share-fold'){sharedFold[v]=!sharedFold[v];render();return}
if(a==='shared-day'){if(sharedDays.has(v))sharedDays.delete(v);else sharedDays.add(v);render();return}
if(a==='pick-category'){const container=t.closest('.category-tiles');if(!container)return;container.querySelector('input[name="category"]').value=v;container.querySelectorAll('.category-tile').forEach(b=>{const active=b.dataset.v===v;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});if(container.closest('#quick-form'))quickCategory=v;return}
if(a==='retry-load'){await load();return}
if(a==='cat-icon'){catPick=v;const form=modal==='edit-cat'?$('#edit-cat-form'):$('#category-form');const input=form?.elements?.name;const draft=input?.value||'';render();const refreshed=modal==='edit-cat'?$('#edit-cat-form'):$('#category-form');if(refreshed?.elements?.name)refreshed.elements.name.value=draft;return}
if(a==='toggle-categories'){categoryExpanded=!categoryExpanded;render();return}
if(a==='rule-detail'){editing=own(data.recurring_rules).find(r=>r.id===v);if(!editing)return;modal='rule-detail';render();return}
if(a==='edit-rule'){editing=own(data.recurring_rules).find(r=>r.id===v);if(!editing)return;modal='edit-rule';render();return}
if(a==='edit-cat'){editing=categories().find(c=>c.id===v);catPick=editing?.icon||CAT_DEFAULT_ICONS[editing?.name]||'smile';modal='edit-cat';render();return}
if(a==='authmode'){authMode=v;notice='';render();return}
if(a==='nav'){page=v;notice='';modal='';window.scrollTo(0,0);render();return}
if(a==='month'){const [y,m]=month.split('-').map(Number);{const d=new Date(y,m-1+Number(v),1);month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}shownDay=month===ym(today())?today():firstDay(month);await refresh();return}
if(a==='tab'){tab=v;render();return}
if(a==='day'){shownDay=v;draftDate=v;render();return}
if(a==='wtab'){wishTab=v;render();return}
if(a==='type'){draftType=v;const form=$('#quick-form');if(form){quickTitle=form.elements.title.value;draftDate=form.elements.date.value;quickCategory=form.elements.category.value}render();return}
if(a==='calc'){const form=$('#quick-form');if(form){quickTitle=form.elements.title.value;draftDate=form.elements.date.value;quickCategory=form.elements.category.value}modal='calc';render();return}
if(a==='digit'){calcAmount=v==='←'?calcAmount.slice(0,-1):String(calcAmount+v).slice(0,10).replace(/^0+(?=\d)/,'');render();return}
if(a==='clear'){calcAmount='';render();return}
if(a==='close'){modal='';render();return}
if(['edit-entry','edit-wish','buy','comments'].includes(a)){const table=a==='edit-entry'?'entries':'wishes';editing=data[table].find(x=>x.id===v);modal=a;render();return}
if(a==='delete-wish'){
  const wish=wishes().find(w=>w.id===v);
  if(!wish)return;
  if(!confirm(`「${wish.title}」を削除するぽよ？\n削除すると元には戻せないよ。`))return;
  await tryWrite(async()=>{await remove('wishes',{id:v,user_id:current.id});});return;
}
if(a==='new-wish'){editing=null;modal='new-wish';render();return}
if(a==='new-rule'){editing=null;modal='new-rule';render();return}
if(a==='join-pair'){modal='join-pair';render();return}
if(a==='create-pair'){await tryWrite(async()=>{await request(api.rpc('create_pair'))});return}
if(a==='copy-code'){try{await navigator.clipboard.writeText(pair.invite_code);alert('招待コードをコピーしたよ')}catch{prompt('このコードをコピーしてね',pair.invite_code)}return}
if(a==='wish-month'){await tryWrite(async()=>{const chosen=data.wish_months.some(w=>w.wish_id===v&&ym(w.target_month)===month);if(chosen)await remove('wish_months',{wish_id:v,target_month:firstDay(month)});else await write('wish_months',{wish_id:v,user_id:current.id,target_month:firstDay(month)})});return}
if(a==='bulk-share'){
 const items=v==='entries'?allEntries():wishes().filter(w=>w.status==='open'&&selectedIds().has(w.id));
 const pending=items.filter(item=>!item.shared);
 if(!pending.length)return;
 if(!partner){alert('共有するには、先に相手とペア連携してね。');return}
 const subject=v==='entries'?'かけいぼ':'ほしいもの';
 if(!confirm(`${Number(month.slice(5))}月の${subject} ${pending.length}件を相手に共有するぽよ？\n※ 金額や内容も相手から見えるようになるよ。\n※ すでに共有済みの記録は変更しないよ。`))return;
 await tryWrite(async()=>{const table=v==='entries'?'entries':'wishes';const ids=pending.map(item=>item.id);const result=await request(api.from(table).update({shared:true}).eq('user_id',current.id).in('id',ids).select('id'));if(result.length!==ids.length)throw new Error('一部の共有設定を変更できなかったよ。再読み込みして確認してね。')});return;
}
if(a==='share-wish'||a==='share-entry'){const iswish=a==='share-wish',table=iswish?'wishes':'entries';const obj=data[table].find(x=>x.id===v);await tryWrite(async()=>{await write(table,{shared:!obj.shared},{id:v,user_id:current.id})});return}
if(a==='done'){const target=own(data.entries).find(e=>e.id===v);if(!target||target.status==='actual')return;await tryWrite(async()=>{await write('entries',{status:'actual'},{id:v,user_id:current.id,status:'planned'})});return}
if(a==='delete-entry'||a==='delete-cat'||a==='del-rule'){if(!confirm('この項目を削除する？'))return;const table=a==='delete-entry'?'entries':a==='delete-cat'?'categories':'recurring_rules';await tryWrite(async()=>{await remove(table,{id:v,user_id:current.id})});return}
if(a==='logout'){await sb.auth.signOut();current=null;partner=null;pair=null;modal='';notice='';render();return}
if(a==='install'){sessionStorage.removeItem(INSTALL_HIDE_KEY);installUI();return}
}

// スマホのインストール促進。ブラウザ側が許可した場合のみネイティブのプロンプトを開く。
let installPromptEvent=null;
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)|| (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||ios;
function installed(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}
const INSTALL_HIDE_KEY='tamepoyo-install-dismiss-v65';
function installUI(){
 const host=document.getElementById('install-host');if(!host)return;
 if(!mobile||installed()||sessionStorage.getItem(INSTALL_HIDE_KEY)==='1'){host.innerHTML='';return;}
 host.innerHTML=`<div class="tp-install-overlay"><section class="tp-install-dialog" role="dialog" aria-modal="true" aria-labelledby="tp-install-heading"><img class="tp-install-poyo" src="./poyo-transparent-v61.png" alt="ぽよ"><h2 id="tp-install-heading">ためぽよをアプリにする？</h2><p>ホーム画面に追加すると、いつでもすぐ開けるぽよ！</p><div class="tp-install-help" id="tp-install-help">${ios?'iPhoneはSafariの共有ボタンから「ホーム画面に追加」を選んでね。':'下のボタンでインストールできる場合があるよ。表示されない場合はChromeの「︙」から「アプリをインストール」または「ホーム画面に追加」を選んでね。'}</div><button type="button" id="tp-install-go" class="tp-install-primary">${ios?'追加方法を確認する':'インストールする'}</button><button type="button" id="tp-install-close" class="tp-install-later">あとで</button></section></div>`;
 document.getElementById('tp-install-close').onclick=()=>{sessionStorage.setItem(INSTALL_HIDE_KEY,'1');host.innerHTML=''};
 document.getElementById('tp-install-go').onclick=async()=>{
   if(installPromptEvent){const evt=installPromptEvent;installPromptEvent=null;try{await evt.prompt();await evt.userChoice}catch(e){console.warn('install prompt',e)}host.innerHTML='';return}
   const help=document.getElementById('tp-install-help');
   help.textContent=ios?'Safariで開いて、画面下の共有ボタン（四角から矢印）→「ホーム画面に追加」→「追加」を押してね。LINEなどのアプリ内ブラウザなら、先にSafariで開いてね。':'Chromeで開き、「︙」メニューから「アプリをインストール」または「ホーム画面に追加」を選んでね。表示されない場合、ブラウザがまだインストール対象と判定していない可能性があるよ。';
 };
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPromptEvent=e;});
window.addEventListener('appinstalled',()=>{installPromptEvent=null;document.getElementById('install-host')?.replaceChildren();});
window.addEventListener('load',()=>setTimeout(installUI,350));

const app=$('#app');app.addEventListener('click',handleClick);app.addEventListener('submit',handleSubmit);
sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){current=null;render()} });
(async()=>{try{const {data:d,error}=await sb.auth.getSession();if(error)throw error;current=d.session?.user||null;if(current)await load();else render()}catch(e){notice=errorText(e);render()}})();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}

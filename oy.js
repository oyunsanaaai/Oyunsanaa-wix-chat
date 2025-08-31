(()=> {
  if (window.__OY_BOOTED__) return; 
  window.__OY_BOOTED__ = true;
  const $ = (s, r=document) => r.querySelector(s);

  // ⛓️ API серверийн үндсэн URL зөвхөн энд зарлана
  const OY_API_BASE = 'https://chat.oyunsanaa.com';

  /* ===== Elements ===== */
  const el = {
    overlay: $('#oyOverlay'), 
    modal: $('#oyModal'),
    drawer: $('#oyDrawer'), 
    menu: $('.oy-menu'),
    menuList: $('#menuList'),
    itemGuides: $('#itemGuides'), guidesWrap: $('#guidesWrap'),
    guideCatsAge: $('#guideCatsAge'), guideCatsSpecial: $('#guideCatsSpecial'),
    activeList: $('#activeList'),
    title: $('#chatTitle'),
    chat: $('#oyChat'), stream: $('#oyStream'),
    input: $('#oyInput'), send: $('#btnSend'),
    btnDrawer: $('#btnDrawer'), btnClose: $('#btnClose'),
    accName: $('#accName'), accCode: $('#accCode'),
    panel: $('#oyPanel'), pBack: $('#oyPanelBack'),
    pTitle: $('#oyPanelTitle'), pBody: $('#oyPanelBody'),
    file: $('#oyFile'),
    modelSelect: $('#modelSelect'),
  };

  /* ===== Store ===== */
  const LSKEY='oy_state_v10'; const msgKey = k=>'oy_msgs_'+k;
  let state = { account:{name:'Хэрэглэгч', code:'OY-0000'}, current:null, active:{} };
  try { const s=JSON.parse(localStorage.getItem(LSKEY)||'null'); if(s) state={...state,...s}; } catch(_){}
  const save = () => localStorage.setItem(LSKEY, JSON.stringify(state));

  /* ===== Helpers ===== */
  const textColorFor = (hex) => {
    const c = (hex || '').replace('#','');
    if (c.length < 6) return '#111';
    const r = parseInt(c.slice(0,2),16);
    const g = parseInt(c.slice(2,4),16);
    const b = parseInt(c.slice(4,6),16);
    const L = (0.299*r + 0.587*g + 0.114*b) / 255;
    return L > 0.7 ? '#111' : '#fff';
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const bubble = (html, who='bot') => {
    const d = document.createElement('div');
    d.className = 'oy-bubble ' + (who === 'user' ? 'oy-user' : 'oy-bot');
    d.innerHTML = html;
    el.stream.appendChild(d);
    if (el.chat) el.chat.scrollTop = el.chat.scrollHeight + 999;
    return d;
  };

  const meta = (t) => {
    const m = document.createElement('div');
    m.className = 'oy-meta';
    m.textContent = t;
    el.stream.appendChild(m);
  };

  /* ===== Icons ===== */
  const ICONS = {
    user:'<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"></path>',
    chart:'<path d="M4 20V10"></path><path d="M10 20V4"></path><path d="M16 20v-7"></path><path d="M2 20h20"></path>',
    target:'<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1"></circle>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M20 22V5a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 5.5V22"></path>',
    school:'<path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M6 12v5c2 1.2 4 2 6 2s4-.8 6-2v-5"></path>',
    gym:'<rect x="1" y="9" width="4" height="6" rx="1"></rect><rect x="19" y="9" width="4" height="6" rx="1"></rect><rect x="7" y="10" width="10" height="4" rx="1"></rect>',
    check:'<path d="M9 11l2 2 4-4"></path><rect x="4" y="4" width="16" height="16" rx="3"></rect>',
    clock:'<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    planet:'<path d="M20 3c-7 0-13 6-13 13 0 2 1 5 4 5 7 0 13-6 13-13 0-3-3-5-4-5z"></path>',
  };
  const iconSvg = (name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.user}</svg>`;

  /* ===== Data ===== */
  const AGE = [
    {slug:'age-0-7',  name:'Бага балчир үе (0–7)',           color:'#E1D9C9'},
    {slug:'age-8-12', name:'Адтай бяцхан үе (8–12)',         color:'#AE9372'},
    {slug:'age-13-18',name:'Сэргэлэн өсвөр үе (13–18)',      color:'#B27D57'},
    {slug:'age-19-25',name:'Эхлэл, мөрөөдлийн үе (19–25)',  color:'#7F4B30'},
    {slug:'age-26-40',name:'Эрх чөлөөт, эрч хүчтэй үе (26–40)', color:'#A28776'},
    {slug:'age-41-55',name:'Туршлага, бүтээлийн үе (41–55)', color:'#7D8769'},
    {slug:'age-56-70',name:'Ухаан, нөлөөллийн үе (56–70)',  color:'#424C21'},
    {slug:'age-70p',  name:'Өвлөж, үлдээх үе (70+)',         color:'#173125'},
  ];
  const SPECIAL = [
    {slug:'vision',  name:'Харааны бэрхшээлтэй', color:'#353326'},
    {slug:'special', name:'Тусгай хэрэгцээт',     color:'#897E45'},
  ];

  /* ===== Menu / Panels (placeholder) ===== */
  const Panels = {
    registry:{
      account:{ title:'Миний бүртгэл', render:(w)=>{ w.innerHTML=`
        <div class="card"><b>Суурь мэдээлэл</b><div class="muted">Нэр, Код нь бүртгэлээс автоматаар орно.</div></div>
      `; } },
      summary:{ title:'Таны сонголт', render:(w)=> w.innerHTML=`<div class="card"><b>Хураангуй</b></div>` },
      goals:{ title:'Амьдралын зорилго', render:(w)=> w.innerHTML=`<div class="card"><b>Зорилго</b></div>` },
      journal:{ title:'Сэтгэлийн дэвтэр', render:(w)=> w.innerHTML=`<div class="card"><b>Журнал</b></div>` },
      edu:{ title:'Сэтгэлийн боловсрол', render:(w)=> w.innerHTML=`<div class="card"><b>Хичээлүүд</b></div>` },
      health:{ title:'Эрүүл мэнд', render:(w)=> w.innerHTML=`<div class="card"><b>Дадал</b></div>` },
      finance:{ title:'Санхүү', render:(w)=> w.innerHTML=`<div class="card"><b>Орлого/Зарлага</b></div>` },
      reminders:{ title:'Сануулга', render:(w)=> w.innerHTML=`<div class="card"><b>Календарь</b></div>` },
      programs:{ title:'Нэмэлт хөтөч', render:(w)=> w.innerHTML=`<div class="card"><b>Хөтөлбөрүүд</b></div>` },
    },
    open(key){
      const def = this.registry[key]; if (!def) return;
      $('#oyPanelTitle').textContent = def.title;
      const body = $('#oyPanelBody'); body.innerHTML = ''; def.render(body);
      $('#oyPanel').hidden = false;
      $('#oyPanelBack').onclick = () => { $('#oyPanel').hidden = true; };
    }
  };

  const MENU_ITEMS = [
    {key:'account',   title:'Миний бүртгэл',        icon:'user'},
    {key:'summary',   title:'Таны сонголт',         icon:'chart'},
    {key:'goals',     title:'Амьдралын зорилго',    icon:'target'},
    {key:'journal',   title:'Сэтгэлийн дэвтэр',     icon:'book'},
    {key:'edu',       title:'Сэтгэлийн боловсрол',  icon:'school'},
    {key:'health',    title:'Эрүүл мэнд',          icon:'gym'},
    {key:'reminders', title:'Сануулга',             icon:'clock'},
    {key:'programs',  title:'Нэмэлт хөтөч',         icon:'planet'},
  ];

  function renderMenu(){
    let list = $('#menuList');
    if(!list){
      list = document.createElement('div'); list.id = 'menuList';
      if ($('#itemGuides')) el.menu.insertBefore(list, $('#itemGuides')); else el.menu.appendChild(list);
    }
    list.innerHTML = '';
    MENU_ITEMS.forEach(m=>{
      const row=document.createElement('div');
      row.className='oy-item'; row.dataset.menu=m.key;
      row.innerHTML=`<span class="i">${iconSvg(m.icon)}</span><span class="t">${m.title}</span>`;
      row.addEventListener('click', ()=>{ el.guidesWrap.hidden=true; Panels.open(m.key); });
      list.appendChild(row);
    });
  }

  /* ===== Guides ===== */
  function renderAgeCats(){
    el.guideCatsAge.innerHTML='';
    AGE.forEach(it=>{
      const pill=document.createElement('div'); pill.className='oy-pill';
      pill.style.setProperty('--c', it.color); pill.style.setProperty('--tc', textColorFor(it.color));
      pill.innerHTML=`<span>${it.name}</span>`;
      pill.onclick=()=>selectChat(it);
      el.guideCatsAge.appendChild(pill);
    });
  }
  function renderSpecialCats(){
    el.guideCatsSpecial.innerHTML='';
    SPECIAL.forEach(it=>{
      const pill=document.createElement('div'); pill.className='oy-pill';
      pill.style.setProperty('--c', it.color); pill.style.setProperty('--tc', textColorFor(it.color));
      pill.innerHTML=`<span>${it.name}</span>`;
      pill.onclick=()=>selectChat(it);
      el.guideCatsSpecial.appendChild(pill);
    });
  }
  function selectChat(it){
    const key = it.slug;
    state.current = key;
    state.active[key] = {name:it.name, color:it.color};
    save(); redrawActive();
    el.title.textContent=`Оюунсанаа — ${it.name}`;
    closeDrawer();
    loadChat(key, true);
  }
  function redrawActive(){
    el.activeList.innerHTML = '';
    Object.entries(state.active).forEach(([key, m]) => {
      const row  = document.createElement('div');
      row.className = 'item';
      row.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;min-height:40px;padding:8px 12px;margin:8px 0;border:1px solid var(--line);border-radius:14px;background:#fff;box-sizing:border-box';
      const dot  = document.createElement('span'); dot.style.cssText='width:12px;height:12px;border-radius:999px;flex:0 0 12px;background:'+(m.color||'#486573');
      const name = document.createElement('div'); name.style.cssText='flex:1 1 auto;font:400 14px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'; name.textContent=m.name;
      const x = document.createElement('button'); x.textContent='×'; x.title='Идэвхтээгээс хасах'; x.style.cssText='appearance:none;flex:0 0 auto;padding:2px 8px;font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;border:none;border-radius:10px;background:#eef0f3;cursor:pointer';
      name.onclick = () => { state.current = key; save(); el.title.textContent = `Оюунсанаа — ${m.name}`; loadChat(key, false); closeDrawer(); };
      x.onclick = (e) => { e.stopPropagation(); delete state.active[key]; if (state.current === key) { state.current = null; el.stream.innerHTML = ''; el.title.textContent = 'Оюунсанаа — Сонголтоо хийнэ үү'; } save(); redrawActive(); };
      row.append(dot, name, x);
      el.activeList.appendChild(row);
    });
  }

  /* ===== Chat ===== */
  function loadChat(key,greet){
    el.stream.innerHTML='';
    const raw=localStorage.getItem(msgKey(key));
    if(raw){ try{ (JSON.parse(raw)||[]).forEach(m=>bubble(m.html,m.who)); }catch(_){ } }
    else if(greet){ bubble('Сайн уу. Чат эхэллээ. 🌿','bot'); meta('Тавтай морилно уу'); }
    setTimeout(()=>el.input && el.input.focus(),30);
  }
  function pushMsg(key, who, html){
    const k=msgKey(key); const arr=JSON.parse(localStorage.getItem(k)||'[]');
    arr.push({t:Date.now(), who, html}); localStorage.setItem(k, JSON.stringify(arr));
  }
// ==== SEND (resilient) ====
async function send () {
  const t = (el.input?.value || '').trim();
  if (!t) { meta('Жишээ: "Сайн байна уу?"'); return; }
  if (!state.current) { bubble('Эхлээд Сэтгэлийн хөтөчөөс чат сонгоорой. 🌿','bot'); el.input.value=''; return; }

  // UI
  bubble(esc(t), 'user');
  pushMsg(state.current, 'user', esc(t));
  el.input.value = '';
  el.send.disabled = true;

  // Түүх
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(msgKey(state.current)) || '[]'); } catch(_) {}

  // Моделиудын map (backend өөр нэр хүсдэг байж болно)
  const uiModel = el.modelSelect?.value || 'gpt-4o';
  const MODEL_MAP = {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    // доор нь шаардлагатай бол нэмнэ
  };
  const model = MODEL_MAP[uiModel] || 'gpt-4o';

  try {
    // ажиллаж буй endpoint-аа олно (кэштэй)
    const url = OY_ENDPOINT || await pickWorkingEndpoint();

    // бодит хүсэлт
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        msg: t,
        chatSlug: state.current || '',
        history: hist
      })
    });

    // 405/404 тохиолдолд өөр зам руу автоматаар шилжинэ
    if (r.status === 405 || r.status === 404) {
      // кэшийг арилгаад дахин сонгоно
      localStorage.removeItem(OY_EP_LSKEY);
      OY_ENDPOINT = '';
      const fallbackUrl = await pickWorkingEndpoint();
      const r2 = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, msg: t, chatSlug: state.current || '', history: hist })
      });
      if (!r2.ok) {
        const txt = await r2.text().catch(()=> '');
        throw new Error(`API (${r2.status}) ${txt}`);
      }
      const { reply, error } = await r2.json();
      if (error) throw new Error(error);
      const safe = esc(reply || 'Одоохондоо хариу олдсонгүй.');
      bubble(safe, 'bot'); pushMsg(state.current, 'bot', safe); save();
      return;
    }

    if (!r.ok) {
      const txt = await r.text().catch(()=> '');
      throw new Error(`API (${r.status}) ${txt}`);
    }

    const { reply, error } = await r.json();
    if (error) throw new Error(error);

    const safe = esc(reply || 'Одоохондоо хариу олдсонгүй.');
    bubble(safe, 'bot');
    pushMsg(state.current, 'bot', safe);
    save();
  } catch (e) {
    console.error(e);
    bubble('⚠️ Холболтын алдаа: ' + esc(niceError(e)), 'bot');
  } finally {
    el.send.disabled = false;
  }
}

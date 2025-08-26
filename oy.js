(()=> {
  if (window.__OY_BOOTED__) return; window.__OY_BOOTED__ = true;
  const $ = (s, r=document) => r.querySelector(s);

  /* ===== Элементүүд ===== */
  const el = {
    open1: $('#oyOpen1'), open2: $('#oyOpen2'),
    overlay: $('#oyOverlay'), modal: $('#oyModal'),
    drawer: $('#oyDrawer'), menu: $('.oy-menu'),
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
  };

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

  /* ===== Store ===== */
  const LSKEY='oy_state_v9'; const msgKey = k=>'oy_msgs_'+k;
  let state = { account:{name:'Хэрэглэгч', code:'OY-0000'}, current:null, active:{} };
  try { const s=JSON.parse(localStorage.getItem(LSKEY)||'null'); if(s) state={...state,...s}; } catch(_){}
  const save = () => localStorage.setItem(LSKEY, JSON.stringify(state));

  /* ===== Helpers ===== */
  const textColorFor=(hex)=>{ const c=(hex||'').replace('#',''); if(c.length<6) return '#111';
    const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
    const L=(0.299*r+0.587*g+0.114*b)/255; return L>0.7? '#111':'#fff'; };
  const esc=(s)=> String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[m]));
  function bubble(html, who='bot'){ const d=document.createElement('div'); d.className='oy-bubble '+(who==='user'?'oy-user':'oy-bot'); d.innerHTML=html;
    el.stream.appendChild(d); el.chat.scrollTop=el.chat.scrollHeight; return d; }
  function meta(t){ const m=document.createElement('div'); m.className='oy-meta'; m.textContent=t; el.stream.appendChild(m); }

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

  /* ===== Panels ===== */
  const Panels = {
    registry:{
      account:{ title:'Миний бүртгэл', render:(w)=>{ w.innerHTML=`
        <div class="card"><b>Суурь мэдээлэл</b><div class="muted">Нэр, Код нь сайтын бүртгэлээс автоматаар орно.</div></div>
        <div class="card">
          <label>Имэйл<br><input id="accEmail" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px"></label><br><br>
          <label>Утас<br><input id="accPhone" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px"></label><br><br>
          <button id="btnAccSave" class="oy-back">Хадгалах</button>
        </div>`;
        $('#btnAccSave')?.addEventListener('click', ()=> bubble('Бүртгэлийн нэмэлт талбар хадгалагдлаа.','bot')); } },
      summary:{ title:'Таны сонголт', render:(w)=> w.innerHTML=`
        <div class="card"><b>Анхны зураг</b><div class="muted">Унталт, ус, алхалт, стресс (анхны 7 хоног)</div></div>
        <div class="card"><b>Явцын зураг</b><div class="muted">Сүүлийн 7/30 хоногийн индикатор</div></div>
        <div class="card"><b>Гол 3 зөвлөгөө</b><div class="muted">Дараа нь динамик болно</div></div>` },
      goals:{ title:'Амьдралын зорилго', render:(w)=> w.innerHTML=`
        <div class="card"><b>Том зорилго (3 хүртэл)</b></div>
        <div class="card"><b>Жижиг алхам · Цагийн хуваарь</b></div>
        <div class="card"><b>Санхүүгийн зорилго</b></div>` },
      journal:{ title:'Сэтгэлийн дэвтэр', render:(w)=> w.innerHTML=`
        <div class="card"><b>Чөлөөт бичвэр</b><div class="muted">Markdown дэмждэг</div></div>
        <div class="card"><b>Чиглүүлсэн захидлууд</b><div class="muted">Талархал, уучлал, аавдаа захиа…</div></div>
        <div class="card"><b>Нууц дэвтэр (PIN)</b><div class="muted">Дараа нь идэвхжүүлнэ</div></div>` },
      edu:{ title:'Сэтгэлийн боловсрол', render:(w)=> w.innerHTML=`
        <div class="card"><b>Бяцхан хичээлүүд</b><div class="muted">Амьсгал 3×3, Талархал, Анхаарал…</div></div>` },
      health:{ title:'Эрүүл мэнд', render:(w)=> w.innerHTML=`
        <div class="card"><b>Ус / Калори / Дасгал</b><div class="muted">Зураг илгээх боломжтой</div></div>` },
      finance:{ title:'Санхүү', render:(w)=> w.innerHTML=`
        <div class="card"><b>Орлого/Зарлага</b><div class="muted">Дараа нь диаграм, тайлан нэмнэ</div></div>` },
      reminders:{ title:'Сануулга', render:(w)=> w.innerHTML=`
        <div class="card"><b>Календарь сануулгууд</b><div class="muted">Эм, уулзалт, төрсөн өдөр…</div></div>` },
      programs:{ title:'Нэмэлт хөтөч', render:(w)=> w.innerHTML=`
        <div class="card"><b>Жишээ</b><div class="muted">Анхаарал 7хон · Муу зуршил 21хон · Ус 14хон</div></div>` },
    },
    open(key){
      const def = this.registry[key]; if (!def) return;
      $('#oyPanelTitle').textContent = def.title;
      const body = $('#oyPanelBody'); body.innerHTML = ''; def.render(body);
      $('#oyPanel').hidden = false;
      $('#oyPanelBack').onclick = () => { $('#oyPanel').hidden = true; };
    }
  };

  /* ===== 4 slug-ийн alias (даралтад ажиллах) ===== */
  Panels.registry['daily_tasks'] = {
    title: 'Өдрийн даалгавар',
    render: (w) => { w.innerHTML = `
      <div class="card"><b>Өнөөдрийн зорилт</b>
        <div class="muted">Жагсаалтыг дараа бодит болгоно.</div>
      </div>`; }
  };
  Panels.registry['journal_book'] = Panels.registry.journal;
  Panels.registry['psy_edu']      = Panels.registry.edu;
  Panels.registry['diet_fitness'] = Panels.registry.health;

  /* ===== Меню (9 ширхэг) ===== */
  const MENU_ITEMS = [
    {key:'account',   title:'Миний бүртгэл',        icon:'user'},
    {key:'summary',   title:'Таны сонголт',         icon:'chart'},
    {key:'goals',     title:'Амьдралын зорилго',    icon:'target'},
    {key:'daily_tasks',title:'Өдрийн даалгавар',    icon:'clock'},
    {key:'journal_book',title:'Сэтгэлийн дэвтэр',   icon:'book'},
    {key:'psy_edu',   title:'Сэтгэлийн боловсрол',  icon:'school'},
    {key:'diet_fitness',title:'Хоол · Дасгал',      icon:'gym'},
    {key:'reminders', title:'Сануулга',             icon:'clock'},
    {key:'programs',  title:'Нэмэлт хөтөч',         icon:'planet'},
  ];
  function renderMenu(){
    let list = $('#menuList');
    if(!list){
      list = document.createElement('div'); list.id = 'menuList';
      if (el.itemGuides) el.menu.insertBefore(list, el.itemGuides); else el.menu.appendChild(list);
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
    el.activeList.innerHTML='';
    Object.entries(state.active).forEach(([key,m])=>{
      const row=document.createElement('div'); row.className='item';
      const dot=document.createElement('span'); dot.className='dot'; dot.style.background=m.color;
      const name=document.createElement('div'); name.className='name'; name.textContent=m.name;
      const x=document.createElement('button'); x.textContent='×'; x.title='Идэвхтээгээс хасах';
      name.onclick=()=>{ state.current=key; save(); el.title.textContent=`Оюунсанаа — ${m.name}`; loadChat(key,false); closeDrawer(); };
      x.onclick=(e)=>{ e.stopPropagation(); delete state.active[key]; if(state.current===key) state.current=null; save(); redrawActive(); };
      row.append(dot,name,x); el.activeList.appendChild(row);
    });
  }

  /* ===== Chat ===== */
  function loadChat(key,greet){
    el.stream.innerHTML='';
    const raw=localStorage.getItem(msgKey(key));
    if(raw){ try{ (JSON.parse(raw)||[]).forEach(m=>bubble(m.html,m.who)); }catch(_){ /* ignore */ } }
    else if(greet){ bubble('Сайн уу. Чат эхэллээ. 🌿','bot'); meta('Тавтай морилно уу'); }
    setTimeout(()=>el.input && el.input.focus(),30);
  }
  function pushMsg(key, who, html){
    const k=msgKey(key); const arr=JSON.parse(localStorage.getItem(k)||'[]');
    arr.push({t:Date.now(), who, html}); localStorage.setItem(k, JSON.stringify(arr));
  }
  // --- CHAT илгээх (жинхэнэ API хувилбар) ---
const API_URL = "https://oyunsanaa-wix-chat.vercel.app/api/chat";
async function send() {
  const t = (el.input?.value || "").trim();
  if (!t) { meta('Жишээ: “Сайн байна уу?”'); return; }
  if (!state.current) { bubble('Эхлээд Сэтгэлийн хөтөчөөс чат сонгоорой. 🌿', 'bot'); el.input.value = ''; return; }

  // UI дээр хэрэглэгчийн мессежийг харуулж, талбар хоослох
  bubble(esc(t), 'user');
  pushMsg(state.current, 'user', esc(t));
  el.input.value = '';
  el.send.disabled = true;

  try {
    const r = await fetch(`${OY_API_BASE}/api/oy-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: t })
    });

    const data = await r.json();
    const reply = esc(data.reply || 'Одоохондоо хариу олдсонгүй.');
    bubble(reply, 'bot');
    pushMsg(state.current, 'bot', reply);
    save();
  } catch (err) {
    bubble('⚠️ Холболтын алдаа. Дахин оролдоно уу.', 'bot');
  } finally {
    el.send.disabled = false;
  }
}

  /* ===== Modal / Drawer ===== */
  function openModal(){
    $('#oyOpen1')?.setAttribute('hidden','');
    $('#oyOpen2')?.setAttribute('hidden','');
    el.modal.hidden=false; el.overlay.hidden=false; document.body.style.overflow='hidden'; bootOnce();
  }
  function closeModal(){
    el.modal.hidden=true; el.overlay.hidden=true; document.body.style.overflow=''; closeDrawer(); save();
    $('#oyOpen1')?.removeAttribute('hidden'); $('#oyOpen2')?.removeAttribute('hidden');
  }
  function toggleDrawer(){ const open=!el.drawer.classList.contains('open'); el.drawer.classList.toggle('open', open); document.body.style.overflow=open?'hidden':''; }
  function closeDrawer(){ el.drawer.classList.remove('open'); document.body.style.overflow=''; }

  /* ===== Boot ===== */
  function bootOnce(){
    if (el.modal.dataset.boot) return; el.modal.dataset.boot='1';
    el.accName.textContent=state.account.name||'Хэрэглэгч';
    el.accCode.textContent=state.account.code||'OY-0000';
    renderMenu(); renderAgeCats(); renderSpecialCats(); redrawActive();
    if(state.current && state.active[state.current]){
      el.title.textContent=`Оюунсанаа — ${state.active[state.current].name}`;
      loadChat(state.current,false);
    } else {
      bubble('Сайн уу, байна уу. Сэтгэлийн хөтөчөөс ангиллаа сонгоод чат руу оръё. 🌸','bot'); meta('Тавтай морилно уу');
    }
  }

  /* ===== Events ===== */
  el.open1?.addEventListener('click', openModal);
  el.open2?.addEventListener('click', openModal);
  el.overlay?.addEventListener('click', closeModal);
  el.btnClose?.addEventListener('click', closeModal);
  el.btnDrawer?.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); el.guidesWrap.hidden=true; toggleDrawer(); });
  document.addEventListener('click', (e)=>{
    if(!el.drawer || !el.drawer.classList.contains('open')) return;
    if(e.target.closest('#oyDrawer') || e.target.closest('#btnDrawer')) return;
    closeDrawer();
  });
  $('#itemGuides')?.addEventListener('click', ()=>{ el.guidesWrap.hidden = !el.guidesWrap.hidden; });
  el.send?.addEventListener('click', send);
  el.input?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }});

  // гаднаас дуудахаар үлдээнэ
  window.OY_OPEN = openModal;
})();




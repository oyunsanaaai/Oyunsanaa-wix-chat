(() => {
  if (window.__OY_BOOTED__) return;
  window.__OY_BOOTED__ = true;

  const $ = (s, r = document) => r.querySelector(s);

  /* ===== Элементийн тохиргоо ===== */
  const el = {
    overlay: $('#oyOverlay'),
    modal: $('#oyModal'),
    drawer: $('#oyDrawer'),
    menu: $('.oy-menu'),
    menuList: $('#menuList'),
    itemGuides: $('#itemGuides'),
    guidesWrap: $('#guidesWrap'),
    guideCatsAge: $('#guideCatsAge'),
    guideCatsSpecial: $('#guideCatsSpecial'),
    activeList: $('#activeList'),
    title: $('#chatTitle'),
    chat: $('#oyChat'),
    stream: $('#oyStream'),
    input: $('#oyInput'),
    send: $('#btnSend'),
    btnDrawer: $('#btnDrawer'),
    btnClose: $('#btnClose'),
    accName: $('#accName'),
    accCode: $('#accCode'),
    panel: $('#oyPanel'),
    pBack: $('#oyPanelBack'),
    pTitle: $('#oyPanelTitle'),
    pBody: $('#oyPanelBody'),
    file: $('#oyFile'),
    modelSelect: $('#modelSelect'),   // ✅ Model сонголт
  };

  /* ===== Мэдээллийн эх үүсвэр ===== */
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

  /* ===== Төлөв хадгалах ===== */
  const LSKEY = 'oy_state_v10';
  const msgKey = (k) => `oy_msgs_${k}`;
  let state = { account: { name: 'Хэрэглэгч', code: 'OY-0000' }, current: null, active: {} };

  try {
    const s = JSON.parse(localStorage.getItem(LSKEY) || 'null');
    if (s) state = { ...state, ...s };
  } catch (_) {}
  const save = () => localStorage.setItem(LSKEY, JSON.stringify(state));

  /* ===== Дэмжлэгийн функцууд ===== */
  const textColorFor = (hex) => {
    const c = (hex || '').replace('#', '');
    if (c.length < 6) return '#111';
    const r = parseInt(c.slice(0, 2), 16),
          g = parseInt(c.slice(2, 4), 16),
          b = parseInt(c.slice(4, 6), 16);
    const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return L > 0.7 ? '#111' : '#fff';
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[m]);

  function bubble(html, who='bot'){ 
    const d=document.createElement('div'); 
    d.className='oy-bubble '+(who==='user'?'oy-user':'oy-bot'); 
    d.innerHTML=html;
    el.stream.appendChild(d); 
    el.chat.scrollTop=el.chat.scrollHeight+999; 
    return d; 
  }

  function pushMsg(key, who, html){
    const k=msgKey(key); 
    const arr=JSON.parse(localStorage.getItem(k)||'[]');
    arr.push({t:Date.now(), who, html}); 
    localStorage.setItem(k, JSON.stringify(arr));
  }

  function meta(t){ 
    const m=document.createElement('div'); 
    m.className='oy-meta'; 
    m.textContent=t; 
    el.stream.appendChild(m); 
  }

  /* ===== Илгээх функц ===== */
  async function send() {
    const t = (el.input?.value || "").trim();
    if (!t) { meta('Жишээ: “Сайн байна уу?”'); return; }
    if (!state.current) { 
      bubble('Эхлээд Сэтгэлийн хөтөчөөс чат сонгоорой. 🌿','bot'); 
      el.input.value=''; 
      return; 
    }

    // UI-д эхлээд харуулна
    bubble(esc(t), 'user');
    pushMsg(state.current, 'user', esc(t));
    el.input.value = '';
    el.send.disabled = true;

    // Түүх (байгаа бол)
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(msgKey(state.current)) || '[]'); } catch (_) {}

    try {
      const modelSel = el.modelSelect || document.getElementById('modelSelect');
      const model = (modelSel && modelSel.value) || 'gpt-4o-mini';

      const response = await fetch('/api/oy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          msg: t,
          chatSlug: state.current || 'default-chat',
          history: hist
        })
      });

      const data = await response.json();
      const reply = data.reply || "Хариу олдсонгүй";

      const messageArea = document.getElementById("oyStream");
      messageArea.innerHTML += `<div class="botMessage">${reply}</div>`;
    } catch (error) {
      console.error('Алдаа гарлаа:', error);
      alert('API холболтын алдаа гарлаа.');
    } finally {
      el.send && (el.send.disabled = false);
    }
  }

  /* ===== Event listeners ===== */
  el.send?.addEventListener("click", send);
  el.input?.addEventListener("keydown", e=>{
    if(e.key==='Enter' && !e.shiftKey){ 
      e.preventDefault(); 
      send(); 
    }
  });

})(); 

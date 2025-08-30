  // --- REAL API (дараа нь өөрийн endpoint-оо солино) ---
  const OY_API_BASE = ""; // жишээ: "https://chat.oyunsanaa.com" (одоохондоо хоосон байж болно)

  async function send() {
    const t = (el.input?.value || "").trim();
    if (!t) { meta('Жишээ: “Сайн байна уу?”'); return; }
    if (!state.current) { bubble('Эхлээд Сэтгэлийн хөтөчөөс чат сонгоорой. 🌿','bot'); el.input.value=''; return; }

    // UI: хэрэглэгчийн мессежийг түрүүлж харуулна
    bubble(esc(t), 'user');
    pushMsg(state.current, 'user', esc(t));
    el.input.value = '';
    if (el.send) el.send.disabled = true;

    // Түүх
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(msgKey(state.current)) || '[]'); } catch(_) {}

    // Сонгосон модел (хамгаалалттай уншина)
    const modelSel = document.getElementById('modelSelect');
    const model = (modelSel && modelSel.value) || 'gpt-4o-mini';

    try {
      const response = await fetch('/api/oy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,                          // ← сонгосон модель API руу
          msg: t,
          chatSlug: state.current || 'default-chat',
          history: hist
        })
      });

      const data  = await response.json();
      const reply = data?.reply || 'Хариу олдсонгүй.';
      bubble(esc(reply), 'bot');
      pushMsg(state.current, 'bot', esc(reply));
      el.chat.scrollTop = el.chat.scrollHeight + 999;
    } catch (error) {
      console.error('Алдаа:', error);
      bubble('API холболтын алдаа. ⚠️', 'bot');
    } finally {
      if (el.send) el.send.disabled = false;
    }
  }

  /* ===== Modal / Drawer ===== */
  const mqDesktop = window.matchMedia('(min-width:1024px)');
  const isDesktop = () => mqDesktop.matches;

  function openModal(){
    el.modal.hidden=false;
    if (!isDesktop()) el.overlay.hidden=false;       // mobile-д харанхуулах
    document.documentElement.style.height='100%';
    document.body.style.overflow='hidden';
    bootOnce();
  }
  function closeModal(){
    el.modal.hidden=true;
    el.overlay.hidden=true;
    closeDrawer();
    document.documentElement.style.height='';
    document.body.style.overflow='';
    save();
  }
  function openDrawer(){ if (isDesktop()) return; document.body.classList.add('oy-drawer-open'); }
  function closeDrawer(){ document.body.classList.remove('oy-drawer-open'); }
  function toggleDrawer(){ document.body.classList.toggle('oy-drawer-open'); }

  mqDesktop.addEventListener?.('change', () => { closeDrawer(); el.overlay.hidden = isDesktop() ? true : el.overlay.hidden; });

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
  el.overlay?.addEventListener('click', ()=>{ closeDrawer(); if(!isDesktop()) closeModal(); });
  el.btnClose?.addEventListener('click', closeModal);
  el.btnDrawer?.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); el.guidesWrap.hidden=true; toggleDrawer(); });
  document.addEventListener('click', (e)=>{
    if(!document.body.classList.contains('oy-drawer-open')) return;
    if(e.target.closest('#oyDrawer') || e.target.closest('#btnDrawer')) return;
    closeDrawer();
  });
  $('#itemGuides')?.addEventListener('click', ()=>{ el.guidesWrap.hidden = !el.guidesWrap.hidden; });

  // Илгээх эвентүүд (ганц л удаа бүртгэнэ)
  el.send?.addEventListener('click', send);
  el.input?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }});

  // Шууд нээж прэвьюлэх (Wix-ээс бол товчоор дууд)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openModal);
  } else {
    openModal();
  }

  // Wix trigger
  window.OY_OPEN = openModal;
  window.addEventListener('message', (ev)=>{
    if (ev?.data?.type === 'OY_OPEN' || ev.data === 'OY_OPEN') openModal();
  });

})(); // ← IIFE төгсгөл

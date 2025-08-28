<script>
(function(){
  // ====== Элементүүд ======
  const $ = s => document.querySelector(s);
  const modal   = $('#oyModal');
  const overlay = $('#oyOverlay');
  const fab     = $('#oyFab');              // байхгүй бол зүгээр л null байна
  const header  = $('#oyHeader');           // embed үед нуух боломжтой
  const drawer  = $('#oyDrawer');
  const btnDrawer = $('#btnDrawer');
  const btnClose  = $('#btnClose');

  const input   = $('#oyInput');
  const sendBtn = $('#oySend');
  const stream  = $('.oy-stream');

  // ====== Нээх/хаах ======
  window.OY_OPEN = function OY_OPEN(){
    if (!modal) return;
    modal.hidden = false;
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = 'hidden'; // арын хуудсыг түгжинэ
    // composer руу фокус
    if (input) setTimeout(()=>input.focus(), 100);
  };

  window.OY_CLOSE = function OY_CLOSE(){
    if (!modal) return;
    modal.hidden = true;
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = ''; // хэвийн болгоно
    if (drawer) drawer.classList.remove('open');
  };

  // ====== Триггерүүд ======
  if (fab) fab.addEventListener('click', OY_OPEN);
  if (overlay) overlay.addEventListener('click', OY_CLOSE);
  if (btnClose) btnClose.addEventListener('click', OY_CLOSE);

  // ESC дархад хаах
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') OY_CLOSE();
  });

  // Drawer toggle
  if (btnDrawer && drawer){
    btnDrawer.addEventListener('click', ()=> drawer.classList.toggle('open'));
  }

  // ====== URL параметрүүд ======
  const qs = new URLSearchParams(location.search);
  // ?open=1 → автоматаар нээх
  if (qs.get('open') === '1') OY_OPEN();

  // ?embed=1 → эмбед горим: FAB/толгойг нуух
  if (qs.get('embed') === '1'){
    document.documentElement.setAttribute('data-embed','1');
    if (fab)    fab.style.display = 'none';
    if (header) header.style.display = 'none';
  }

  // ====== Composer: Enter = илгээх, Shift+Enter = шинэ мөр ======
  function sendMessage(){
    if (!input || !stream) return;
    const text = input.value.trim();
    if (!text) return;
    // Энд өөрийн илгээх логикоо дуудаарай (API/websocket гэх мэт)
    // Доорх нь зөвхөн UI-д харагдуулах demo:
    const me = document.createElement('div');
    me.className = 'oy-bubble oy-user';
    me.textContent = text;
    stream.appendChild(me);
    input.value = '';
    autoSize();    // өндрийг дахин тааруулна
    stream.scrollTop = stream.scrollHeight; // доош гүйлгэнэ
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  if (input){
    input.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ====== Textarea авто-өндөр ======
  function autoSize(){
    if (!input) return;
    input.style.height = 'auto';
    const max = parseInt(window.getComputedStyle(input).getPropertyValue('max-height')) || 120;
    input.style.height = Math.min(input.scrollHeight, max) + 'px';
  }
  if (input){
    input.addEventListener('input', autoSize);
    window.addEventListener('resize', autoSize);
    autoSize();
  }

  // ====== iOS 100dvh/keyboard гажгийг багасгах ======
  // Modal нээгдэхэд viewport өөрчлөгдөхөд өндөр дахин тооцоолох
  let vhTick;
  window.addEventListener('resize', ()=>{
    clearTimeout(vhTick);
    vhTick = setTimeout(()=>{
      document.body.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    }, 120);
  });
  // CSS-д хүсвэл height: calc(var(--vh) * 100); ашиглаж болно
})();
</script>
<script>
(function(){
  const input  = document.querySelector('.oy-textarea');
  const send   = document.querySelector('.oy-send');
  const stream = document.querySelector('.oy-stream');
  if(!input || !send || !stream) return;

  function autoSize(){
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }
  function sendMsg(){
    const t = (input.value || '').trim();
    if(!t) return;
    const div = document.createElement('div');
    div.className = 'oy-bubble oy-user';
    div.textContent = t;
    stream.appendChild(div);
    input.value = '';
    autoSize();
    stream.scrollTop = stream.scrollHeight;
  }

  input.addEventListener('input', autoSize);
  send.addEventListener('click', sendMsg);
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
  });
  autoSize();
})();
</script>

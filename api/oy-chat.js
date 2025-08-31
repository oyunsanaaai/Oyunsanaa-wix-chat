// ⛓️ API суурь тохиргоо — олон зам туршаад, ажиллаж байгаа замыг кэшлэнэ
const OY_HOST = 'https://chat.oyunsanaa.com';              // Vercel субдомен
const OY_EP_CANDIDATES = [
  '/api/oy-chat',     // хуучин зам
  '/api/chat',        // түгээмэл
  '/api/v1/chat',     // шинэчлэл байж магадгүй
  '/api/openai/chat'  // өөр төсөөлөгдөх бүтэц
].map(p => OY_HOST + p);

const OY_EP_LSKEY = 'oy_best_endpoint_v1';
let OY_ENDPOINT = localStorage.getItem(OY_EP_LSKEY) || '';

async function pickWorkingEndpoint() {
  const bodies = { ping: true }; // lightweight body to шалгах
  const opts = (body)=>({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const candidates = OY_ENDPOINT ? [OY_ENDPOINT, ...OY_EP_CANDIDATES.filter(u=>u!==OY_ENDPOINT)] : OY_EP_CANDIDATES;

  for (const url of candidates) {
    try {
      const r = await fetch(url, opts(bodies));
      // 200–299: ok. 400: зөв method боловч буруу өгөгдөл—OK гэж үзнэ
      if (r.status >= 200 && r.status < 300) { OY_ENDPOINT = url; localStorage.setItem(OY_EP_LSKEY, url); return url; }
      if (r.status === 400) { OY_ENDPOINT = url; localStorage.setItem(OY_EP_LSKEY, url); return url; }
      // 405/404 бол дараагийн замыг туршина
    } catch(_) { /* next */ }
  }
  throw new Error('API endpoint олдсонгүй (405/404 эсвэл CORS).');
}

// Жижиг helper: алдаа мессежийг нэг мөр болгон гаргана
const niceError = (e) => (e?.message || e || 'Алдаа');

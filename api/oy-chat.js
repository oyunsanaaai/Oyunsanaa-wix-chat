// товчлуурын эвент бүртгэхийг send() функцээс гадуур хийнэ
document.getElementById("btnSend").addEventListener("click", send);

async function send() {
  const model = document.getElementById("modelSelect").value || "gpt-3.5-turbo";
  const message = document.getElementById("oyInput").value.trim();

  if (!message) {
    alert('Та мессеж бичих шаардлагатай!');
    return;
  }

  try {
    const response = await fetch('/api/oy-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        msg: message,
        chatSlug: state.current || 'default-chat', // ✅ тогтмол биш
        history: []
      })
    });

    const data = await response.json();
    const reply = data.reply || "Хариу олдсонгүй";

    const messageArea = document.getElementById("oyStream");
    messageArea.innerHTML += `<div class="botMessage">${reply}</div>`;
  } catch (error) {
    console.error('Алдаа гарлаа:', error);
    alert('API холболтын алдаа гарлаа.');
  }
}

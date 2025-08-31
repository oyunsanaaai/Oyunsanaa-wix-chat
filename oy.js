// oy.js - эхэнд ЗӨВХӨН энийг бич:
(()=> {
  if (window.__OY_BOOTED__) return; 
  window.__OY_BOOTED__ = true;
  
  // бусад код...
})();
  try {
    const { model = 'gpt-4o-mini', msg = '', chatSlug = '', history = [] } = req.body || {};
    
    console.log(`🔥 API Request - Model: ${model}, Chat: ${chatSlug}, Message: ${msg.substring(0, 50)}...`);
    
    // Model нэр шалгаад засварлах
    const validModels = {
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4': 'gpt-4-turbo',           // ❌ gpt-4 → ✅ gpt-4-turbo
      'gpt-4-turbo': 'gpt-4-turbo',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-mini': 'gpt-4o-mini'       // ❌ gpt-4-mini → ✅ gpt-4o-mini
    };
    
    const selectedModel = validModels[model] || 'gpt-4o-mini';
    
    if (selectedModel !== model) {
      console.log(`🔧 Model засварлав: ${model} → ${selectedModel}`);
    }

    // History боловсруулах (зөвхөн сүүлийн 10 мессеж авах)
    const processedHistory = (history || [])
      .filter(item => item && (item.text || item.html || item.content))
      .map(item => ({
        role: item.who === 'user' ? 'user' : 'assistant',
        content: item.text || item.html || item.content || ''
      }))
      .slice(-10); // Зөвхөн сүүлийн 10 мессеж

    console.log(`📚 История: ${processedHistory.length} мессеж`);

// API дуудлага
const response = await fetch('/api/oy-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: selectedModel,
    msg: userMessage,
    chatSlug: currentChat,
    history: chatHistory
  })
});    console.log(`📊 OpenAI Response Status: ${response.status}`);
    
    if (!response.ok) {
      console.error('❌ OpenAI API Error:', data);
      
      // Тодорхой алдааны мессеж
      let errorMessage = 'OpenAI API алдаа';
      
      if (data?.error?.code === 'invalid_api_key') {
        errorMessage = 'API key буруу эсвэл хүчинтэй бус байна';
      } else if (data?.error?.code === 'insufficient_quota') {
        errorMessage = 'API quota дууссан - https://platform.openai.com/account/billing шалгана уу';
      } else if (data?.error?.code === 'model_not_found') {
        errorMessage = `"${selectedModel}" модель олдсонгүй`;
      } else if (data?.error?.message) {
        errorMessage = data.error.message;
      }
      
      return res.status(500).json({ error: errorMessage });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'Хариу олдсонгүй.';
    
    console.log(`✅ Амжилттай хариулав: ${reply.substring(0, 100)}...`);
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Серверийн алдаа гарлаа' 
    });
  }
}

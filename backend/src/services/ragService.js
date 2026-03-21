const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const aiService = require('./aiService');

// Fetch brief context docs from Products and Promotions
async function fetchContextDocs(query) {
  const q = String(query || '').trim();
  const ctxItems = [];
  if (!q) return '';

  try {
    // Products: use text search (productSchema has text index)
    const prodDocs = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' }, productName: 1, description: 1, productCode: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .lean();

    prodDocs.forEach((p) => {
      const snippet = (p.description || '').replace(/\s+/g, ' ').slice(0, 300);
      ctxItems.push(`Product: ${p.productName} (code:${p.productCode})\n${snippet}\nLink: /product/${p._id}`);
    });

    // Promotions: simple keyword match on code or description
    const promoDocs = await Promotion.find({
      $or: [
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(3)
      .lean();

    promoDocs.forEach((pr) => {
      const snippet = (pr.description || '').replace(/\s+/g, ' ').slice(0, 300);
      ctxItems.push(`Promotion: ${pr.code}\n${snippet}`);
    });
  } catch (err) {
    console.error('fetchContextDocs error:', err?.message || err);
  }

  // join with separators
  return ctxItems.slice(0, 5).join('\n\n---\n\n');
}

async function generateWithContext(userMsg, user = null) {
  const context = await fetchContextDocs(userMsg);
  const userName = user?.fullName || user?.email || 'Khách hàng';

  const prompt = `Context:\n${context || 'Không có tài liệu liên quan trong hệ thống.'}\n\nInstruction:\nBạn là trợ lý hỗ trợ khách hàng của cửa hàng. Dựa trên Context nếu có, trả lời ngắn gọn, chính xác, bằng tiếng Việt. Nếu không có thông tin liên quan trong Context, hãy yêu cầu khách cung cấp thêm thông tin và không phán đoán. Luôn kèm nguồn nếu trích dẫn sản phẩm hoặc mã khuyến mãi.\n\nUser (${userName}): ${userMsg}`;

  // call aiService
  return aiService.generateResponse(prompt);
}

module.exports = { fetchContextDocs, generateWithContext };

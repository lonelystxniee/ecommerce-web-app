const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const aiService = require('./aiService');

// Format money in VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Fetch brief context docs from Products and Promotions
async function fetchContextDocs(query) {
  const q = String(query || '').trim();
  const ctxItems = [];
  if (!q) return '';

  try {
    // Products: use text search and populate category
    const prodDocs = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' }, productName: 1, description: 1, productCode: 1, price: 1, quantity: 1, categoryID: 1 }
    )
      .populate('categoryID', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .limit(4)
      .lean();

    prodDocs.forEach((p) => {
      const stockStatus = p.quantity > 0 ? `Còn hàng (${p.quantity} sản phẩm)` : 'Hết hàng';
      const categories = (p.categoryID || []).map(cat => cat.name).join(', ');
      const descSnippet = (p.description || '').replace(/\s+/g, ' ').slice(0, 500);
      
      ctxItems.push(`[SẢN PHẨM]
Tên: ${p.productName}
Mã: ${p.productCode}
Giá: ${formatCurrency(p.price)}
Trạng thái: ${stockStatus}
Danh mục: ${categories || 'Chưa phân loại'}
Mô tả: ${descSnippet}...
Link: [👉 Xem chi tiết sản phẩm tại đây](/product/${p._id})`);
    });

    // Promotions: simple keyword match on code or description
    const promoDocs = await Promotion.find({
      $or: [
        { code: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
      status: 'active' // Only active promotions
    })
      .limit(3)
      .lean();

    promoDocs.forEach((pr) => {
      const descSnippet = (pr.description || '').replace(/\s+/g, ' ').slice(0, 300);
      ctxItems.push(`[KHUYẾN MÃI]
Mã: ${pr.code}
Giảm giá: ${pr.discountValue}${pr.discountType === 'percentage' ? '%' : ' VNĐ'}
Mô tả: ${descSnippet}`);
    });
  } catch (err) {
    console.error('fetchContextDocs error:', err?.message || err);
  }

  return ctxItems.join('\n\n---\n\n');
}

async function generateWithContext(userMsg, user = null) {
  const context = await fetchContextDocs(userMsg);
  const userName = user?.fullName || user?.email || 'Khách hàng';

  const systemInstructions = `Bạn là Trợ lý ảo Momotrust - một chuyên gia am hiểu về sản phẩm và các chương trình khuyến mãi của cửa hàng.
NHIỆM VỤ CỦA BẠN:
1. Trả lời các câu hỏi của khách hàng một cách chuyên nghiệp, tận tâm và thân thiện bằng tiếng Việt.
2. Sử dụng thông tin từ [CONTEXT] được cung cấp bên dưới để trả lời.
3. Nếu không tìm thấy thông tin phù hợp trong [CONTEXT], hãy lịch sự thông báo rằng bạn không có thông tin cụ thể về vấn đề này và đề nghị khách hàng để lại thông tin hoặc liên hệ đội ngũ hỗ trợ trực tuyến (tab Trực tuyến).
4. TUYỆT ĐỐI KHÔNG tự bịa đặt thông tin về sản phẩm, giá cả hoặc mã giảm giá nếu không có trong ngữ cảnh.
5. Luôn ghi rõ nguồn (Mã sản phẩm, Giá, Link) nếu trích dẫn sản phẩm.
6. Nếu sản phẩm HẾT HÀNG, hãy thông báo rõ cho khách và gợi ý họ quay lại sau hoặc xem các sản phẩm tương tự.

[CONTEXT]:
${context || 'Không tìm thấy dữ liệu trực tiếp liên quan. Hãy trả lời dựa trên kiến thức chung về dịch vụ khách hàng nhưng không cam kết về sản phẩm cụ thể.'}`;

  const prompt = `User (${userName}): ${userMsg}`;

  // Gửi instructions như một phần của prompt cấu trúc
  return aiService.generateResponse(`${systemInstructions}\n\n${prompt}`);
}

module.exports = { fetchContextDocs, generateWithContext };

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, Share2, Facebook, Twitter, Link, Clock, ArrowLeft, Bookmark } from 'lucide-react'
import API_URL from '../config/apiConfig'

const MagazineDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [articleRes, allArticlesRes] = await Promise.all([fetch(`${API_URL}/api/articles/${id}`), fetch(`${API_URL}/api/articles`)])

        const articleData = await articleRes.json()
        const allData = await allArticlesRes.json()

        if (articleData.success) {
          setArticle(articleData.article)
        }

        if (allData.success) {
          // Filter out current article and take 5 latest
          const others = allData.articles.filter((a) => a._id !== id && a.type === 'news').slice(0, 5)
          setRelatedArticles(others)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200
    const noOfWords = text ? text.split(/\s/g).length : 0
    const minutes = noOfWords / wordsPerMinute
    const readTime = Math.ceil(minutes)
    return readTime
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-primary">
        <h2 className="mb-4 text-2xl font-bold">Bài viết không tồn tại</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 text-white rounded-full bg-primary">
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 bg-[#fdfaf5] font-trust-san selection:bg-[#faa519] selection:text-white">
      {/* READING PROGRESS BAR */}

      {/* DYNAMIC BLUR HERO SECTION */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        {/* Background Layer: Blurred Article Image */}
        <div className="absolute inset-0 transition-opacity duration-1000 scale-110 bg-center bg-cover blur-2xl opacity-40" style={{ backgroundImage: `url(${article.image})` }} />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3e2714]/80 via-transparent to-[#fdfaf5]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#9d0b0f]/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center max-w-5xl px-4 pt-20 mx-auto text-center">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-white/90 hover:text-[#faa519] font-black uppercase text-xs tracking-[0.3em] transition-all group cursor-pointer"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2" />
            <span>Quay lại tạp chí</span>
          </button>

          <div className="flex items-center gap-4 mb-6 animate-fadeIn">
            <span className="h-[1px] w-8 bg-[#faa519]"></span>
            <span className="text-[#faa519] font-black uppercase text-[10px] tracking-[0.5em]">ClickGo Magazine</span>
            <span className="h-[1px] w-8 bg-[#faa519]"></span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-seagull text-white leading-[1.1] mb-8 drop-shadow-2xl animate-zoomIn">{article.title}</h1>

          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 group">
              <Calendar size={18} className="text-[#faa519] group-hover:scale-125 transition-transform" />
              {new Date(article.date).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center gap-2 group">
              <Clock size={18} className="text-[#faa519] group-hover:scale-125 transition-transform" />
              {calculateReadingTime(article.content + article.summary)} phút đọc
            </div>
            <div className="flex items-center gap-2 text-[#faa519]">
              <Bookmark size={16} fill="currentColor" />
              <span>Lưu bài viết</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 mx-auto -mt-24 max-w-7xl md:-mt-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* MAIN ARTICLE CARD */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(62,39,20,0.15)] border border-[#faa519]/10 overflow-hidden relative group/card">
              {/* Decorative Corner Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />

              {/* FEATURED IMAGE WITH PREMIUM FRAME */}
              {article.image && (
                <div className="p-8 pb-0">
                  <div className="w-full aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl relative">
                    <img src={article.image} alt={article.title} className="object-cover w-full h-full transition-transform duration-1000 group-hover/card:scale-105" />
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" />
                  </div>
                </div>
              )}

              <div className="p-8 pt-12 md:p-20">
                {/* SOCIAL FLOATING STICKY SIDEBAR (STUB) */}
                <div className="absolute flex-col hidden gap-4 -translate-y-1/2 xl:flex left-8 top-1/2">
                  <button className="p-3 bg-white border border-stone-100 text-[#3e2714] rounded-full hover:bg-[#faa519] hover:text-white transition-all shadow-md hover:shadow-[#faa519]/30 cursor-pointer">
                    <Facebook size={18} />
                  </button>
                  <button className="p-3 bg-white border border-stone-100 text-[#3e2714] rounded-full hover:bg-[#faa519] hover:text-white transition-all shadow-md hover:shadow-[#faa519]/30 cursor-pointer">
                    <Twitter size={18} />
                  </button>
                  <button className="p-3 bg-white border border-stone-100 text-[#3e2714] rounded-full hover:bg-[#faa519] hover:text-white transition-all shadow-md hover:shadow-[#faa519]/30 cursor-pointer">
                    <Link size={18} />
                  </button>
                </div>

                <div className="max-w-3xl mx-auto">
                  <p className="text-2xl md:text-3xl text-[#5e4027] font-seagull italic leading-relaxed mb-16 text-center relative">
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-8xl text-[#faa519]/10 font-serif leading-none italic select-none">“</span>
                    {article.summary}
                    <span className="block w-20 h-1 bg-[#faa519] mx-auto mt-10 rounded-full"></span>
                  </p>

                  <div
                    className="article-content max-w-none text-[#3e2714] leading-relaxed text-xl tracking-wide"
                    dangerouslySetInnerHTML={{
                      __html: (article.content || '')
                        // Xóa sạch các Zero-width space (ZWSP) và ký tự rỗng ngắt chữ bí mật
                        .replace(/[\u200B-\u200D\uFEFF]/g, '')
                        // Cưỡng chế TẤT CẢ các thẻ có thuộc tính style chứa bẻ từ phải mất tác dụng
                        .replace(/word-break:\s*break-all/gi, 'word-break: normal')
                        .replace(/overflow-wrap:\s*break-word/gi, 'overflow-wrap: normal'),
                    }}
                  />

                  {/* TAGS / FOOTER METADATA */}
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-10 mt-20 border-t border-stone-100">
                    <div className="flex gap-2">
                      {['Văn hóa', 'Tinh hoa', 'ClickGo'].map((tag) => (
                        <span
                          key={tag}
                          className="px-5 py-2 bg-stone-50 border border-stone-100 rounded-full text-[10px] font-black uppercase text-stone-400 hover:border-[#faa519] hover:text-[#faa519] transition-all cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs italic font-black uppercase text-stone-300">
                      Cập nhật ngày: {new Date(article.updatedAt || article.createdAt || article.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RELATED ARTICLES - MORE DYNAMIC */}
            {relatedArticles.length > 0 && (
              <div className="px-4 mt-20 space-y-10">
                <div className="space-y-2 text-center">
                  <h3 className="text-3xl font-seagull text-[#9d0b0f]">Đọc thêm bài viết</h3>
                  <p className="text-xs font-black tracking-widest uppercase text-stone-400">Khám phá thế giới tinh hoa Việt Nam</p>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  {relatedArticles.slice(0, 2).map((item) => (
                    <div key={item._id} onClick={() => navigate(`/magazine/${item._id}`)} className="space-y-6 cursor-pointer group">
                      <div className="aspect-[16/10] rounded-[40px] overflow-hidden shadow-xl shadow-stone-200/50 relative">
                        <img src={item.image} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                        <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/40 to-transparent group-hover:opacity-100" />
                      </div>
                      <div className="px-2 space-y-3">
                        <span className="text-[10px] font-black text-[#faa519] uppercase tracking-[0.3em]">Tạp chí ClickGo</span>
                        <h4 className="text-xl font-seagull text-[#3e2714] group-hover:text-[#9d0b0f] transition-colors leading-tight">{item.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR - GLASSMORPHISM V2 */}
          <div className="space-y-10 lg:col-span-4">
            <div className="bg-white/70 backdrop-blur-2xl rounded-[50px] p-10 shadow-xl border border-white sticky top-32 overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#faa519]" />

              <h3 className="text-2xl font-seagull text-[#9d0b0f] mb-10 pb-4 border-b border-[#faa519]/20">Tin mới nhất</h3>

              <div className="space-y-10">
                {relatedArticles.map((item, idx) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/magazine/${item._id}`)}
                    className="relative flex items-start gap-5 pb-10 border-b cursor-pointer group last:pb-0 border-stone-100 last:border-0"
                  >
                    <span className="absolute -left-6 top-0 text-4xl font-black text-stone-100 group-hover:text-[#faa519]/10 transition-colors">0{idx + 1}</span>
                    <div className="w-20 h-20 rounded-[24px] overflow-hidden shrink-0 border-2 border-white shadow-lg group-hover:rotate-3 transition-all">
                      <img src={item.image} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" alt={item.title} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#3e2714] line-clamp-2 uppercase leading-tight group-hover:text-[#9d0b0f] transition-all">{item.title}</h4>
                      <p className="text-[10px] text-[#faa519] font-black uppercase tracking-widest">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* NEWSLETTER - REFINED */}
              <div className="mt-12 bg-gradient-to-br from-[#9d0b0f] to-[#3e2714] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/5 blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <h4 className="text-2xl leading-tight font-seagull">Gói ghém tinh hoa Việt</h4>
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">Đăng ký để không bỏ lỡ những câu chuyện về văn hóa và sản phẩm đặc sản từ ClickGo.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Địa chỉ email của bạn"
                      className="w-full bg-white/10 border border-white/20 rounded-[20px] px-6 py-4 text-xs outline-none focus:bg-white/20 focus:border-[#faa519] transition-all placeholder:text-white/30"
                    />
                    <button className="w-full bg-[#faa519] text-white py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/20 hover:scale-[1.02] transition-all cursor-pointer">
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        
        .article-content h1 { font-family: 'UTM Seagull', serif; font-size: 3rem; font-weight: 400; margin-top: 4rem; margin-bottom: 2rem; color: #9d0b0f; line-height: 1.1; }
        .article-content h2 { font-family: 'UTM Seagull', serif; font-size: 2.25rem; font-weight: 400; margin-top: 3.5rem; margin-bottom: 1.5rem; color: #3e2714; position: relative; padding-bottom: 1rem; }
        .article-content h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; h: 4px; background: #faa519; border-radius: 2px; }
        .article-content h3 { font-family: 'Momo Trust Sans', serif; font-size: 1.75rem; font-weight: 400; margin-top: 2.5rem; margin-bottom: 1rem; color: #5e4027; }
        .article-content p, .article-content p span { margin-bottom: 2rem; line-height: 2; color: #3e2714; word-break: normal !important; word-wrap: break-word !important; }
        .article-content img { max-width: 90%; height: auto !important; border-radius: 3rem; margin: 4rem auto; display: block; box-shadow: 0 40px 80px -20px rgba(62,39,20,0.3); border: 12px solid white; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .article-content img:hover { transform: scale(1.02); }
        .article-content ul { list-style-type: none; margin-left: 0; margin-bottom: 2rem; background: #fdfaf5; padding: 2rem; border-radius: 2rem; border: 1px solid #faa51922; }
        .article-content ul li { position: relative; padding-left: 3rem; margin-bottom: 1.25rem; font-weight: 500; }
        .article-content ul li::before { content: '◈'; position: absolute; left: 0.5rem; color: #faa519; font-size: 1.25rem; top: -0.2rem; }
        .article-content ol { list-style-type: decimal; margin-left: 2rem; margin-bottom: 2rem; }
        .article-content li { margin-bottom: 1rem; padding-left: 1rem; }
        .article-content a { color: #9d0b0f; text-decoration: none; border-bottom: 2px solid #faa519; font-weight: 700; transition: all 0.3s; }
        .article-content a:hover { background: #faa51911; border-bottom-color: #9d0b0f; }
        .article-content blockquote { border-left: 10px solid #faa519; padding: 3rem 3.5rem; font-family: 'UTM Seagull', serif; font-style: italic; color: #5e4027; margin: 4rem 0; background: #fffcf7; border-radius: 0 4rem 4rem 0; font-size: 1.5rem; box-shadow: 20px 20px 60px #f0eee2, -20px -20px 60px #ffffff; position: relative; }
        .article-content blockquote::before { content: '“'; position: absolute; top: 0rem; left: 1rem; font-size: 8rem; color: #faa51915; font-family: serif; }
        .article-content iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 3rem; margin: 5rem 0; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.25); border: 8px solid white; }
        
        @media (max-width: 768px) {
          .article-content h1 { font-size: 2.25rem; }
          .article-content h2 { font-size: 1.75rem; }
          .article-content p { font-size: 1.125rem; line-height: 1.8; }
          .article-content img { max-width: 100%; border-radius: 2rem; margin: 3rem 0; border: 6px solid white; }
          .article-content blockquote { padding: 2rem; font-size: 1.25rem; border-left-width: 6px; }
        }
      `,
        }}
      />
    </div>
  )
}

export default MagazineDetail

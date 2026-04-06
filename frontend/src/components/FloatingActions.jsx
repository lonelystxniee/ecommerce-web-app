import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trophy, Sparkles, ChevronUp } from 'lucide-react'
import CombinedChatWidget from './CombinedChatWidget'

const FloatingActions = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isLuckyWheelPage = location.pathname === '/lucky-wheel'

  return (
    <div className="fixed flex flex-row-reverse items-center gap-6 pointer-events-none bottom-10 right-10 z-[9999]">
      <div className="transition-all duration-500 pointer-events-auto hover:scale-110 active:scale-90">
        <CombinedChatWidget open={chatOpen} setOpen={setChatOpen} showTrigger={true} isGrouped={true} />
      </div>

      {!isLuckyWheelPage && (
        <div className="relative pointer-events-auto group/lucky">
          <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-[#fdfcf5] backdrop-blur-xl px-6 py-3 rounded-[24px] shadow-[0_25px_60px_rgba(157,11,15,0.2)] border border-[#e0be91]/30 whitespace-nowrap opacity-0 group-hover/lucky:opacity-100 transition-all duration-500 translate-y-4 group-hover/lucky:translate-y-0 pointer-events-none scale-90 group-hover/lucky:scale-100 flex flex-col items-center">
            <p className="text-[#9d0b0f] font-black text-[12px] uppercase tracking-widest flex items-center gap-2">
              Vòng Quay May Mắn <Sparkles className="w-3.5 h-3.5 text-[#f39200]" />
            </p>
            <span className="text-[#88694f] text-[9px] font-bold italic opacity-60">Săn ngay voucher giá trị!</span>
            <div className="absolute w-4 h-4 -mt-2 rotate-45 -translate-x-1/2 bg-[#fdfcf5] border-b border-r top-full left-1/2 border-[#e0be91]/30"></div>
          </div>

          <Link
            to="/lucky-wheel"
            className="relative w-16 h-16 bg-gradient-to-br from-[#f39200] via-[#ca1d22] to-[#9d0b0f] rounded-[24px] shadow-[0_20px_45px_rgba(157,11,15,0.4)] flex items-center justify-center text-white transition-all duration-700 hover:-translate-y-4 hover:rotate-6 hover:scale-110 active:scale-95 group/link border-2 border-white/50"
          >
            <div className="absolute inset-[-6px] bg-[#f39200] rounded-[30px] blur-2xl opacity-0 group-hover/lucky:opacity-40 transition-opacity duration-700"></div>
            <Trophy className="relative z-10 w-8 h-8 fill-current drop-shadow-xl animate-bounce group-hover/lucky:animate-pulse" />
            <div className="absolute inset-0 overflow-hidden rounded-[24px]">
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/40 rotate-45 group-hover/lucky:animate-shine"></div>
            </div>
            <div className="absolute z-20 w-5 h-5 bg-[#ffe000] border-2 border-white rounded-full shadow-xl -top-1 -right-1 animate-pulse"></div>
          </Link>
        </div>
      )}

      {isVisible && (
        <div className="relative pointer-events-auto group/scroll">
          {/* Minimalist Tooltip */}
          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-gray-100 whitespace-nowrap opacity-0 group-hover/scroll:opacity-100 transition-all duration-500 translate-y-2 group-hover/scroll:translate-y-0 pointer-events-none">
            <span className="text-[#9d0b0f] font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">Lên đầu trang</span>
          </div>

          <button onClick={scrollToTop} className="relative flex items-center justify-center transition-all duration-500 cursor-pointer w-14 h-14 hover:-translate-y-3 active:scale-90">
            {/* The Brand Asset - Floating cleanly without a heavy box */}
            <div className="relative">
              <img
                src="https://honglam.vn/_next/static/media/btn-top.29d23597.png"
                alt="Scroll Top"
                className="object-contain w-12 h-12 transition-all duration-500 opacity-90 group-hover/scroll:opacity-100 group-hover/scroll:scale-110"
              />
              {/* Subtle hover glow behind the asset */}
              <div className="absolute inset-0 bg-[#9d0b0f] blur-xl opacity-0 group-hover/scroll:opacity-20 transition-opacity rounded-full"></div>
            </div>
          </button>
        </div>
      )}

      <style>{`
        @keyframes shine {
          from { left: -100%; }
          to { left: 100%; }
        }
        .group-hover\\/lucky:hover .animate-shine {
          animation: shine 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default FloatingActions

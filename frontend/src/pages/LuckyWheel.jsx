import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import API_URL from '../config/apiConfig'
import { ChevronLeft, Trophy, RefreshCw, Copy, Ticket, Loader2, CheckCircle, Gift, Navigation, X, Zap, MousePointer2, Timer, RotateCcw, Brain, ZapOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const LuckyWheel = () => {
  const [dbPromos, setDbPromos] = useState([])
  const [myVouchers, setMyVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [availableSpins, setAvailableSpins] = useState(0)
  const [canPlayMiniGame, setCanPlayMiniGame] = useState(true) // Trạng thái chơi game

  const [showModal, setShowModal] = useState(false)
  const [gameMode, setGameMode] = useState(null)
  const [gameStatus, setGameStatus] = useState('idle')

  const [clickCount, setClickCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const timerRef = useRef(null)
  const TARGET_CLICKS = 15

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const questions = [
    {
      q: "Sản phẩm nào là 'đặc sản' nổi tiếng nhất của Clickgo",
      a: ['Ô mai', 'Bánh đậu xanh', 'Kẹo cu đơ'],
      c: 0,
    },
    {
      q: 'Hệ thống ClickGo chuyên cung cấp dịch vụ gì?',
      a: ['Giao đồ ăn', 'Đặt tour & Voucher', 'Sửa chữa xe'],
      c: 0,
    },
  ]

  const token = localStorage.getItem('token')

  const fetchInitialData = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const resPromos = await fetch(`${API_URL}/api/promotions/all`)
      const dataPromos = await resPromos.json()
      if (dataPromos.success) setDbPromos(dataPromos.promos.filter((p) => p.status === 'ACTIVE'))

      const resStatus = await fetch(`${API_URL}/api/promotions/spin-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataStatus = await resStatus.json()
      if (dataStatus.success) {
        setAvailableSpins(dataStatus.availableSpins)
        setCanPlayMiniGame(dataStatus.canPlayMiniGame)
      }

      const resMyV = await fetch(`${API_URL}/api/promotions/my-vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataMyV = await resMyV.json()
      if (dataMyV.success) {
        const formatted = dataMyV.vouchers.map((v) => ({
          name: v.code,
          code: v.code,
          description: v.discountType === 'AMOUNT' ? `Giảm ${v.discountValue.toLocaleString()}đ` : `Giảm ${v.discountValue}%`,
        }))
        setMyVouchers(formatted)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initData()
  }, [])
  const initData = fetchInitialData

  const handleWinGame = async () => {
    setGameStatus('won')
    try {
      const res = await fetch(`${API_URL}/api/promotions/add-spin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAvailableSpins(data.availableSpins)
        setCanPlayMiniGame(false) // Chơi xong khóa luôn
        toast.success('Tuyệt vời! +1 Lượt quay đã được cộng.')
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error('Lỗi kết nối server!')
    }
  }

  const startClickGame = () => {
    setGameStatus('playing')
    setClickCount(0)
    setTimeLeft(5)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (timeLeft === 0 && gameStatus === 'playing') {
      if (clickCount >= TARGET_CLICKS) handleWinGame()
      else setGameStatus('lost')
    }
  }, [timeLeft, gameStatus])

  const handleQuizAnswer = (index) => {
    if (index === questions[currentQuestion].c) {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
      else handleWinGame()
    } else toast.error('Sai rồi!')
  }

  const resetAllGames = () => {
    clearInterval(timerRef.current)
    setShowModal(false)
    setGameMode(null)
    setGameStatus('idle')
    setClickCount(0)
    setCurrentQuestion(0)
  }

  const wheelPrizes = useMemo(() => {
    const colors = ['#9d0b0f', '#3e2714', '#f39200', '#88694f']
    let segments = []
    const formattedPromos = dbPromos.map((p) => ({
      name: p.code,
      code: p.code,
      description: p.discountType === 'AMOUNT' ? `Giảm ${p.discountValue.toLocaleString()}đ` : `Giảm ${p.discountValue}%`,
    }))
    for (let i = 0; i < 8; i++) {
      if (formattedPromos[i])
        segments.push({
          ...formattedPromos[i],
          color: colors[i % colors.length],
        })
      else
        segments.push({
          name: i % 2 === 0 ? 'Thêm lượt' : 'Mất lượt',
          code: null,
          color: colors[i % colors.length],
        })
    }
    return segments
  }, [dbPromos])

  const spinWheel = async () => {
    if (isSpinning || availableSpins <= 0) {
      if (!token) return toast.error('Vui lòng đăng nhập!')
      if (availableSpins <= 0) toast.error('Bạn đã hết lượt quay hôm nay!')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/promotions/use-spin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) return toast.error(data.message)
      setAvailableSpins(data.remainingSpins)
    } catch (e) {
      return toast.error('Lỗi server!')
    }

    setIsSpinning(true)
    setResult(null)
    const extraDegree = Math.floor(Math.random() * 360)
    const newRotation = rotation + 1800 + extraDegree
    setRotation(newRotation)

    setTimeout(async () => {
      setIsSpinning(false)
      const prizeIndex = Math.round((360 - (newRotation % 360)) / 45) % 8
      const winner = wheelPrizes[prizeIndex]
      setResult(winner)

      if (winner.code) {
        setMyVouchers((prev) => [winner, ...prev.filter((v) => v.code !== winner.code)])
        setShowPopup(true)
        try {
          const promo = dbPromos.find((p) => p.code === winner.code)
          if (promo) {
            await fetch(`${API_URL}/api/promotions/save-win`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ promoId: promo._id }),
            })
          }
        } catch (e) {
          console.error(e)
        }
      } else toast(winner.name + '!')
    }, 3500)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="animate-spin text-[#9d0b0f]" size={40} />
      </div>
    )

  return (
    <div className="relative min-h-screen pb-20 font-sans bg-transparent">
      <div className="max-w-[1200px] mx-auto px-4 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-[#9d0b0f] font-bold hover:underline mb-8">
          <ChevronLeft size={20} /> Quay lại trang chủ
        </Link>

        {/* Badge Lượt quay */}
        <div className="absolute top-10 right-10 bg-white p-4 rounded-3xl shadow-xl border-2 border-[#faa519]/30 flex items-center gap-4 animate-fadeIn z-50">
          <div className="bg-gradient-to-br from-[#9d0b0f] to-[#f39200] w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#88694f] uppercase tracking-widest">Lượt quay</p>
            <p className="text-2xl font-black text-[#3e2714] leading-none">{availableSpins}</p>
          </div>
        </div>

        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-[#9d0b0f] uppercase tracking-tighter mb-2">Vòng Quay Tinh Hoa</h2>
          <p className="text-[#88694f] font-medium italic">Săn Voucher thật từ hệ thống ClickGo</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-16 lg:flex-row">
          <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-40 text-[#f39200]">
              <div className="w-10 h-12 bg-current" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            </div>
            <div
              className="w-full h-full rounded-full border-[15px] border-[#3e2714] shadow-[0_0_60px_rgba(157,11,15,0.4)] relative overflow-hidden transition-transform duration-[3500ms] ease-out bg-[#3e2714]"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {wheelPrizes.map((prize, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-0 w-full h-full origin-center"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    clipPath: 'polygon(50% 50%, 29.3% 0%, 70.7% 0%)',
                    backgroundColor: prize.color,
                  }}
                >
                  <div className="absolute left-0 flex items-start justify-center w-full top-8 md:top-12">
                    <span
                      className="text-[9px] md:text-[11px] font-black text-white uppercase whitespace-nowrap drop-shadow-md"
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        maxHeight: '35%',
                        overflow: 'hidden',
                      }}
                    >
                      {prize.name}
                    </span>
                  </div>
                </div>
              ))}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full z-10 border-8 border-[#3e2714] shadow-inner"></div>
            </div>
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-28 h-28 rounded-full font-black text-white uppercase tracking-widest text-lg shadow-2xl transition-all active:scale-90 border-4 border-[#faa519] ${isSpinning ? 'bg-gray-400' : 'bg-[#9d0b0f] hover:bg-red-800'}`}
            >
              {isSpinning ? '...' : 'QUAY'}
            </button>
          </div>

          <div className="w-full max-w-md space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-[#faa519]/20">
              <h3 className="text-xl font-black text-[#9d0b0f] uppercase mb-4 flex items-center gap-2">
                <RefreshCw size={20} /> Thể lệ & Hướng dẫn
              </h3>
              <div className="space-y-2 text-xs text-[#88694f] font-medium leading-relaxed mb-6">
                <p>
                  • Tặng <b>01 lượt quay</b> miễn phí mỗi ngày.
                </p>
                <p>
                  • Tặng tối đa <b>01 lượt quay</b> thêm từ Mini Game mỗi ngày.
                </p>
              </div>

              {/* NÚT MINI GAME ĐÃ CẬP NHẬT TRẠNG THÁI KHÓA */}
              <button
                onClick={() => (canPlayMiniGame ? setShowModal(true) : toast.error('Hôm nay bạn đã chơi rồi!'))}
                disabled={!canPlayMiniGame}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
                ${canPlayMiniGame ? 'bg-[#f39200] hover:bg-[#e08600] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {canPlayMiniGame ? <MousePointer2 size={18} /> : <Lock size={18} />}
                {canPlayMiniGame ? 'Chơi Mini Game nhận lượt' : 'Ngày mai quay lại!'}
              </button>
            </div>

            <div className="bg-[#3e2714] p-6 rounded-[32px] text-white shadow-lg border border-white/5 min-h-[320px]">
              <p className="text-[10px] font-bold text-[#f39200] uppercase mb-5 tracking-widest flex items-center gap-2">
                <Ticket size={14} /> Voucher của bạn
              </p>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {myVouchers.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-xs italic text-center opacity-30 text-white/50">
                    <Gift size={40} className="mb-2" />
                    Chưa có quà...
                  </div>
                ) : (
                  myVouchers.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl animate-fadeIn">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-[#9d0b0f] bg-red-50 px-2 py-0.5 rounded uppercase">{v.code}</span>
                          <CheckCircle size={12} className="text-green-500" />
                        </div>
                        <p className="text-xs italic text-gray-400">{v.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(v.code)
                          toast.success('Đã sao chép!')
                        }}
                        className="ml-4 p-2.5 bg-[#f7f4ef] text-[#3e2714] rounded-xl hover:bg-[#9d0b0f] hover:text-white transition-all shadow-sm"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MINI GAME (GIỮ NGUYÊN) */}
      {showModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-zoomIn border-4 border-[#3e2714]">
            <div className="bg-[#3e2714] p-6 text-center text-white relative">
              <button onClick={resetAllGames} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-xl font-black tracking-tighter uppercase">{gameMode === null ? 'Chọn Trò Chơi' : gameMode === 'quiz' ? 'Thử Thách Trí Tuệ' : 'Click Thật Nhanh'}</h3>
            </div>
            <div className="p-8 space-y-6">
              {gameMode === null && (
                <div className="grid gap-4">
                  <button
                    onClick={() => setGameMode('quiz')}
                    className="p-6 rounded-3xl border-2 border-gray-100 hover:border-[#f39200] hover:bg-orange-50 transition-all flex items-center gap-4 group"
                  >
                    <div className="bg-orange-100 p-3 rounded-2xl text-[#f39200] group-hover:bg-[#f39200] group-hover:text-white">
                      <Brain size={32} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[#3e2714] uppercase text-sm">Chọn đáp án</p>
                      <p className="text-[10px] text-gray-500">Trả lời 2 câu hỏi</p>
                    </div>
                  </button>
                  <button onClick={() => setGameMode('click')} className="p-6 rounded-3xl border-2 border-gray-100 hover:border-[#9d0b0f] hover:bg-red-50 transition-all flex items-center gap-4 group">
                    <div className="bg-red-100 p-3 rounded-2xl text-[#9d0b0f] group-hover:bg-[#9d0b0f] group-hover:text-white">
                      <MousePointer2 size={32} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[#3e2714] uppercase text-sm">Bấm nhanh</p>
                      <p className="text-[10px] text-gray-500">15 lần / 5 giây</p>
                    </div>
                  </button>
                </div>
              )}
              {gameMode === 'click' && (
                <div className="space-y-6 text-center">
                  {gameStatus === 'idle' ? (
                    <button onClick={startClickGame} className="w-full bg-[#9d0b0f] text-white py-4 rounded-2xl font-black uppercase">
                      Bắt đầu
                    </button>
                  ) : gameStatus === 'playing' ? (
                    <div className="space-y-4">
                      <div className="flex items-end justify-between font-black">
                        <p className="text-2xl">
                          {clickCount} / {TARGET_CLICKS}
                        </p>
                        <p className="text-[#9d0b0f] flex items-center gap-1">
                          <Timer size={18} />
                          {timeLeft}s
                        </p>
                      </div>
                      <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-[#9d0b0f] transition-all"
                          style={{
                            width: `${(clickCount / TARGET_CLICKS) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <button
                        onMouseDown={() => {
                          if (gameStatus === 'playing') setClickCount((c) => c + 1)
                        }}
                        className="w-full aspect-square rounded-full bg-gradient-to-br from-[#f39200] to-[#9d0b0f] text-white font-black text-3xl shadow-[0_12px_0_#3e2714] active:shadow-none active:translate-y-[12px] transition-all border-4 border-white"
                      >
                        CLICK!
                      </button>
                    </div>
                  ) : gameStatus === 'won' ? (
                    <div className="space-y-4">
                      <Trophy size={48} className="mx-auto text-yellow-500" />
                      <p className="font-black text-xl text-[#3e2714]">THÀNH CÔNG!</p>
                      <button onClick={resetAllGames} className="w-full bg-[#3e2714] text-white py-4 rounded-2xl font-black uppercase text-xs">
                        Quay ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ZapOff size={48} className="mx-auto text-gray-300" />
                      <p className="text-xl font-black text-gray-400">THẤT BẠI</p>
                      <button onClick={startClickGame} className="w-full bg-[#9d0b0f] text-white py-4 rounded-2xl font-black uppercase text-xs">
                        Thử lại
                      </button>
                    </div>
                  )}
                </div>
              )}
              {gameMode === 'quiz' && (
                <div className="space-y-6 text-center">
                  {gameStatus === 'won' ? (
                    <div className="space-y-4">
                      <Trophy size={48} className="mx-auto text-yellow-500" />
                      <p className="font-black text-xl text-[#3e2714]">THÀNH CÔNG!</p>
                      <button onClick={resetAllGames} className="w-full bg-[#3e2714] text-white py-4 rounded-2xl font-black uppercase text-xs">
                        Quay ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Câu {currentQuestion + 1} / 2</p>
                      <p className="text-lg font-black text-[#3e2714]">{questions[currentQuestion].q}</p>
                      <div className="grid gap-2">
                        {questions[currentQuestion].a.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuizAnswer(i)}
                            className="w-full py-4 px-6 rounded-2xl border-2 border-gray-100 font-bold text-[#3e2714] hover:border-[#9d0b0f] hover:bg-red-50 transition-all text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP KẾT QUẢ QUAY  */}
      {showPopup && result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-zoomIn border-4 border-[#faa519]">
            <div className="bg-gradient-to-br from-[#9d0b0f] to-[#f39200] p-10 text-center text-white">
              <Trophy size={60} className="mx-auto mb-4 text-yellow-300" />
              <h3 className="text-2xl font-black uppercase">Chúc mừng!</h3>
              <p className="mt-2 text-4xl font-black tracking-tighter uppercase">{result.name}</p>
            </div>
            <div className="p-8 space-y-6 text-center">
              <div className="bg-[#f7f4ef] p-5 rounded-2xl border-2 border-dashed border-[#9d0b0f]/30">
                <p className="text-3xl font-black text-[#9d0b0f] uppercase tracking-widest">{result.code}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.code)
                  toast.success('Đã sao chép!')
                  setShowPopup(false)
                }}
                className="w-full bg-[#3e2714] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-black transition-all"
              >
                <Navigation size={18} className="rotate-45" /> Sao chép & Dùng ngay
              </button>
              <button onClick={() => setShowPopup(false)} className="text-xs font-bold tracking-widest text-gray-400 underline uppercase">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; }.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }@keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }.animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }`}</style>
    </div>
  )
}

export default LuckyWheel

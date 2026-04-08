import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, KeyRound, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import API_URL from '../config/apiConfig'
import { validatePassword } from '../helpers/validate'

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}
const STRENGTH_CONFIG = [
  { label: 'Rất yếu', color: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/5' },
  { label: 'Yếu', color: 'bg-orange-500', textColor: 'text-orange-500', width: 'w-2/5' },
  { label: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-600', width: 'w-3/5' },
  { label: 'Mạnh', color: 'bg-green-500', textColor: 'text-green-600', width: 'w-full' },
]

export default function ResetPassword() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) {
      setStatus('invalid')
      return
    }

    setToken(t)

    // Verify token on load
    const verifyToken = async () => {
      setStatus('loading')
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-reset-token/${t}`)
        const data = await res.json()

        if (data.success) {
          setStatus('idle')
        } else {
          setStatus('invalid')
          setMessage(data.message)
        }
      } catch (err) {
        console.error('Verify token error:', err)
        setStatus('error')
        setMessage('Không thể kết nối đến máy chủ để xác thực token!')
      }
    }

    verifyToken()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setStatus('error')
      setMessage('Mật khẩu xác nhận không khớp!')
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setStatus('error')
      setMessage(passwordError)
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setMessage(data.message)
        toast.success('Đặt lại mật khẩu thành công!')
        setTimeout(() => navigate('/'), 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Đã có lỗi xảy ra!')
      }
    } catch {
      setStatus('error')
      setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại!')
    }
  }

  const strength = newPassword ? getStrength(newPassword) : -1
  const strengthInfo = strength >= 0 ? STRENGTH_CONFIG[strength] : null
  const passwordsMatch = confirmPassword && newPassword === confirmPassword
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword

  if (status === 'loading') {
    return (
      <div className="h-auto pt-4 pb-20 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-full max-w-md px-6 py-12 mx-auto text-center bg-white border border-gray-100 shadow-2xl rounded-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
            <Loader2 className="animate-spin text-[#800a0d]" size={40} />
          </div>
          <h2 className="text-xl font-black text-[#800a0d] mb-2 tracking-tight">Đang xác thực...</h2>
          <p className="text-sm italic text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="h-auto pt-4 pb-20 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] min-h-[70vh]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-4 mx-auto mb-10 font-bold text-[#88694f] text-xs max-w-300">
          <Link to="/" className="hover:text-[#800a0d] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#800a0d]">Đặt lại mật khẩu</span>
        </div>

        <div className="max-w-md px-6 py-12 mx-auto text-center bg-white border border-gray-100 shadow-2xl rounded-3xl animate-zoomIn">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 text-red-500 rounded-full bg-red-50">
            <XCircle size={36} />
          </div>
          <h1 className="text-2xl font-black text-[#800a0d] tracking-tight mb-3">Link không hợp lệ</h1>
          <p className="mb-8 text-sm italic font-medium text-gray-500">Link đặt lại mật khẩu không đúng hoặc đã hết hạn (15 phút).</p>
          <Link
            to="/forgot-password"
            className="inline-block w-full bg-[#800a0d] text-white py-4 rounded-[30px] font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-sm transition-all text-center"
          >
            Yêu cầu link mới
          </Link>
          <div className="pt-6 mt-8 border-t border-gray-100">
            <Link to="/" className="inline-flex items-center gap-2 text-[#88694f] text-sm font-bold hover:text-[#800a0d] transition-colors">
              <ArrowLeft size={16} />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-auto pt-4 pb-20 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] min-h-[70vh]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 mx-auto mb-10 font-bold text-[#88694f] text-xs max-w-300">
        <Link to="/" className="hover:text-[#800a0d] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#800a0d]">Đặt lại mật khẩu</span>
      </div>

      <div className="max-w-md px-6 py-12 mx-auto bg-white border border-gray-100 shadow-2xl rounded-3xl animate-zoomIn">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50 text-[#800a0d]">
            {status === 'success' ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-2xl font-black text-[#800a0d] tracking-tight mb-3">{status === 'success' ? 'Thành công! 🎉' : 'Đặt lại mật khẩu'}</h1>
          <p className="text-sm italic font-medium text-gray-500">{status === 'success' ? 'Mật khẩu của bạn đã được cập nhật thành công.' : 'Nhập mật khẩu mới để hoàn tất quá trình đặt lại.'}</p>
        </div>

        {/* Trạng thái thành công */}
        {status === 'success' ? (
          <div className="space-y-6 text-center">
            <div className="p-4 border border-green-100 bg-green-50 rounded-2xl">
              <p className="text-sm font-bold leading-relaxed text-green-700">{message}</p>
              <p className="mt-2 text-xs text-green-600 opacity-80">Đang chuyển về trang chủ sau 3 giây...</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-[#88694f] text-sm font-bold hover:text-[#800a0d] transition-colors">
              <ArrowLeft size={16} />
              Về trang chủ ngay
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <label className="block pl-1 text-[13px] font-black text-text-primary uppercase tracking-wider">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-5 py-4 pr-12 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800a0d] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Thanh độ mạnh mật khẩu */}
              {newPassword && strengthInfo && (
                <div className="px-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold">Độ mạnh:</span>
                    <span className={`text-[11px] font-black ${strengthInfo.textColor}`}>{strengthInfo.label}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <label className="block pl-1 text-[13px] font-black text-text-primary uppercase tracking-wider">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`w-full px-5 py-4 pr-12 bg-[#fdfaf5] border rounded-2xl outline-none transition-all font-bold text-[#3e2714] ${
                    passwordsMatch ? 'border-green-400 focus:border-green-500' : passwordsMismatch ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-[#800a0d]'
                  } focus:bg-white`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800a0d] transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {passwordsMatch && <CheckCircle2 size={16} className="absolute text-green-500 -translate-y-1/2 right-12 top-1/2" />}
              </div>
              {passwordsMismatch && <p className="text-red-500 text-[12px] font-bold pl-1">Mật khẩu xác nhận không khớp</p>}
            </div>

            {/* Thông báo lỗi */}
            {status === 'error' && message && (
              <div className="p-3 border border-red-100 bg-red-50 rounded-xl">
                <p className="text-sm font-bold text-center text-red-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#800a0d] text-white py-4 rounded-[30px] font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-sm transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <KeyRound size={16} />
                  Đặt lại mật khẩu
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

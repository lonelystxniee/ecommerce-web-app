import React, { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'

const VnpayReturn = () => {
  const [searchParams] = useSearchParams()
  const responseCode = searchParams.get('vnp_ResponseCode')
  const { clearCart } = useCart()

  useEffect(() => {
    if (responseCode === '00') {
      if (clearCart) clearCart()
    }
  }, [responseCode])

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-transparent">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md w-full border-2 border-[#9d0b0f]">
        {responseCode === '00' ? (
          <>
            <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />
            <h2 className="text-2xl font-black tracking-tighter text-primary">Thanh toán thành công!</h2>
            <p className="mt-4 italic font-medium text-gray-500">Đơn hàng của bạn đã được ghi nhận. Hệ thống sẽ liên hệ sớm nhất.</p>
          </>
        ) : (
          <>
            <XCircle size={80} className="mx-auto mb-6 text-red-500" />
            <h2 className="text-2xl font-black tracking-tighter text-gray-800 uppercase">Thanh toán thất bại</h2>
            <p className="mt-4 font-medium text-gray-500">Giao dịch không thành công hoặc bị hủy bỏ.</p>
          </>
        )}
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link to="/" className="flex items-center justify-center px-4 py-2 font-bold tracking-widest text-white rounded-full shadow-lg bg-primary hover:bg-red-900 whitespace-nowrap">
            Về trang chủ
          </Link>
          <Link
            to="/account?tab=orders"
            className="flex items-center justify-center px-4 py-2 font-bold tracking-widest text-white rounded-full shadow-lg bg-primary hover:bg-red-900 whitespace-nowrap"
          >
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VnpayReturn

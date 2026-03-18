import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'

export const ProductItemSmall = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist()
  const productId = product.id || product._id

  return (
    <div
      className="flex flex-col items-center p-1 pb-4 bg-white transition-all duration-300 cursor-pointer h-full
          relative before:content-[''] before:absolute before:bg-transparent before:border before:border-gray-300 
          before:top-1/2 before:left-1/2 before:-translate-1/2 before:w-[calc(100%-8px)] before:h-[calc(100%-8px)] before:z-0 before:pointer-events-none
    "
    >
      <div className="relative w-full h-40 mb-4 overflow-hidden lg:h-60 group">
        <img
          src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(productId)
          }}
          className="absolute z-10 p-2 transition-all rounded-full shadow-sm top-2 right-2 bg-white/80 hover:bg-white active:scale-90"
        >
          <Heart
            size={18}
            className={isInWishlist(productId) ? 'text-[#9d0b0f] fill-[#9d0b0f]' : 'text-gray-400'}
          />
        </button>
      </div>
      <div className="flex flex-col items-center justify-between">
        <Link
          to={`/product/${productId}`}
          className="text-[15px] font-bold text-text-primary line-clamp-2 mb-1 hover:text-primary transition-colors text-center h-11 flex items-center justify-center leading-tight relative z-1"
        >
          {product.name}
        </Link>
        <p className="text-[13px] text-text-primary mb-4 text-center line-clamp-1 italic font-medium relative z-1">
          {product.slogan}
        </p>
        <Link
          to={`/product/${productId}`}
          className="text-primary border border-gray-300 px-6 py-1.5 rounded-[30px] text-sm font-bold hover:rounded-lg cursor-pointer transition-all duration-300 relative z-1 bg-white"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}

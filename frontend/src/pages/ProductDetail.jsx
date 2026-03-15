import React, { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Star,
  Phone,
  ShoppingCart,
  MessageSquare,
  User,
  Send,
  Share2,
  Copy,
  Camera,
  Video,
  Trash2,
  Play,
  X,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import { ProductItemSmall } from "./Home/ProductItemSmall";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantities, setQuantities] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          // Initialize quantities based on the number of variants
          if (data.product.variants && data.product.variants.length > 0) {
            setQuantities(new Array(data.product.variants.length).fill(0));
          } else {
            setQuantities([0]);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !product.categoryID || product.categoryID.length === 0) return;
      try {
        const categoryId = product.categoryID[0]._id || product.categoryID[0];
        const res = await fetch(`${API_URL}/api/products/search?categoryId=${categoryId}&limit=6`);
        const data = await res.json();
        if (data.success) {
          // Filter out the current product and limit to 5
          const filtered = data.products
            .filter(p => p._id !== id)
            .slice(0, 5);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product, id]);

  // Logic: Lấy mảng images từ DB, nếu không có thì fallback về trường image cũ
  const productImages =
    product?.images?.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  const nextImg = () => {
    setActiveImg((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  const prevImg = () => {
    setActiveImg((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (page = 1) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}?page=${page}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.currentPage);

        // Find if current user has a review
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const currentUser = JSON.parse(savedUser);
          const existingReview = data.reviews.find(r =>
            (r.userID && r.userID._id === currentUser._id) ||
            r.userID === currentUser._id
          );
          if (existingReview) {
            setUserReview(existingReview);
            setUserRating(existingReview.rating);
            setReviewComment(existingReview.comment);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [id, currentPage]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 10) {
      return toast.error("Bạn chỉ có thể tải lên tối đa 10 tệp!");
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("Vui lòng đăng nhập để đánh giá!");
    }

    if (!reviewComment.trim()) {
      return toast.error("Vui lòng nhập bình luận!");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("productID", id);
    formData.append("rating", userRating);
    formData.append("comment", reviewComment);
    selectedFiles.forEach((file) => {
      formData.append("images", file); // Backend expects 'images' key for both
    });

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đã gửi đánh giá thành công!");
        setReviewComment("");
        setUserRating(5);
        setSelectedFiles([]);
        setPreviews([]);
        fetchReviews();
      } else {
        toast.error(data.message || "Gửi đánh giá thất bại!");
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const VideoModal = ({ videoUrl, onClose }) => {
    if (!videoUrl) return null;

    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute text-white transition-all top-6 right-6 hover:scale-125 hover:rotate-90"
        >
          <X size={40} />
        </button>
        <div
          className="relative w-full max-w-5xl overflow-hidden bg-black aspect-video rounded-2xl shadow-2xl animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            src={videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          />
        </div>
      </div>
    );
  };

  // Logic: Use variants from backend, fallback to flat fields if none
  const variants = product?.variants && product.variants.length > 0
    ? product.variants
    : (product ? [{ label: "Giá gốc", price: product.price }] : []);

  const updateQty = (index, delta) => {
    const newQty = [...quantities];
    newQty[index] = Math.max(0, newQty[index] + delta);
    setQuantities(newQty);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  const shareUrl = encodeURIComponent(window.location.href);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  };

  const handleShareFacebook = (e) => {
    e.preventDefault();
    // Auto copy link to clipboard for manual pasting (essential for localhost)
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã copy link! Bạn hãy Dán (Ctrl+V) vào bài viết nhé.");

    const url = shareLinks.facebook;
    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      "facebook-share-dialog",
      `width=${width},height=${height},top=${top},left=${left},toolbar=0,status=0,menubar=0`,
    );
  };

  const calculateTotal = () =>
    quantities.reduce(
      (total, q, i) => total + q * (variants[i]?.price || 0),
      0,
    );

  const handleAction = (type) => {
    let hasItems = false;
    quantities.forEach((q, i) => {
      if (q > 0) {
        // Logic: Thêm vào giỏ hàng với thông tin biến thể thật
        addToCart({
          ...product,
          id: `${product._id}-${variants[i].label}`,
          name: product.name,
          label: variants[i].label,
          price: variants[i].price,
          quantity: q,
          image: productImages[0]
        });
        hasItems = true;
      }
    });
    if (!hasItems) return toast.error("Vui lòng chọn số lượng!");
    if (type === "buy_now") navigate("/cart");
    else toast.success("Đã thêm vào giỏ hàng thành công!");
  };

  // Giao diện khi đang tải
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
      </div>
    );

  // Giao diện khi không tìm thấy sản phẩm
  if (!product)
    return (
      <div className="min-h-screen p-20 font-bold text-center bg-transparent text-section">
        Sản phẩm không tồn tại!
      </div>
    );

  return (
    <div className="bg-transparent min-h-screen font-sans text-[#3e2714] pb-10">
      <div className="container px-4 py-6 mx-auto max-w-300">
        {/* Breadcrumb */}
        <div className="text-[12px] text-gray-500 mb-6 uppercase font-bold">
          Trang chủ / Sản phẩm /{" "}
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="flex flex-col items-start gap-8 mb-12 lg:flex-row">
          {/* CỘT 1: HÌNH ẢNH */}
          <div className="flex flex-col w-full gap-4 lg:w-5/12">
            <div className="relative p-2 overflow-hidden bg-white border border-gray-100 rounded-sm shadow-md">
              <div
                onClick={prevImg}
                className="absolute w-8 h-8 -translate-y-1/2 cursor-pointer top-1/2 left-2 z-3"
              >
                <img
                  alt="prev"
                  src="https://honglam.vn/_next/static/media/slick-prev-xs-hover.d0444fb5.png"
                  className="w-8 h-8"
                />
              </div>
              <div
                onClick={nextImg}
                className="absolute w-8 h-8 -translate-y-1/2 cursor-pointer top-1/2 right-2 z-3"
              >
                <img
                  alt="next"
                  src="https://honglam.vn/_next/static/media/slick-next-xs-hover.c14e777f.png"
                  className="w-8 h-8"
                />
              </div>
              <div className="flex justify-center overflow-hidden bg-white">
                <img
                  src={productImages[activeImg]}
                  className="object-contain h-100"
                  alt={product.name}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImg(i)}
                  className={`border-2 h-20 w-full object-contain cursor-pointer ${activeImg === i ? "border-primary" : "border-transparent opacity-60"}`}
                />
              ))}
            </div>
          </div>

          {/* CỘT 2: THÔNG TIN */}
          <div className="flex flex-col w-full lg:w-4/12">
            <h1 className="mb-1 text-3xl font-bold tracking-tight uppercase font-seagull text-primary">
              {product.name}
            </h1>
            <p className="text-sm text-[#88694f] mb-4 italic">
              {product.slogan || "Tinh hoa quà Việt"}
            </p>
            <div className="flex gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill="#faa519"
                  className="text-secondary"
                />
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-gray-600 mb-8 border-b border-dashed border-gray-300 pb-6 italic">
              {product.description ||
                "Sản phẩm được chế biến theo quy trình nghiêm ngặt, giữ trọn hương vị tự nhiên đặc trưng của đặc sản Hà Thành."}
            </p>

            <div className="bg-[#efe7db] rounded-lg p-1 shadow-inner overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[#88694f] font-bold border-b border-gray-300">
                    <th className="py-2 text-left pl-3 uppercase text-[10px]">
                      Khối lượng
                    </th>
                    <th className="py-2 text-center uppercase text-[10px]">
                      Giá
                    </th>
                    <th className="py-2 text-center uppercase text-[10px]">
                      Số lượng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variants.map((v, i) => (
                    <tr key={i} className="font-bold hover:bg-white/30">
                      <td className="py-4 pl-3 text-gray-700">{v.label}</td>
                      <td className="py-4 text-center text-primary">
                        {v.price.toLocaleString()}đ
                      </td>
                      <td className="flex justify-center py-4">
                        <div className="flex items-center overflow-hidden bg-white border border-gray-300 rounded">
                          <button
                            onClick={() => updateQty(i, -1)}
                            className="px-2 py-1 text-gray-400 border-r"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center">
                            {quantities[i]}
                          </span>
                          <button
                            onClick={() => updateQty(i, 1)}
                            className="px-2 py-1 text-gray-400 border-l"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <p className="mb-6 text-xl italic font-bold">
                Thành tiền:{" "}
                <span className="text-2xl font-black text-primary">
                  {calculateTotal().toLocaleString()}đ
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction("add_to_cart")}
                  className="flex-1 bg-[#f39200] text-white py-4 rounded-md font-bold uppercase tracking-widest shadow-lg active:scale-95"
                >
                  Thêm vào giỏ
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`px-4 py-4 rounded-md shadow-lg transition-all active:scale-95 border-2 ${isInWishlist(product._id)
                    ? "bg-red-50 border-[#9d0b0f] text-[#9d0b0f]"
                    : "bg-white border-gray-200 text-gray-400 hover:text-[#9d0b0f] hover:border-[#9d0b0f]"
                    }`}
                  title={isInWishlist(product._id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart size={24} fill={isInWishlist(product._id) ? "#9d0b0f" : "none"} />
                </button>
              </div>

              {/* PHẦN CHIA SẺ */}
              <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400">CHIA SẺ:</span>
                  <div className="flex gap-2">
                    {/* Facebook */}
                    <button
                      onClick={handleShareFacebook}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition-transform shadow-sm"
                      title="Chia sẻ qua Facebook"
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>

                    {/* Messenger */}
                    <a
                      href={`fb-messenger://share/?link=${shareUrl}`}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00B2FF] text-white hover:scale-110 transition-transform shadow-sm"
                      title="Chia sẻ qua Messenger"
                      onClick={(e) => {
                        if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                          handleShareFacebook(e); // Fallback to FB post dialog on desktop
                        }
                      }}
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.197 1.458 6.066 3.826 8.048V24l4.632-2.541c1.139.316 2.338.484 3.542.484 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.293 14.946l-3.32-3.535-6.48 3.535 7.128-7.567 3.32 3.535 6.48-3.535-7.128 7.567z" />
                      </svg>
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-110 transition-transform shadow-sm border border-gray-200"
                      title="Sao chép liên kết"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN ĐÁNH GIÁ & BÌNH LUẬN */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 pb-4 mb-8 border-b border-gray-100">
            <MessageSquare size={24} className="text-primary" />
            <h3 className="text-xl font-bold uppercase">
              Đánh giá & Bình luận ({reviews.length})
            </h3>
          </div>

          {/* Form đánh giá */}
          <div className="mb-12">
            <h4 className="mb-4 text-sm font-bold text-gray-500 uppercase">
              {userReview ? "Chỉnh sửa đánh giá của bạn" : "Gửi đánh giá của bạn"}
            </h4>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Đánh giá của bạn:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={24}
                        fill={star <= userRating ? "#f39200" : "none"}
                        className={star <= userRating ? "text-[#f39200]" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                    className="w-full h-32 p-4 text-sm bg-gray-50 border border-gray-200 outline-none rounded-xl focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Upload Media */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20 group">
                      {preview.type === "video" ? (
                        <div className="flex items-center justify-center w-full h-full bg-black rounded-lg">
                          <Video size={20} className="text-white" />
                        </div>
                      ) : (
                        <img src={preview.url} className="object-cover w-full h-full rounded-lg" alt="preview" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute flex items-center justify-center w-5 h-5 text-white transition-all bg-red-500 rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {previews.length < 10 && (
                    <label className="flex flex-col items-center justify-center w-20 h-20 transition-all border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5">
                      <Camera size={20} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Ảnh/Video</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 italic">Hỗ trợ tải lên tối đa 10 hình ảnh hoặc video ngắn.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-primary text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    {userReview ? "ĐANG CẬP NHẬT..." : "ĐANG GỬI..."}
                  </>
                ) : (
                  <>
                    {userReview ? "CẬP NHẬT ĐÁNH GIÁ" : "GỬI ĐÁNH GIÁ"} <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Danh sách đánh giá */}
          <div className="space-y-8">
            {reviews.length === 0 ? (
              <div className="py-10 text-center text-gray-400 italic">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="flex gap-4 pb-8 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full shrink-0">
                    {review.userID?.avatar ? (
                      <img src={review.userID.avatar} className="object-cover w-full h-full rounded-full" alt="avatar" />
                    ) : (
                      <User className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-[#5c4033]">{review.userID?.fullName || "Khách hàng"}</h5>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          fill={s <= review.rating ? "#f39200" : "none"}
                          className={s <= review.rating ? "text-[#f39200]" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {(() => {
                        const badWords = ["ngu", "chó", "đm", "vl", "vãi", "cứt", "tệ", "dở", "địt", "lồn", "cặc", "đĩ", "điếm"];
                        let text = review.comment || "";

                        const regex = new RegExp(`(${badWords.join('|')})`, 'gi');
                        const parts = text.split(regex);

                        return parts.map((part, index) => {
                          if (regex.test(part)) {
                            const firstChar = part.charAt(0);
                            const maskedText = firstChar + "*".repeat(part.length - 1);
                            return <span key={index}>{maskedText}</span>;
                          }
                          return part;
                        });
                      })()}
                    </p>

                    {/* Media trong bình luận */}
                    <div className="flex flex-wrap gap-2">
                      {review.images?.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="object-cover w-20 h-20 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                          alt="review-img"
                          onClick={() => window.open(img, "_blank")}
                        />
                      ))}
                      {review.videos?.map((video, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 bg-black rounded-lg cursor-pointer group flex items-center justify-center overflow-hidden"
                          onClick={() => setActiveVideo(video)}
                        >
                          <video src={video} className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={24} className="text-white fill-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${currentPage === 1 ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-primary border-gray-200 hover:bg-primary hover:text-white"}`}
              >
                Trước
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-white border-primary" : "text-gray-500 border-gray-200 hover:border-primary hover:text-primary"}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${currentPage === totalPages ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-primary border-gray-200 hover:bg-primary hover:text-white"}`}
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        <VideoModal videoUrl={activeVideo} onClose={() => setActiveVideo(null)} />

        {/* Sản phẩm cùng loại */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold uppercase tracking-tighter text-primary">
                Sản phẩm cùng loại
              </h3>
              <Link
                to={`/category/${product.categoryID?.[0]?.slug || ''}`}
                className="text-sm font-bold text-[#88694f] hover:text-primary transition-colors flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductItemSmall key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default ProductDetail;

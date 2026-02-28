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
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

import toast from "react-hot-toast";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantities, setQuantities] = useState([]); // Chuyển thành mảng rỗng để khởi tạo theo data

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5175/api/products");
        const data = await res.json();
        if (data.success) {
          const found = data.products.find((p) => p._id === id);
          if (found) {
            setProduct(found);
            // Logic: Khởi tạo số lượng tương ứng với số lượng biến thể từ DB
            if (found.variants) {
              setQuantities(new Array(found.variants.length).fill(0));
            }
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

  const [commentList, setCommentList] = useState([
    {
      id: 1,
      user: "Anh Tuấn",
      text: "Ô mai rất ngon, giao hàng nhanh!",
      date: "02/02/2026",
    },
    {
      id: 2,
      user: "Chị Lan",
      text: "Sản phẩm đóng gói đẹp, thích hợp làm quà biếu.",
      date: "01/02/2026",
    },
  ]);
  const [userComment, setUserComment] = useState("");

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    const newCmt = {
      id: Date.now(),
      user: "Khách hàng",
      text: userComment,
      date: "Vừa xong",
    };
    setCommentList([newCmt, ...commentList]);
    setUserComment("");
  };

  // Logic: Sử dụng trực tiếp variants từ DB thay vì tính toán x1.5 hay x2.25
  const variants = product?.variants || [];

  const updateQty = (index, delta) => {
    const newQty = [...quantities];
    newQty[index] = Math.max(0, newQty[index] + delta);
    setQuantities(newQty);
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
          name: `${product.name} ${variants[i].label}`,
          price: variants[i].price,
          quantity: q, // Truyền số lượng thực tế
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
                  onClick={() => handleAction("buy_now")}
                  className="flex-1 py-4 font-bold tracking-widest text-white uppercase rounded-md shadow-lg bg-primary active:scale-95"
                >
                  MUA NGAY
                </button>
                <button
                  onClick={() => handleAction("add_to_cart")}
                  className="flex-1 bg-[#f39200] text-white py-4 rounded-md font-bold uppercase tracking-widest shadow-lg active:scale-95"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN BÌNH LUẬN */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-3 pb-4 mb-8 border-b border-gray-100">
            <MessageSquare size={24} className="text-primary" />
            <h3 className="text-xl font-bold uppercase">
              Đánh giá & Bình luận
            </h3>
          </div>
          <form
            onSubmit={handleSendComment}
            className="flex items-start gap-4 mb-10"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full shrink-0">
              <User className="text-gray-400" />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Nhận xét của bạn..."
                className="w-full h-32 p-4 text-sm border outline-none rounded-xl focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2"
              >
                Gửi bình luận <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

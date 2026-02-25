import React, { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Star,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Phone,
  Store,
  ShoppingCart,
  MessageSquare,
  User,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// DANH SÁCH SẢN PHẨM (Y hệt bên Home.jsx)
const products = [
  {
    id: 1,
    name: "Mơ 5",
    slogan: "Chua, cay, ngọt, dẻo",
    price: 30000,
    image: "https://cdn.honglam.vn/honglam/D_HL_5_1_f485410bab_7b43e4c182.png",
    desc: "Mơ 5 Hồng Lam mang hương vị đặc trưng, kết hợp giữa vị chua thanh và cay nồng của ớt bột tinh tế.",
  },
  {
    id: 2,
    name: "Sấu bao tử",
    slogan: "Chua, cay, giòn",
    price: 55000,
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Sau_bao_tu_01_1_ed570b459b_1_38b07a16d4_1_eca889aad6.png",
    desc: "Sấu bao tử giòn tan, không hạt, thấm đượm vị mặn ngọt truyền thống Hà Thành.",
  },
  {
    id: 3,
    name: "Mơ dẻo Chùa Hương",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
    desc: "Đặc sản tâm linh vùng đất Chùa Hương, thơm mùi gừng già nồng ấm.",
  },
  {
    id: 4,
    name: "Mận dẻo đặc biệt",
    slogan: "Chua, ngọt, dẻo",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Man_deo_DB_a49979c621_78a02f0269.png",
    desc: "Từng miếng mận dẻo mềm, giữ trọn vẹn vị ngọt thanh của đường mía tinh luyện.",
  },
  {
    id: 158,
    name: "Bộ quà Sắc Hoa",
    slogan: "Tinh tế & Ý nghĩa",
    price: 605000,
    image: "https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg",
    desc: "Sắc Hoa là bản hoà ca rộn ràng của mùa xuân - thời khắc trăm hoa đua nở đón chào năm mới.",
  },
];

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();

  // --- LOGIC DỮ LIỆU ---
  const product = products.find((p) => p.id === parseInt(id));

  // Tự động cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // --- LOGIC SLIDER ẢNH ---
  const productImages = [product?.image, product?.image, product?.image]; // Giả lập mảng 3 ảnh
  const [activeImg, setActiveImg] = useState(0);

  const nextImg = () => {
    setActiveImg((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  const prevImg = () => {
    setActiveImg((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  // --- LOGIC BÌNH LUẬN ---
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

  // --- LOGIC MUA HÀNG ---
  const variants = [
    { label: "200g", price: product?.price || 0 },
    { label: "300g", price: Math.round((product?.price || 0) * 1.5) },
    { label: "450g", price: Math.round((product?.price || 0) * 2.25) },
  ];
  const [quantities, setQuantities] = useState([0, 0, 0]);

  const updateQty = (index, delta) => {
    const newQty = [...quantities];
    newQty[index] = Math.max(0, newQty[index] + delta);
    setQuantities(newQty);
  };

  const calculateTotal = () =>
    quantities.reduce((total, q, i) => total + q * variants[i].price, 0);

  const handleAction = (type) => {
    let hasItems = false;
    quantities.forEach((q, i) => {
      if (q > 0) {
        for (let n = 0; n < q; n++) {
          addToCart({
            ...product,
            id: `${product.id}-${variants[i].label}`,
            name: `${product.name} ${variants[i].label}`,
            price: variants[i].price,
          });
        }
        hasItems = true;
      }
    });
    if (!hasItems) return alert("Vui lòng chọn số lượng!");
    if (type === "buy_now") navigate("/checkout");
    else alert("Đã thêm vào giỏ hàng thành công!");
  };

  if (!product)
    return (
      <div className="p-20 text-center font-bold">Sản phẩm không tồn tại!</div>
    );

  return (
    <div className="bg-[#f7f4ef] min-h-screen font-sans text-[#3e2714] pb-10">
      <div className="container mx-auto max-w-[1200px] px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-[12px] text-gray-500 mb-6 uppercase font-bold">
          Trang chủ / Sản phẩm /{" "}
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          {/* CỘT 1: HÌNH ẢNH CÓ SLIDER */}
          <div className="lg:w-5/12 w-full flex flex-col gap-4">
            <div className="relative bg-white p-2 shadow-md border border-gray-100 rounded-sm overflow-hidden">
              {/* Nút điều hướng Trái */}
              <div
                onClick={prevImg}
                className="absolute top-1/2 left-2 z-[3] h-8 w-8 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all"
              >
                <img
                  alt="prev"
                  src="https://honglam.vn/_next/static/media/slick-prev-xs-hover.d0444fb5.png"
                  className="h-8 w-8 object-cover"
                />
              </div>

              {/* Nút điều hướng Phải */}
              <div
                onClick={nextImg}
                className="absolute top-1/2 right-2 z-[3] h-8 w-8 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all"
              >
                <img
                  alt="next"
                  src="https://honglam.vn/_next/static/media/slick-next-xs-hover.c14e777f.png"
                  className="h-8 w-8 object-cover"
                />
              </div>

              {/* Hiển thị ảnh theo Index */}
              <div className="overflow-hidden bg-white">
                <img
                  src={productImages[activeImg]}
                  className="w-full aspect-square object-contain transition-all duration-500"
                  alt=""
                />
              </div>

              <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                {activeImg + 1} / {productImages.length}
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImg(i)}
                  className={`border-2 cursor-pointer transition ${activeImg === i ? "border-primary" : "border-transparent opacity-60"}`}
                />
              ))}
            </div>

            {/* Hotline & Social */}
            <div className="mt-6 bg-white border border-gray-200 p-4 flex items-center gap-4 rounded-xl">
              <div className="p-3 bg-red-100 rounded-full text-primary shadow-inner">
                <Phone size={24} className="fill-current text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Giao hàng tận nơi
                </p>
                <p className="text-2xl font-black text-primary tracking-tighter">
                  19008122
                </p>
              </div>
            </div>
          </div>

          {/* CỘT 2: THÔNG TIN (Ở giữa) */}
          <div className="lg:w-4/12 w-full flex flex-col">
            <h1 className="text-3xl font-bold text-primary mb-1 font-serif">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-4 italic">
              {product.slogan}
            </p>
            <div className="flex gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill="#faa519"
                  className="text-[#faa519]"
                />
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-gray-600 mb-8 border-b border-dashed border-gray-300 pb-6 italic">
              {product.desc}
            </p>

            {/* Bảng giá */}
            <div className="bg-[#efe7db] rounded-lg p-1 shadow-inner overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-gray-600 font-bold border-b border-gray-300">
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
                    <tr
                      key={i}
                      className="hover:bg-white/30 transition-colors font-bold"
                    >
                      <td className="py-4 pl-3 text-gray-700">
                        {product.name} {v.label}
                      </td>
                      <td className="py-4 text-center text-gray-800">
                        {v.price.toLocaleString()}đ
                      </td>
                      <td className="py-4 flex justify-center">
                        <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                          <button
                            onClick={() => updateQty(i, -1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-400 border-r"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center">
                            {quantities[i]}
                          </span>
                          <button
                            onClick={() => updateQty(i, 1)}
                            className="px-2 py-1 hover:bg-gray-100 text-gray-400 border-l"
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
              <p className="text-xl font-bold mb-6 italic">
                Thành tiền:{" "}
                <span className="text-primary text-2xl font-black">
                  {calculateTotal().toLocaleString()}đ
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction("buy_now")}
                  className="flex-1 bg-[#800a0d] text-white py-4 rounded-md font-bold uppercase tracking-widest shadow-lg hover:bg-red-900 transition-all active:scale-95"
                >
                  MUA NGAY
                </button>
                <button
                  onClick={() => handleAction("add_to_cart")}
                  className="flex-1 bg-[#faa519] text-white py-4 rounded-md font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: PHẦN BÌNH LUẬN (Dưới cùng) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-10">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <MessageSquare size={24} className="text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-tight">
              Đánh giá & Bình luận
            </h3>
          </div>

          {/* Form nhập bình luận */}
          <form
            onSubmit={handleSendComment}
            className="mb-10 flex gap-4 items-start"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <User className="text-gray-400" />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm..."
                className="w-full border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-primary transition-all text-sm h-32"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-red-800 transition-all active:scale-95 flex items-center gap-2"
              >
                Gửi bình luận <Send size={14} />
              </button>
            </div>
          </form>

          {/* Danh sách bình luận */}
          <div className="space-y-8">
            {commentList.map((cmt) => (
              <div
                key={cmt.id}
                className="flex gap-4 border-b border-gray-50 pb-6"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center font-bold text-primary shrink-0">
                  {cmt.user.charAt(0)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-800">{cmt.user}</p>
                    <span className="text-[11px] text-gray-400">
                      {cmt.date}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        fill="#faa519"
                        className="text-[#faa519]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl">
                    {cmt.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

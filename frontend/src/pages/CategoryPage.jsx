import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Filter, ChevronDown, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const allProducts = [
  {
    id: 1,
    name: "Mơ 5",
    category: "o-mai",
    slogan: "Chua, cay, ngọt, dẻo",
    price: 30000,
    image: "https://cdn.honglam.vn/honglam/D_HL_5_1_f485410bab_7b43e4c182.png",
  },
  {
    id: 2,
    name: "Sấu bao tử",
    category: "o-mai",
    slogan: "Chua, cay, giòn",
    price: 55000,
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Sau_bao_tu_01_1_ed570b459b_1_38b07a16d4_1_eca889aad6.png",
  },
  {
    id: 10,
    name: "Mứt Dừa Non",
    category: "mut-tet",
    slogan: "Ngọt thanh, mềm",
    price: 95000,
    image: "https://cdn.honglam.vn/honglam/Mut_dua_non_01_2_0b19b280e3.jpg",
  },
  {
    id: 11,
    name: "Mứt Sen Trần",
    category: "mut-tet",
    slogan: "Ngọt, giòn, thơm",
    price: 150000,
    image: "https://cdn.honglam.vn/honglam/Mut_sen_tran_01_48d3237993.jpg",
  },
  {
    id: 20,
    name: "Bánh Chả",
    category: "banh-keo",
    slogan: "Thơm, bùi",
    price: 40000,
    image: "https://cdn.honglam.vn/honglam/Banh_cha_01_a132276db9.jpg",
  },
  {
    id: 21,
    name: "Kẹo Dồi",
    category: "banh-keo",
    slogan: "Giòn rụm, ngọt bùi",
    price: 55000,
    image: "https://cdn.honglam.vn/honglam/Keo_doi_04_4606db8a8b.png",
  },
  {
    id: 30,
    name: "Nước cốt sấu",
    category: "thuc-uong",
    slogan: "Chua, ngọt",
    price: 45000,
    image: "https://cdn.honglam.vn/honglam/Sau_ngam_duong_01_8474b94921.jpg",
  },
];

const sidebarItems = [
  { name: "Giải pháp quà tặng", slug: "giai-phap-qua-tang" },
  { name: "Ô mai (xí muội)", slug: "o-mai" },
  { name: "Mứt Tết", slug: "mut-tet" },
  { name: "Bánh - Kẹo", slug: "banh-keo" },
  { name: "Chè, Trà đặc sản", slug: "che-tra" },
  { name: "Sản phẩm khác", slug: "san-pham-khac" },
  { name: "Thức uống", slug: "thuc-uong" },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [isCatOpen, setIsCatOpen] = useState(true); // State để đóng mở danh mục

  const getCatName = (s) => {
    const item = sidebarItems.find((i) => i.slug === s);
    return item ? item.name : "Sản phẩm";
  };

  const filteredProducts = allProducts.filter((p) => p.category === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="bg-[#f7f4ef] min-h-screen font-sans text-[#3e2714]">
      {/* 1. BREADCRUMB */}
      <div className="bg-[#ede4d4] py-3 border-b border-gray-200">
        <div className="mx-auto max-w-[1200px] px-4 flex items-center gap-2 text-[12px] font-bold text-[#88694f] uppercase tracking-wider">
          <Link to="/" className="hover:text-[#9d0b0f]">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span>Sản phẩm</span>
          <ChevronRight size={14} />
          <span className="text-[#9d0b0f]">{getCatName(slug)}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* SIDEBAR BỘ LỌC */}
        <aside className="w-full md:w-[260px] shrink-0">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden sticky top-24">
            {/* Header Bộ Lọc màu Đỏ */}
            <div className="bg-[#9d0b0f] p-3 flex items-center gap-2 text-white">
              <Filter size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Bộ lọc
              </h3>
            </div>

            {/* Mục Danh mục sản phẩm */}
            <div className="p-0 border-b border-gray-100">
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="flex items-center justify-between w-full p-4 font-bold text-[13px] uppercase hover:bg-gray-50 transition-all text-[#3e2714]"
              >
                Danh mục sản phẩm
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isCatOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Vùng có thể cuộn lên xuống */}
              <div
                className={`overflow-hidden transition-all duration-300 ${isCatOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <ul className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                  {sidebarItems.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/category/${item.slug}`}
                        className={`text-[13px] block py-1.5 hover:text-[#9d0b0f] transition-colors ${slug === item.slug ? "text-[#9d0b0f] font-bold border-l-2 border-[#9d0b0f] pl-2" : "text-gray-600 pl-2"}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Banner Quảng cáo Sidebar */}
            <div className="p-4 bg-gray-50">
              <img
                src="https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg"
                className="w-full rounded border border-gray-200"
                alt="Quảng cáo"
              />
            </div>
          </div>
        </aside>

        {/* DANH SÁCH SẢN PHẨM */}
        <main className="flex-1">
          {/* Header nội dung sản phẩm */}
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 border-b border-[#9d0b0f] pb-3 gap-3">
            <h2 className="text-2xl font-bold text-[#9d0b0f] uppercase tracking-tighter">
              {getCatName(slug)}
              <span className="text-gray-400 text-sm font-normal lowercase ml-2">
                ({filteredProducts.length} sản phẩm)
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              Sắp xếp:
              <select className="border border-gray-300 rounded px-2 py-1 outline-none bg-white cursor-pointer">
                <option>Mới nhất</option>
                <option>Giá thấp đến Cao</option>
                <option>Giá cao đến thấp</option>
                <option>Sản phẩm mới</option>
                <option>Giảm giá nhiều</option>
              </select>
            </div>
          </div>

          {/* Grid Sản phẩm */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-2 border border-transparent hover:border-[#faa51980] hover:shadow-md transition-all flex flex-col group h-full"
                >
                  <Link
                    to={`/product/${p.id}`}
                    className="block overflow-hidden relative"
                  >
                    <img
                      src={p.image}
                      className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={p.name}
                    />
                  </Link>
                  <div className="p-2 text-center flex-1 flex flex-col">
                    <Link
                      to={`/product/${p.id}`}
                      className="font-bold text-sm text-[#3e2714] line-clamp-1 hover:text-[#9d0b0f] transition-colors mb-1"
                    >
                      {p.name}
                    </Link>
                    <p className="text-[11px] text-gray-400 italic mb-3 line-clamp-1">
                      {p.slogan}
                    </p>
                    <p className="text-[#9d0b0f] font-black text-base mb-4 mt-auto">
                      {p.price.toLocaleString()}đ
                    </p>
                    <button
                      onClick={() => {
                        addToCart(p);
                        alert(`Đã thêm ${p.name} vào giỏ!`);
                      }}
                      className="w-full border border-[#9d0b0f] text-[#9d0b0f] text-[11px] font-bold uppercase py-2 rounded-full hover:bg-[#9d0b0f] hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      Mua nhanh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-lg border border-dashed text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Hiện chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;

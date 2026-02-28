import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Truck, Headset, CreditCard, Gift, ChevronRight } from "lucide-react";

import Hero from "./Hero";
import CategorySection from "./CategorySection";

export const SectionHeading = ({ title, outlined }) => (
  <div className="relative flex items-center justify-center my-10 z-1">
    <hr className="z-0 flex-1 w-40 h-px mr-3 border-primary" />
    <div
      className={`${outlined ? "bg-transparent" : "bg-section"} border-primary relative z-99 flex w-fit items-center border-t border-b p-px
          
        `}
    >
      <img
        alt="left"
        src={
          outlined
            ? "https://honglam.vn/_next/static/media/btn41-bg-left-hover.a799d898.png"
            : "https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        }
        className="absolute -top-px -left-3 h-[calc(100%+2px)] w-[14px] object-contain"
      />
      <img
        alt="right"
        src={
          outlined
            ? "https://honglam.vn/_next/static/media/btn41-bg-right-hover.5de6cf95.png"
            : "https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        }
        className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
      <div className="px-6 flex items-center justify-center min-w-50 md:min-w-77.5 h-10">
        <h3
          className={`${outlined ? "text-primary" : "text-white"} text-xl md:text-2xl lg:text-[30px] font-seagull font-bold tracking-tighter leading-none flex items-center`}
        >
          {title}
        </h3>
      </div>
    </div>
    <hr className="flex-1 h-px ml-3 border-primary" />
  </div>
);

const bannerImages = [
  "https://cdn.honglam.vn/honglam/Tet_website_ab5d5cb5d1.jpg",
  "https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg",
  "https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg",
];

const products = [
  {
    id: 1,
    name: "Mơ 5",
    slogan: "Chua, cay, ngọt, dẻo",
    price: 30000,
    image: "https://cdn.honglam.vn/honglam/D_HL_5_1_f485410bab_7b43e4c182.png",
  },
  {
    id: 2,
    name: "Sấu bao tử",
    slogan: "Chua, cay, giòn",
    price: 55000,
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Sau_bao_tu_01_1_ed570b459b_1_38b07a16d4_1_eca889aad6.png",
  },
  {
    id: 3,
    name: "Mơ dẻo Chùa Hương",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
  {
    id: 4,
    name: "Mận dẻo đặc biệt",
    slogan: "Chua, ngọt, dẻo",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Man_deo_DB_a49979c621_78a02f0269.png",
  },
  {
    id: 5,
    name: "Mơ dẻo Nam Định",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
  {
    id: 6,
    name: "Mơ dẻo chua",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
];

const banhKeoProducts = [
  {
    id: 101,
    name: "Bánh mãng cầu cuộn",
    slogan: "Thơm, ngọt",
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Banh_Mang_Cau_Cuon_01_418c8793c5.jpg",
  },
  {
    id: 102,
    name: "Kẹo lạc dồi Sìu Châu",
    slogan: "Giòn tan, thơm bùi",
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Keo_siu_chau_01_97e2c0a958.jpg",
  },
  {
    id: 103,
    name: "Kẹo dồi",
    slogan: "Kẹo dồi",
    image: "https://cdn.honglam.vn/honglam/Keo_doi_04_4606db8a8b.png",
  },
];

const cheTraProducts = [
  {
    id: 201,
    name: "Trà Sen Bách Diệp",
    slogan: "Ngọt dịu, thơm hương sen",
    image: "https://cdn.honglam.vn/honglam/Tra_sen_bach_diep_01_b2657d93a1.jpg",
  },
  {
    id: 202,
    name: "Tâm sen",
    slogan: "Chát nhẹ, ngọt hậu",
    image: "https://cdn.honglam.vn/honglam/Tam_sen_01_da35c3d7b6.jpg",
  },
  {
    id: 203,
    name: "Chè (trà) Thái thượng hạng",
    slogan: "Chát nhẹ, ngọt hậu",
    image:
      "https://cdn.honglam.vn/honglam/z7151040333072_da209d58df3ad1c431f2d93f63115e6f_b2e4dbff31.jpg",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [, setEnableTransition] = React.useState(true);

  const nextBanner = () => {
    setBannerIndex((prev) => prev + 1);
  };

  const ITEMS_PER_SLIDE = 3;

  React.useEffect(() => {
    if (bannerIndex === bannerImages.length) {
      setTimeout(() => {
        setEnableTransition(false);
        setBannerIndex(0);
      }, 500);
    } else {
      setEnableTransition(true);
    }
  }, [bannerIndex]);

  // auto chạy
  React.useEffect(() => {
    const timer = setInterval(nextBanner, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-transparent">
      {/* HERO */}
      <Hero />
      {/* SECTION 2: SERVICE BAR */}
      <div className="mx-auto mt-2.5 max-w-300 px-4">
        <div className="relative bg-[rgba(255,255,255,.6)]">
          <div className="grid grid-cols-2 border border-[#c0a884] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {/* Giao hàng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-1.e3475999.png"
                    alt="giao-hang-sieu-toc"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Giao hàng siêu tốc
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Giao hàng trong 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Tư vấn */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-2.98ae416c.png"
                    alt="tu-van-mien-phi"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Tư vấn miễn phí
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Đội ngũ tư vấn tận tình
                  </p>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-3.43ac297a.png"
                    alt="thanh-toan"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Thanh toán
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Thanh toán khi nhận hàng
                  </p>
                </div>
              </div>
            </div>

            {/* Quà tặng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-4.ada696ef.png"
                    alt="giai-phap-qua-tang"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Giải pháp quà tặng
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Dành cho doanh nghiệp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SẢN PHẨM BÁN CHẠY */}
      <div className="px-4 mx-auto mt-10 text-center max-w-300 max-h-112.5">
        <SectionHeading title="Sản phẩm bán chạy" outlined />

        <div className="grid items-stretch grid-cols-2 grid-rows-3 gap-5 mt-8 md:grid-rows-2 md:grid-cols-3 max-h-112.5">
          {/* CỘT 1 - TRÊN (Sản phẩm 0) */}
          <div className="relative h-full">
            <OrangeCard product={products[0]} />
          </div>

          {/* GIỮA – CHIẾM 2 HÀNG (Sản phẩm index 1) */}
          <div className="relative h-full row-span-2 group">
            <div
              onClick={() => navigate(`/product/${products[1]?.id}`)}
              className="flex flex-col items-center w-full h-full p-8 overflow-hidden text-white shadow-md cursor-pointer "
            >
              <img
                src="https://honglam.vn/_next/static/media/bg-hot-product-3.1f862014.jpg"
                alt=""
                className="absolute inset-0 w-full h-full"
              />
              <h3 className="relative mb-1 md:text-[26px] font-bold tracking-tight uppercase z-1 font-seagull ">
                {products[1]?.name}
              </h3>
              <p className="relative mb-2 text-sm md:text-[15px] z-1">
                {products[1]?.slogan}
              </p>

              <img
                src={products[1]?.image}
                className="object-contain w-24 mb-1 transition-transform duration-500 md:w-48 drop-shadow-2xl"
                alt=""
              />

              <p className="mb-1 text-sm md:text-[15px] relatve z-1">Chỉ từ</p>
              <p className="mb-4 italic font-bold md:mb-6 md:text-3xl font-uvnvan relatve z-1">
                55.000đ
              </p>

              {/* NÚT MUA NGAY (Dẫn sang thanh toán) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(products[1]);
                  navigate(`/product/${products[1]?.id}`);
                }}
                className="relative flex items-center justify-center px-3 md:py-1 font-medium uppercase transition-all duration-150 ease-in-out border border-white rounded-[30px] text-[8px] md:text-[13px] whitespace-nowrap cursor-pointer md:w-36 hover:rounded-lg z-1"
              >
                <span>Mua ngay</span>
                <ChevronRight className="w-3 md:w-4" />
              </button>
            </div>
          </div>

          {/* CỘT 3 - TRÊN (Sản phẩm 2) */}
          <div className="relative h-full">
            <OrangeCard product={products[2]} />
          </div>

          {/* CỘT 1 - DƯỚI (Sản phẩm 3) */}
          <div className="relative h-full">
            <OrangeCard product={products[3]} />
          </div>

          {/* CỘT 3 - DƯỚI (Sản phẩm 4 hoặc lấy lại 0) */}
          <div className="relative h-full">
            <OrangeCard product={products[4] || products[0]} />
          </div>
        </div>
      </div>

      {/* SECTION 4: GIẢI PHÁP QUÀ TẶNG */}
      <div className="px-4 mx-auto text-center mt-30 max-w-300">
        <SectionHeading title="Giải pháp quà tặng, quà biếu" />
        <p className="text-secondary-2 my-5 hidden px-[12%] text-center text-sm lg:block text-gray-600 font-light leading-relaxed italic">
          Bộ quà tặng Ô mai Hồng Lam là giải pháp quà Tết, quà Trung Thu, quà lễ
          Tết,.. được lựa chọn để kết nối các mối quan hệ xã hội, kết nối tình
          thân, vun đắp các mối quan hệ thêm bền chặt gắn kết.
        </p>
        <div className="grid grid-cols-1 gap-8 mt-10 md:grid-cols-3">
          <GiftCard
            id={158}
            title="Bộ quà Sắc Hoa"
            price="605"
            img="https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg"
          />
          <GiftCard
            id={155}
            title="Bộ quà Thịnh Vượng VIP"
            price="1.465.000"
            img="https://cdn.honglam.vn/honglam/Thinh_Vuong_1_80577e5604.jpg"
          />
          <GiftCard
            id={156}
            title="Bộ quà An Khang VIP"
            price="1.215.000"
            img="https://cdn.honglam.vn/honglam/An_Khang_1_f0039c4d01.jpg"
          />
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/category/giai-phap-qua-tang"
            className="hover:text-primary group inline-flex items-center gap-2 text-base text-[#917359] font-bold transition-all underline-offset-4"
          >
            Xem tất cả sản phẩm{" "}
            <img
              src="https://honglam.vn/_next/static/media/btn-more.c2bbf147.png"
              className="h-4 transition-all group-hover:translate-x-2"
              alt="more"
            />
          </Link>
        </div>
      </div>

      {/* SECTION 5: Ô MAI (XÍ MUỘI) */}
      <CategorySection
        title="Ô mai (xí muội)"
        subtitle="Ô mai xí muội đặc sản Hà Nội"
        bannerImage="https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg"
        products={products}
        categoryLink="/category/o-mai"
      />

      {/* SECTION 5.1: BÁNH - KẸO */}
      <CategorySection
        title="Bánh - Kẹo"
        subtitle="Bánh kẹo đặc sản truyền thống"
        bannerImage="https://cdn.honglam.vn/honglam/Anh_web_Banh_keo_2_d4d154866e.jpg"
        products={banhKeoProducts}
        categoryLink="/category/banh-keo"
      />

      {/* SECTION 5.2: CHÈ, TRÀ ĐẶC SẢN */}
      <CategorySection
        title="Chè, Trà đặc sản"
        subtitle="Hương vị trà Việt tinh tế"
        bannerImage="https://cdn.honglam.vn/honglam/Anh_web_Tra_1_a6f8a30e3a.jpg"
        products={cheTraProducts}
        categoryLink="/category/che-tra"
      />

      {/* SECTION 6: TẠP CHÍ  */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* HEADER */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Tạp chí" outlined />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a
            href="/tap-chi-hong-lam"
            className="hidden text-sm text-primary text-nowrap md:block"
          >
            Xem thêm
          </a>

          <div className="hidden w-4 h-px bg-primary z-1 md:block"></div>
          <div className="border-primary z-1 hidden h-1.25 w-1.25 border md:block"></div>
        </div>

        {/* LIST */}
        <div className="mt-6 space-y-5">
          {/* Item 1 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/nhin-lai-su-kien-ra-mat-bo-suu-tap-qua-tet-2026-ma-dao-khai-xuan-cua-o-mai-hong-lam">
                <img
                  src="https://cdn.honglam.vn/honglam/8_297d391f7a.png"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/nhin-lai-su-kien-ra-mat-bo-suu-tap-qua-tet-2026-ma-dao-khai-xuan-cua-o-mai-hong-lam"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                Nhìn lại sự kiện ra mắt bộ sưu tập quà Tết 2026 “Mã đáo khai
                xuân”
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Ngày 14/12 vừa qua, tại không gian cửa hàng Ô mai Hồng Lam Lạc
                Long Quân, sự kiện ra mắt bộ sưu tập quà Tết 2026 đã diễn ra
                trong không khí ấm cúng, gần gũi…
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/o-mai-hong-lam-ghi-dau-an-tai-hoi-nghi-khoa-hoc-efsc-2025-lan-toa-tinh-hoa-qua-viet">
                <img
                  src="https://cdn.honglam.vn/honglam/01_Anh_bia_4b9d178e16.jpg"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/o-mai-hong-lam-ghi-dau-an-tai-hoi-nghi-khoa-hoc-efsc-2025-lan-toa-tinh-hoa-qua-viet"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                Ô Mai Hồng Lam ghi dấu ấn tại Hội nghị Khoa học EFSC 2025
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Ô mai Hồng Lam tham gia Hội nghị EFSC 2025 ngày 14–15/11, lan
                tỏa tinh hoa quà Việt đến đông đảo đối tác và khách tham quan…
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/hong-lam-chung-tay-ho-tro-truong-mam-non-kim-lu-thai-nguyen-sau-bao-lu">
                <img
                  src="https://cdn.honglam.vn/honglam/Thumb_4_0649d483dc.png"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/hong-lam-chung-tay-ho-tro-truong-mam-non-kim-lu-thai-nguyen-sau-bao-lu"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                Hồng Lam chung tay hỗ trợ Trường Mầm non Kim Lư (Thái Nguyên)
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Sau đợt mưa lũ kéo dài tại miền núi phía Bắc, Hồng Lam đã tổ
                chức hoạt động thiện nguyện nhằm hỗ trợ thầy cô và học sinh…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: THƯ VIỆN VIDEO */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* Header */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Thư viện Video" outlined />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a
            href="/video"
            className="hidden text-sm text-primary text-nowrap md:block"
          >
            Xem thêm
          </a>

          <div className="hidden w-4 h-px bg-primary z-1 md:block"></div>
          <div className="border-primary z-1 hidden h-1.25 w-1.25 border md:block"></div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Video lớn */}
            <a
              href="/hong-lam-gui-dang-que-nha"
              className="relative flex flex-col h-full cursor-pointer group"
            >
              <img
                src="https://cdn.honglam.vn/honglam/Hong_Lam_gui_dang_que_nha_video_thumnail_2b00974899.jpg"
                alt="Click Go gửi dáng quê nhà"
                className="flex-1 object-cover w-full"
              />

              <div className="flex items-center gap-2 mt-4">
                <div className="bg-primary group-hover:bg-secondary w-fit rounded-full p-1.5 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white"
                  >
                    <path d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-primary">
                  Click Go gửi dáng quê nhà
                </span>
              </div>
            </a>

            {/* Grid video nhỏ */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: "Ô mai Click Go - Bốn khúc tinh hoa",
                  link: "/o-mai-hong-lam-bon-khuc-tinh-hoa",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_e8477e15b1.jpg",
                },
                {
                  title:
                    'The Best Friends | Cuộc thi làm Clip "Ơn thầy nghĩa bạn"',
                  link: "/the-best-friends-cuoc-thi-lam-clip-on-thay-nghia-ban-o-mai-hong-lam",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_f5fa524c39.jpg",
                },
                {
                  title: '[ Trailer] Cuộc thi làm clip "Ơn thầy nghĩa bạn"',
                  link: "/trailer-cuoc-thi-lam-clip-on-thay-nghia-ban-o-mai-hong-lam",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_4957fa2598.jpg",
                },
                {
                  title:
                    'Ô mai Click Go - Chương trình "Lửa thử vàng" - VTVCab15',
                  link: "/o-mai-hong-lam-chuong-trinh-lua-thu-vang-vtvcab15",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_b09821392c.jpg",
                },
              ].map((video, index) => (
                <a
                  key={index}
                  href={video.link}
                  className="relative block cursor-pointer group"
                >
                  <img
                    src={video.img}
                    alt={video.title}
                    className="object-cover w-full h-40"
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-primary group-hover:bg-secondary w-fit rounded-full p-1.5 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-white"
                      >
                        <path d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4z" />
                      </svg>
                    </div>
                    <span className="font-medium line-clamp-2 text-primary">
                      {video.title}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceItem = ({ img, text, last }) => (
  <div
    className={`flex items-center gap-3 justify-center ${!last ? "border-r border-[#ded3c2]" : ""} px-4 py-2`}
  >
    <img src={img} className="h-8" alt="" />
    <div className="text-primary uppercase text-[11px] font-bold text-left leading-tight">
      {text}
    </div>
  </div>
);

const OrangeCard = ({ product }) => {
  // const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-[#f39200] p-4 text-white flex justify-between shadow-sm h-full relative overflow-hidden">
      <img
        src="https://honglam.vn/_next/static/media/bg-hot-product-3.1f862014.jpg"
        alt=""
        className="absolute inset-0 w-full h-full brightness-110"
      />
      <div className="flex flex-col items-start flex-1 text-left justify-evenly">
        <h3 className="relative text-xs font-bold sm:text-base lg:text-xl whitespace-nowrap z-1">
          {product?.name}
        </h3>
        <p className="relative text-xs lg:text-[15px] z-1 text-red">
          {product?.slogan}
        </p>

        <p className="md:text-xs lg:text-[15px] relative z-1 md:block hidden">
          Chỉ từ
        </p>
        <p className="relative text-xl lg:text-[30px] z-1 font-uvnvan italic mb-2">
          {product?.price.toLocaleString("vi")}đ
        </p>
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="relative flex items-center justify-center px-3 md:py-1 font-medium uppercase transition-all duration-150 text-[8px] md:text-[13px] whitespace-nowrap ease-in-out border border-white rounded-[30px] cursor-pointer  md:w-30 hover:rounded-lg z-1"
        >
          <span>Mua ngay</span>
          <ChevronRight className="w-4" />
        </button>
      </div>
      <img
        src={product?.image}
        className="self-center object-contain w-24 transition-transform md:w-44 drop-shadow-md group-hover:rotate-6"
      />
    </div>
  );
};

const GiftCard = ({ id, title, price, img }) => {
  const navigate = useNavigate();
  // const { addToCart } = useCart();

  return (
    <div
      className="group relative mx-1 mt-10 p-0.5 shadow-sm transition-all hover:shadow-xl"
      style={{
        boxShadow: "rgb(250, 165, 25) 0px 0px 0px 1px",
        background:
          "linear-gradient(to left, rgb(253, 216, 155), rgb(251, 242, 226))",
      }}
    >
      {/* TIÊU ĐỀ MÀU CAM */}
      <div className="absolute top-0 z-20 flex items-center -translate-x-1/2 -translate-y-1/2 left-1/2">
        <div
          className="relative flex w-fit items-center border-t border-b border-secondary p-px bg-secondary
                        before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-secondary
                        after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-secondary"
        >
          <img
            alt="left"
            src="https://honglam.vn/_next/static/media/btn41-bg-left-hover-solid-2.6831ea9d.png"
            className="absolute -top-px -left-2.75 h-[calc(100%+2px)] w-3.5 object-contain"
          />
          <div className="flex items-center justify-center bg-secondary">
            <h3 className="flex items-center h-10 px-6 text-sm font-bold tracking-tighter capitalize md:text-base text-primary whitespace-nowrap">
              {title}
            </h3>
          </div>
          <img
            alt="right"
            src="https://honglam.vn/_next/static/media/btn41-bg-right-hover-solid-2.6d26b9cf.png"
            className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
          />
        </div>
      </div>

      {/* ẢNH SẢN PHẨM: Thêm Link để click vào ảnh là chuyển trang */}
      <Link to={`/product/${id}`} className="block overflow-hidden bg-white">
        <img
          src={img}
          className="object-cover w-full transition-transform duration-500 h-80"
          alt={title}
        />
      </Link>

      <div className="relative flex items-center justify-between px-4 py-5 overflow-hidden bg-transparent">
        <img
          src="https://honglam.vn/_next/static/media/bg_img.aee452a5.png"
          className="absolute left-0 object-cover w-full h-8 bottom-full z-3"
          alt=""
        />
        <p className="text-[#88694f] font-bold text-sm italic">
          Chỉ từ {price}K
        </p>

        {/* NÚT BẤM: Sửa thành điều hướng sang trang chi tiết */}
        <button
          onClick={() => navigate(`/product/${id}`)}
          className="flex items-center gap-1 bg-white text-primary border border-primary px-4 py-1.5 rounded-[30px] text-[10px] font-bold uppercase hover:bg-primary hover:rounded-sm hover:text-white transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
        >
          Mua ngay <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const ProductItemSmall = ({ product }) => {
  // const { addToCart } = useCart();
  return (
    <div className="h-full bg-white p-1 text-center shadow-[0_3px_10px_rgba(0,0,0,.04)] transition-all flex flex-col group border hover:border-[#faa51980]">
      {/* Bọc toàn bộ bằng Link */}
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="h-40 overflow-hidden lg:h-60">
          <img
            src={product.image}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="flex flex-col items-center flex-1 p-3">
          <h3 className="text-base font-bold text-gray-800 transition-colors line-clamp-1 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mb-4 text-[13px] text-[#88694f] italic">
            {product.slogan}
          </p>
          <p className="mt-auto mb-3 font-bold text-primary">
            {product.price.toLocaleString()}đ
          </p>
          <div className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold border border-gray-200 shadow-sm rounded-[20px] px-6.25 py-1.5 text-primary hover:bg-primary hover:text-white transition-all">
            Mua nhanh
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Home;

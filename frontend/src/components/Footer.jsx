import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-10 bg-[#e0be91]/20 text-secondary-2">
      <div className="px-4 mx-auto max-w-300">
        {/* MAIN */}
        <div className="pt-10 pb-10">
          {/* TOP GRID */}
          <div className="mb-10 grid grid-cols-1 gap-8 text-[15px] md:grid-cols-2 lg:grid-cols-4">
            {/* VỀ CHÚNG TÔI */}
            <nav>
              <h3 className="mb-4 text-lg font-bold">Về chúng tôi</h3>
              <ul className="space-y-2 font-medium">
                {[
                  "Câu chuyện ",
                  "Giới thiệu chung",
                  "Nhận diện thương hiệu",
                  "Tầm nhìn",
                  "Sứ mệnh",
                  "Triết lý kinh doanh",
                  "Văn hóa công ty",
                  "Cảm nhận của khách hàng",
                  "Tuyển dụng",
                ].map((item, i) => (
                  <li key={i} className="cursor-pointer hover:text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </nav>

            {/* SẢN PHẨM */}
            <nav>
              <h3 className="mb-4 text-lg font-bold">Sản phẩm</h3>
              <ul className="space-y-2 font-medium">
                {[
                  "Giải pháp quà tặng, quà biếu",
                  "Ô mai (xí muội)",
                  "Mứt Tết",
                  "Bánh - Kẹo",
                  "Chè, Trà đặc sản",
                  "Sản phẩm khác",
                  "Thức uống",
                ].map((item, i) => (
                  <li key={i} className="cursor-pointer hover:text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </nav>

            {/* HỖ TRỢ */}
            <nav>
              <h3 className="mb-4 text-lg font-bold">Hỗ trợ khách hàng</h3>
              <ul className="space-y-2 font-medium">
                {[
                  "Chính sách bảo mật",
                  "Chính sách đổi - trả hàng",
                  "Câu hỏi thường gặp",
                  "Liên hệ",
                  "Tra cứu đơn hàng",
                ].map((item, i) => (
                  <li key={i} className="cursor-pointer hover:text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </nav>

            {/* FANPAGE FACEBOOK */}
            <div>
              <h3 className="mb-4 text-lg font-bold">Fanpage Facebook</h3>
              <iframe
                title="facebook"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61586852291537&width=340&height=130&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
                width="100%"
                height="130"
                className="overflow-hidden border-0 rounded"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>

          {/* INFO GRID */}
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 text-[15px]">
            {/* CSKH */}
            <div>
              <h3 className="mb-4 text-lg font-bold">
                Bán hàng trực tuyến & CSKH
              </h3>
              <div className="space-y-2 font-medium">
                <p className="flex gap-2">
                  <Phone size={16} className="mt-1" />
                  Hotline: 19008122 / (024) 3205 6257
                </p>
                <p className="flex gap-2">
                  <Mail size={16} className="mt-1" />
                  Website: honglam.vn
                </p>
              </div>
            </div>

            {/* CÔNG TY */}
            <div>
              <h3 className="mb-4 text-lg font-bold">
                Công ty Cổ phần ClickGo
              </h3>
              <div className="space-y-2 font-medium">
                <p className="flex gap-2">
                  <MapPin size={16} className="mt-1" />
                  KCN Quang Minh, Mê Linh, Hà Nội
                </p>
                <p className="flex gap-2">
                  <Phone size={16} className="mt-1" />
                  (024) 3818 2486
                </p>
                <p className="flex gap-2">
                  <Mail size={16} className="mt-1" />
                  ClickGo@clickgo.vn
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="border-t border-[#e0be91] pt-6 text-sm text-center">
            © 2026 ClickGo – Trao niềm tin, nhận chất lượng.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

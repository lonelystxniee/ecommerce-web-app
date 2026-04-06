import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import API_URL from "../../config/apiConfig";

const WelcomePopup = () => {
  const [popups, setPopups] = useState([]); // Chuyển thành mảng để chứa nhiều quảng cáo
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("welcome_popup_shown");

    if (!hasShown) {
      fetch(`${API_URL}/api/ads`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // SỬA TẠI ĐÂY: Dùng filter để lấy TẤT CẢ quảng cáo popup đang ACTIVE
            const activePopups = data.ads.filter(
              (ad) => ad.type === "popup" && ad.status === "ACTIVE",
            );

            if (activePopups.length > 0) {
              setPopups(activePopups);
              setTimeout(() => setIsOpen(true), 1500);
            }
          }
        });
    }
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % popups.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("welcome_popup_shown", "true");
  };

  if (!isOpen || popups.length === 0) return null;

  const currentAd = popups[currentIndex];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-lg w-full animate-zoomIn group">
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-[#f39200] transition-all p-2"
        >
          <X size={32} strokeWidth={3} />
        </button>

        {/* Nội dung quảng cáo */}
        <div className="relative overflow-hidden rounded-[40px] shadow-2xl border-4 border-white/20 bg-white">
          <a href={currentAd.link} onClick={handleClose}>
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className="w-full h-auto object-cover transition-all duration-500"
            />
          </a>

          {/* Điều hướng nếu có nhiều hơn 1 ảnh */}
          {popups.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full text-[#9d0b0f] opacity-0 group-hover:opacity-100 transition-all shadow-md"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full text-[#9d0b0f] opacity-0 group-hover:opacity-100 transition-all shadow-md"
              >
                <ChevronRight size={24} />
              </button>

              {/* Chỉ số trang (Dots) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {popups.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-[#f39200]" : "w-1.5 bg-white/50"}`}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tiêu đề quảng cáo nhỏ phía dưới */}
        <p className="text-white text-center mt-4 font-bold uppercase tracking-widest text-xs opacity-70">
          {currentAd.title} ({currentIndex + 1}/{popups.length})
        </p>
      </div>
    </div>
  );
};

export default WelcomePopup;

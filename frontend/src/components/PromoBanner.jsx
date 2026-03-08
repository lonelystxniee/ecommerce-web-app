/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";

const PromoBanner = () => {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/promotions/active-banner`);
        const data = await res.json();
        if (data.success && data.promos && data.promos.length > 0) {
          const bannerPromos = data.promos
            .filter((p) => p.isBannerActive)
            .map((p) => ({
              code: p.code,
              bannerText:
                p.bannerText ||
                `🔥 GIẢM GIÁ! Nhập mã ${p.code} để nhận thêm ưu đãi.`,
              bannerColor: p.bannerColor || "#9d0b0f",
            }));
          setPromos(bannerPromos);
        }
      } catch (error) {
        console.error("Lỗi lấy banner khuyến mãi:", error);
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    if (promos.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [promos]);

  if (promos.length === 0 || !isVisible) return null;

  const currentPromo = promos[currentIndex];

  return (
    <div
      className="promo-banner-container"
      style={{
        background: "#75080c",
        color: "white",
        minHeight: "45px",
        textAlign: "center",
        position: "relative",
        zIndex: 1000,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.9rem",
        fontWeight: "600",
        transition: "all 0.3s ease",
        overflow: "hidden",
        fontFamily: "'Momo Trust Sans', sans-serif",
      }}
    >
      {/* Background Assets */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: "150px",
          backgroundImage: `url('https://honglam.vn/_next/static/media/btn41-bg-left-hover.a799d898.png')`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left center",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "150px",
          backgroundImage: `url('https://honglam.vn/_next/static/media/btn41-bg-right-hover.5de6cf95.png')`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "relative",
          zIndex: 2,
          padding: "0 40px",
        }}
      >
        <span
          style={{
            letterSpacing: "0.02em",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          {currentPromo.bannerText}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(currentPromo.code);
            alert("Đã sao chép mã giảm giá!");
          }}
          style={{
            background: "#faa519",
            border: "none",
            color: "#9d0b0f",
            padding: "4px 14px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: "800",
            textTransform: "uppercase",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#white";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#faa519";
            e.target.style.transform = "scale(1)";
          }}
        >
          Sao chép mã
        </button>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.target.style.background = "rgba(255,255,255,0.3)")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "rgba(255,255,255,0.1)")
        }
      >
        ×
      </button>
    </div>
  );
};

export default PromoBanner;

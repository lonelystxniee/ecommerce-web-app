import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi vị trí cuộn trang để ẩn/hiện nút
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-10 right-4 z-99 animate-fade-in"
        >
          <div className="flex justify-end mt-3">
            <img
              alt="button to top"
              loading="lazy"
              width="49"
              height="68"
              className="transition-all opacity-50 cursor-pointer hover:opacity-100 hover:-translate-y-1"
              src="https://honglam.vn/_next/static/media/btn-top.29d23597.png"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SectionHeading } from './Home';
import { ProductItemSmall } from './ProductItemSmall';

const CategorySection = ({ title, subtitle, bannerImage, products, categoryLink }) => {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  const [slideIndex, setSlideIndex] = useState(0);

  React.useEffect(() => {
    if (slideIndex >= totalSlides && totalSlides > 0) {
      setSlideIndex(totalSlides - 1);
    }
  }, [totalSlides, slideIndex]);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="px-4 mx-auto mt-16 text-center max-w-300">
      <SectionHeading title={title} />
      {subtitle && <p className="text-[#88694f] my-1 text-center text-sm">{subtitle}</p>}

      <div className="flex items-stretch h-auto gap-6 mt-10">
        {/* Banner Column (Left) */}
        <div className="relative hidden h-auto overflow-hidden md:flex shrink-0 group max-w-91.25 max-h-97.5">
          <div className="absolute border border-white pointer-events-none top-2 right-2 bottom-2 left-2 z-2"></div>
          <img
            src={bannerImage}
            className="relative object-cover w-full h-full transition-transform duration-1000 ease-out z-1 group-hover:scale-110"
            alt={`${title} banner`}
          />
        </div>

        {/* Products Column (Right) */}
        <div className="relative flex flex-col justify-between flex-1 min-w-0">
          <div className="relative">
            {/* Navigation Buttons */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className={`absolute w-10 h-10 -translate-y-1/2 cursor-pointer top-1/2 -left-3 md:-left-5 z-10 transition-all duration-300 hover:scale-110 ${slideIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <img
                    alt="prev"
                    src="https://honglam.vn/_next/static/media/slick-prev-xs-hover.d0444fb5.png"
                    className="w-full h-full drop-shadow-md"
                  />
                </button>
                <button
                  onClick={nextSlide}
                  className={`absolute w-10 h-10 -translate-y-1/2 cursor-pointer top-1/2 -right-3 md:-right-5 z-10 transition-all duration-300 hover:scale-110 ${slideIndex === totalSlides - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <img
                    alt="next"
                    src="https://honglam.vn/_next/static/media/slick-next-xs-hover.c14e777f.png"
                    className="w-full h-full drop-shadow-md"
                  />
                </button>
              </>
            )}

            {/* Product Items Slider */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                }}
              >
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <div
                    key={i}
                    className={`grid min-w-full gap-5 px-1`}
                    style={{
                      gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))`,
                    }}
                  >
                    {products
                      .slice(i * itemsPerSlide, i * itemsPerSlide + itemsPerSlide)
                      .map((p) => (
                        <ProductItemSmall key={p.id || p.name} product={p} />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="absolute flex justify-center gap-3 mt-8 -translate-x-1/2 -bottom-8 left-1/2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className="transition-all duration-200 focus:outline-none hover:scale-125"
                >
                  <img
                    src={
                      slideIndex === i
                        ? 'https://honglam.vn/_next/static/media/slick-dot-active.e0c701e2.png'
                        : 'https://honglam.vn/_next/static/media/slick-dot.1e11291d.png'
                    }
                    className="w-4"
                    alt={`dot-${i}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View All Link */}
      <div className="flex justify-center mt-12">
        <Link
          to={categoryLink}
          className="hover:text-primary group inline-flex items-center gap-2 text-base text-[#917359] font-bold transition-all underline-offset-4"
        >
          Xem tất cả sản phẩm{' '}
          <img
            src="https://honglam.vn/_next/static/media/btn-more.c2bbf147.png"
            className="h-4 transition-all group-hover:translate-x-2"
            alt="more"
          />
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;

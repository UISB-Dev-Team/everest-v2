"use client";

import { useState, type ReactNode, type TouchEvent } from "react";

interface CarouselProps {
  children: ReactNode[];
  showIndicators?: boolean;
  className?: string;
  indicatorClassName?: string;
  activeIndicatorClassName?: string;
  inactiveIndicatorClassName?: string;
  minSwipeDistance?: number;
}

export function Carousel({
  children,
  showIndicators = true,
  className = "",
  indicatorClassName = "",
  activeIndicatorClassName = "w-6 sm:w-8 bg-[#2E7D32]",
  inactiveIndicatorClassName = "w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400 active:bg-slate-500",
  minSwipeDistance = 50,
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalSlides = children.length;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }
  };

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0 px-1 sm:px-2">
              {child}
            </div>
          ))}
        </div>
      </div>

      {showIndicators && totalSlides > 1 && (
        <div
          className={`flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 ${indicatorClassName}`}
        >
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 touch-manipulation ${
                currentSlide === index
                  ? activeIndicatorClassName
                  : inactiveIndicatorClassName
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

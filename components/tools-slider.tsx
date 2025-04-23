"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode, useRef } from "react";

interface ToolsSliderProps {
  children: ReactNode;
}

export default function ToolsSlider({ children }: ToolsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Slider Navigation */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Horizontal Scrolling Container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </div>
  );
} 
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BannerSlide {
  image: string;
  title: string;
  description: string;
  cta: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
}

export default function HeroBanner({ slides }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentBanner = slides[currentSlide];

  return (
    <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-muted">
      <div className="absolute inset-0">
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-hero-title">
            {currentBanner.title}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90" data-testid="text-hero-description">
            {currentBanner.description}
          </p>
          <Button 
            size="lg" 
            variant="default"
            className="backdrop-blur-md"
            data-testid="button-hero-cta"
          >
            {currentBanner.cta}
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
            data-testid={`button-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { IHeroSlide } from '../../types';
import { api } from '../../services/api';
import { getOptimizedImageUrl, getImageSrcSet, IMAGE_SIZES } from '../../utils/imageOptimizer';

const DEFAULT_SLIDES: IHeroSlide[] = [
  {
    _id: 'eid-edit',
    tag: 'Limited Festive Drop',
    title: 'Eid Edit 2026',
    subtitle: 'Up to 30% Off Haute Couture Ensembles',
    description:
      'Handcrafted zari, resham and tilla embroidery on pure swiss lawn & chiffon. Express Cash on Delivery nationwide.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=80',
    ctaText: 'Shop Eid Edit',
    secondaryCta: 'View Festive Wear',
    category: 'Festive Wear',
    fabric: 'Organza',
    active: true,
  },
  {
    _id: 'summer-lawn',
    tag: 'New Season Arrival',
    title: 'Summer Voile & Lawn',
    subtitle: 'Breezy Swiss Weaves & Floral Prints',
    description:
      'Ultra-breathable summer textures crafted for effortless daytime sophistication and evening comfort.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=80',
    ctaText: 'Explore Summer Edit',
    secondaryCta: 'Shop Swiss Lawn',
    category: 'Summer',
    fabric: 'Lawn',
    active: true,
  },
  {
    _id: 'winter-shawl',
    tag: 'Regal Ensembles',
    title: 'Winter Luxury & Shawls',
    subtitle: 'Pashmina, Raw Silk & Embroidered Velvet',
    description:
      'Rich jewel tones, heavy embroidered borders and handcrafted warm shawls for statement occasions.',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=80',
    ctaText: 'Explore Winter',
    secondaryCta: 'View Luxury Pret',
    category: 'Winter',
    fabric: 'Jacquard',
    active: true,
  },
  {
    _id: 'azadi-heritage',
    tag: 'Heritage Collection',
    title: 'Imperial Gents Boski & Pret',
    subtitle: 'Authentic 10-Pound Boski Silk & Cotton',
    description:
      'Traditional heritage wear tailored for gentlemen. Genuine gold seal fabric with flawless drape and luxury finish.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80',
    ctaText: 'Shop Gents Boski',
    secondaryCta: 'View All Designs',
    category: 'Boski',
    fabric: 'Boski',
    active: true,
  },
];

interface HeroCarouselProps {
  onSelectCategory: (category: string, fabric?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [slides, setSlides] = useState<IHeroSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch dynamic hero slides from Admin API
  useEffect(() => {
    let isMounted = true;
    const fetchSlides = async () => {
      try {
        const res = await api.getHeroSlides();
        if (isMounted && Array.isArray(res)) {
          const activeOnly = res.filter((s) => s.active !== false);
          if (activeOnly.length > 0) {
            setSlides(activeOnly);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic hero slides:', err);
      }
    };

    fetchSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  // Auto-play timer
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // Safe slide index
  const safeCurrent = current >= totalSlides ? 0 : current;
  const slide = slides[safeCurrent] || DEFAULT_SLIDES[0];

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div
      className="relative bg-stone-950 text-white overflow-hidden select-none min-h-[460px] sm:min-h-[520px] md:min-h-[560px] flex items-center shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Seasonal Campaigns Carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide._id || safeCurrent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {/* Responsive WebP Hero Image with Core Web Vitals optimization */}
          <picture className="absolute inset-0 block w-full h-full">
            {getImageSrcSet(slide.image, [640, 1024, 1440, 1920], 85) && (
              <source
                type="image/webp"
                srcSet={getImageSrcSet(slide.image, [640, 1024, 1440, 1920], 85)}
                sizes={IMAGE_SIZES.heroBanner}
              />
            )}
            <img
              src={getOptimizedImageUrl(slide.image, 1600, 85, 'webp')}
              srcSet={getImageSrcSet(slide.image, [640, 1024, 1440, 1920], 85)}
              sizes={IMAGE_SIZES.heroBanner}
              alt={slide.title}
              className="w-full h-full object-cover object-center transition-transform duration-10000 ease-out transform scale-105"
              loading={safeCurrent === 0 ? 'eager' : 'lazy'}
              fetchPriority={safeCurrent === 0 ? 'high' : 'auto'}
              decoding={safeCurrent === 0 ? 'sync' : 'async'}
            />
          </picture>

          {/* Multi-layered luxury vignette overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/40 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-stone-950/30 to-stone-950/80 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide._id || safeCurrent}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl space-y-3.5 sm:space-y-4"
          >
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{slide.tag || 'Special Campaign'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-md">
              {slide.title}
            </h1>

            {/* Subtitle with Gold Accent */}
            <p className="text-amber-200/95 font-semibold text-sm sm:text-base tracking-wide flex items-center gap-2">
              <span className="w-6 h-[1.5px] bg-amber-400 inline-block" />
              <span>{slide.subtitle}</span>
            </p>

            {/* Description */}
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-lg">
              {slide.description}
            </p>

            {/* Value Proposition Micro-Pill */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-300">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Authentic Fabric</span>
              </span>
              <span className="text-stone-600">•</span>
              <span>Express Cash on Delivery</span>
            </div>

            {/* Action Buttons (Min 44px tap targets) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectCategory(slide.category || 'all', slide.fabric)}
                className="min-h-[46px] px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>{slide.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectCategory('all', slide.fabric)}
                className="min-h-[46px] px-5 py-3 bg-stone-900/80 hover:bg-stone-800 text-stone-100 font-semibold text-xs uppercase tracking-wider rounded-xl border border-stone-700/80 hover:border-amber-500/50 backdrop-blur-md transition-all shadow-md"
              >
                {slide.secondaryCta || 'Explore All Designs'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls: Left / Right Arrows (Min 44x44px tap targets) */}
      {totalSlides > 1 && (
        <>
          <div className="absolute z-20 inset-y-0 left-2 sm:left-4 flex items-center">
            <button
              onClick={handlePrev}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-stone-950/60 hover:bg-amber-500 hover:text-stone-950 text-stone-300 border border-stone-800 backdrop-blur-md transition-all flex items-center justify-center shadow-lg"
              aria-label="Previous Campaign Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute z-20 inset-y-0 right-2 sm:right-4 flex items-center">
            <button
              onClick={handleNext}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-stone-950/60 hover:bg-amber-500 hover:text-stone-950 text-stone-300 border border-stone-800 backdrop-blur-md transition-all flex items-center justify-center shadow-lg"
              aria-label="Next Campaign Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute z-20 bottom-3 sm:bottom-4 inset-x-0 flex justify-center items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s._id || idx}
                onClick={() => setCurrent(idx)}
                className="min-h-[44px] min-w-[28px] flex items-center justify-center transition-all"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    safeCurrent === idx
                      ? 'w-8 h-2 bg-gradient-to-r from-amber-400 to-amber-300 shadow-md'
                      : 'w-2 h-2 bg-stone-600 hover:bg-stone-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

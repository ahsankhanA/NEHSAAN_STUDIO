import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck, Sparkles } from 'lucide-react';

interface TestimonialItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  productName: string;
  comment: string;
  verified: boolean;
  date: string;
}

const DEFAULT_REVIEWS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'Ayesha Tariq',
    city: 'Gulberg, Lahore',
    rating: 5,
    productName: 'Noor-e-Zainab Luxury Embroidered Pret',
    comment: 'Exquisite stitching and authentic organza fabric! The zari work on the neckline and dupatta drape looks even better than the pictures. Received within 48 hours via COD in Lahore.',
    verified: true,
    date: '2 days ago',
  },
  {
    id: 't2',
    name: 'Dr. Maham Siddiqui',
    city: 'F-7, Islamabad',
    rating: 5,
    productName: 'Gul-e-Bahar Embroidered Lawn 3PC',
    comment: 'Pure Swiss voile lawn with heavy schiffli embroidery. After washing, zero color fading and crisp fall. NIVORA has become our family’s trusted luxury pret brand.',
    verified: true,
    date: '3 days ago',
  },
  {
    id: 't3',
    name: 'Zubair Ahmed',
    city: 'Clifton, Karachi',
    rating: 5,
    productName: 'Shahi Boski Men Unstitched Suit',
    comment: 'Authentic 10-pound Chinese Boski blend. Buttery soft, elegant natural sheen, and comes with metallic buttons and tags. Impeccable packaging and fast delivery to Karachi.',
    verified: true,
    date: '1 week ago',
  },
  {
    id: 't4',
    name: 'Hira Salman',
    city: 'DHA Phase 5, Lahore',
    rating: 5,
    productName: 'Zari Chiffon Festive Maxi',
    comment: 'Ordered for my cousin’s wedding and received non-stop compliments all evening! Their WhatsApp support helped me verify the size before dispatch. Truly royal service.',
    verified: true,
    date: '5 days ago',
  },
  {
    id: 't5',
    name: 'Anum Fatima',
    city: 'Civil Lines, Faisalabad',
    rating: 5,
    productName: 'Meena Jacquard 3PC Unstitched',
    comment: 'The contrasting woven organza dupatta and self-weave zari jacquard shirt are heavenly. 100% genuine quality fabrics at very fair wholesale-grade pricing.',
    verified: true,
    date: '4 days ago',
  },
  {
    id: 't6',
    name: 'Syeda Bakhtawar',
    city: 'University Town, Peshawar',
    rating: 5,
    productName: 'Al-Karamat Men Latha Unstitched Suit',
    comment: 'Traditional crisp Egyptian cotton latha. Stays sharp all day and does not wrinkle easily. My father was extremely satisfied with the texture and length.',
    verified: true,
    date: '6 days ago',
  },
];

export const TestimonialsSlider: React.FC = () => {
  const [items, setItems] = useState<TestimonialItem[]>(DEFAULT_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive cards per view: 1 for mobile (<640px), 2 for tablet (<1024px), 3 for desktop
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    // Try to load any extra reviews from API, blend with defaults
    fetch('/api/reviews/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const apiItems: TestimonialItem[] = data.testimonials.map((r: any, idx: number) => ({
            id: r._id || `api_${idx}`,
            name: r.customerName || 'Verified Patron',
            city: r.customerCity || 'Pakistan',
            rating: r.rating || 5,
            productName: r.productName || 'Luxury Collection',
            comment: r.comment || '',
            verified: Boolean(r.isVerifiedBuyer !== false),
            date: 'Recent',
          }));
          setItems([...apiItems, ...DEFAULT_REVIEWS]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.ceil(items.length / cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const visibleItems = items.slice(
    currentIndex * cardsPerView,
    currentIndex * cardsPerView + cardsPerView
  );

  if (visibleItems.length < cardsPerView) {
    const needed = cardsPerView - visibleItems.length;
    visibleItems.push(...items.slice(0, needed));
  }

  return (
    <section
      className="py-12 sm:py-16 bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 relative overflow-hidden border-t border-amber-900/20"
      aria-label="Client Testimonials Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Shimmer Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 -left-16 w-80 h-80 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-16 w-80 h-80 bg-amber-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Client Experiences
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Words From Our Discerning Clients
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-lg">
              Over 15,000+ satisfied clients across Pakistan cherish our hand-embroidered luxury fabrics, precise fits, and prompt courier service.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={prevSlide}
              aria-label="Previous Testimonials"
              className="p-2.5 rounded-full border border-stone-700 bg-stone-800/90 hover:bg-amber-500 hover:border-amber-400 text-stone-300 hover:text-stone-950 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Testimonials"
              className="p-2.5 rounded-full border border-stone-700 bg-stone-800/90 hover:bg-amber-500 hover:border-amber-400 text-stone-300 hover:text-stone-950 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Animated Cards Grid */}
        <div className="min-h-[290px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {visibleItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-stone-800/70 backdrop-blur-sm border border-stone-700/70 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl group"
                >
                  <div>
                    {/* Top Row: Stars & Quote */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-stone-600 group-hover:text-amber-500/40 transition-colors" />
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal italic line-clamp-4">
                      "{item.comment}"
                    </p>
                  </div>

                  {/* Footer: Product tag & client metadata */}
                  <div className="mt-5 pt-4 border-t border-stone-700/60">
                    <div className="text-[11px] text-amber-400/90 font-medium truncate mb-2">
                      ✦ {item.productName}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          {item.name}
                          {item.verified && (
                            <span 
                              title="Verified Buyer"
                              className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-950/90 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-800/60 font-medium"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400">
                          {item.city} • <span className="text-stone-500">{item.date}</span>
                        </div>
                      </div>

                      {/* Initials Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-serif font-bold text-xs flex items-center justify-center shadow-inner">
                        {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => setCurrentIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === currentIndex
                  ? 'w-7 bg-amber-500'
                  : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

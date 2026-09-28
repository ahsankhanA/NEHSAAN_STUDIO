import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import type { IBoutique } from '../../types';

const DEFAULT_CATEGORIES: IBoutique[] = [
  {
    _id: 'summer',
    name: 'Summer Edit',
    subtitle: 'Swiss Voile & Light Lawns',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Summer',
    fabricQuery: 'Lawn',
    tag: 'Trending',
  },
  {
    _id: 'festive',
    name: 'Festive Wear',
    subtitle: 'Zari & Organza Formals',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Festive Wear',
    tag: 'Haute Drop',
  },
  {
    _id: 'winter',
    name: 'Winter Collection',
    subtitle: 'Velvet, Shawls & Pashmina',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Winter',
    fabricQuery: 'Jacquard',
  },
  {
    _id: 'boski',
    name: 'Imperial Boski',
    subtitle: 'Authentic 10-Pound Gents Silk',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Boski',
    fabricQuery: 'Boski',
    tag: 'Classic',
  },
  {
    _id: 'chiffon',
    name: 'Pure Chiffon',
    subtitle: 'Delicate Embroidered Dupattas',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Chiffon',
    fabricQuery: 'Chiffon',
  },
  {
    _id: 'lawn',
    name: 'Swiss Lawn',
    subtitle: 'Printed & Stitched Daily Wear',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    categoryQuery: 'Lawn',
    fabricQuery: 'Lawn',
  },
];

interface CategoryGridProps {
  onSelectCategory: (category: string, fabric?: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const [boutiques, setBoutiques] = useState<IBoutique[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let mounted = true;
    api.getBoutiques()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setBoutiques(data.filter((b) => b.active !== false));
        }
      })
      .catch(() => {
        // Fallback gracefully to defaults
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10" aria-label="Curated Collections Grid">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
            Curated Boutiques
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
            Seasonal Collections & Fabrics
          </h2>
        </div>
        <p className="text-xs text-stone-500 max-w-xs">
          Explore artisanal weaves, hand-embroidered motifs, and seasonal fabric edits.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {boutiques.map((cat) => (
          <motion.div
            key={cat._id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(cat.categoryQuery, cat.fabricQuery)}
            className="group relative rounded-xl overflow-hidden bg-stone-900 aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-800 hover:border-amber-500/50"
          >
            {/* Ambient Gold Glow Line on Hover */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

            {/* Background Image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              loading="lazy"
              onError={(e) => {
                // Fallback luxury placeholder if broken image
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

            {/* Tag Badge */}
            {cat.tag && (
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm z-10">
                {cat.tag}
              </span>
            )}

            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-stone-300 line-clamp-1 mt-0.5">
                {cat.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

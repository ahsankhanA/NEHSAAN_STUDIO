import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  message = 'Curating Exclusive Collections & Artisanal Weaves...',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="nehsaan-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-stone-100 select-none px-4"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/15 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-sm relative z-10"
          >
            {/* Crown / Monogram Crest */}
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-[1.5px] shadow-2xl shadow-amber-500/20">
                <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  {/* Subtle inner shimmer */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent"
                  />
                  <span className="font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                    N
                  </span>
                </div>
              </div>

              {/* Orbiting Sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute -inset-2 pointer-events-none"
              >
                <div className="w-3 h-3 bg-amber-400 rounded-full blur-[1px] shadow-sm shadow-amber-300" />
              </motion.div>
            </div>

            {/* Brand Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.25em] text-white uppercase">
              NEHSAAN
            </h1>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold mt-1">
              Haute Couture • Islamabad
            </p>

            {/* Elegant Divider */}
            <div className="flex items-center gap-2 my-5 w-40">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/60" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>

            {/* Dynamic Status Message */}
            <p className="text-xs text-stone-400 font-light tracking-wide max-w-xs">
              {message}
            </p>

            {/* Linear Shimmer Bar */}
            <div className="w-48 h-1 bg-stone-800 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

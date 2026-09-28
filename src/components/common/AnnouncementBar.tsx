import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementBarProps {
  text?: string;
  linkText?: string;
  onActionClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = 'EID EDIT — UP TO 30% OFF | SHOP NOW',
  linkText,
  onActionClick,
}) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('nehsaan_announcement_dismissed');
      // If the text has changed or was never dismissed, show it
      if (dismissed !== text) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [text]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      localStorage.setItem('nehsaan_announcement_dismissed', text);
    } catch {}
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-amber-200 text-xs font-medium border-b border-amber-900/40 z-40 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-center sm:text-left">
          <div
            onClick={onActionClick}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer hover:text-white transition-colors flex-wrap"
          >
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 shrink-0">
              <Sparkles className="w-3 h-3" />
              Limited Drop
            </span>
            <span className="font-serif tracking-wide text-xs sm:text-sm font-semibold">
              {text}
            </span>
            {linkText && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-400 font-bold underline underline-offset-2 ml-1">
                {linkText}
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
            title="Dismiss Announcement"
            aria-label="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

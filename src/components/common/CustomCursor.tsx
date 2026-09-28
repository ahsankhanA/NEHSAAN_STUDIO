import React, { useEffect, useState, useRef } from 'react';

/**
 * Subtle Fashion-Themed Custom Cursor for Desktop Pointer Devices
 * - Pure hardware-accelerated transform3d
 * - Disabled on touch/mobile devices via (hover: hover) and (pointer: fine)
 * - Zero interference with clicking (pointer-events: none)
 * - Respects prefers-reduced-motion
 */
export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  useEffect(() => {
    // Precise hardware pointer detection
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mediaQuery.matches) {
      return;
    }

    setIsEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
        setIsHoveringInteractive(!!interactive);
      }
    };

    const render = () => {
      if (reducedMotionQuery.matches) {
        ringX = mouseX;
        ringY = mouseY;
      } else {
        // Smooth linear interpolation for ring
        ringX += (mouseX - ringX) * 0.25;
        ringY += (mouseY - ringY) * 0.25;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(render);

    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsEnabled(e.matches);
    };
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      mediaQuery.removeEventListener('change', onMediaChange);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {/* Outer Fashion Ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 -ml-3.5 -mt-3.5 transition-transform duration-75 ease-out"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`w-7 h-7 rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
            isHoveringInteractive
              ? 'border-amber-600 scale-125 bg-amber-600/10'
              : 'border-stone-700/60 scale-100'
          }`}
        >
          {/* Subtle Atelier Crosshair Accents */}
          <span className="w-1 h-px bg-amber-700/50 absolute left-0 -ml-1"></span>
          <span className="w-1 h-px bg-amber-700/50 absolute right-0 -mr-1"></span>
        </div>
      </div>

      {/* Center Golden Stitch Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1"
        style={{ willChange: 'transform' }}
      >
        <div
          className={`w-2 h-2 rounded-full transition-transform duration-150 ${
            isHoveringInteractive ? 'bg-amber-600 scale-150' : 'bg-stone-900 scale-100'
          }`}
        />
      </div>
    </div>
  );
};

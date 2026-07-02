import { useState, useEffect } from 'react';

/**
 * Detects when the "compact" touch-first layout should be used
 * (bottom nav, FAB cart, sheet modals) instead of the desktop
 * sidebar + side-panel layout.
 *
 * Width alone isn't enough — a phone in landscape (e.g. 926×428)
 * can be WIDER than a tablet held in portrait (e.g. 768×1024), so
 * we also flip to compact mode when the viewport is short, which
 * reliably catches landscape phones regardless of their width.
 */
export function useIsMobile(widthBreakpoint = 820, heightBreakpoint = 540) {
  const compute = () =>
    window.innerWidth <= widthBreakpoint || window.innerHeight <= heightBreakpoint;

  const [isMobile, setIsMobile] = useState(compute);

  useEffect(() => {
    const widthQuery  = window.matchMedia(`(max-width: ${widthBreakpoint}px)`);
    const heightQuery = window.matchMedia(`(max-height: ${heightBreakpoint}px)`);
    const update = () => setIsMobile(widthQuery.matches || heightQuery.matches);

    widthQuery.addEventListener('change', update);
    heightQuery.addEventListener('change', update);
    window.addEventListener('orientationchange', update);
    update();

    return () => {
      widthQuery.removeEventListener('change', update);
      heightQuery.removeEventListener('change', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [widthBreakpoint, heightBreakpoint]);

  return isMobile;
}

/** True for real tablet-sized viewports (not phone, not full desktop). Useful for 3-column grids etc. */
export function useIsTablet() {
  const compute = () => window.innerWidth > 820 && window.innerWidth <= 1180;
  const [isTablet, setIsTablet] = useState(compute);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 821px) and (max-width: 1180px)');
    const update = () => setIsTablet(mq.matches);
    mq.addEventListener('change', update);
    update();
    return () => mq.removeEventListener('change', update);
  }, []);

  return isTablet;
}

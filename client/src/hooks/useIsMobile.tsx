import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  // Initialize with actual screen size to prevent desktop flash on mobile
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}

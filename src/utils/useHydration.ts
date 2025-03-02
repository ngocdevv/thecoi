import { useState, useEffect } from 'react';

/**
 * Custom hook to safely handle hydration
 * Returns true when the component has been hydrated on the client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  // This effect only runs once on the client after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
} 
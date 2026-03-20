import { useState, useEffect } from 'react';

export function useContainerSize(ref) {
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

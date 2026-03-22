import { useState, useCallback, useRef } from 'react';

export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const notify = useCallback(
    (message, type = 'ok') => {
      clearTimer();
      setToast({ message, type });
      // Progress and warning toasts stay until explicitly replaced
      if (type !== 'progress') {
        timerRef.current = setTimeout(() => setToast(null), type === 'warning' ? 5000 : duration);
      }
    },
    [duration]
  );

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, []);

  return { toast, notify, dismiss };
}

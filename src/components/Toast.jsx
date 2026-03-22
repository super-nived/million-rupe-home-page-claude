import { useEffect, useState } from 'react';

const TYPE_CONFIG = {
  ok:       { bg: '#064e3b', border: '#10b981', icon: '✓' },
  err:      { bg: '#7f1d1d', border: '#ef4444', icon: '✕' },
  progress: { bg: '#1e1b4b', border: '#6366f1', icon: null },
  warning:  { bg: '#78350f', border: '#f59e0b', icon: '!' },
};

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'toastSpin .6s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (toast) {
      setCurrent(toast);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setCurrent(null), 250);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!current) return null;

  const cfg = TYPE_CONFIG[current.type] || TYPE_CONFIG.ok;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: `translateX(-50%) translateY(${visible ? '0' : '-12px'})`,
          opacity: visible ? 1 : 0,
          background: cfg.bg,
          borderLeft: `3px solid ${cfg.border}`,
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          zIndex: 999,
          boxShadow: '0 6px 28px rgba(0,0,0,.5)',
          transition: 'all .25s cubic-bezier(.4,0,.2,1)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          maxWidth: 'min(400px, calc(100vw - 32px))',
          pointerEvents: 'none',
        }}
      >
        {current.type === 'progress' ? (
          <Spinner />
        ) : cfg.icon ? (
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: cfg.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </span>
        ) : null}
        <span>{current.message}</span>
      </div>
      <style>{`@keyframes toastSpin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

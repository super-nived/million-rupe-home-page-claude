export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: toast.type === 'err' ? '#7f1d1d' : '#064e3b',
        color: '#fff',
        padding: '9px 18px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 999,
        boxShadow: '0 6px 28px rgba(0,0,0,.5)',
        animation: 'slideDown .25s ease',
      }}
    >
      {toast.message}
    </div>
  );
}

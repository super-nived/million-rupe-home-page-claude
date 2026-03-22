import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideTicketModal } from '../../features/lottery/lotterySlice';
import { fmtRupees, formatTicketId } from '../../utils/formatters';
import { colors } from '../../styles/theme';

export default function TicketCardModal() {
  const dispatch = useDispatch();
  const { showTicket, ticketData } = useSelector((s) => s.lottery);
  const cardRef = useRef(null);

  if (!showTicket || !ticketData) return null;

  const ticket = ticketData;
  const pixels = ticket.bw * ticket.bh;

  const handleShare = async () => {
    const text = `I just bought ${pixels} pixels on PixelLakh.in for ${fmtRupees(pixels)}! Ticket ${formatTicketId(ticket.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PixelLakh.in', text, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div
      onClick={() => dispatch(hideTicketModal())}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        animation: 'fadeIn .25s ease',
      }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(360px, calc(100vw - 32px))',
          background: `linear-gradient(135deg, #0f0f1a 0%, #1a1025 100%)`,
          border: `1px solid ${colors.accent}33`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 20px 60px rgba(0,0,0,.6), 0 0 40px ${colors.accent}15`,
          animation: 'ticketSlideUp .35s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header stripe */}
        <div
          style={{
            background: `linear-gradient(90deg, ${colors.accent}, #d97706)`,
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>
              PixelLakh.in
            </div>
            <div style={{ fontSize: 9, color: '#00000088', fontWeight: 600 }}>
              PURCHASE TICKET
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>
            {formatTicketId(ticket.id)}
          </div>
        </div>

        {/* Tear line */}
        <div style={{
          height: 1,
          backgroundImage: `repeating-linear-gradient(90deg, ${colors.accent}44 0 6px, transparent 6px 12px)`,
        }} />

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          {/* Ad info */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
              {ticket.label}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              by {ticket.owner}
            </div>
          </div>

          {/* Grid info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <InfoBlock label="Pixels" value={pixels.toLocaleString('en-IN')} />
            <InfoBlock label="Amount" value={fmtRupees(pixels)} accent />
            <InfoBlock label="Position" value={`(${ticket.bx}, ${ticket.by})`} />
            <InfoBlock label="Size" value={`${ticket.bw} × ${ticket.bh}`} />
          </div>

          {/* Date */}
          <div style={{ fontSize: 10, color: colors.textDimmest, marginBottom: 16 }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: `1px solid ${colors.borderLight}`,
                color: colors.text,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              Share
            </button>
            <button
              onClick={() => dispatch(hideTicketModal())}
              style={{
                flex: 1,
                padding: '10px 0',
                background: colors.accent,
                border: 'none',
                color: '#000',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, accent }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '8px 10px',
      }}
    >
      <div style={{ fontSize: 9, color: colors.textDimmest, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ? colors.accent : colors.text }}>
        {value}
      </div>
    </div>
  );
}

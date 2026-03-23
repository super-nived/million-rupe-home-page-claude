import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideTicketModal } from '../../features/lottery/lotterySlice';
import { fmtRupees, formatTicketId } from '../../utils/formatters';
import { colors } from '../../styles/theme';
import { playCrateReveal } from '../../utils/sounds';

const STAGES = { CRATE: 0, SHAKE: 1, BURST: 2, REVEAL: 3, CARD: 4 };

function BurstParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 400;
    const h = canvas.height = 400;
    const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fff', '#d97706'];
    const particles = Array.from({ length: 50 }, () => ({
      x: w / 2, y: h / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 18,
      size: 2 + Math.random() * 6,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.alpha -= 0.016;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 400, height: 400,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function TicketCardModal() {
  const dispatch = useDispatch();
  const { showTicket, ticketData } = useSelector((s) => s.lottery);
  const [stage, setStage] = useState(STAGES.CRATE);
  const prevTicketRef = useRef(null);

  useEffect(() => {
    if (!showTicket || !ticketData) { setStage(STAGES.CRATE); return; }
    if (ticketData === prevTicketRef.current) return;
    prevTicketRef.current = ticketData;

    setStage(STAGES.CRATE);
    playCrateReveal();

    const t1 = setTimeout(() => setStage(STAGES.SHAKE), 300);
    const t2 = setTimeout(() => setStage(STAGES.BURST), 800);
    const t3 = setTimeout(() => setStage(STAGES.REVEAL), 1000);
    const t4 = setTimeout(() => setStage(STAGES.CARD), 1400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [showTicket, ticketData]);

  if (!showTicket || !ticketData) return null;

  const ticket = ticketData;
  const pixels = ticket.bw * ticket.bh;
  const isCard = stage >= STAGES.CARD;
  const isBurst = stage >= STAGES.BURST;

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
      onClick={isCard ? () => dispatch(hideTicketModal()) : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: isCard ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        transition: 'background .3s',
      }}
    >
      {/* Light rays on burst */}
      {isBurst && !isCard && (
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.accent}50 0%, transparent 70%)`,
          animation: 'raysPulse .4s ease-out',
          pointerEvents: 'none',
        }} />
      )}

      {/* Burst particles */}
      {isBurst && !isCard && <BurstParticles />}

      {/* Pre-reveal: Crate box */}
      {!isCard && (
        <div style={{
          width: 90, height: 90,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${colors.accent}, #d97706)`,
          border: `2px solid ${colors.accent}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 ${stage >= STAGES.SHAKE ? 40 : 15}px ${colors.accent}55`,
          transition: 'box-shadow .3s',
          animation:
            stage === STAGES.CRATE ? 'crateAppear .3s cubic-bezier(.34,1.56,.64,1)' :
            stage === STAGES.SHAKE ? 'crateShake .5s ease-in-out' :
            stage === STAGES.BURST ? 'crateBurst .2s ease-out forwards' : 'none',
        }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>🎫</div>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#000', letterSpacing: 1, marginTop: 4 }}>
            TICKET
          </div>
        </div>
      )}

      {/* Post-reveal: Ticket card (same design as before) */}
      {isCard && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(360px, calc(100vw - 32px))',
            background: `linear-gradient(135deg, #0f0f1a 0%, #1a1025 100%)`,
            border: `1px solid ${colors.accent}33`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: `0 20px 60px rgba(0,0,0,.6), 0 0 40px ${colors.accent}15`,
            animation: 'cardReveal .4s cubic-bezier(.34,1.56,.64,1)',
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
      )}

      {/* Skip hint during animation */}
      {!isCard && (
        <div
          onClick={() => setStage(STAGES.CARD)}
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
          }}
        >
          tap to skip
        </div>
      )}
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

import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideWinnerCard } from '../../features/golden/goldenSlice';
import { fmtRupees } from '../../utils/formatters';
import { colors } from '../../styles/theme';
import { playCelebration } from '../../utils/sounds';

function ConfettiCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 400;
    const h = canvas.height = 500;
    const COLORS = ['#ffd700', '#fbbf24', '#f59e0b', '#fff', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    const confetti = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: -10 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      size: 3 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of confetti) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx += (Math.random() - 0.5) * 0.3;
        p.rotation += p.rotationSpeed;
        if (p.y > h + 20) { p.alpha -= 0.05; }
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
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
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 500,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function WinnerCardModal() {
  const dispatch = useDispatch();
  const { showWinner, winnerData } = useSelector((s) => s.golden);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!showWinner || !winnerData) { setRevealed(false); return; }
    setRevealed(false);
    playCelebration();
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, [showWinner, winnerData]);

  if (!showWinner || !winnerData) return null;

  const instaUrl = `https://instagram.com/${winnerData.instagram}`;

  return (
    <div
      onClick={() => dispatch(hideWinnerCard())}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
    >
      <ConfettiCanvas />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(360px, calc(100vw - 32px))',
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1410 0%, #0f0f1a 100%)',
          border: '2px solid #ffd70044',
          boxShadow: '0 20px 80px rgba(0,0,0,.8), 0 0 100px #ffd70015',
          animation: revealed ? 'cardReveal .5s cubic-bezier(.34,1.56,.64,1)' : 'crateAppear .3s ease',
        }}
      >
        {/* Golden trophy header */}
        <div style={{
          background: 'linear-gradient(135deg, #ffd700, #f59e0b, #daa520)',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 60%)',
          }} />
          <div style={{ fontSize: 48, marginBottom: 4, position: 'relative' }}>🏆</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#000', letterSpacing: 1, position: 'relative' }}>
            WINNER!
          </div>
          <div style={{ fontSize: 11, color: '#00000088', fontWeight: 600, position: 'relative' }}>
            Golden Pixel Found
          </div>
        </div>

        {/* Winner info */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          {/* Name */}
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 4 }}>
            {winnerData.name}
          </div>

          {/* Instagram */}
          <a
            href={instaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: '#E1306C',
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22, height: 22,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            }}>
              <span style={{ fontSize: 13, color: '#fff' }}>📷</span>
            </span>
            @{winnerData.instagram}
          </a>

          {/* Prize */}
          <div style={{
            background: '#ffd70010',
            border: '1px solid #ffd70022',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: '#ffd70088', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>
              PRIZE WON
            </div>
            <div style={{
              fontSize: 32, fontWeight: 900,
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {fmtRupees(winnerData.prize || 0)}
            </div>
          </div>

          {/* Sponsor */}
          {winnerData.sponsor?.name && (
            <div style={{ fontSize: 10, color: colors.textDimmest, marginBottom: 16 }}>
              Sponsored by{' '}
              <span style={{ color: '#ffd700', fontWeight: 600 }}>{winnerData.sponsor.name}</span>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'block',
                padding: '11px 0',
                background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
                color: '#fff',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Follow Winner
            </a>
            <button
              onClick={() => dispatch(hideWinnerCard())}
              style={{
                flex: 1,
                padding: '11px 0',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${colors.borderLight}`,
                color: colors.text,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

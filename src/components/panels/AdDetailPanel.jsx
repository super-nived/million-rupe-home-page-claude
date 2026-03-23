import { useState, useEffect, useRef } from 'react';
import { fmtRupees } from '../../utils/formatters';
import { colors } from '../../styles/theme';
import { playCrateReveal } from '../../utils/sounds';

// Stages: crate → shake → burst → reveal → content
const STAGES = { CRATE: 0, SHAKE: 1, BURST: 2, REVEAL: 3, CONTENT: 4 };
const TIMINGS = { CRATE: 300, SHAKE: 500, BURST: 200, REVEAL: 400 };

function Particles({ color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 400;
    const h = canvas.height = 400;
    const particles = Array.from({ length: 40 }, () => ({
      x: w / 2, y: h / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16,
      size: 2 + Math.random() * 5,
      alpha: 1,
      color: Math.random() > 0.5 ? color : (Math.random() > 0.5 ? '#f59e0b' : '#fff'),
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.alpha -= 0.018;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      if (alive) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [color]);

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

export default function AdDetailPanel({ ad, onClose }) {
  const [stage, setStage] = useState(STAGES.CRATE);
  const prevAdRef = useRef(null);

  useEffect(() => {
    if (!ad) { setStage(STAGES.CRATE); return; }
    if (ad === prevAdRef.current) return;
    prevAdRef.current = ad;

    // Reset and start sequence
    setStage(STAGES.CRATE);
    playCrateReveal();

    const t1 = setTimeout(() => setStage(STAGES.SHAKE), TIMINGS.CRATE);
    const t2 = setTimeout(() => setStage(STAGES.BURST), TIMINGS.CRATE + TIMINGS.SHAKE);
    const t3 = setTimeout(() => setStage(STAGES.REVEAL), TIMINGS.CRATE + TIMINGS.SHAKE + TIMINGS.BURST);
    const t4 = setTimeout(() => setStage(STAGES.CONTENT), TIMINGS.CRATE + TIMINGS.SHAKE + TIMINGS.BURST + TIMINGS.REVEAL);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [ad]);

  if (!ad) return null;

  const pixels = ad.bw * ad.bh;
  const isRevealed = stage >= STAGES.CONTENT;
  const isBurst = stage >= STAGES.BURST;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={isRevealed ? undefined : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        background: isRevealed ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.75)',
        transition: 'background .3s',
        pointerEvents: 'auto',
      }}
    >
      {/* Light rays on burst */}
      {isBurst && !isRevealed && (
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ad.color}40 0%, transparent 70%)`,
          animation: 'raysPulse .4s ease-out',
          pointerEvents: 'none',
        }} />
      )}

      {/* Burst particles */}
      {isBurst && <Particles color={ad.color} />}

      {/* Crate box / Reveal card */}
      <div
        style={{
          position: 'relative',
          width: isRevealed ? 'min(300px, calc(100vw - 32px))' : 80,
          height: isRevealed ? 'auto' : 80,
          transition: isRevealed ? 'all .4s cubic-bezier(.34,1.56,.64,1)' : 'none',
          animation:
            stage === STAGES.CRATE ? 'crateAppear .3s cubic-bezier(.34,1.56,.64,1)' :
            stage === STAGES.SHAKE ? 'crateShake .5s ease-in-out' :
            stage === STAGES.BURST ? 'crateBurst .2s ease-out forwards' :
            stage === STAGES.REVEAL ? 'cardReveal .4s cubic-bezier(.34,1.56,.64,1)' :
            'none',
        }}
      >
        {/* Pre-reveal: Crate icon */}
        {!isRevealed && (
          <div style={{
            width: 80, height: 80,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ad.color}, ${ad.color}88)`,
            border: `2px solid ${ad.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 900,
            color: '#fff',
            boxShadow: `0 0 ${stage >= STAGES.SHAKE ? 30 : 10}px ${ad.color}66`,
            transition: 'box-shadow .3s',
            opacity: stage === STAGES.BURST ? 0 : 1,
          }}>
            {ad.label[0]}
          </div>
        )}

        {/* Post-reveal: Content card */}
        {isRevealed && (
          <div
            style={{
              background: colors.bgOverlay,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${ad.color}44`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 30px ${ad.color}20`,
            }}
          >
            {/* Glow header */}
            <div style={{
              padding: '14px 16px',
              background: `linear-gradient(135deg, ${ad.color}20, transparent)`,
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${ad.color}, ${ad.color}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#fff',
                  boxShadow: `0 0 12px ${ad.color}44`,
                }}>
                  {ad.label[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
                    {ad.label}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>
                    by {ad.owner}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: colors.textMuted,
                  width: 28, height: 28,
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .15s',
                }}
              >
                ✕
              </button>
            </div>

            {/* Image preview if exists */}
            {ad.imageUrl && (
              <div style={{ padding: '12px 16px 0' }}>
                <img
                  src={ad.imageUrl}
                  alt={ad.label}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            )}

            {/* Stats grid */}
            <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatBlock label="Position" value={`(${ad.bx}, ${ad.by})`} />
              <StatBlock label="Size" value={`${ad.bw} × ${ad.bh}px`} />
              <StatBlock label="Pixels" value={pixels.toLocaleString('en-IN')} />
              <StatBlock label="Value" value={fmtRupees(pixels)} color={colors.accent} />
            </div>

            {/* CTA */}
            <div style={{ padding: '0 16px 14px' }}>
              {ad.url && ad.url !== '#' ? (
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: 10,
                    background: `linear-gradient(135deg, ${ad.color}, ${ad.color}cc)`,
                    color: '#fff',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12,
                    textDecoration: 'none',
                    boxShadow: `0 4px 15px ${ad.color}33`,
                    transition: 'transform .15s',
                  }}
                >
                  Visit Website →
                </a>
              ) : (
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.textMuted,
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skip hint */}
      {!isRevealed && (
        <div
          onClick={() => setStage(STAGES.CONTENT)}
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
          }}
        >
          tap to skip
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      padding: '7px 10px',
    }}>
      <div style={{
        fontSize: 9, color: colors.textDimmest,
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color || colors.text }}>
        {value}
      </div>
    </div>
  );
}

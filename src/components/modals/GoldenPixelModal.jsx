import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeClaim, disableTreasure, showWinnerCard } from '../../features/golden/goldenSlice';
import { useGoldenConfig } from '../../features/golden/useGolden';
import { claimGoldenPixel } from '../../services/goldenService';
import { fmtRupees } from '../../utils/formatters';
import { colors, inputStyle } from '../../styles/theme';
import { playGoldenReveal } from '../../utils/sounds';

const STAGES = { CRATE: 0, SHAKE: 1, BURST: 2, GLOW: 3, FORM: 4 };

function GoldenParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 400;
    const h = canvas.height = 400;
    const COLORS = ['#ffd700', '#ffec8b', '#f59e0b', '#fff', '#fbbf24', '#daa520'];
    const particles = Array.from({ length: 60 }, () => ({
      x: w / 2, y: h / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      size: 2 + Math.random() * 8,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      type: Math.random() > 0.5 ? 'circle' : 'star',
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.vx *= 0.99;
        p.alpha -= 0.012;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.type === 'star') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Date.now() / 200);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i === 0 ? p.size : p.size * 0.4;
            ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
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

export default function GoldenPixelModal() {
  const dispatch = useDispatch();
  const { showClaim } = useSelector((s) => s.golden);
  const { data: config } = useGoldenConfig();
  const [stage, setStage] = useState(STAGES.CRATE);
  const [form, setForm] = useState({ name: '', phone: '', instagram: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const prevShowRef = useRef(false);

  useEffect(() => {
    if (!showClaim) { setStage(STAGES.CRATE); setError(''); return; }
    if (prevShowRef.current) return;
    prevShowRef.current = true;

    setStage(STAGES.CRATE);
    playGoldenReveal();

    const t1 = setTimeout(() => setStage(STAGES.SHAKE), 400);
    const t2 = setTimeout(() => setStage(STAGES.BURST), 1000);
    const t3 = setTimeout(() => setStage(STAGES.GLOW), 1300);
    const t4 = setTimeout(() => setStage(STAGES.FORM), 1800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [showClaim]);

  useEffect(() => {
    if (!showClaim) prevShowRef.current = false;
  }, [showClaim]);

  if (!showClaim || !config) return null;

  const isForm = stage >= STAGES.FORM;
  const isBurst = stage >= STAGES.BURST;

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.phone.trim() || form.phone.trim().length < 10) { setError('Valid phone/GPay number required'); return; }
    if (!form.instagram.trim()) { setError('Instagram ID required'); return; }

    setSubmitting(true);
    setError('');
    try {
      const result = await claimGoldenPixel({
        name: form.name.trim(),
        phone: form.phone.trim(),
        instagram: form.instagram.trim().replace('@', ''),
      });
      dispatch(closeClaim());
      dispatch(disableTreasure());
      dispatch(showWinnerCard({
        name: form.name.trim(),
        instagram: form.instagram.trim().replace('@', ''),
        prize: config.prize,
        sponsor: config.sponsor,
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(closeClaim());
  };

  return (
    <div
      onClick={isForm ? handleClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: isForm ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
        transition: 'background .3s',
      }}
    >
      {/* Golden rays */}
      {isBurst && !isForm && (
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffd70066 0%, #f59e0b33 30%, transparent 70%)',
          animation: 'raysPulse .5s ease-out',
          pointerEvents: 'none',
        }} />
      )}

      {isBurst && <GoldenParticles />}

      {/* Pre-reveal: Golden crate */}
      {!isForm && (
        <div style={{
          width: 100, height: 100,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #ffd700, #f59e0b, #daa520)',
          border: '3px solid #ffd700',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 ${stage >= STAGES.SHAKE ? 60 : 20}px #ffd70066`,
          transition: 'box-shadow .3s',
          animation:
            stage === STAGES.CRATE ? 'crateAppear .4s cubic-bezier(.34,1.56,.64,1)' :
            stage === STAGES.SHAKE ? 'goldenShake .6s ease-in-out' :
            stage === STAGES.BURST ? 'crateBurst .2s ease-out forwards' :
            'none',
        }}>
          <div style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }}>💎</div>
          <div style={{ fontSize: 8, fontWeight: 900, color: '#000', letterSpacing: 1.5, marginTop: 4 }}>
            GOLDEN
          </div>
        </div>
      )}

      {/* Post-reveal: Claim form */}
      {isForm && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(380px, calc(100vw - 32px))',
            background: 'linear-gradient(135deg, #1a1410 0%, #0f0f1a 100%)',
            border: '2px solid #ffd70044',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.7), 0 0 80px #ffd70015',
            animation: 'cardReveal .4s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          {/* Golden header */}
          <div style={{
            background: 'linear-gradient(90deg, #ffd700, #f59e0b, #daa520)',
            padding: '14px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 2 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#000', letterSpacing: 1 }}>
              YOU FOUND THE GOLDEN PIXEL!
            </div>
          </div>

          {/* Prize + Sponsor */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 12,
            }}>
              <div style={{
                fontSize: 28, fontWeight: 900,
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {fmtRupees(config.prize || 0)}
              </div>
            </div>

            {/* Sponsor info */}
            {config.sponsor?.name && (
              <div style={{
                background: '#ffd70010',
                border: '1px solid #ffd70022',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                {config.sponsor.logo && (
                  <img
                    src={config.sponsor.logo}
                    alt={config.sponsor.name}
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 10, color: '#ffd70088', fontWeight: 600 }}>SPONSORED BY</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffd700' }}>
                    {config.sponsor.name}
                  </div>
                  {config.sponsor.message && (
                    <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                      {config.sponsor.message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: colors.textDimmest, marginBottom: 10, textAlign: 'center' }}>
              Be the FIRST to claim — enter your details below
            </div>

            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ ...inputStyle, width: '100%', border: '1px solid #ffd70033' }}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Phone / GPay number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ ...inputStyle, width: '100%', border: '1px solid #ffd70033' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                placeholder="Instagram ID (e.g. yourname)"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                style={{ ...inputStyle, width: '100%', border: '1px solid #ffd70033' }}
              />
            </div>

            {error && (
              <div style={{ color: colors.error, fontSize: 11, marginBottom: 8, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 0',
                background: submitting ? '#ffd70088' : 'linear-gradient(90deg, #ffd700, #f59e0b)',
                border: 'none',
                color: '#000',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                cursor: submitting ? 'wait' : 'pointer',
                letterSpacing: 0.5,
              }}
            >
              {submitting ? '⏳ Claiming...' : '🎉 CLAIM PRIZE'}
            </button>

            <div
              onClick={handleClose}
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: colors.textDimmest,
                marginTop: 10,
                cursor: 'pointer',
              }}
            >
              close
            </div>
          </div>
        </div>
      )}

      {/* Skip hint */}
      {!isForm && (
        <div
          onClick={() => setStage(STAGES.FORM)}
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 11,
            color: 'rgba(255,215,0,0.3)',
            cursor: 'pointer',
          }}
        >
          tap to skip
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearConfetti } from '../../features/lottery/lotterySlice';

const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#6366f1', '#ec4899', '#fff'];
const COUNT = 80;
const DURATION = 2500;

export default function Confetti() {
  const show = useSelector((s) => s.lottery.showConfetti);
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 40,
      w: 4 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rv: (Math.random() - 0.5) * 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const fade = Math.max(0, 1 - elapsed / DURATION);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.08;
        p.y += p.vy;
        p.rot += p.rv;
        p.opacity = fade;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dispatch(clearConfetti());
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [show, dispatch]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        pointerEvents: 'none',
      }}
    />
  );
}

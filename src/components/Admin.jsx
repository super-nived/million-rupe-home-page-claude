import { useState, useEffect, useCallback } from 'react';
import { colors, inputStyle, btnStyle } from '../styles/theme';
import { verifyAdminPassword, saveGoldenConfig, saveSiteConfig, getAllAds, deleteAd, archiveWinnerAndReset } from '../services/adminService';
import { getGoldenConfig, subscribeToGoldenConfig, getWinnersHistory } from '../services/goldenService';
import { getSiteConfig } from '../services/firebaseService';
import { fmtRupees } from '../utils/formatters';

// --- Shared styles ---
const font = "'Geist','SF Pro Display',-apple-system,system-ui,sans-serif";

const card = {
  background: '#111119',
  border: '1px solid #1e1e2e',
  borderRadius: 14,
  overflow: 'hidden',
  marginBottom: 14,
};

const cardHead = (color = colors.accent) => ({
  padding: '12px 16px',
  borderBottom: '1px solid #1e1e2e',
  background: `linear-gradient(135deg, ${color}10, transparent)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const cardBody = { padding: '14px 16px' };

const lbl = {
  display: 'block',
  fontSize: 10,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  fontWeight: 600,
  marginBottom: 5,
};

const inp = {
  ...inputStyle,
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  borderRadius: 8,
  background: '#0a0a12',
  border: '1px solid #1e1e2e',
  transition: 'border .2s',
};

const row = { display: 'flex', gap: 10, marginBottom: 12 };
const col = { flex: 1, minWidth: 0 };

const primaryBtn = (bg = colors.accent) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 22px',
  background: bg,
  color: bg === '#ef4444' ? '#fff' : '#000',
  border: 'none',
  borderRadius: 9,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all .15s',
  letterSpacing: '0.3px',
});

const ghostBtn = {
  ...btnStyle,
  padding: '8px 14px',
  fontSize: 11,
  borderRadius: 8,
};

// --- Component ---
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [saving, setSaving] = useState(false);

  const [golden, setGolden] = useState({
    x: 500, y: 500, size: 1, prize: 100, active: false, round: 1,
    sponsor: { name: '', logo: '', url: '', message: '' },
    winner: null,
  });
  const [site, setSite] = useState({ tagline: '', highlight: '' });
  const [ads, setAds] = useState([]);
  const [winners, setWinners] = useState([]);
  const [tab, setTab] = useState('golden');

  const flash = (msg, type = 'ok') => {
    setStatus({ msg, type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  const handleLogin = async () => {
    setError('');
    const ok = await verifyAdminPassword(password);
    if (ok) {
      setAuthed(true);
      loadData();
    } else {
      setError('Wrong password');
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [g, s, a, w] = await Promise.all([
        getGoldenConfig(), getSiteConfig(), getAllAds(), getWinnersHistory(),
      ]);
      if (g) setGolden(prev => ({
        ...prev, ...g,
        sponsor: { name: '', logo: '', url: '', message: '', ...g.sponsor },
      }));
      if (s) setSite({ tagline: s.tagline || '', highlight: s.highlight || '' });
      setAds(a);
      setWinners(w);
    } catch (e) {
      flash('Failed to load: ' + e.message, 'err');
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const unsub = subscribeToGoldenConfig(data => {
      if (data) setGolden(prev => ({
        ...prev, ...data,
        sponsor: { name: '', logo: '', url: '', message: '', ...data?.sponsor },
      }));
    });
    return unsub;
  }, [authed]);

  const handleSaveGolden = async () => {
    setSaving(true);
    try {
      await saveGoldenConfig(golden);
      flash('Golden pixel saved!');
    } catch (e) {
      flash('Error: ' + e.message, 'err');
    }
    setSaving(false);
  };

  const handleSaveSite = async () => {
    setSaving(true);
    try {
      await saveSiteConfig(site);
      flash('Site config saved!');
    } catch (e) {
      flash('Error: ' + e.message, 'err');
    }
    setSaving(false);
  };

  const handleDeleteAd = async (adId, label) => {
    if (!confirm(`Delete "${label}" permanently?`)) return;
    try {
      await deleteAd(adId);
      setAds(prev => prev.filter(a => a.id !== adId));
      flash('Ad deleted');
    } catch (e) {
      flash(e.message, 'err');
    }
  };

  const handleNewRound = async () => {
    if (!confirm('Archive current winner and start new round?')) return;
    setSaving(true);
    try {
      const nr = await archiveWinnerAndReset(golden);
      setGolden(prev => ({ ...prev, active: false, winner: null, round: nr }));
      flash(`Round ${nr} started!`);
      setWinners(await getWinnersHistory());
    } catch (e) {
      flash('Error: ' + e.message, 'err');
    }
    setSaving(false);
  };

  // ─── LOGIN ───────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#08080d',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font, color: '#e8e8f0',
      }}>
        <div style={{
          width: 'min(380px, calc(100vw - 40px))',
          ...card,
          padding: 0,
        }}>
          {/* Header */}
          <div style={{
            padding: '28px 24px 20px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #f59e0b08, transparent)',
          }}>
            <div style={{
              width: 56, height: 56, margin: '0 auto 12px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, boxShadow: '0 8px 24px #f59e0b22',
            }}>⚙</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>PixelLakh</div>
            <div style={{ fontSize: 12, color: '#666' }}>Admin Dashboard</div>
          </div>

          {/* Form */}
          <div style={{ padding: '0 24px 24px' }}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
              style={{
                ...inp,
                textAlign: 'center',
                fontSize: 14,
                padding: '12px 16px',
                marginBottom: 12,
              }}
            />
            <button
              onClick={handleLogin}
              style={{ ...primaryBtn(), width: '100%', padding: '12px 0', fontSize: 13 }}
            >
              Sign In
            </button>
            {error && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 8,
                background: '#ef444418', border: '1px solid #ef444433',
                color: '#ef4444', fontSize: 12, textAlign: 'center',
              }}>{error}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───────────────────────────────────────
  const tabs = [
    { key: 'golden', icon: '💎', label: 'Golden Pixel' },
    { key: 'site', icon: '🌐', label: 'Site' },
    { key: 'ads', icon: '📦', label: `Ads (${ads.length})` },
    { key: 'winners', icon: '🏆', label: 'Winners' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#08080d',
      fontFamily: font, color: '#e8e8f0',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0c0c14', borderBottom: '1px solid #1e1e2e',
        padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>⚙</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>PixelLakh Admin</div>
            <div style={{ fontSize: 9, color: '#555' }}>Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status.msg && (
            <div style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: status.type === 'err' ? '#ef444418' : '#10b98118',
              color: status.type === 'err' ? '#ef4444' : '#10b981',
              border: `1px solid ${status.type === 'err' ? '#ef444433' : '#10b98133'}`,
              animation: 'fadeIn .2s',
            }}>
              {status.type === 'err' ? '✕' : '✓'} {status.msg}
            </div>
          )}
          <a href="/" style={{
            ...ghostBtn, textDecoration: 'none', fontSize: 11,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            ← Site
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, padding: '10px 16px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 9, fontSize: 12,
              fontWeight: tab === t.key ? 700 : 500,
              background: tab === t.key ? '#f59e0b' : '#111119',
              color: tab === t.key ? '#000' : '#888',
              border: tab === t.key ? 'none' : '1px solid #1e1e2e',
              cursor: 'pointer', transition: 'all .15s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '4px 16px 24px', maxWidth: 640, margin: '0 auto' }}>

        {/* ─── GOLDEN PIXEL ─── */}
        {tab === 'golden' && (
          <>
            {/* Status card */}
            <div style={card}>
              <div style={{
                padding: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: golden.active ? '#10b98108' : '#ef444408',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: golden.active ? '#10b981' : '#ef4444',
                    boxShadow: `0 0 8px ${golden.active ? '#10b981' : '#ef4444'}66`,
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {golden.active ? 'Treasure Hunt Active' : 'Treasure Hunt Inactive'}
                    </div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      Round #{golden.round || 1} · Prize {fmtRupees(golden.prize || 0)}
                    </div>
                  </div>
                </div>
                <label style={{
                  position: 'relative', width: 44, height: 24,
                  display: 'inline-block', cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={golden.active}
                    onChange={e => setGolden({ ...golden, active: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', inset: 0,
                    borderRadius: 12,
                    background: golden.active ? '#10b981' : '#333',
                    transition: 'background .2s',
                  }} />
                  <span style={{
                    position: 'absolute', top: 2, left: golden.active ? 22 : 2,
                    width: 20, height: 20, borderRadius: 10,
                    background: '#fff',
                    transition: 'left .2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                  }} />
                </label>
              </div>
            </div>

            {/* Position & Size */}
            <div style={card}>
              <div style={cardHead('#ffd700')}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>📍 Position & Size</span>
              </div>
              <div style={cardBody}>
                <div style={row}>
                  <div style={col}>
                    <label style={lbl}>X Position (0-999)</label>
                    <input
                      type="number" min="0" max="999"
                      value={golden.x}
                      onChange={e => setGolden({ ...golden, x: +e.target.value })}
                      style={inp}
                    />
                  </div>
                  <div style={col}>
                    <label style={lbl}>Y Position (0-999)</label>
                    <input
                      type="number" min="0" max="999"
                      value={golden.y}
                      onChange={e => setGolden({ ...golden, y: +e.target.value })}
                      style={inp}
                    />
                  </div>
                </div>
                <div style={row}>
                  <div style={col}>
                    <label style={lbl}>Size (pixels)</label>
                    <input
                      type="number" min="1" max="20"
                      value={golden.size}
                      onChange={e => setGolden({ ...golden, size: +e.target.value })}
                      style={inp}
                    />
                  </div>
                  <div style={col}>
                    <label style={lbl}>Prize Amount (₹)</label>
                    <input
                      type="number" min="0"
                      value={golden.prize}
                      onChange={e => setGolden({ ...golden, prize: +e.target.value })}
                      style={inp}
                    />
                  </div>
                </div>
                {/* Grid preview */}
                <div style={{
                  background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: 8,
                  padding: 8, marginBottom: 12,
                }}>
                  <div style={{ fontSize: 9, color: '#444', marginBottom: 6, textAlign: 'center' }}>
                    Preview — Golden pixel at ({golden.x}, {golden.y}), size {golden.size}px
                  </div>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: 80, display: 'block' }}>
                    <rect width="100" height="100" fill="#0f0f17" />
                    <rect width="100" height="100" fill="none" stroke="#1a1a28" strokeWidth="0.5" />
                    {/* Grid lines */}
                    {[10,20,30,40,50,60,70,80,90].map(n => (
                      <g key={n}>
                        <line x1={n} y1="0" x2={n} y2="100" stroke="#1a1a2822" strokeWidth="0.3" />
                        <line x1="0" y1={n} x2="100" y2={n} stroke="#1a1a2822" strokeWidth="0.3" />
                      </g>
                    ))}
                    {/* Golden pixel */}
                    <rect
                      x={golden.x / 10}
                      y={golden.y / 10}
                      width={Math.max(1.5, golden.size / 10)}
                      height={Math.max(1.5, golden.size / 10)}
                      fill="#ffd700"
                      stroke="#ffd700"
                      strokeWidth="0.5"
                    >
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                    </rect>
                    {/* Proximity ring */}
                    <circle
                      cx={golden.x / 10 + golden.size / 20}
                      cy={golden.y / 10 + golden.size / 20}
                      r="8"
                      fill="none" stroke="#ffd70033" strokeWidth="0.3" strokeDasharray="1.5 1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sponsor */}
            <div style={card}>
              <div style={cardHead('#f59e0b')}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>📢 Sponsor</span>
              </div>
              <div style={cardBody}>
                <div style={row}>
                  <div style={col}>
                    <label style={lbl}>Sponsor Name</label>
                    <input
                      value={golden.sponsor.name}
                      onChange={e => setGolden({ ...golden, sponsor: { ...golden.sponsor, name: e.target.value } })}
                      style={inp} placeholder="BrandX"
                    />
                  </div>
                  <div style={col}>
                    <label style={lbl}>Logo URL</label>
                    <input
                      value={golden.sponsor.logo}
                      onChange={e => setGolden({ ...golden, sponsor: { ...golden.sponsor, logo: e.target.value } })}
                      style={inp} placeholder="https://..."
                    />
                  </div>
                </div>
                <div style={row}>
                  <div style={col}>
                    <label style={lbl}>Website URL</label>
                    <input
                      value={golden.sponsor.url}
                      onChange={e => setGolden({ ...golden, sponsor: { ...golden.sponsor, url: e.target.value } })}
                      style={inp} placeholder="https://brandx.com"
                    />
                  </div>
                  <div style={col}>
                    <label style={lbl}>Message</label>
                    <input
                      value={golden.sponsor.message}
                      onChange={e => setGolden({ ...golden, sponsor: { ...golden.sponsor, message: e.target.value } })}
                      style={inp} placeholder="Check us out!"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveGolden}
              disabled={saving}
              style={{
                ...primaryBtn(),
                width: '100%', padding: '12px 0',
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? '⏳ Saving...' : '💾 Save Golden Pixel Settings'}
            </button>

            {/* Winner card */}
            {golden.winner && (
              <div style={{ ...card, marginTop: 14, border: '1px solid #ffd70033' }}>
                <div style={cardHead('#ffd700')}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>🏆 Current Winner</span>
                  <span style={{
                    padding: '3px 8px', borderRadius: 6,
                    background: '#ffd70018', color: '#ffd700',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    Round #{golden.round || 1}
                  </span>
                </div>
                <div style={cardBody}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'Name', value: golden.winner.name },
                      { label: 'Phone/GPay', value: golden.winner.phone },
                      { label: 'Instagram', value: `@${golden.winner.instagram}`, color: '#E1306C' },
                      { label: 'Prize', value: fmtRupees(golden.prize), color: '#10b981' },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: '#0a0a12', border: '1px solid #1e1e2e',
                        borderRadius: 8, padding: '8px 10px',
                      }}>
                        <div style={{ ...lbl, marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: item.color || '#e8e8f0' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleNewRound}
                    disabled={saving}
                    style={{
                      ...primaryBtn('#8b5cf6'),
                      width: '100%', padding: '10px 0', color: '#fff',
                    }}
                  >
                    Archive & Start Round #{(golden.round || 1) + 1}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── SITE CONFIG ─── */}
        {tab === 'site' && (
          <>
            <div style={card}>
              <div style={cardHead('#10b981')}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>🌐 Site Configuration</span>
              </div>
              <div style={cardBody}>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Tagline</label>
                  <input
                    value={site.tagline}
                    onChange={e => setSite({ ...site, tagline: e.target.value })}
                    style={inp}
                    placeholder="Every pixel funds a dream..."
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Highlight Text (shown in header)</label>
                  <input
                    value={site.highlight}
                    onChange={e => setSite({ ...site, highlight: e.target.value })}
                    style={inp}
                    placeholder="100% to the community"
                  />
                </div>
                <button
                  onClick={handleSaveSite}
                  disabled={saving}
                  style={{
                    ...primaryBtn('#10b981'),
                    width: '100%', padding: '12px 0', color: '#000',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? '⏳ Saving...' : '💾 Save Site Config'}
                </button>
              </div>
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#f59e0b08', border: '1px solid #f59e0b22',
              fontSize: 11, color: '#666',
            }}>
              To edit the About page content, go to Firebase Console → Firestore → config/site → about field
            </div>
          </>
        )}

        {/* ─── ADS ─── */}
        {tab === 'ads' && (
          <div style={card}>
            <div style={{
              ...cardHead('#3b82f6'),
              position: 'sticky', top: 49, zIndex: 5, background: '#111119',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                📦 All Ads
                <span style={{ fontSize: 11, color: '#666', fontWeight: 400, marginLeft: 6 }}>
                  {ads.length} total
                </span>
              </span>
              <button onClick={loadData} style={ghostBtn}>↻ Refresh</button>
            </div>
            <div style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
              {ads.map(ad => (
                <div
                  key={ad.id}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #1a1a2a',
                    gap: 10,
                    transition: 'background .1s',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${ad.color || '#f59e0b'}, ${ad.color || '#f59e0b'}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff',
                    boxShadow: `0 2px 8px ${ad.color || '#f59e0b'}22`,
                  }}>
                    {(ad.label || '?')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ad.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#555' }}>
                      {ad.bw}×{ad.bh}px at ({ad.bx},{ad.by}) · by {ad.owner}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, flexShrink: 0 }}>
                    {fmtRupees(ad.bw * ad.bh)}
                  </div>
                  <button
                    onClick={() => handleDeleteAd(ad.id, ad.label)}
                    style={{
                      padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: '#ef444415', border: '1px solid #ef444433',
                      color: '#ef4444', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {!ads.length && (
                <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>
                  No ads yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── WINNERS ─── */}
        {tab === 'winners' && (
          <div style={card}>
            <div style={cardHead('#ffd700')}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>🏆 Winner History</span>
              <span style={{ fontSize: 11, color: '#666' }}>{winners.length} total</span>
            </div>
            {winners.length ? (
              winners.map((w, i) => (
                <div
                  key={w.id || i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid #1a1a2a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14,
                    }}>🏆</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 10, color: '#E1306C' }}>@{w.instagram}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>
                      {fmtRupees(w.prize)}
                    </div>
                    <div style={{ fontSize: 9, color: '#555' }}>
                      Round #{w.round}{w.sponsorName ? ` · ${w.sponsorName}` : ''}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>
                No winners yet — start a treasure hunt!
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        input:focus{border-color:#f59e0b55!important;outline:none}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}
      `}</style>
    </div>
  );
}

import { useSelector, useDispatch } from 'react-redux';
import { closeAbout } from '../../features/lottery/lotterySlice';
import { useSiteConfig } from '../../features/lottery/useLottery';
import { colors } from '../../styles/theme';

const DEFAULT_ABOUT = {
  title: 'The Idea Behind PixelLakh',
  story: 'We believe in building things that give back. PixelLakh is a pixel advertising grid where every rupee collected goes directly to the community. No middlemen, no commission — just people supporting people.',
  sections: [
    {
      heading: 'How it works',
      body: 'Buy pixel ad space for ₹1 each. Your brand, image, or message lives on the grid forever. Every rupee raised goes to a cause chosen by the community.',
    },
    {
      heading: 'The promise',
      body: 'Full transparency. Every transaction is public. Every rupee is tracked. When we say 100% goes to the community, we mean it.',
    },
  ],
  cta: null,
  ctaUrl: null,
};

export default function AboutModal() {
  const dispatch = useDispatch();
  const showAbout = useSelector((s) => s.lottery.showAbout);
  const { data: config } = useSiteConfig();

  if (!showAbout) return null;

  const about = config?.about || DEFAULT_ABOUT;
  const title = about.title || DEFAULT_ABOUT.title;
  const story = about.story || DEFAULT_ABOUT.story;
  const sections = about.sections || DEFAULT_ABOUT.sections;

  return (
    <div
      onClick={() => dispatch(closeAbout())}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        animation: 'fadeIn .2s ease',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 100%)',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          background: colors.bgPanel,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          animation: 'ticketSlideUp .3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.text, lineHeight: 1.3 }}>
                {title}
              </div>
            </div>
            <button
              onClick={() => dispatch(closeAbout())}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textDim,
                fontSize: 18,
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px 24px' }}>
          {/* Main story */}
          <p style={{
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 1.7,
            marginBottom: 20,
          }}>
            {story}
          </p>

          {/* Dynamic sections */}
          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: i < sections.length - 1 ? 16 : 0 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}>
                {section.heading}
              </div>
              <p style={{
                fontSize: 12,
                color: colors.textMuted,
                lineHeight: 1.6,
              }}>
                {section.body}
              </p>
            </div>
          ))}

          {/* Optional CTA */}
          {about.cta && (
            <div style={{ marginTop: 20 }}>
              <a
                href={about.ctaUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px 0',
                  background: colors.accent,
                  color: '#000',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'opacity .15s',
                }}
              >
                {about.cta}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

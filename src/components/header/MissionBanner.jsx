import { useDispatch } from 'react-redux';
import { useSiteConfig } from '../../features/lottery/useLottery';
import { openAbout } from '../../features/lottery/lotterySlice';
import { colors } from '../../styles/theme';

const DEFAULT_CONFIG = {
  tagline: 'Every pixel funds a dream. Every rupee goes back to you.',
  highlight: '100% to the community',
};

export default function MissionBanner() {
  const dispatch = useDispatch();
  const { data: config } = useSiteConfig();
  const tagline = config?.tagline || DEFAULT_CONFIG.tagline;
  const highlight = config?.highlight || DEFAULT_CONFIG.highlight;

  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${colors.accent}08, ${colors.accent}15, ${colors.accent}08)`,
        borderBottom: `1px solid ${colors.accent}15`,
        padding: '4px 12px',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10, color: colors.textDim }}>
        {tagline}
        {highlight && (
          <>
            {' '}
            <span
              onClick={() => dispatch(openAbout())}
              style={{
                color: colors.accent,
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: `1px dashed ${colors.accent}55`,
                transition: 'border-color .15s',
              }}
              onMouseEnter={(e) => e.target.style.borderColor = colors.accent}
              onMouseLeave={(e) => e.target.style.borderColor = `${colors.accent}55`}
            >
              {highlight} →
            </span>
          </>
        )}
      </span>
    </div>
  );
}

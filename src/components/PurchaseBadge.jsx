import { colors } from '../styles/theme';

export default function PurchaseBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: colors.accent,
        color: colors.bg,
        fontSize: 10,
        fontWeight: 800,
        padding: '3px 14px',
        borderRadius: 20,
        zIndex: 200,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      Purchase mode
    </div>
  );
}

import { colors } from '../styles/theme';

export default function Stat({ label, value }) {
  return (
    <div style={{ background: colors.bgCard, borderRadius: 7, padding: '6px 9px' }}>
      <div
        style={{
          fontSize: 9,
          color: colors.textDimmer,
          marginBottom: 1,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

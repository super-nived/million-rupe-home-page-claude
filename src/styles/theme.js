export const colors = {
  bg: '#08080d',
  bgPanel: '#0c0c14',
  bgCard: '#0a0a10',
  bgOverlay: '#11111dee',
  border: '#1c1c2c',
  borderLight: '#2a2a3a',
  text: '#e8e8f0',
  textMuted: '#8888a0',
  textDim: '#666',
  textDimmer: '#555',
  textDimmest: '#444',
  accent: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  gridCell: '#0f0f17',
  gridStroke: '#1a1a28',
};

export const fonts = {
  base: "'Geist','SF Pro Display',-apple-system,system-ui,sans-serif",
};

export const btnStyle = {
  background: 'transparent',
  border: `1px solid ${colors.borderLight}`,
  color: colors.text,
  borderRadius: 7,
  padding: '5px 11px',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'all .12s',
};

export const inputStyle = {
  flex: 1,
  background: colors.bgCard,
  border: `1px solid ${colors.borderLight}`,
  color: colors.text,
  borderRadius: 7,
  padding: '8px 11px',
  fontSize: 12,
  outline: 'none',
  minWidth: 0,
};

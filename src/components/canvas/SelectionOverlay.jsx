export default function SelectionOverlay({ selection, scale }) {
  if (!selection) return null;

  return (
    <rect
      x={selection.bx}
      y={selection.by}
      width={selection.bw}
      height={selection.bh}
      fill={selection.free ? 'rgba(245,158,11,.22)' : 'rgba(239,68,68,.25)'}
      stroke={selection.free ? '#f59e0b' : '#ef4444'}
      strokeWidth={1.8 / scale}
      strokeDasharray={`${3 / scale}`}
      rx={0.8}
    />
  );
}

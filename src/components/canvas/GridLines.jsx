import { memo, useMemo } from 'react';
import { CANVAS_PX, VISUAL_BLOCK } from '../../constants/grid';

const VISUAL_GRID = CANVAS_PX / VISUAL_BLOCK;

const GridLines = memo(function GridLines({ scale }) {
  const lines = useMemo(() => {
    if (scale < 2) return null;
    const opacity = Math.min((scale - 2) / 4, 0.25);
    const result = [];
    for (let i = 0; i <= VISUAL_GRID; i++) {
      result.push(
        <line
          key={`h${i}`}
          x1={0}
          y1={i * VISUAL_BLOCK}
          x2={CANVAS_PX}
          y2={i * VISUAL_BLOCK}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.5 / scale}
          opacity={opacity}
        />
      );
      result.push(
        <line
          key={`v${i}`}
          x1={i * VISUAL_BLOCK}
          y1={0}
          x2={i * VISUAL_BLOCK}
          y2={CANVAS_PX}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.5 / scale}
          opacity={opacity}
        />
      );
    }
    return result;
  }, [scale]);

  return lines;
});

export default GridLines;

import { forwardRef } from 'react';
import { CANVAS_PX, VISUAL_BLOCK } from '../../constants/grid';
import AdRect from './AdRect';
import GridLines from './GridLines';
import SelectionOverlay from './SelectionOverlay';
import GoldenPixelGlow from '../effects/GoldenPixelGlow';

const GridCanvas = forwardRef(function GridCanvas(
  { ads, scale, canvasW, canvasH, hoveredAd, selectedAd, mode, selection },
  ref
) {
  return (
    <svg
      ref={ref}
      width={canvasW}
      height={canvasH}
      viewBox={`0 0 ${CANVAS_PX} ${CANVAS_PX}`}
      style={{ display: 'block' }}
    >
      <defs>
        <pattern id="grid" width={VISUAL_BLOCK} height={VISUAL_BLOCK} patternUnits="userSpaceOnUse">
          <rect width={VISUAL_BLOCK} height={VISUAL_BLOCK} fill="#0f0f17" />
          <rect
            x={0.3}
            y={0.3}
            width={VISUAL_BLOCK - 0.6}
            height={VISUAL_BLOCK - 0.6}
            fill="none"
            stroke="#1a1a28"
            strokeWidth={0.25}
          />
        </pattern>
      </defs>
      <rect width={CANVAS_PX} height={CANVAS_PX} fill="url(#grid)" />
      <GridLines scale={scale} />

      {ads.map((ad) => (
        <AdRect
          key={ad.id}
          ad={ad}
          scale={scale}
          isHovered={hoveredAd?.id === ad.id}
          isSelected={selectedAd?.id === ad.id}
        />
      ))}

      <GoldenPixelGlow scale={1} />

      {mode === 'buy' && <SelectionOverlay selection={selection} scale={scale} />}
    </svg>
  );
});

export default GridCanvas;

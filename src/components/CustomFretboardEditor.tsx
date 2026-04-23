import { useMemo } from 'react';
import type { RefObject } from 'react';
import type { iCoords, iDragState, iFretboardConfig } from '../types/types';
import { getX, getY } from '../helpers/fretboardHelpers';

interface iCustomFretboardEditorProps {
  coords: iCoords[];
  fretboardConfig: iFretboardConfig;
  dragState: iDragState | null;
  selectedDotId: string | null;
  resolvedPrimaryColor: string;
  svgRef: RefObject<SVGSVGElement>;
  onCellClick: (string: number, fret: number) => void;
  onDotMouseDown: (id: string) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseUp: () => void;
  onBackgroundClick: () => void;
}

const SINGLE_MARKER_POSITIONS = new Set([3, 5, 7, 9]);

const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return '#000000';
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? '#000000' : '#ffffff';
};

const CustomFretboardEditor = ({
  coords,
  fretboardConfig,
  dragState,
  selectedDotId,
  resolvedPrimaryColor,
  svgRef,
  onCellClick,
  onDotMouseDown,
  onSvgMouseMove,
  onSvgMouseUp,
  onBackgroundClick,
}: iCustomFretboardEditorProps) => {
  const { numFrets, numStrings, width, height, fretpointRadius } = fretboardConfig;
  const hitHeight = fretpointRadius * 3;

  const positionMarkers = useMemo(() => {
    const markers: React.ReactElement[] = [];
    const cyCenter = (getY(numStrings, fretboardConfig) + getY(1, fretboardConfig)) / 2;
    const r = fretpointRadius * 0.6;

    for (let fret = 1; fret <= numFrets; fret++) {
      const markerPos = fret % 12 === 0 ? 12 : fret % 12;
      const cx = (getX(fret - 1, fretboardConfig) + getX(fret, fretboardConfig)) / 2;

      if (SINGLE_MARKER_POSITIONS.has(markerPos)) {
        markers.push(
          <circle
            key={`marker-${fret}`}
            cx={cx}
            cy={cyCenter}
            r={r}
            className='custom-fretboard-editor__position-marker'
          />,
        );
      } else if (markerPos === 12) {
        markers.push(
          <circle
            key={`marker-${fret}-top`}
            cx={cx}
            cy={cyCenter - fretpointRadius * 1.5}
            r={r}
            className='custom-fretboard-editor__position-marker'
          />,
          <circle
            key={`marker-${fret}-bottom`}
            cx={cx}
            cy={cyCenter + fretpointRadius * 1.5}
            r={r}
            className='custom-fretboard-editor__position-marker'
          />,
        );
      }
    }
    return markers;
  }, [fretboardConfig]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      role='application'
      aria-label='Custom fretboard editor'
      className='custom-fretboard-editor'
      onMouseMove={onSvgMouseMove}
      onMouseUp={onSvgMouseUp}
    >
      {/* ① Fret lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          className='fret-lines'
          x1={getX(i, fretboardConfig)}
          y1={getY(1, fretboardConfig)}
          x2={getX(i, fretboardConfig)}
          y2={getY(numStrings, fretboardConfig)}
          strokeWidth={2}
        />
      ))}

      {/* ② String lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i + 1}`}
          x1={getX(0, fretboardConfig)}
          y1={getY(i + 1, fretboardConfig)}
          x2={getX(numFrets, fretboardConfig)}
          y2={getY(i + 1, fretboardConfig)}
          className='string-lines'
          strokeWidth={3 - i * 0.5}
        />
      ))}

      {/* ③ Position markers */}
      {positionMarkers}

      {/* ④ Background rect — deselect on click */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill='transparent'
        onClick={onBackgroundClick}
        data-export-remove='true'
      />

      {/* ⑤ Hit areas */}
      {Array.from({ length: numStrings }, (_, si) => si + 1).flatMap(s =>
        Array.from({ length: numFrets }, (_, fi) => fi + 1).map(f => {
          const dot = coords.find(d => d.string === s && d.fret === f);
          const isOccupied = dot !== undefined;
          return (
            <rect
              key={`hit-${s}-${f}`}
              x={getX(f - 1, fretboardConfig)}
              y={getY(s, fretboardConfig) - hitHeight / 2}
              width={getX(f, fretboardConfig) - getX(f - 1, fretboardConfig)}
              height={hitHeight}
              fill='transparent'
              className={`custom-fretboard-editor__hit-area${isOccupied ? ' custom-fretboard-editor__hit-area--occupied' : ''}`}
              role='button'
              tabIndex={0}
              aria-label={`String ${s}, Fret ${f} — ${isOccupied ? (dot.label ?? 'occupied') : 'empty'}`}
              onClick={() => onCellClick(s, f)}
              onMouseDown={
                isOccupied && dot.id
                  ? e => {
                      e.preventDefault();
                      onDotMouseDown(dot.id!);
                    }
                  : undefined
              }
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCellClick(s, f);
                }
              }}
              data-export-remove='true'
            />
          );
        }),
      )}

      {/* ⑥ User dots — ring circle behind dot for selected state */}
      {coords.map(dot => {
        const isDragging = dragState?.dotId === dot.id;
        const isSelected = selectedDotId === dot.id;
        const cx = (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2;
        const cy = getY(dot.string, fretboardConfig);
        return (
          <g key={`dot-group-${dot.id}`} pointerEvents='none'>
            {isSelected && (
              <circle cx={cx} cy={cy} r={fretpointRadius + 3} fill={resolvedPrimaryColor} />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={fretpointRadius}
              fill={dot.color as string}
              className={isDragging ? 'custom-fretboard-editor__dot--dragging' : undefined}
            />
          </g>
        );
      })}

      {/* ⑦ Dot labels */}
      {coords
        .filter(d => d.label)
        .map(dot => {
          const cx = (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2;
          const cy = getY(dot.string, fretboardConfig);
          return (
            <text
              key={`label-${dot.id}`}
              x={cx}
              y={cy}
              textAnchor='middle'
              dominantBaseline='central'
              fontSize={13}
              fill={getContrastColor(dot.color as string)}
              pointerEvents='none'
            >
              {(dot.label ?? '').slice(0, 2)}
            </text>
          );
        })}

      {/* ⑧ Drag preview */}
      {dragState && (
        <circle
          cx={
            (getX(dragState.previewFret - 1, fretboardConfig) +
              getX(dragState.previewFret, fretboardConfig)) /
            2
          }
          cy={getY(dragState.previewString, fretboardConfig)}
          r={fretpointRadius}
          fill={resolvedPrimaryColor}
          className='custom-fretboard-editor__drag-preview'
          pointerEvents='none'
        />
      )}
    </svg>
  );
};

export default CustomFretboardEditor;

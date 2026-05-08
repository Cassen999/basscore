import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { iCoords, iDragState, iFretboardConfig } from '../../types/types';
import { getX, getY } from '../../helpers/fretboardHelpers';

interface iCustomFretboardEditorProps {
  coords: iCoords[];
  fretboardConfig: iFretboardConfig;
  dragState: iDragState | null;
  selectedDotId: string | null;
  resolvedPrimaryColor: string;
  svgRef: RefObject<SVGSVGElement | null>;
  onCellClick: (string: number, fret: number) => void;
  onDotMouseDown: (id: string) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseUp: () => void;
  onBackgroundClick: () => void;
  rotated?: boolean;
  isMobile?: boolean;
  onLongPressDot?: (id: string, clientX: number, clientY: number) => void;
  onLongPressCell?: (string: number, fret: number, clientX: number, clientY: number) => void;
  onTouchTapCell?: (string: number, fret: number) => void;
  longPressThreshold?: number;
  isContextMenuOpen?: boolean;
  onContextMenuDismiss?: () => void;
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
  rotated = false,
  isMobile = false,
  onLongPressDot,
  onLongPressCell,
  onTouchTapCell,
  longPressThreshold = 1000,
  isContextMenuOpen = false,
  onContextMenuDismiss,
}: iCustomFretboardEditorProps) => {
  const { numFrets, numStrings, width, height, fretpointRadius } = fretboardConfig;
  const hitHeight = fretpointRadius * 3;

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const timerFiredRef = useRef(false);
  const contextMenuWasOpenRef = useRef(false);
  const timerCancelledRef = useRef(false);

  const positionMarkers = useMemo(() => {
    const { numFrets, numStrings, fretpointRadius } = fretboardConfig;
    const markers: React.ReactElement[] = [];
    const r = fretpointRadius * 0.6;

    for (let fret = 1; fret <= numFrets; fret++) {
      const markerPos = fret % 12 === 0 ? 12 : fret % 12;

      if (rotated) {
        // In rotated layout: fret drives y, strings drive x
        // Center marker horizontally between string 1 and numStrings
        const cxCenter = (getY(numStrings, fretboardConfig) + getY(1, fretboardConfig)) / 2;
        const cy = (getX(fret - 1, fretboardConfig) + getX(fret, fretboardConfig)) / 2;

        if (SINGLE_MARKER_POSITIONS.has(markerPos)) {
          markers.push(
            <circle
              key={`marker-${fret}`}
              cx={cxCenter}
              cy={cy}
              r={r}
              className='custom-fretboard-editor__position-marker'
            />,
          );
        } else if (markerPos === 12) {
          markers.push(
            <circle
              key={`marker-${fret}-top`}
              cx={cxCenter - fretpointRadius * 1.5}
              cy={cy}
              r={r}
              className='custom-fretboard-editor__position-marker'
            />,
            <circle
              key={`marker-${fret}-bottom`}
              cx={cxCenter + fretpointRadius * 1.5}
              cy={cy}
              r={r}
              className='custom-fretboard-editor__position-marker'
            />,
          );
        }
      } else {
        const cyCenter = (getY(numStrings, fretboardConfig) + getY(1, fretboardConfig)) / 2;
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
    }
    return markers;
  }, [fretboardConfig, rotated]);

  const handleTouchStart = (s: number, f: number, e: React.TouchEvent) => {
    e.preventDefault();
    contextMenuWasOpenRef.current = false;
    timerCancelledRef.current = false;

    if (isContextMenuOpen) {
      contextMenuWasOpenRef.current = true;
      onContextMenuDismiss?.();
      return;
    }
    const touch = e.targetTouches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    timerFiredRef.current = false;

    const dot = coords.find(d => d.string === s && d.fret === f);
    if (dot && dot.id) {
      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        navigator.vibrate?.(50);
        onLongPressDot?.(dot.id!, touch.clientX, touch.clientY);
      }, longPressThreshold);
    } else {
      longPressTimerRef.current = setTimeout(() => {
        timerFiredRef.current = true;
        navigator.vibrate?.(50);
        onLongPressCell?.(s, f, touch.clientX, touch.clientY);
      }, longPressThreshold);
    }
  };

  const handleTouchMove = (s: number, f: number, e: React.TouchEvent) => {
    if (contextMenuWasOpenRef.current) return;
    if (!touchStartPosRef.current || !longPressTimerRef.current) return;
    const touch = e.targetTouches[0];
    const dx = touch.clientX - touchStartPosRef.current.x;
    const dy = touch.clientY - touchStartPosRef.current.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);
    const dot = coords.find(d => d.string === s && d.fret === f);
    if (!dot && displacement > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      timerCancelledRef.current = true;
    }
  };

  const handleTouchEnd = (s: number, f: number) => {
    if (contextMenuWasOpenRef.current) {
      contextMenuWasOpenRef.current = false;
      return;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!timerFiredRef.current && !timerCancelledRef.current) {
      const dot = coords.find(d => d.string === s && d.fret === f);
      if (!dot) {
        onTouchTapCell?.(s, f);
      }
    }
    touchStartPosRef.current = null;
    timerCancelledRef.current = false;
  };

  const svgWidth = rotated ? height : width;
  const svgHeight = rotated ? width : height;

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      role='application'
      aria-label='Custom fretboard editor'
      className={`custom-fretboard-editor${rotated ? ' custom-fretboard-editor--rotated' : ''}`}
      onMouseMove={onSvgMouseMove}
      onMouseUp={onSvgMouseUp}
    >
      {/* ① Fret lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) =>
        rotated ? (
          <line
            key={`fret-${i}`}
            className='fret-lines'
            x1={getY(1, fretboardConfig)}
            y1={getX(i, fretboardConfig)}
            x2={getY(numStrings, fretboardConfig)}
            y2={getX(i, fretboardConfig)}
            strokeWidth={2}
          />
        ) : (
          <line
            key={`fret-${i}`}
            className='fret-lines'
            x1={getX(i, fretboardConfig)}
            y1={getY(1, fretboardConfig)}
            x2={getX(i, fretboardConfig)}
            y2={getY(numStrings, fretboardConfig)}
            strokeWidth={2}
          />
        ),
      )}

      {/* ② String lines */}
      {Array.from({ length: numStrings }).map((_, i) =>
        rotated ? (
          <line
            key={`string-${i + 1}`}
            x1={getY(i + 1, fretboardConfig)}
            y1={getX(0, fretboardConfig)}
            x2={getY(i + 1, fretboardConfig)}
            y2={getX(numFrets, fretboardConfig)}
            className='string-lines'
            strokeWidth={3 - i * 0.5}
          />
        ) : (
          <line
            key={`string-${i + 1}`}
            x1={getX(0, fretboardConfig)}
            y1={getY(i + 1, fretboardConfig)}
            x2={getX(numFrets, fretboardConfig)}
            y2={getY(i + 1, fretboardConfig)}
            className='string-lines'
            strokeWidth={3 - i * 0.5}
          />
        ),
      )}

      {/* ③ Position markers */}
      {positionMarkers}

      {/* ④ Background rect — deselect on click */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill='transparent'
        onClick={onBackgroundClick}
        data-export-remove='true'
      />

      {/* ⑤ Hit areas */}
      {Array.from({ length: numStrings }, (_, si) => si + 1).flatMap(s =>
        Array.from({ length: numFrets }, (_, fi) => fi + 1).map(f => {
          const dot = coords.find(d => d.string === s && d.fret === f);
          const isOccupied = dot !== undefined;

          const hitProps = rotated
            ? {
                x: getY(s, fretboardConfig) - hitHeight / 2,
                y: getX(f - 1, fretboardConfig),
                width: hitHeight,
                height: getX(f, fretboardConfig) - getX(f - 1, fretboardConfig),
              }
            : {
                x: getX(f - 1, fretboardConfig),
                y: getY(s, fretboardConfig) - hitHeight / 2,
                width: getX(f, fretboardConfig) - getX(f - 1, fretboardConfig),
                height: hitHeight,
              };

          return (
            <rect
              key={`hit-${s}-${f}`}
              {...hitProps}
              fill='transparent'
              className={`custom-fretboard-editor__hit-area${isOccupied ? ' custom-fretboard-editor__hit-area--occupied' : ''}`}
              role='button'
              tabIndex={0}
              aria-label={`String ${s}, Fret ${f} — ${isOccupied ? (dot.label ?? 'occupied') : 'empty'}`}
              onClick={() => onCellClick(s, f)}
              onMouseDown={
                !isMobile && isOccupied && dot.id
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
              onTouchStart={isMobile ? e => handleTouchStart(s, f, e) : undefined}
              onTouchMove={isMobile ? e => handleTouchMove(s, f, e) : undefined}
              onTouchEnd={isMobile ? () => handleTouchEnd(s, f) : undefined}
              data-export-remove='true'
            />
          );
        }),
      )}

      {/* ⑥ User dots — ring circle behind dot for selected state */}
      {coords.map(dot => {
        const isDragging = dragState?.dotId === dot.id;
        const isSelected = selectedDotId === dot.id;
        const cx = rotated
          ? getY(dot.string, fretboardConfig)
          : (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2;
        const cy = rotated
          ? (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2
          : getY(dot.string, fretboardConfig);
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
          const cx = rotated
            ? getY(dot.string, fretboardConfig)
            : (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2;
          const cy = rotated
            ? (getX(dot.fret - 1, fretboardConfig) + getX(dot.fret, fretboardConfig)) / 2
            : getY(dot.string, fretboardConfig);
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
      {dragState && !rotated && (
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

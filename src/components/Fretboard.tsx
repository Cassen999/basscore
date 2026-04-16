import type { iFretboardProps } from "../types/types";
import {
  getX,
  getY,
  mapFretPoints,
} from "../helpers/fretboardHelpers";
import { useMemo } from "react";
import { useControls } from "../contexts/ControlsContext";

const Fretboard = (props?: iFretboardProps) => {
  const { fretboardConfig } = useControls();
  const { numFrets, numStrings, width, height } = fretboardConfig;

  const fretPoints = useMemo(() => {
    if (!props?.coords) return [];
    return mapFretPoints(props.coords, fretboardConfig);
  }, [props?.coords, numFrets, numStrings]);
  
  return (
    <div className="fretboard">
      <span className="fretboard__label fretboard__label--nut">Nut</span>
      <svg
        width={width}
        height={height}
      >
        {/* Fret Lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            className='fret-lines'
            key={`fret-${i}`}
            x1={getX(i, fretboardConfig)}
            y1={getY(1, fretboardConfig)}
            x2={getX(i, fretboardConfig)}
            y2={getY(numStrings, fretboardConfig)}
            strokeWidth={2}
          />
        ))}

        {/* String Lines */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={getX(0, fretboardConfig)}
            y1={getY(i + 1, fretboardConfig)}
            x2={getX(numFrets, fretboardConfig)}
            y2={getY(i + 1, fretboardConfig)}
            className='string-lines'
            strokeWidth={3 - i * 0.5}
          />
        ))}

        {/** If coordinates are given map the fret points */}
        {fretPoints}
      </svg>
      <span className="fretboard__label fretboard__label--bridge">Bridge</span>
    </div>
  );
};

export default Fretboard;

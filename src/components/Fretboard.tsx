import type { iFretboardProps } from "../types/types";
import {
  fretboardHeight,
  fretboardWidth,
  numFrets,
  getX,
  getY,
  numStrings,
  mapFretPoints,
} from "../helpers/fretboardHelpers";

const Fretboard = (props?: iFretboardProps) => {
  return (
    <svg
      width={fretboardWidth}
      height={fretboardHeight}
      style={{ background: "white" }}
    >
      {/* Fret Lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={getX(i)}
          y1={getY(1)}
          x2={getX(i)}
          y2={getY(numStrings)}
          stroke="#888"
          strokeWidth={2}
        />
      ))}

      {/* String Lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={getX(0)}
          y1={getY(i + 1)}
          x2={getX(numFrets)}
          y2={getY(i + 1)}
          stroke="#ccc"
          strokeWidth={3 - i * 0.5}
        />
      ))}

      {/** If coordinates are given map the fret points */}
      {props?.coords && mapFretPoints(props.coords)}
    </svg>
  );
};

export default Fretboard;

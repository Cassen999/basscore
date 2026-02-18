import type { iFretboardProps } from "../types/types";

const Fretboard = (props: iFretboardProps) => {
  const { coords } = props;
  const width = 500;
  const height = 200;
  const circleRadius = 8;
  const maxStroke = 3;
  const margin = circleRadius + maxStroke / 2 + 2;

  const numFrets = 5;
  const numStrings = 4;

  const getY = (stringIndex: number) =>
    margin + (numStrings - stringIndex) * ((height - 2 * margin) / numFrets);

  const getX = (fretIndex: number) =>
    margin + fretIndex * ((width - 2 * margin) / numFrets);

  const getCircleX = (fretIndex: number) =>
    (getX(fretIndex - 1) + getX(fretIndex)) / 2;

  const getCircleY = (stringIndex: number) => getY(stringIndex);

  return (
    <svg width={width} height={height} style={{ background: "white" }}>
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

      {coords.map((coord) => {
        const { string, fret } = coord;
        return fret !== 0 && <circle cx={getCircleX(fret)} cy={getCircleY(string)} r={8} fill="orange" />;
      })}
    </svg>
  );
};

export default Fretboard;

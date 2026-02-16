# Features

- Flash cards
- Audio recognition
- Metronome
- Tuner

# Flash cards

- Card
- Interval visual
- Audio recognition (later)
- Flip animation

# SVGs

- SVG grid system for fretboard
  - Draw a circle at correct coordinate based on interval
- Dot with dynamic number
  - Could be dynamic or could be a collection of dots 1-7

```
  const Fretboard = () => {
  const width = 500;
  const height = 200;

  const numFrets = 5;
  const numStrings = 4;

  const fretSpacing = width / numFrets;
  const stringSpacing = height / (numStrings - 1);

  // Convert logical string (bottom = 1) to SVG Y (top = 0)
  const getY = (stringIndex: number) =>
    height - (stringIndex - 1) * stringSpacing;

  const getX = (fretIndex: number) =>
    fretIndex * fretSpacing;

  return (
    <svg width={width} height={height} style={{ background: "#222" }}>
      {/* Fret Lines (Vertical) */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={i * fretSpacing}
          y1={0}
          x2={i * fretSpacing}
          y2={height}
          stroke="#888"
          strokeWidth={2}
        />
      ))}

      {/* String Lines (Horizontal) */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={0}
          y1={i * stringSpacing}
          x2={width}
          y2={i * stringSpacing}
          stroke="#ccc"
          strokeWidth={3 - i * 0.5} // thicker low strings
        />
      ))}

      {/* Dot: String 1, Fret 3 */}
      <circle
        cx={getX(3)}
        cy={getY(1)}
        r={8}
        fill="orange"
      />

      {/* Dot: String 2, Fret 1 */}
      <circle
        cx={getX(1)}
        cy={getY(2)}
        r={8}
        fill="lime"
      />
    </svg>
  );
  };

  export default Fretboard;

```

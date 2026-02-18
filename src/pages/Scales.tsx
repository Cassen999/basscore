import Fretboard from "../components/Fretboard";
import { createScale } from "../helpers/createScale";

export const Scales = () => {
  return (
    <div className="scales-container">
      <h1 className="page-title">Scales and Positions</h1>

      <div className="page-section">
        <h2 className="page-subtitle">Major (Position 1)</h2>
        <Fretboard coords={createScale('major')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Dorian (Position 2)</h2>
        <Fretboard coords={createScale('dorian')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Phrygian (Position 3)</h2>
        <Fretboard coords={createScale('phrygian')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Lydian (Position 4)</h2>
        <Fretboard coords={createScale('lydian')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Mixolydian (Position 5)</h2>
        <Fretboard coords={createScale('mixolydian')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Minor (Position 6)</h2>
        <Fretboard coords={createScale('minor')} />
      </div>

      <div className="page-section">
        <h2 className="page-subtitle">Locrian (Position 7)</h2>
        <Fretboard coords={createScale('locrian')} />
      </div>
    </div>
  );
};

import Fretboard from "../components/Fretboard";
import { createInterval } from "../helpers/createInterval";

export const Intervals = () => {
  return (
    <div className="intervals-container">
      <h1 className="page-title">Intervals</h1>
      <div>Root note is pink, interval note is purple, unison is teal</div>

      <div className="page-section">
        <div className="page-subsection">
          <h2>2nd</h2>
          <Fretboard coords={createInterval({ interval: 2 })} numFrets={6} />
          Flat: <Fretboard coords={createInterval({ interval: 2, flat: true })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>3rd</h2>
          <Fretboard coords={createInterval({ interval: 3 })} numFrets={6} />
          Flat: <Fretboard coords={createInterval({ interval: 3, flat: true })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>4th</h2>
          <Fretboard coords={createInterval({ interval: 4 })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>5th</h2>
          <Fretboard coords={createInterval({ interval: 5 })} numFrets={6} />
          Flat: <Fretboard coords={createInterval({ interval: 5, flat: true })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>6th</h2>
          <Fretboard coords={createInterval({ interval: 6 })} numFrets={6} />
          Flat: <Fretboard coords={createInterval({ interval: 6, flat: true })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>7th</h2>
          <Fretboard coords={createInterval({ interval: 7 })} numFrets={6} />
          Flat: <Fretboard coords={createInterval({ interval: 7, flat: true })} numFrets={6} />
        </div>

        <div className="page-subsection">
          <h2>8th (Octave)</h2>
          <Fretboard coords={createInterval({ interval: 8 })} numFrets={6} />
        </div>
      </div>
    </div>
  );
};

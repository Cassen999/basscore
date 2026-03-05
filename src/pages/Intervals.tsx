import Fretboard from "../components/Fretboard";
import { createInterval } from "../helpers/createInterval";
import { useControls } from "../contexts/ControlsContext";
import { useMemo } from "react";
import ControlPanel from "../components/ControlPanel";

export const Intervals = () => {
  const { interval = 2, setInterval } = useControls();

  const intervalSuffix = (interval: number) => {
    switch (interval) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  const coords = useMemo(
    () => createInterval({ interval: interval }),
    [interval],
  );
  
  return (
    <div className="intervals-container">
      <h1 className="page-title">Intervals</h1>
      <div>Root note is pink, interval note is purple, unison is teal</div>
      {/* <div>
        {([2, 3, 4, 5, 6, 7, 8] as const).map((i) => (
          <button key={i} onClick={() => setInterval && setInterval(i)}>
            {i}
          </button>
        ))}
      </div> */}

      <div className="intervals-page-section">
        <div className="page-subsection">
          <ControlPanel />
        </div>
        <div className="page-subsection">
          <h2>{interval + intervalSuffix(interval)}</h2>
          <Fretboard coords={coords} numFrets={6} />
        </div>
      </div>
    </div>
  );
};

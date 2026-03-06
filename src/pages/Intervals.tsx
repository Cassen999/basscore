import Fretboard from "../components/Fretboard";
import { createInterval } from "../helpers/createInterval";
import { useControls } from "../contexts/ControlsContext";
import { useMemo, type ReactNode } from "react";
import ControlPanel from "../components/ControlPanel";
import { ColorPicker } from "primereact/colorpicker";

export const Intervals = () => {
  const { interval = 2, setInterval, intervalColors } = useControls();


  const intervalSuffix = (interval: number): string => {
    switch (interval) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const intervalRenderColors = {
    root: intervalColors?.root.color as string,
    interval: intervalColors?.interval.color as string,
    unison: intervalColors?.unison.color as string,
  };

  const coords = useMemo(
    () => createInterval({ interval: interval, colors: intervalRenderColors }),
    [
      interval,
      intervalRenderColors
    ],
  );

  const rootNoteControls = (): ReactNode => {
    return (
      <div className="root-controls">
        <ColorPicker
          id='root-note-cp'
          className='color-picker'
          title="Root Note Color"
          value={intervalColors?.root.color as string}
          onChange={(e) => intervalColors?.root.setColor(`#${e.value}`)}
        />
        <label htmlFor="root-note-cp">Root Note</label>
      </div>
    );
  };

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
          <ControlPanel cardProps={{
            header: 'Fretboard Controls'
          }} elements={[rootNoteControls()]} />
        </div>
        <div className="page-subsection">
          <h2>{interval + intervalSuffix(interval)}</h2>
          <Fretboard coords={coords} numFrets={6} />
        </div>
      </div>
    </div>
  );
};

import Fretboard from "../components/Fretboard";
import { createInterval } from "../helpers/createInterval";
import { useControls } from "../contexts/ControlsContext";
import { useMemo, type ReactNode } from "react";
import ControlPanel from "../components/ControlPanel";
import { ColorPicker } from "primereact/colorpicker";
import type {
  iControlElementGroups,
  iIntervalSelectItems,
  tNoteType,
} from "../types/types";
import { InputSwitch } from "primereact/inputswitch";
import { SelectButton } from "primereact/selectbutton";

export const Intervals = () => {
  const {
    interval = 2,
    setInterval,
    intervalColors,
    showUnison,
    setShowUnison,
  } = useControls();

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

  const intervalSelect = () => {
    const intervalOptions: iIntervalSelectItems[] = [
      { name: "2nd", value: 2 },
      { name: "3rd", value: 3 },
      { name: "4th", value: 4 },
      { name: "5th", value: 5 },
      { name: "6th", value: 6 },
      { name: "7th", value: 7 },
      { name: "8th", value: 8 },
    ];

    return (
      <div className="interval-select">
        <SelectButton
          value={interval}
          options={intervalOptions}
          onChange={(e) => setInterval(e.value)}
          optionLabel="name"
        />
      </div>
    );
  };

  const intervalRenderColors = {
    root: intervalColors?.root.color as string,
    interval: intervalColors?.interval.color as string,
    unison: intervalColors?.unison.color as string,
  };

  const coords = useMemo(
    () =>
      createInterval({
        interval: interval,
        colors: intervalRenderColors,
        unison: showUnison,
      }),
    [interval, intervalRenderColors],
  );

  const noteColorControls = (noteType: tNoteType): ReactNode => {
    return (
      <div className={`${noteType}-cp`}>
        <ColorPicker
          id={`${noteType}-note-cp`}
          className="color-picker"
          title={`${noteType} Note Color`}
          value={intervalColors[noteType].color as string}
          onChange={(e) => intervalColors[noteType].setColor(`#${e.value}`)}
        />
      </div>
    );
  };

  const unisonSwitch = () => (
    <div className="unison-toggle">
      <InputSwitch
        id="unison-switch"
        aria-label="Show/Hide Unison Note"
        tooltip="Show/Hide Unison Note"
        checked={showUnison}
        onChange={(e) => setShowUnison(e.value)}
      />
    </div>
  );

  const controlsElements: iControlElementGroups[] = [
    {
      title: 'Interval',
      elements: [intervalSelect()],
    },
    {
      title: "Root Note",
      elements: [noteColorControls("root")],
    },
    {
      title: "Interval Note",
      elements: [noteColorControls("interval")],
    },
    {
      title: "Unison Note",
      elements: [noteColorControls("unison"), unisonSwitch()],
    },
  ];

  return (
    <div className="intervals-container">
      <h1 className="page-title">Intervals</h1>

      <div className="intervals-page-section">
        <div className="page-subsection">
          <ControlPanel
            cardProps={{
              header: "Fretboard Controls",
            }}
            // elements={[noteColorControls('root')]}
            elements={controlsElements}
          />
        </div>
        <div className="page-subsection">
          <h2>{interval + intervalSuffix(interval)}</h2>
          <Fretboard coords={coords} numFrets={6} />
        </div>
      </div>
    </div>
  );
};

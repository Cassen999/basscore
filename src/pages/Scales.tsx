import { SelectButton } from "primereact/selectbutton";
import ControlPanel from "../components/ControlPanel";
import Fretboard from "../components/Fretboard";
import { useControls } from "../contexts/ControlsContext";
import { createScale } from "../helpers/createScale";
import type {
  iControlElementGroups,
  iScaleSelectItems,
  tColorType,
} from "../types/types";
import { ColorPicker } from "primereact/colorpicker";
import type { ReactNode } from "react";

export const Scales = () => {
  const {
    scaleNoteColor,
    setScaleNoteColor,
    setDisplayedScales,
    displayedScales,
  } = useControls();

  const noteColorControls = (): ReactNode => {
    return (
      <div className="scale-cp">
        <ColorPicker
          className="color-picker"
          title="Scale Note Color"
          value={scaleNoteColor as string}
          onChange={(e) => setScaleNoteColor(`#${e.value}`)}
        />
      </div>
    );
  };

  const scaleSelect = () => {
    const scaleOptions: iScaleSelectItems[] = [
      { name: "major", value: "major" },
      { name: "minor", value: "minor" },
      { name: "dorian", value: "dorian" },
      { name: "locrian", value: "locrian" },
      { name: "lydian", value: "lydian" },
      { name: "mixolydian", value: "mixolydian" },
      { name: "phrygian", value: "phrygian" },
    ];

    return (
      <div className="interval-select">
        <SelectButton
          value={displayedScales}
          options={scaleOptions}
          onChange={(e) => setDisplayedScales(e.value)}
          optionLabel="name"
        />
      </div>
    );
  };

  const controlsElements: iControlElementGroups[] = [
    {
      title: "Scale",
      elements: [scaleSelect()],
    },
    {
      title: "Note Color",
      elements: [noteColorControls()],
    },
  ];

  return (
    <div className="scales-container">
      <h1 className="page-title">Scales and Positions</h1>

      <div className='scale-page-section'>
        <div className="page-subsection">
          <ControlPanel
            cardProps={{
              header: "Fretboard Controls",
            }}
            elements={controlsElements}
          />
        </div>

        <div className="page-subsection">
          <h2 className="page-subtitle">Major (Position 1)</h2>
          <Fretboard
            coords={createScale({
              scaleType: displayedScales,
              noteColor: scaleNoteColor,
            })}
          />
        </div>
      </div>
    </div>
  );
};

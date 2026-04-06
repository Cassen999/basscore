import { SelectButton } from "primereact/selectbutton";
import ControlPanel from "../components/ControlPanel";
import Fretboard from "../components/Fretboard";
import { useControls } from "../contexts/ControlsContext";
import { createScale } from "../helpers/fretpoints";
import type { iControlElementGroups, iScaleSelectItems } from "../types/types";
import { ColorPicker } from "primereact/colorpicker";
import { useEffect, useRef, type ReactNode } from "react";
import _ from "lodash";
import { DictionaryPanel } from "../components/DictionaryPanel";
import { OverlayPanel } from "primereact/overlaypanel";

export const Scales = () => {
  const {
    scaleNoteColor,
    setScaleNoteColor,
    setDisplayedScales,
    displayedScales,
    fretboardConfig,
    setFretboardConfig,
  } = useControls();

  useEffect(() => setFretboardConfig({ ...fretboardConfig, numFrets: 5 }), []);

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

  const scaleOptions: iScaleSelectItems[] = [
    { name: "Major", value: "major" },
    { name: "Dorian", value: "dorian" },
    { name: "Phrygian", value: "phrygian" },
    { name: "Lydian", value: "lydian" },
    { name: "Mixolydian", value: "mixolydian" },
    { name: "Minor", value: "minor" },
    { name: "Locrian", value: "locrian" },
  ];

  const scaleSelect = () => {
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

  const overlayRef = useRef<OverlayPanel>(null);

  const formattedScaleName = (
    <span
      onMouseEnter={(e) => overlayRef.current?.show(e, e.target)}
      onMouseLeave={() => overlayRef.current?.hide()}
    >
      <p className="displayed-scale">
        {displayedScales[0].toUpperCase() + displayedScales.slice(1)}
      </p>
    </span>
  );

  return (
    <div className="scales-container">
      <OverlayPanel ref={overlayRef}>
        <DictionaryPanel word={displayedScales} />
      </OverlayPanel>
      <h1 className="page-title">Scales and Positions</h1>

      <div className="scale-page-section">
        <div className="page-subsection">
          <ControlPanel
            cardProps={{
              header: "Fretboard Controls",
            }}
            elements={controlsElements}
          />
        </div>

        <div className="page-subsection">
          <h2 className="page-subtitle">
            {formattedScaleName}{" "}
            {`(Position ${_.findIndex(scaleOptions, { value: displayedScales }) + 1})`}
          </h2>
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

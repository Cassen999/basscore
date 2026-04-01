import { InputNumber } from "primereact/inputnumber";
import { Metronome } from "../components/Metronome";
import { useState } from "react";
import type { tSubdivision } from "../types/types";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Slider } from "primereact/slider";

interface iSubdivisionMenu {
  name: string;
  value: tSubdivision;
}

const subdivisions: iSubdivisionMenu[] = [
  { name: "Whole Note", value: 0.25 },
  { name: "Half Note", value: 0.5 },
  { name: "Quarter Note", value: 1 },
  { name: "Eight Note", value: 2 },
  { name: "Sixteenth Note", value: 4 },
];

export const MetronomePage = () => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subDiv, setSubDiv] = useState<tSubdivision>(subdivisions[2].value);
  const [volume, setVolume] = useState<number>(50);

  return (
    <div className="metronome-container">
      <div className="metronome-controls-container">
        <div className="metronome-controls">
          <Tooltip
            target=".bpm-inputnumber"
            content="How many beats per measure?"
            mouseTrack
            mouseTrackLeft={10}
          />
          <label className="bpm-inputnumber">
            BPM
            <InputNumber
              inputId="bpm-input"
              name="bpm"
              min={40}
              max={240}
              value={bpm}
              onValueChange={(e) => setBpm(e.value!!)}
            />
          </label>
          <Tooltip
            target=".subdivision-input"
            content="What type of notes? Default is Quarter Note"
            mouseTrack
            mouseTrackLeft={10}
          />
          <label className="subdivision-input">
            Subdivision
            <Dropdown
              id="subdivision-input"
              value={subDiv}
              onChange={(e: DropdownChangeEvent) => {
                setSubDiv(e.value);
              }}
              options={subdivisions}
              optionLabel="name"
              optionValue="value"
              placeholder="Subdivisions"
            />
          </label>
        </div>
        <Button
          label={isPlaying ? "Stop" : "Start"}
          onClick={() => setIsPlaying(!isPlaying)}
        />
      </div>
      <div className="volume-slider">
        <Tooltip
          target=".volume-slider"
          content="Volume"
          mouseTrack
          mouseTrackLeft={10}
        />
        <Slider
          value={volume}
          onChange={(e) => {
            console.log("e", e.value);
            setVolume(e.value as number);
          }}
          orientation="vertical"
          min={0}
          max={100}
        />
      </div>
      <Metronome
        bpm={bpm}
        subdivision={subDiv}
        isPlaying={isPlaying}
        volume={volume / 100}
      />
    </div>
  );
};

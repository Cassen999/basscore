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

interface iTimeSigMenu {
  name: string;
  /** Full time signature string, e.g. "4/4". Numerator is parsed for bpMeasure. */
  value: string;
}

const subdivisions: iSubdivisionMenu[] = [
  { name: "Whole Note", value: 0.25 },
  { name: "Half Note", value: 0.5 },
  { name: "Quarter Note", value: 1 },
  { name: "Eight Note", value: 2 },
  { name: "Sixteenth Note", value: 4 },
];

const timeSignatures: iTimeSigMenu[] = [
  { name: "1/2", value: "1/2" },
  { name: "2/2", value: "2/2" },
  { name: "3/2", value: "3/2" },
  { name: "4/2", value: "4/2" },
  { name: "1/4", value: "1/4" },
  { name: "2/4", value: "2/4" },
  { name: "3/4", value: "3/4" },
  { name: "4/4", value: "4/4" },
  { name: "5/4", value: "5/4" },
  { name: "6/4", value: "6/4" },
  { name: "7/4", value: "7/4" },
  { name: "8/4", value: "8/4" },
  { name: "9/4", value: "9/4" },
  { name: "10/4", value: "10/4" },
  { name: "11/4", value: "11/4" },
  { name: "12/4", value: "12/4" },
  { name: "1/8", value: "1/8" },
  { name: "2/8", value: "2/8" },
  { name: "3/8", value: "3/8" },
  { name: "4/8", value: "4/8" },
  { name: "5/8", value: "5/8" },
  { name: "6/8", value: "6/8" },
  { name: "7/8", value: "7/8" },
  { name: "8/8", value: "8/8" },
  { name: "9/8", value: "9/8" },
  { name: "10/8", value: "10/8" },
  { name: "11/8", value: "11/8" },
  { name: "12/8", value: "12/8" },
];

export const MetronomePage = () => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subDiv, setSubDiv] = useState<tSubdivision>(subdivisions[2].value);
  const [volume, setVolume] = useState<number>(50);
  const [timeSig, setTimeSig] = useState<string>("4/4");

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
          <Tooltip
            target=".time-sig-input"
            content="Time signature"
            mouseTrack
            mouseTrackLeft={10}
          />
          <label className="time-sig-input">
            Time Signature
            <Dropdown
              id="time-sig-input"
              value={timeSig}
              onChange={(e: DropdownChangeEvent) => {
                setTimeSig(e.value);
              }}
              options={timeSignatures}
              optionLabel="name"
              optionValue="value"
              placeholder="Time Signature"
            />
          </label>
        </div>
        <div className="volume-slider">
          <Tooltip
            target=".volume-slider"
            content={`Volume: ${volume}`}
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
      </div>
      <div className="metronome-play-section">
        <Metronome
          bpm={bpm}
          subdivision={subDiv}
          isPlaying={isPlaying}
          volume={volume / 100}
          bpMeasure={parseInt(timeSig.split("/")[0])}
        />
        <Button
          className='start-metronome-btn'
          label={isPlaying ? "Stop" : "Start"}
          onClick={() => setIsPlaying(!isPlaying)}
        />
      </div>
    </div>
  );
};

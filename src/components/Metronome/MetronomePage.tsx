import { InputNumber } from "primereact/inputnumber";
import { Metronome } from "./Metronome";
import { useState, useEffect } from "react";
import type { tSubdivision } from "../../types/types";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import BCTooltip from "../BCTooltip/BCTooltip";
import { Slider } from "primereact/slider";
import { subdivisions, timeSignatures } from "../../helpers/dataSets";

export const MetronomePage = () => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subDiv, setSubDiv] = useState<tSubdivision>(subdivisions[2].value);
  const [volume, setVolume] = useState<number>(50);
  const [timeSig, setTimeSig] = useState<string>("4/4");
  const [isMd, setIsMd] = useState<boolean>(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="metronome-container">
      <div className="metronome-controls-container">
        <div className="metronome-controls">
          <BCTooltip target=".bpm-inputnumber" content="How many beats per measure?" mouseTrack mouseTrackLeft={10} />
          <label className="bpm-inputnumber">
            BPM
            <InputNumber
              inputId="bpm-input"
              name="bpm"
              min={40}
              max={240}
              value={bpm}
              onValueChange={(e) => setBpm(e.value!!)}
              inputMode="numeric"
            />
          </label>
          <BCTooltip target=".subdivision-input" content="What type of notes? Default is Quarter Note" mouseTrack mouseTrackLeft={10} />
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
          <BCTooltip target=".time-sig-input" content="Time signature" mouseTrack mouseTrackLeft={10} />
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
          <BCTooltip target=".volume-slider" content={`Volume: ${volume}`} />
          <Slider
            value={volume}
            onChange={(e) => setVolume(e.value as number)}
            orientation={isMd ? 'horizontal' : 'vertical'}
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

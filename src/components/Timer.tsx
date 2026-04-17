import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useTimer } from '../contexts/TimerContext';

interface iTimerDialogProps {
  visible: boolean;
  onHide: () => void;
  /** Bounding rect of the trigger button — used to anchor the dialog position */
  anchorRect: DOMRect | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const Timer = ({ visible, onHide, anchorRect }: iTimerDialogProps) => {
  const { duration, setDuration, accumulated, displayMs, isRunning, status, start, pause, stop } =
    useTimer();
  const [resetDuration, setResetDuration] = useState<number | null>(null);

  // This should use formatted time and extract values from that
  const minutes = Math.floor(displayMs / 60000);
  const seconds = Math.floor((displayMs % 60000) / 1000);

  const handleTimeChange = (newMinutes: number, newSeconds: number) => {
    const clampedMinutes = Math.min(60, Math.max(0, newMinutes));
    const clampedSeconds = clampedMinutes === 60 ? 0 : Math.min(59, Math.max(0, newSeconds));
    const newRemainingMs = (clampedMinutes * 60 + clampedSeconds) * 1000;
    setDuration((newRemainingMs + accumulated) / 1000);
  };

  const handleInputChange = (raw: string, field: 'minutes' | 'seconds') => {
    const digits = raw.replace(/\D/g, '');
    const val = digits === '' ? 0 : parseInt(digits, 10);
    if (field === 'minutes') handleTimeChange(val, seconds);
    else handleTimeChange(minutes, val);
  };

  const handleStart = () => {
    if (status === 'idle') setResetDuration(duration);
    start();
  };

  const handleReset = () => {
    stop();
    setDuration(resetDuration);
  };

  const handleClear = () => {
    stop();
    setDuration(null);
    setResetDuration(null);
  };

  const addTime = (secs: number) => {
    setDuration((prev) => (prev ?? 0) + secs);
  };

  const dialogStyle = anchorRect
    ? { marginTop: anchorRect.bottom + 8, marginLeft: anchorRect.left + anchorRect.width / 2 }
    : undefined;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal={false}
      showHeader={false}
      position='top-left'
      draggable={false}
      resizable={false}
      style={dialogStyle}
      className='timer-dialog'
    >
      <div className='timer-dialog__display'>
        <input
          type='text'
          inputMode='numeric'
          value={pad(minutes)}
          disabled={isRunning}
          maxLength={2}
          aria-label='Minutes'
          className='timer-dialog__input-field'
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleInputChange(e.target.value, 'minutes')}
        />
        <span className='timer-dialog__colon'>:</span>
        <input
          type='text'
          inputMode='numeric'
          value={pad(seconds)}
          disabled={isRunning}
          maxLength={2}
          aria-label='Seconds'
          className='timer-dialog__input-field'
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleInputChange(e.target.value, 'seconds')}
        />
      </div>
      <div className='timer-dialog__pills'>
        <button className='timer-dialog__pill' onClick={() => addTime(30)}>
          +30s
        </button>
        <button className='timer-dialog__pill' onClick={() => addTime(60)}>
          +1 min
        </button>
        <button className='timer-dialog__pill' onClick={() => addTime(120)}>
          +2 min
        </button>
      </div>
      <Button
        label={isRunning ? 'Stop' : 'Start'}
        onClick={isRunning ? pause : handleStart}
        disabled={!isRunning && !duration}
        className='timer-dialog__start-stop'
      />
      <div className='timer-dialog__secondary-actions'>
        <button className='timer-dialog__secondary-btn' onClick={handleReset} disabled={!duration}>
          Reset
        </button>
        <button className='timer-dialog__secondary-btn' onClick={handleClear} disabled={!duration}>
          Clear
        </button>
      </div>
    </Dialog>
  );
};

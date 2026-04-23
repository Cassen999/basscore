import { useState } from 'react';
import { Button } from 'primereact/button';
import { useTimer } from '../../contexts/TimerContext';

const pad = (n: number) => String(n).padStart(2, '0');

export const TimerControls = () => {
  const { duration, setDuration, accumulated, formattedTime, status, start, pause, stop } =
    useTimer();
  const [startDuration, setStartDuration] = useState<number | null>(null);
  const [pillTotal, setPillTotal] = useState<number>(0);
  const [activeField, setActiveField] = useState<'minutes' | 'seconds' | null>(null);
  const [inputBuffer, setInputBuffer] = useState('');

  const [minutes, seconds] = formattedTime.split(':').map(Number);

  const handleTimeChange = (newMinutes: number, newSeconds: number) => {
    const clampedMinutes = Math.min(60, Math.max(0, newMinutes));
    const clampedSeconds = clampedMinutes === 60 ? 0 : Math.min(59, Math.max(0, newSeconds));
    const newRemainingMs = (clampedMinutes * 60 + clampedSeconds) * 1000;
    setDuration((newRemainingMs + accumulated) / 1000);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, field: 'minutes' | 'seconds') => {
    e.target.select();
    setActiveField(field);
    setInputBuffer(field === 'minutes' ? pad(minutes) : pad(seconds));
  };

  const handleInputChange = (raw: string, field: 'minutes' | 'seconds') => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setInputBuffer(digits);
    const val = digits === '' ? 0 : parseInt(digits, 10);
    if (field === 'minutes') handleTimeChange(val, seconds);
    else handleTimeChange(minutes, val);
  };

  const handleBlur = (field: 'minutes' | 'seconds') => {
    setActiveField(null);
    const val = inputBuffer === '' ? 0 : parseInt(inputBuffer, 10);
    if (field === 'minutes') handleTimeChange(val, seconds);
    else handleTimeChange(minutes, val);
  };

  const handleStart = () => {
    if (status === 'idle') {
      setStartDuration(duration);
      setPillTotal(0);
    }
    start();
  };

  const handleReset = () => {
    stop();
    setDuration((startDuration ?? 0) + pillTotal);
  };

  const handleClear = () => {
    stop();
    setDuration(null);
    setStartDuration(null);
    setPillTotal(0);
  };

  const addTime = (secs: number) => {
    setDuration((prev) => (prev ?? 0) + secs);
    setPillTotal((prev) => prev + secs);
  };

  return (
    <div className='timer-controls'>
      <div className='timer-controls__display'>
        <input
          type='text'
          inputMode='numeric'
          value={activeField === 'minutes' ? inputBuffer : pad(minutes)}
          disabled={status === 'running'}
          maxLength={2}
          aria-label='Minutes'
          className='timer-controls__input-field'
          onFocus={(e) => handleFocus(e, 'minutes')}
          onChange={(e) => handleInputChange(e.target.value, 'minutes')}
          onBlur={() => handleBlur('minutes')}
        />
        <span className='timer-controls__colon'>:</span>
        <input
          type='text'
          inputMode='numeric'
          value={activeField === 'seconds' ? inputBuffer : pad(seconds)}
          disabled={status === 'running'}
          maxLength={2}
          aria-label='Seconds'
          className='timer-controls__input-field'
          onFocus={(e) => handleFocus(e, 'seconds')}
          onChange={(e) => handleInputChange(e.target.value, 'seconds')}
          onBlur={() => handleBlur('seconds')}
        />
      </div>
      <div className='timer-controls__pills'>
        <button className='timer-controls__pill' onClick={() => addTime(30)}>
          +30s
        </button>
        <button className='timer-controls__pill' onClick={() => addTime(60)}>
          +1 min
        </button>
        <button className='timer-controls__pill' onClick={() => addTime(120)}>
          +2 min
        </button>
      </div>
      <Button
        label={status === 'running' ? 'Stop' : 'Start'}
        onClick={status === 'running' ? pause : handleStart}
        disabled={status !== 'running' && !duration}
        className='timer-controls__start-stop'
      />
      <div className='timer-controls__secondary-actions'>
        <button
          className='timer-controls__secondary-btn'
          onClick={handleReset}
          disabled={!duration}
        >
          Reset
        </button>
        <button
          className='timer-controls__secondary-btn'
          onClick={handleClear}
          disabled={!duration}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

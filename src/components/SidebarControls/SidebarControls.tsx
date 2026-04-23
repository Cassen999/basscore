import { useLocation } from 'react-router-dom';
import { useControls } from '../../contexts/ControlsContext';
import { Dropdown } from 'primereact/dropdown';
import { ColorPicker } from 'primereact/colorpicker';
import { InputSwitch } from 'primereact/inputswitch';
import type { iScaleSelectItems, iIntervalSelectItems } from '../../types/types';

const scaleOptions: iScaleSelectItems[] = [
  { name: 'Major', value: 'major' },
  { name: 'Minor', value: 'minor' },
  { name: 'Dorian', value: 'dorian' },
  { name: 'Locrian', value: 'locrian' },
  { name: 'Lydian', value: 'lydian' },
  { name: 'Mixolydian', value: 'mixolydian' },
  { name: 'Phrygian', value: 'phrygian' },
];

const intervalOptions: iIntervalSelectItems[] = [
  { name: '2nd', value: 2 },
  { name: '3rd', value: 3 },
  { name: '4th', value: 4 },
  { name: '5th', value: 5 },
  { name: '6th', value: 6 },
  { name: '7th', value: 7 },
  { name: '8th', value: 8 },
];

const SidebarControls = () => {
  const { pathname } = useLocation();
  const {
    displayedScales,
    setDisplayedScales,
    scaleNoteColor,
    setScaleNoteColor,
    interval,
    setInterval,
    intervalColors,
    showUnison,
    setShowUnison,
  } = useControls();

  if (pathname === '/scales') {
    return (
      <div className='sidebar-controls'>
        <div className='sidebar-controls__group'>
          <span className='sidebar-controls__label'>Scale</span>
          <Dropdown
            value={displayedScales}
            options={scaleOptions}
            onChange={(e) => setDisplayedScales(e.value)}
            optionLabel='name'
            panelClassName='sidebar-dropdown-panel'
          />
        </div>
        <div className='sidebar-controls__group'>
          <span className='sidebar-controls__label'>Note Color</span>
          <ColorPicker
            value={scaleNoteColor as string}
            onChange={(e) => setScaleNoteColor(`#${e.value}`)}
          />
        </div>
      </div>
    );
  }

  if (pathname === '/intervals') {
    return (
      <div className='sidebar-controls'>
        <div className='sidebar-controls__group'>
          <span className='sidebar-controls__label'>Interval</span>
          <Dropdown
            value={interval}
            options={intervalOptions}
            onChange={(e) => setInterval(e.value)}
            optionLabel='name'
            panelClassName='sidebar-dropdown-panel'
          />
        </div>
        <div className='sidebar-controls__group'>
          <span className='sidebar-controls__label'>Root</span>
          <ColorPicker
            value={intervalColors.root.color as string}
            onChange={(e) => intervalColors.root.setColor(`#${e.value}`)}
          />
        </div>
        <div className='sidebar-controls__group'>
          <span className='sidebar-controls__label'>Interval</span>
          <ColorPicker
            value={intervalColors.interval.color as string}
            onChange={(e) => intervalColors.interval.setColor(`#${e.value}`)}
          />
        </div>
        <div className='sidebar-controls__group unison'>
          <span className='sidebar-controls__label'>Unison</span>
          <ColorPicker
            value={intervalColors.unison.color as string}
            onChange={(e) => intervalColors.unison.setColor(`#${e.value}`)}
          />
          <span className='sidebar-controls__label unison-switch-label'>{showUnison ? 'Hide' : 'Show'} Unison</span>
          <InputSwitch
            aria-label='Show/Hide Unison Note'
            checked={showUnison}
            onChange={(e) => setShowUnison(e.value)}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default SidebarControls;

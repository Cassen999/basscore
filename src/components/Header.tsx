// Rule: always use single quotes over double quotes unless double quotes are necessary
import { useRef, useState } from 'react';
import type { MenuItem } from 'primereact/menuitem';
import type { MenuItemOptions } from 'primereact/menuitem';
import Logo from '../assets/logo.png';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { useNavigate } from 'react-router-dom';
import SidebarControls from './SidebarControls';
import { Timer } from './Timer';
import { TimerControls } from './TimerControls';
import { useTimer } from '../contexts/TimerContext';

export const Header = () => {
  const nav = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerAnchorRect, setTimerAnchorRect] = useState<DOMRect | null>(null);
  const timerBtnRef = useRef<HTMLButtonElement>(null);

  const { status, formattedTime } = useTimer();

  const items: MenuItem[] = [
    { label: 'Home', command: () => nav('/home') },
    { label: 'Metronome', command: () => nav('/metronome') },
    { label: 'Scales', command: () => nav('/scales') },
    { label: 'Intervals', command: () => nav('/intervals') },
    {
      label: 'Timer',
      template: (_item: MenuItem, options: MenuItemOptions) => (
        <button
          ref={timerBtnRef}
          className={`${options.className} timer-menu-btn`}
          onClick={() => {
            setTimerAnchorRect(timerBtnRef.current?.getBoundingClientRect() ?? null);
            setTimerVisible((v) => !v);
          }}
        >
          <span className={options.labelClassName}>
            Timer{status === 'running' && !timerVisible && ` - ${formattedTime}`}
          </span>
        </button>
      ),
    },
  ];

  const navItems = [
    { label: 'Home', url: '/home' },
    { label: 'Metronome', url: '/metronome' },
    { label: 'Scales', url: '/scales' },
    { label: 'Intervals', url: '/intervals' },
  ];

  return (
    <div className='header-container'>
      <Button
        icon='pi pi-bars'
        className='hamburger-btn'
        onClick={() => setSidebarVisible(true)}
        text
        aria-label='Open navigation menu'
      />
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        position='left'
        className='nav-sidebar'
      >
        <nav>
          {navItems.map((item) => (
            <button
              key={item.label}
              className='nav-sidebar__item'
              onClick={() => {
                nav(item.url);
                setSidebarVisible(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className='sidebar-timer'>
          <Panel header='Timer' toggleable collapsed className='sidebar-timer__panel'>
            <TimerControls />
          </Panel>
        </div>
        <SidebarControls />
        <div className='nav-sidebar__img-container'>
          <img src='images/bass-guitar.png' alt='Bass guitar' className='nav-sidebar__img' />
        </div>
      </Sidebar>
      <div className='logo-container'>
        <img src={Logo} className='logo' alt='basscore logo' />
      </div>
      <div className='menubar-container'>
        <Menubar model={items} />
      </div>
      <Timer
        visible={timerVisible}
        onHide={() => setTimerVisible(false)}
        anchorRect={timerAnchorRect}
      />
    </div>
  );
};

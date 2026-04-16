// Rule: always use single quotes over double quotes unless double quotes are necessary
import { useState } from 'react';
import type { MenuItem } from 'primereact/menuitem';
import Logo from '../assets/logo.png';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import SidebarControls from './SidebarControls';

export const Header = () => {
  const nav = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const items: MenuItem[] = [
    { label: 'Home', command: () => nav('/home') },
    { label: 'Metronome', command: () => nav('/metronome') },
    { label: 'Scales', command: () => nav('/scales') },
    { label: 'Intervals', command: () => nav('/intervals') },
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
    </div>
  );
};

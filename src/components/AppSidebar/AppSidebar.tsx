import { Sidebar } from 'primereact/sidebar';
import type { iAppSidebarProps } from '../../types/types';

const AppSidebar = ({ visible, onHide, position = 'right', children }: iAppSidebarProps) => (
  <Sidebar visible={visible} onHide={onHide} position={position} className='nav-sidebar'>
    {children}
    <div className='nav-sidebar__img-container'>
      <img src={`${import.meta.env.BASE_URL}images/bass-guitar.png`} alt='Bass guitar' className='nav-sidebar__img' />
    </div>
  </Sidebar>
);

export default AppSidebar;

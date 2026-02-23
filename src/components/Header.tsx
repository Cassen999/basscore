import type { MenuItem } from "primereact/menuitem";
import Logo from "../assets/logo.png";
import Initials from "../assets/initials.png";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const nav = useNavigate();
  const items: MenuItem[] = [
    {
      label: "Home",
      icon: <img src={Initials} className="initials" />,
      command: () => nav("/"),
    },
  ];

  return (
    <div className="header-container">
      <div className="logo-container">
        <img src={Logo} className="logo" alt="basscore logo" />
      </div>
      <Menubar className="home-menu" model={items} />
    </div>
  );
};

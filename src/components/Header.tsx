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
      command: () => nav("/"),
    },
    {
      label: "Scales",
      command: () => nav("/scales"),
    },
    {
      label: "Intervals",
      command: () => nav("/intervals"),
    },
  ];

  return (
    <div className="header-container">
      <div className="logo-container">
        <img src={Logo} className="logo" alt="basscore logo" />
      </div>
      <Menubar
        className="home-menu"
        model={items}
        start={<img src={Initials} className="initials" />}
      />
    </div>
  );
};

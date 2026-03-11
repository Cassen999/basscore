
import type { MenuItem } from "primereact/menuitem";
import Logo from "../assets/logo.png";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const nav = useNavigate();

  const items: MenuItem[] = [
    { label: "Home", command: () => nav("/home") },
    { label: "Metronome", command: () => nav("/metronome")},
    { label: "Scales", command: () => nav("/scales") },
    { label: "Intervals", command: () => nav("/intervals") },
  ];

  return (
    <div className="header-container">
      <div className="logo-container">
        <img src={Logo} className="logo" alt="basscore logo" />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Menubar model={items} />
      </div>
    </div>
  );
};

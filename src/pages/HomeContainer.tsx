import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { ControlsProvider } from "../contexts/ControlsContext";

export const HomeContainer = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-section">
        <ControlsProvider>
          <Outlet />
        </ControlsProvider>
      </main>
    </div>
  );
};

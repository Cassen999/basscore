import { Outlet } from "react-router-dom";
import { Header } from "../Header/Header";
import { ControlsProvider } from "../../contexts/ControlsContext";
import { TimerProvider } from "../../contexts/TimerContext";
import Footer from "../Footer/Footer";

export const HomeContainer = () => {
  return (
    <div className="app-container">
      <TimerProvider>
        <ControlsProvider>
          <Header />
          <main className="main-section">
            <Outlet />
          </main>
        </ControlsProvider>
      </TimerProvider>
      <Footer />
    </div>
  );
};

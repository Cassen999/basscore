import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { ControlsProvider } from "../contexts/ControlsContext";
import Footer from "../components/Footer";

export const HomeContainer = () => {
  return (
    <div className="app-container">
      <ControlsProvider>
        <Header />
        <main className="main-section">
          <Outlet />
        </main>
      </ControlsProvider>
      <Footer />
    </div>
  );
};

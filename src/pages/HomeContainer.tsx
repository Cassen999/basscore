import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export const HomeContainer = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-section">
        <Outlet />
      </main>
    </div>
  );
};

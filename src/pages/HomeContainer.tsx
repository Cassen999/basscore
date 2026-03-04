import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export const HomeContainer = () => {
  return (
    <div className='home-container'>
      <Header />
      <div className='main-section'>
        {/* <Sidenav /> */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
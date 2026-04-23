import { Home } from "./pages/Home";
import { Intervals } from "./pages/Intervals";
import { Scales } from "./pages/Scales";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./styles/index.scss";
import { HomeContainer } from "./pages/HomeContainer";
import { MetronomePage } from "./pages/Metronome";
import { CustomFretboard } from "./pages/CustomFretboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeContainer />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="scales" element={<Scales />} />
        <Route path="intervals" element={<Intervals />} />
        <Route path="metronome" element={<MetronomePage />} />
        <Route path="teaching-tools" element={<Outlet />}>
          <Route path="fretboard" element={<CustomFretboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

import { Home } from "./components/Home/Home";
import { Intervals } from "./components/Intervals/Intervals";
import { Scales } from "./components/Scales/Scales";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./styles/index.scss";
import { HomeContainer } from "./components/Home/HomeContainer";
import { MetronomePage } from "./components/Metronome/MetronomePage";
import { CustomFretboard } from "./components/CustomFretboardEditor/CustomFretboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeContainer />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="scales" element={<Scales />} />
        <Route path="intervals" element={<Intervals />} />
        <Route path="metronome" element={<MetronomePage />} />
        <Route path="tools" element={<Outlet />}>
          <Route path="fretboard" element={<CustomFretboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

import { Home } from "./pages/Home";
import { Intervals } from "./pages/Intervals";
import { Scales } from "./pages/Scales";
import { Navigate, Route, Routes } from "react-router-dom";
import "./styles/index.scss";
import { HomeContainer } from "./pages/HomeContainer";
import { Metronome } from "./components/Metronome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeContainer />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="scales" element={<Scales />} />
        <Route path="intervals" element={<Intervals />} />
        <Route path="metronome" element={<Metronome />} />
      </Route>
    </Routes>
  );
}

export default App;

import { Home } from "./pages/Home";
import { Intervals } from "./pages/Intervals";
import { Scales } from "./pages/Scales";
import { Route, Routes } from "react-router-dom";
import "./styles/index.scss";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scales" element={<Scales />} />
      <Route path="/intervals" element={<Intervals />} />
    </Routes>
  );
}

export default App;

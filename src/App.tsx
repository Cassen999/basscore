import { Home } from "./pages/Home";
import { Intervals } from "./pages/Intervals";
import { Scales } from "./pages/Scales";
import { Route, Routes } from "react-router-dom";
import "./styles/index.scss";
import { HomeContainer } from "./pages/HomeContainer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeContainer />}>
        <Route path="scales" element={<Scales />} />
        <Route path="intervals" element={<Intervals />} />
      </Route>
    </Routes>
  );
}

export default App;

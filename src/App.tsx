import { StrictMode } from "react";
import { Metronome } from "./components/Metronome/Metronome";
import { PrimeReactProvider } from "primereact/api";
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // theme
import 'primereact/resources/primereact.min.css';                  // core css
import 'primeicons/primeicons.css';                                // icons

function App() {
  return (
    <StrictMode>
      <PrimeReactProvider>
        <Metronome />
      </PrimeReactProvider>
    </StrictMode>
  );
}

export default App;

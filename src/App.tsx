import WelcomePage from "./components/WelcomePage.tsx";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage.tsx";

export function App() {
  return (
      <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/map" element={<MainPage />} />
      </Routes>
  );
}
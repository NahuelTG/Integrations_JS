import { Routes, Route } from "react-router";

import CameraApp from "./components/CameraApp";
import Home from "./components/Home";

import "./App.css";

function App() {
   return (
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/camera" element={<CameraApp />} />
      </Routes>
   );
}

export default App;

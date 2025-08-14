import { Routes, Route } from "react-router";

import CameraApp from "./components/CameraApp";
import CameraAppThree from "./components/CameraAppThree";
import CameraAppMindAR from "./components/CameraAppMindAR";
import ARCubeComponent from "./components/ARCubeComponent";
import Home from "./components/Home";

import "./App.css";

function App() {
   return (
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/camera" element={<CameraApp />} />
         <Route path="/camera_three" element={<CameraAppThree />} />
         <Route path="/camera_mind" element={<CameraAppMindAR />} />
         <Route path="/camera_surface" element={<ARCubeComponent />} />
      </Routes>
   );
}

export default App;

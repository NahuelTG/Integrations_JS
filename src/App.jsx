import { Routes, Route } from "react-router";

import CameraApp from "./components/CameraApp";
import CameraAppThree from "./components/CameraAppThree";
import CameraAppMindAR from "./components/CameraAppMindAR";
import CameraWebXR from "./components/CameraWebXR";
import SceneDialogue from "./components/dialogue_globe/SceneDialogue";

import Home from "./components/Home";

import "./App.css";

function App() {
   return (
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/camera" element={<CameraApp />} />
         <Route path="/camera_three" element={<CameraAppThree />} />
         <Route path="/camera_mind" element={<CameraAppMindAR />} />
         <Route path="/camera_surface" element={<CameraWebXR />} />
         <Route path="/scene_dialogue" element={<SceneDialogue />} />
      </Routes>
   );
}

export default App;

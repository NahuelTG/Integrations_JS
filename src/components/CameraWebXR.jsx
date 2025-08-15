// CameraWebXR.js
import { useRef } from "react";
import { useNavigate } from "react-router";

// Hooks personalizados
import { useARSupport } from "../hooks/useARSupport";
import { useThreeJS } from "../hooks/useThreeJS";
import { useARSession } from "../hooks/useARSession";
import { useHitTest } from "../hooks/useHitTest";
import { useARControls } from "../hooks/useARControls";
import { useCubeManager } from "../hooks/useCubeManager";
import { useARRender } from "../hooks/useARRender";
import { useWindowResize } from "../hooks/useWindowResize";

// Componentes UI
import ARLoadingIndicator from "./AR/ARLoadingIndicator";
import ARErrorMessage from "./AR/ARErrorMessage";
import ARSurfaceIndicator from "./AR/ARSurfaceIndicator";
import ARControls from "./AR/ARControls";
import AROverlay from "./AR/AROverlay";

const CameraWebXR = () => {
   const canvasRef = useRef(null);
   const navigate = useNavigate();

   // 1. Verificar soporte AR
   const isARSupported = useARSupport();

   // 2. Inicializar Three.js
   const { isReady, scene, camera, renderer, reticle, pointer } = useThreeJS(canvasRef);

   // 3. Gestión de cubos
   const { cubeCount, addCube, handleUIAddCube, removeLastCube, removeAllCubes, shouldIgnoreSelect } = useCubeManager(scene, reticle);

   // 4. Sesión AR
   const { stopAR, isStartedRef, setIsTracked } = useARSession(renderer, isARSupported, scene);

   // 5. Hit Testing
   const { surfaceDetected, processHitTest } = useHitTest(renderer, reticle, pointer, camera, isStartedRef, setIsTracked);

   // 6. Controladores AR
   useARControls(renderer, addCube, shouldIgnoreSelect);

   // 7. Loop de renderizado
   useARRender(renderer, scene, camera, processHitTest);

   // 8. Redimensionado
   useWindowResize(camera, renderer);

   // Handlers
   const handleStopAR = () => {
      stopAR();
      navigate("/");
   };

   return (
      <div style={containerStyles}>
         {/* Canvas de Three.js */}
         <canvas
            ref={canvasRef}
            style={{
               ...canvasStyles,
               display: isReady ? "block" : "none",
            }}
         />

         {/* DOM Overlay */}
         <AROverlay>
            <ARLoadingIndicator isReady={isReady} />

            <ARErrorMessage isReady={isReady} isARSupported={isARSupported} />

            <ARSurfaceIndicator surfaceDetected={surfaceDetected} />

            <ARControls
               surfaceDetected={surfaceDetected}
               cubeCount={cubeCount}
               onAddCube={handleUIAddCube}
               onRemoveLastCube={removeLastCube}
               onRemoveAllCubes={removeAllCubes}
               onExit={handleStopAR}
            />
         </AROverlay>
      </div>
   );
};

// Estilos
const containerStyles = {
   position: "relative",
   width: "100vw",
   height: "100vh",
   margin: 0,
   padding: 0,
   backgroundColor: "#000",
   overflow: "hidden",
};

const canvasStyles = {
   position: "absolute",
   top: 0,
   left: 0,
   width: "100%",
   height: "100%",
   pointerEvents: "none",
   zIndex: 1,
};

export default CameraWebXR;

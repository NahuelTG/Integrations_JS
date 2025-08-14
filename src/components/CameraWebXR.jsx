import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";

const CameraWebXR = () => {
   // Refs básicos
   const canvasRef = useRef(null);
   const sceneRef = useRef(null);
   const cameraRef = useRef(null);
   const rendererRef = useRef(null);
   const controllerRef = useRef(null);
   const reticleRef = useRef(null);
   const pointerRef = useRef(null);

   // AR state refs
   const hitTestSourceRef = useRef(null);
   const hitTestSourceRequestedRef = useRef(false);
   const isStartedRef = useRef(false);
   const isTrackedRef = useRef(false);
   const cubesRef = useRef([]);

   // ✅ NUEVA variable para controlar interacciones de UI
   const isUIInteractionRef = useRef(false);

   // React states
   const [isReady, setIsReady] = useState(false);
   const [isARSupported, setIsARSupported] = useState(false);
   const [surfaceDetected, setSurfaceDetected] = useState(false);
   const [cubeCount, setCubeCount] = useState(0);

   const navigate = useNavigate();

   // 1. VERIFICAR SOPORTE AR
   useEffect(() => {
      const checkARSupport = async () => {
         if ("xr" in navigator) {
            try {
               const supported = await navigator.xr.isSessionSupported("immersive-ar");
               setIsARSupported(supported);
            } catch (error) {
               setIsARSupported(false);
               console.log(error);
            }
         } else {
            setIsARSupported(false);
         }
      };
      checkARSupport();
   }, []);

   // 2. INICIALIZAR THREE.JS
   useEffect(() => {
      const init = () => {
         if (!canvasRef.current || isReady) return;

         try {
            // Scene
            sceneRef.current = new THREE.Scene();

            // Camera
            cameraRef.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

            // Renderer
            rendererRef.current = new THREE.WebGLRenderer({
               canvas: canvasRef.current,
               antialias: true,
               alpha: true,
            });
            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            rendererRef.current.xr.enabled = true;
            rendererRef.current.shadowMap.enabled = true;
            rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

            // Lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
            light.position.set(0.5, 1, 1);
            sceneRef.current.add(light);

            // Controller
            const controller = rendererRef.current.xr.getController(0);
            controller.addEventListener("select", onSelect);
            controllerRef.current = controller;
            sceneRef.current.add(controller);

            // Reticle
            const reticle = new THREE.Mesh(
               new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
               new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            reticle.matrixAutoUpdate = false;
            reticle.visible = false;
            reticleRef.current = reticle;
            sceneRef.current.add(reticle);

            // Pointer
            const pointer = new THREE.Mesh(new THREE.SphereBufferGeometry(0.02), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
            pointer.visible = false;
            pointerRef.current = pointer;
            sceneRef.current.add(pointer);

            // Window resize
            const onWindowResize = () => {
               if (!rendererRef.current.xr.isPresenting) {
                  cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                  cameraRef.current.updateProjectionMatrix();
                  rendererRef.current.setSize(window.innerWidth, window.innerHeight);
               }
            };
            window.addEventListener("resize", onWindowResize, false);

            // Animation loop
            rendererRef.current.setAnimationLoop(render);

            // AR session events
            rendererRef.current.xr.addEventListener("sessionstart", function () {
               sceneRef.current.background = null;
               isStartedRef.current = true;
            });

            rendererRef.current.xr.addEventListener("sessionend", function () {
               isStartedRef.current = false;
               isTrackedRef.current = false;
               hitTestSourceRequestedRef.current = false;
               hitTestSourceRef.current = null;
               setSurfaceDetected(false);
            });

            setIsReady(true);
         } catch (error) {
            console.error("Error inicializando Three.js:", error);
         }
      };

      const timeoutId = setTimeout(init, 100);
      return () => clearTimeout(timeoutId);
   }, [isReady]);

   // 3. AUTO-INICIAR AR
   useEffect(() => {
      if (isReady && isARSupported) {
         setTimeout(startAR, 1000);
      }
   }, [isReady, isARSupported]);

   // 4. onSelect - ✅ MEJORADO para evitar doble toque
   const onSelect = useCallback(() => {
      // Si es una interacción de UI, la ignoramos y reseteamos la bandera
      if (isUIInteractionRef.current) {
         isUIInteractionRef.current = false;
         return;
      }

      // Solo agregar cubo si el reticle es visible (superficie detectada)
      if (reticleRef.current && reticleRef.current.visible) {
         addCube();
      }
   }, []);

   // 5. RENDER LOOP
   const render = useCallback((frame) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      if (isStartedRef.current && frame) {
         const referenceSpace = rendererRef.current.xr.getReferenceSpace();
         const session = rendererRef.current.xr.getSession();

         // Hit test setup
         if (hitTestSourceRequestedRef.current === false) {
            session.requestReferenceSpace("viewer").then(function (referenceSpace) {
               session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
                  hitTestSourceRef.current = source;
               });
            });

            session.addEventListener("end", function () {
               hitTestSourceRequestedRef.current = false;
               hitTestSourceRef.current = null;
            });

            hitTestSourceRequestedRef.current = true;
         }

         // Hit test results
         if (hitTestSourceRef.current) {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

            if (hitTestResults.length) {
               const hit = hitTestResults[0];
               reticleRef.current.visible = true;
               pointerRef.current.visible = true;

               reticleRef.current.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

               const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix);
               const cameraPos = new THREE.Vector3().setFromMatrixPosition(cameraRef.current.matrixWorld);

               pointerRef.current.position.copy(reticlePos);
               pointerRef.current.position.y = cameraPos.y;

               setSurfaceDetected(true);

               if (!isTrackedRef.current) {
                  isTrackedRef.current = true;
               }
            } else {
               reticleRef.current.visible = false;
               pointerRef.current.visible = false;
               setSurfaceDetected(false);
            }
         }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
   }, []);

   // 6. FUNCIONES DE CUBOS - ✅ MEJORADAS para marcar interacciones de UI
   const addCube = useCallback(() => {
      if (!reticleRef.current?.visible || !sceneRef.current) return;

      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshLambertMaterial({
         color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.receiveShadow = true;

      const position = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix);
      cube.position.copy(position);
      cube.position.y += 0.05;

      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      sceneRef.current.add(cube);
      cubesRef.current.push(cube);
      setCubeCount(cubesRef.current.length);
   }, []);

   // ✅ NUEVA función para manejar clics de botón
   const handleAddCubeButton = useCallback(() => {
      // Marcar que es una interacción de UI
      isUIInteractionRef.current = true;
      addCube();
   }, [addCube]);

   const removeLastCube = useCallback(() => {
      if (cubesRef.current.length === 0) return;

      // Marcar que es una interacción de UI
      isUIInteractionRef.current = true;

      const lastCube = cubesRef.current.pop();
      sceneRef.current.remove(lastCube);
      lastCube.geometry.dispose();
      lastCube.material.dispose();
      setCubeCount(cubesRef.current.length);
   }, []);

   const removeAllCubes = useCallback(() => {
      // Marcar que es una interacción de UI
      isUIInteractionRef.current = true;

      cubesRef.current.forEach((cube) => {
         sceneRef.current.remove(cube);
         cube.geometry.dispose();
         cube.material.dispose();
      });

      cubesRef.current = [];
      setCubeCount(0);

      if (rendererRef.current) {
         rendererRef.current.renderLists.dispose();
      }
   }, []);

   // 7. INICIAR AR
   const startAR = useCallback(async () => {
      if (!isARSupported || !rendererRef.current) return;

      try {
         const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.getElementById("ar-ui") },
         });

         rendererRef.current.xr.setReferenceSpaceType("local");
         rendererRef.current.xr.setSession(session);
      } catch (error) {
         try {
            const session = await navigator.xr.requestSession("immersive-ar", {
               requiredFeatures: ["hit-test"],
            });
            rendererRef.current.xr.setReferenceSpaceType("local");
            rendererRef.current.xr.setSession(session);
         } catch (fallbackError) {
            console.error("Error iniciando AR:", fallbackError, error);
         }
      }
   }, [isARSupported]);

   const stopAR = () => {
      const session = rendererRef.current?.xr.getSession();
      if (session) {
         session.end();
         HandleBackHome();
      }
   };

   const HandleBackHome = () => {
      navigate("/");
   };

   return (
      <div
         style={{
            position: "relative",
            width: "100vw",
            height: "100dvh",
            margin: 0,
            padding: 0,
            backgroundColor: "#000",
            overflow: "hidden",
         }}
      >
         {/* Canvas de Three.js */}
         <canvas
            ref={canvasRef}
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               pointerEvents: "none",
               zIndex: 1,
               display: isReady ? "block" : "none",
            }}
         />

         {/* DOM Overlay - Solo botones básicos */}
         <div
            id="ar-ui"
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               pointerEvents: "none",
               zIndex: 1000,
            }}
         >
            {/* Indicador de superficie */}
            {surfaceDetected && (
               <div
                  style={{
                     position: "absolute",
                     top: "80px",
                     left: "50%",
                     transform: "translateX(-50%)",
                     background: "rgba(0, 255, 136, 0.9)",
                     color: "white",
                     padding: "10px 20px",
                     borderRadius: "25px",
                     fontSize: "16px",
                     fontWeight: "bold",
                     textAlign: "center",
                     pointerEvents: "auto",
                     border: "2px solid white",
                  }}
               >
                  ✅ Superficie detectada - Toca en el mundo AR o usa el botón
               </div>
            )}

            {/* Contador de cubos */}
            {cubeCount > 0 && (
               <div
                  style={{
                     position: "absolute",
                     top: "20px",
                     right: "20px",
                     background: "rgba(0, 0, 0, 0.8)",
                     color: "white",
                     padding: "8px 16px",
                     borderRadius: "20px",
                     fontSize: "14px",
                     fontWeight: "bold",
                     border: "2px solid rgba(255, 255, 255, 0.3)",
                     pointerEvents: "auto",
                  }}
               >
                  📦 {cubeCount}
               </div>
            )}

            {/* Botón salir */}
            <button
               onClick={stopAR}
               style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: "rgba(255, 68, 68, 0.9)",
                  color: "white",
                  border: "2px solid white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  pointerEvents: "auto",
               }}
            >
               ❌ Salir
            </button>

            {/* Botones inferiores - ✅ USANDO LA NUEVA FUNCIÓN */}
            <div
               style={{
                  position: "absolute",
                  bottom: "30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  pointerEvents: "auto",
               }}
            >
               {/* Botón añadir cubo - ✅ USANDO handleAddCubeButton */}
               <button
                  onClick={handleAddCubeButton}
                  disabled={!surfaceDetected}
                  style={{
                     width: "60px",
                     height: "60px",
                     borderRadius: "50%",
                     background: surfaceDetected ? "rgba(0, 255, 136, 0.9)" : "rgba(100, 100, 100, 0.6)",
                     border: `3px solid ${surfaceDetected ? "#00ff88" : "#666"}`,
                     color: "white",
                     fontSize: "24px",
                     cursor: surfaceDetected ? "pointer" : "not-allowed",
                     fontWeight: "bold",
                     boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                  }}
               >
                  ➕
               </button>

               {/* Botón quitar último */}
               {cubeCount > 0 && (
                  <button
                     onClick={removeLastCube}
                     style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(255, 136, 0, 0.9)",
                        border: "3px solid #ff8800",
                        color: "white",
                        fontSize: "20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                     }}
                  >
                     ↶
                  </button>
               )}

               {/* Botón limpiar todos */}
               {cubeCount > 0 && (
                  <button
                     onClick={removeAllCubes}
                     style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(255, 68, 68, 0.9)",
                        border: "3px solid #ff4444",
                        color: "white",
                        fontSize: "20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                     }}
                  >
                     🗑️
                  </button>
               )}
            </div>

            {/* Mensaje de carga */}
            {!isReady && (
               <div
                  style={{
                     position: "absolute",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     color: "white",
                     fontSize: "18px",
                     background: "rgba(0,0,0,0.8)",
                     padding: "20px",
                     borderRadius: "10px",
                     textAlign: "center",
                     pointerEvents: "auto",
                  }}
               >
                  Cargando WebXR...
               </div>
            )}

            {/* Error AR no soportado */}
            {isReady && !isARSupported && (
               <div
                  style={{
                     position: "absolute",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     color: "#ff6b6b",
                     fontSize: "16px",
                     background: "rgba(0,0,0,0.9)",
                     padding: "30px",
                     borderRadius: "15px",
                     textAlign: "center",
                     pointerEvents: "auto",
                     border: "2px solid #ff6b6b",
                  }}
               >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>❌</div>
                  <div style={{ fontWeight: "bold", marginBottom: "10px" }}>WebXR no soportado</div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>Necesitas un dispositivo Android con Chrome</div>
               </div>
            )}
         </div>
      </div>
   );
};

export default CameraWebXR;

// ARCubeComponent.jsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ARCubeComponent = () => {
   const mountRef = useRef(null);

   // Variables principales (como en bounce.js)
   const sceneRef = useRef(null);
   const cameraRef = useRef(null);
   const rendererRef = useRef(null);
   const controllerRef = useRef(null);
   const reticleRef = useRef(null);
   const pointerRef = useRef(null);

   // AR state
   const hitTestSourceRef = useRef(null);
   const hitTestSourceRequestedRef = useRef(false);
   const isStartedRef = useRef(false);
   const isTrackedRef = useRef(false);
   const placedCubesRef = useRef([]);

   // React state
   const [isARSupported, setIsARSupported] = useState(false);
   const [isARActive, setIsARActive] = useState(false);
   const [cubeCount, setCubeCount] = useState(0);
   const [surfaceDetected, setSurfaceDetected] = useState(false);

   useEffect(() => {
      checkARSupport();
      initializeApp();

      return () => {
         // Cleanup
         if (rendererRef.current) {
            rendererRef.current.dispose();
         }
      };
   }, []);

   const checkARSupport = () => {
      if ("xr" in navigator) {
         navigator.xr
            .isSessionSupported("immersive-ar")
            .then((supported) => {
               setIsARSupported(supported);
            })
            .catch(() => {
               setIsARSupported(false);
            });
      } else {
         setIsARSupported(false);
      }
   };

   const initializeApp = () => {
      // Crear container (igual que en bounce.js)
      const container = document.createElement("div");
      if (mountRef.current) {
         mountRef.current.appendChild(container);
      }

      // Scene setup (igual que bounce.js)
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      cameraRef.current = camera;

      // Lighting (igual que bounce.js)
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
      light.position.set(0.5, 1, 1);
      scene.add(light);

      // Renderer (igual que bounce.js)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controller setup (igual que bounce.js)
      const controller = renderer.xr.getController(0);
      controller.addEventListener("select", onSelect);
      controllerRef.current = controller;
      scene.add(controller);

      // Reticle (igual que bounce.js)
      const reticle = new THREE.Mesh(
         new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
         new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      reticleRef.current = reticle;
      scene.add(reticle);

      // Pointer (igual que bounce.js)
      const pointer = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
      pointer.visible = false;
      pointerRef.current = pointer;
      scene.add(pointer);

      // Window resize (igual que bounce.js)
      const onWindowResize = () => {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onWindowResize, false);

      // Start animation loop
      renderer.setAnimationLoop(render);

      // AR session events
      renderer.xr.addEventListener("sessionstart", function () {
         scene.background = null;
         isStartedRef.current = true;
         setIsARActive(true);
         console.log("AR session started");
      });

      renderer.xr.addEventListener("sessionend", function () {
         isStartedRef.current = false;
         isTrackedRef.current = false;
         hitTestSourceRequestedRef.current = false;
         hitTestSourceRef.current = null;
         setIsARActive(false);
         setSurfaceDetected(false);
         console.log("AR session ended");
      });
   };

   // onSelect function (adaptado de bounce.js)
   const onSelect = () => {
      if (reticleRef.current && reticleRef.current.visible) {
         placeCube();
      }
   };

   // Función para colocar cubo (reemplaza la lógica de Bouncer)
   const placeCube = () => {
      if (!reticleRef.current || !reticleRef.current.visible) return;

      // Crear cubo simple
      const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const cubeMaterial = new THREE.MeshLambertMaterial({
         color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      cube.receiveShadow = true;

      // Posicionar en la superficie detectada
      const position = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix);
      cube.position.copy(position);
      cube.position.y += 0.05; // Elevar sobre la superficie

      // Rotación aleatoria
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      // Añadir a la escena
      sceneRef.current.add(cube);
      placedCubesRef.current.push(cube);
      setCubeCount(placedCubesRef.current.length);

      console.log("Cubo colocado en:", position);
   };

   // Clear cubes function (similar a bomb function)
   const clearCubes = () => {
      placedCubesRef.current.forEach((cube) => {
         sceneRef.current.remove(cube);
      });
      placedCubesRef.current = [];
      setCubeCount(0);
      rendererRef.current.renderLists.dispose();
   };

   // Render function (adaptado de bounce.js)
   const render = (timestamp, frame) => {
      if (isStartedRef.current && frame) {
         const referenceSpace = rendererRef.current.xr.getReferenceSpace();
         const session = rendererRef.current.xr.getSession();

         // Hit test setup (igual que bounce.js)
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

         // Hit test results (igual que bounce.js)
         if (hitTestSourceRef.current) {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

            if (hitTestResults.length) {
               const hit = hitTestResults[0];
               reticleRef.current.visible = true;
               pointerRef.current.visible = true;

               // Update reticle position
               reticleRef.current.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

               const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix);
               const cameraPos = new THREE.Vector3().setFromMatrixPosition(cameraRef.current.matrixWorld);

               pointerRef.current.position.copy(reticlePos);
               pointerRef.current.position.y = cameraPos.y;

               setSurfaceDetected(true);

               // Track detection (igual que bounce.js)
               if (!isTrackedRef.current) {
                  isTrackedRef.current = true;
                  console.log("Surface tracking started");
               }
            } else {
               reticleRef.current.visible = false;
               pointerRef.current.visible = false;
               setSurfaceDetected(false);
            }
         }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
   };

   // Start AR function
   const startAR = async () => {
      try {
         const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
         });

         rendererRef.current.xr.setReferenceSpaceType("local");
         rendererRef.current.xr.setSession(session);
      } catch (error) {
         console.error("Error starting AR session:", error);
      }
   };

   // Stop AR function
   const stopAR = () => {
      const session = rendererRef.current.xr.getSession();
      if (session) {
         session.end();
      }
   };

   return (
      <div className="ar-cube-app">
         {/* Mount point */}
         <div ref={mountRef} className="ar-mount" />

         {/* UI Overlay similar a index.pug */}
         {!isARActive && (
            <div className="splash-screen">
               <div className="content">
                  <div className="title">
                     <h1>AR Cube Placer</h1>
                  </div>
                  <div className="sub">
                     <p>Coloca cubos 3D en superficies reales</p>
                     <p>Basado en WebXR y Three.js</p>
                  </div>

                  {isARSupported ? (
                     <button className="ar-button" onClick={startAR}>
                        START AR!
                     </button>
                  ) : (
                     <div className="not-supported">
                        <h2>WebXR not supported on this device</h2>
                        <p>Try reloading the page from a recent Android phone.</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* AR Active UI */}
         {isARActive && (
            <div className="ar-overlay">
               {/* Instructions similar a hints */}
               <div className="hints">
                  <div className="copy">
                     <p>{surfaceDetected ? "Superficie detectada - Toca para colocar cubo" : "Escanea las superficies a tu alrededor"}</p>
                  </div>
               </div>

               {/* Cube counter */}
               <div className="cube-counter">
                  <p>Cubos: {cubeCount}</p>
               </div>

               {/* Navigation similar a nav */}
               <nav className={cubeCount > 0 ? "" : "hidden"}>
                  <button className="but clear-btn" onClick={clearCubes}>
                     🗑️
                  </button>
               </nav>

               {/* Bottom controls */}
               <div className="bottom">
                  <button className="but place-btn" onClick={placeCube} disabled={!surfaceDetected}>
                     ➕
                  </button>
                  <div className="status">
                     <div className={`indicator ${surfaceDetected ? "active" : ""}`}></div>
                  </div>
                  <button className="but stop-btn" onClick={stopAR}>
                     ❌
                  </button>
               </div>
            </div>
         )}

         <style jsx>{`
            .ar-cube-app {
               position: relative;
               width: 100%;
               height: 100vh;
               background: black;
               overflow: hidden;
            }

            .ar-mount {
               width: 100%;
               height: 100%;
            }

            .splash-screen {
               position: fixed;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background: black;
               display: flex;
               align-items: center;
               justify-content: center;
               z-index: 1000;
            }

            .content {
               text-align: center;
               color: white;
               font-family: "Arial", sans-serif;
            }

            .title h1 {
               font-size: 3rem;
               margin-bottom: 1rem;
               font-weight: bold;
            }

            .sub p {
               font-size: 1.2rem;
               margin-bottom: 0.5rem;
               opacity: 0.8;
            }

            .ar-button {
               background: transparent;
               color: white;
               border: 2px solid white;
               padding: 15px 30px;
               border-radius: 10px;
               font-size: 1.2rem;
               font-weight: bold;
               cursor: pointer;
               margin-top: 2rem;
               transition: all 0.3s ease;
            }

            .ar-button:hover {
               background: white;
               color: black;
            }

            .not-supported {
               color: #ff6b6b;
               text-align: center;
            }

            .ar-overlay {
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               pointer-events: none;
               z-index: 1000;
            }

            .hints {
               width: 100%;
               text-align: center;
               margin: 20vh auto 0 auto;
               pointer-events: auto;
            }

            .hints .copy {
               width: 80%;
               margin: 0 auto;
            }

            .hints p {
               color: white;
               font-family: Arial, sans-serif;
               text-align: center;
               font-size: 1.5rem;
               background: rgba(0, 0, 0, 0.7);
               padding: 1rem;
               border-radius: 10px;
               margin: 0;
            }

            .cube-counter {
               position: fixed;
               top: 20px;
               right: 20px;
               background: rgba(0, 0, 0, 0.7);
               color: white;
               padding: 10px 15px;
               border-radius: 20px;
               pointer-events: auto;
            }

            nav {
               position: fixed;
               left: 20px;
               top: 20px;
               pointer-events: auto;
            }

            nav.hidden {
               display: none;
            }

            .but {
               display: block;
               border: none;
               width: 60px;
               height: 60px;
               background: white;
               border-radius: 50%;
               text-align: center;
               outline: none;
               cursor: pointer;
               font-size: 1.5rem;
               transition: all 0.3s ease;
               margin: 10px;
            }

            .but:active {
               transform: scale(1.2) rotate(5deg);
            }

            .but:disabled {
               opacity: 0.5;
               cursor: not-allowed;
            }

            .bottom {
               position: fixed;
               left: 50%;
               transform: translateX(-50%);
               bottom: 30px;
               display: flex;
               justify-content: center;
               align-items: center;
               gap: 20px;
               pointer-events: auto;
            }

            .status {
               width: 60px;
               height: 60px;
               display: flex;
               align-items: center;
               justify-content: center;
            }

            .indicator {
               width: 20px;
               height: 20px;
               border-radius: 50%;
               background: #ff6b6b;
               transition: background 0.3s ease;
            }

            .indicator.active {
               background: #4ecdc4;
               box-shadow: 0 0 20px #4ecdc4;
            }

            @media screen and (max-width: 700px) {
               .title h1 {
                  font-size: 2rem;
               }

               .hints p {
                  font-size: 1.2rem;
               }

               .but {
                  width: 50px;
                  height: 50px;
                  font-size: 1.2rem;
               }
            }
         `}</style>
      </div>
   );
};

export default ARCubeComponent;

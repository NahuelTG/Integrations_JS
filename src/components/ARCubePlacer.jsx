// ARCubePlacer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ARCubePlacer = () => {
   const mountRef = useRef(null);
   const sceneRef = useRef(null);
   const rendererRef = useRef(null);
   const cameraRef = useRef(null);
   const sessionRef = useRef(null);
   const reticleRef = useRef(null);
   const controllerRef = useRef(null);
   const hitTestSourceRef = useRef(null);
   const placedCubesRef = useRef([]);

   const [isARSupported, setIsARSupported] = useState(false);
   const [isARActive, setIsARActive] = useState(false);
   const [surfaceDetected, setSurfaceDetected] = useState(false);
   const [cubeCount, setCubeCount] = useState(0);
   const [error, setError] = useState("");

   useEffect(() => {
      checkARSupport();
      return () => {
         if (sessionRef.current) {
            sessionRef.current.end();
         }
      };
   }, []);

   const checkARSupport = async () => {
      if ("xr" in navigator) {
         try {
            const supported = await navigator.xr.isSessionSupported("immersive-ar");
            setIsARSupported(supported);
            if (!supported) {
               setError("Tu dispositivo no soporta WebXR AR. Usa Chrome en Android o Safari en iOS 15+");
            }
         } catch (err) {
            setError("Error verificando soporte AR: " + err.message);
         }
      } else {
         setError("WebXR no está disponible. Usa un navegador compatible.");
      }
   };

   const initScene = () => {
      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
         antialias: true,
         alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Mount renderer
      if (mountRef.current) {
         mountRef.current.appendChild(renderer.domElement);
      }

      // Lighting (igual que en tu proyecto)
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
      light.position.set(0.5, 1, 1);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Create reticle (indicador de superficie)
      const reticle = new THREE.Mesh(
         new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
         new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
         })
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      reticleRef.current = reticle;
      scene.add(reticle);

      // Controller para detectar taps
      const controller = renderer.xr.getController(0);
      controller.addEventListener("select", onSelect);
      controllerRef.current = controller;
      scene.add(controller);

      return { scene, camera, renderer };
   };

   const onSelect = () => {
      // Cuando el usuario toca la pantalla/trigger
      if (reticleRef.current && reticleRef.current.visible) {
         placeCube();
      }
   };

   const placeCube = () => {
      if (!reticleRef.current || !reticleRef.current.visible) return;

      // Crear cubo básico
      const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const cubeMaterial = new THREE.MeshLambertMaterial({
         color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6), // Color aleatorio
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      cube.receiveShadow = true;

      // Posicionar el cubo en la superficie detectada
      const position = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix);
      cube.position.copy(position);
      cube.position.y += 0.05; // Elevar ligeramente sobre la superficie

      // Rotación aleatoria para variedad
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      // Añadir a la escena
      sceneRef.current.add(cube);
      placedCubesRef.current.push(cube);
      setCubeCount(placedCubesRef.current.length);

      console.log("Cubo colocado en:", position);
   };

   const clearCubes = () => {
      placedCubesRef.current.forEach((cube) => {
         sceneRef.current.remove(cube);
      });
      placedCubesRef.current = [];
      setCubeCount(0);
   };

   const startARSession = async () => {
      try {
         initScene();

         // Request AR session (igual que en tu proyecto)
         const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
         });

         sessionRef.current = session;
         session.updateRenderState({
            baseLayer: new XRWebGLLayer(session, rendererRef.current.getContext()),
         });

         // Reference space
         const referenceSpace = await session.requestReferenceSpace("local");

         // Hit test setup
         let hitTestSourceRequested = false;

         setIsARActive(true);

         // Animation loop (basado en tu código)
         const onXRFrame = (timestamp, frame) => {
            session.requestAnimationFrame(onXRFrame);

            if (frame) {
               const session = rendererRef.current.xr.getSession();

               if (!hitTestSourceRequested) {
                  session.requestReferenceSpace("viewer").then(function (referenceSpace) {
                     session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
                        hitTestSourceRef.current = source;
                     });
                  });
                  hitTestSourceRequested = true;
               }

               if (hitTestSourceRef.current) {
                  const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

                  if (hitTestResults.length) {
                     const hit = hitTestResults[0];
                     reticleRef.current.visible = true;
                     reticleRef.current.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                     setSurfaceDetected(true);
                  } else {
                     reticleRef.current.visible = false;
                     setSurfaceDetected(false);
                  }
               }
            }

            rendererRef.current.render(sceneRef.current, cameraRef.current);
         };

         session.requestAnimationFrame(onXRFrame);

         // Handle session end
         session.addEventListener("end", () => {
            setIsARActive(false);
            setSurfaceDetected(false);
            hitTestSourceRef.current = null;

            if (mountRef.current && rendererRef.current.domElement) {
               mountRef.current.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current.dispose();
         });
      } catch (err) {
         setError("Error iniciando sesión AR: " + err.message);
         console.error("AR Error:", err);
      }
   };

   const stopARSession = () => {
      if (sessionRef.current) {
         sessionRef.current.end();
      }
   };

   // Handle window resize
   useEffect(() => {
      const handleResize = () => {
         if (rendererRef.current && cameraRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
         }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   return (
      <div className="ar-cube-container">
         {/* Renderer mount point */}
         <div ref={mountRef} className="ar-renderer" />

         {/* UI cuando no está AR activo */}
         {!isARActive && (
            <div className="ar-splash">
               <div className="ar-content">
                  <h1>🎯 AR Cube Placer</h1>

                  {!isARSupported ? (
                     <div className="ar-error">
                        <p>❌ {error}</p>
                        <div className="requirements">
                           <h3>Requisitos:</h3>
                           <ul>
                              <li>Chrome 88+ en Android</li>
                              <li>Safari 15+ en iOS</li>
                              <li>Dispositivo compatible con ARCore/ARKit</li>
                              <li>Conexión HTTPS</li>
                           </ul>
                        </div>
                     </div>
                  ) : (
                     <div className="ar-ready">
                        <p>✅ Tu dispositivo soporta AR</p>
                        <p>Detecta superficies automáticamente y coloca cubos 3D sobre ellas.</p>
                        <button className="start-ar-btn" onClick={startARSession}>
                           🚀 Iniciar AR
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* UI cuando AR está activo */}
         {isARActive && (
            <div className="ar-overlay">
               {/* Instrucciones */}
               <div className="ar-instructions">
                  <div className={`surface-status ${surfaceDetected ? "detected" : "scanning"}`}>
                     {surfaceDetected ? (
                        <>
                           ✅ Superficie detectada
                           <div className="hint">Toca la pantalla para colocar un cubo</div>
                        </>
                     ) : (
                        <>
                           🔍 Escaneando superficies...
                           <div className="hint">Mueve tu dispositivo para encontrar el suelo</div>
                        </>
                     )}
                  </div>
               </div>

               {/* Contador de cubos */}
               <div className="cube-counter">📦 Cubos colocados: {cubeCount}</div>

               {/* Controles */}
               <div className="ar-controls">
                  <button className="control-btn" onClick={placeCube} disabled={!surfaceDetected}>
                     ➕ Colocar Cubo
                  </button>
                  <button className="control-btn" onClick={clearCubes}>
                     🗑️ Limpiar Todo
                  </button>
                  <button className="control-btn stop-btn" onClick={stopARSession}>
                     ❌ Salir AR
                  </button>
               </div>
            </div>
         )}

         <style jsx>{`
            .ar-cube-container {
               position: relative;
               width: 100%;
               height: 100vh;
               overflow: hidden;
               background: #000;
            }

            .ar-renderer {
               width: 100%;
               height: 100%;
            }

            .ar-splash {
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               display: flex;
               align-items: center;
               justify-content: center;
               z-index: 1000;
            }

            .ar-content {
               background: rgba(255, 255, 255, 0.95);
               padding: 2rem;
               border-radius: 20px;
               max-width: 400px;
               text-align: center;
               box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .ar-content h1 {
               color: #333;
               font-size: 1.8rem;
               margin-bottom: 1rem;
               font-weight: bold;
            }

            .ar-error {
               color: #d63031;
            }

            .requirements {
               margin-top: 1rem;
               text-align: left;
            }

            .requirements h3 {
               color: #333;
               margin-bottom: 0.5rem;
            }

            .requirements ul {
               margin-left: 1rem;
            }

            .ar-ready {
               color: #00b894;
            }

            .start-ar-btn {
               background: linear-gradient(45deg, #00b894, #00cec9);
               color: white;
               border: none;
               padding: 1rem 2rem;
               border-radius: 50px;
               font-size: 1.1rem;
               font-weight: bold;
               cursor: pointer;
               margin-top: 1rem;
               transition: all 0.3s ease;
            }

            .start-ar-btn:hover {
               transform: translateY(-2px);
               box-shadow: 0 10px 20px rgba(0, 184, 148, 0.3);
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

            .ar-instructions {
               position: absolute;
               top: 20px;
               left: 20px;
               right: 20px;
               pointer-events: auto;
            }

            .surface-status {
               background: rgba(0, 0, 0, 0.8);
               color: white;
               padding: 1rem;
               border-radius: 10px;
               text-align: center;
               font-weight: bold;
               transition: all 0.3s ease;
            }

            .surface-status.detected {
               background: rgba(0, 184, 148, 0.9);
            }

            .surface-status.scanning {
               background: rgba(255, 165, 0, 0.9);
            }

            .hint {
               font-size: 0.9rem;
               opacity: 0.8;
               margin-top: 0.5rem;
            }

            .cube-counter {
               position: absolute;
               top: 100px;
               left: 20px;
               background: rgba(0, 0, 0, 0.8);
               color: white;
               padding: 0.5rem 1rem;
               border-radius: 20px;
               font-weight: bold;
               pointer-events: auto;
            }

            .ar-controls {
               position: absolute;
               bottom: 30px;
               left: 50%;
               transform: translateX(-50%);
               display: flex;
               gap: 1rem;
               pointer-events: auto;
               flex-wrap: wrap;
               justify-content: center;
            }

            .control-btn {
               background: rgba(0, 0, 0, 0.8);
               color: white;
               border: none;
               padding: 1rem 1.5rem;
               border-radius: 50px;
               font-weight: bold;
               cursor: pointer;
               transition: all 0.3s ease;
               font-size: 0.9rem;
            }

            .control-btn:hover:not(:disabled) {
               background: rgba(0, 150, 255, 0.9);
               transform: scale(1.05);
            }

            .control-btn:disabled {
               opacity: 0.5;
               cursor: not-allowed;
            }

            .stop-btn:hover {
               background: rgba(214, 48, 49, 0.9) !important;
            }

            @media (max-width: 768px) {
               .ar-controls {
                  flex-direction: column;
                  align-items: center;
               }

               .control-btn {
                  width: 200px;
               }
            }
         `}</style>
      </div>
   );
};

export default ARCubePlacer;

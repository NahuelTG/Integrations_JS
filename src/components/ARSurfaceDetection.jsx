// ARSurfaceDetection.jsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ARSurfaceDetection = () => {
   const mountRef = useRef(null);
   const sceneRef = useRef(null);
   const rendererRef = useRef(null);
   const sessionRef = useRef(null);
   const reticleRef = useRef(null);
   const hitTestSourceRef = useRef(null);
   const placedObjectsRef = useRef([]);

   const [isARSupported, setIsARSupported] = useState(false);
   const [isARActive, setIsARActive] = useState(false);
   const [surfaceDetected, setSurfaceDetected] = useState(false);
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

   const initializeScene = () => {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera (WebXR will handle this)
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      // Renderer with XR support
      const renderer = new THREE.WebGLRenderer({
         antialias: true,
         alpha: true,
         powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Mount renderer
      if (mountRef.current) {
         mountRef.current.appendChild(renderer.domElement);
      }

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Create reticle (surface indicator)
      createReticle();

      return { scene, camera, renderer };
   };

   const createReticle = () => {
      const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
      const material = new THREE.MeshBasicMaterial({
         color: 0x00ff00,
         transparent: true,
         opacity: 0.8,
      });

      const reticle = new THREE.Mesh(geometry, material);
      reticle.visible = false;
      reticleRef.current = reticle;
      sceneRef.current.add(reticle);

      // Add pulsing animation
      const animate = () => {
         if (reticle.visible) {
            reticle.scale.setScalar(1 + 0.2 * Math.sin(Date.now() * 0.005));
         }
         requestAnimationFrame(animate);
      };
      animate();
   };

   const startARSession = async () => {
      try {
         const { renderer } = initializeScene();

         const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test", "plane-detection"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body },
         });

         sessionRef.current = session;
         session.updateRenderState({
            baseLayer: new XRWebGLLayer(session, renderer.getContext()),
         });

         // Get reference space
         const referenceSpace = await session.requestReferenceSpace("local");

         // Setup hit test source for plane detection
         const viewerSpace = await session.requestReferenceSpace("viewer");
         hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });

         setIsARActive(true);

         // Animation loop
         const onXRFrame = (time, frame) => {
            session.requestAnimationFrame(onXRFrame);

            if (hitTestSourceRef.current) {
               const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

               if (hitTestResults.length > 0) {
                  const hit = hitTestResults[0];
                  const pose = hit.getPose(referenceSpace);

                  if (pose && reticleRef.current) {
                     reticleRef.current.visible = true;
                     reticleRef.current.position.setFromMatrixPosition(new THREE.Matrix4().fromArray(pose.transform.matrix));
                     reticleRef.current.quaternion.setFromRotationMatrix(new THREE.Matrix4().fromArray(pose.transform.matrix));
                     setSurfaceDetected(true);
                  }
               } else {
                  if (reticleRef.current) {
                     reticleRef.current.visible = false;
                  }
                  setSurfaceDetected(false);
               }
            }

            renderer.render(sceneRef.current, renderer.xr.getCamera());
         };

         session.requestAnimationFrame(onXRFrame);

         // Handle session end
         session.addEventListener("end", () => {
            setIsARActive(false);
            setSurfaceDetected(false);
            hitTestSourceRef.current = null;

            // Clean up
            if (mountRef.current && renderer.domElement) {
               mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
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

   const placeObject = () => {
      if (!reticleRef.current || !reticleRef.current.visible) return;

      const objectTypes = [
         { geometry: new THREE.BoxGeometry(0.1, 0.1, 0.1), color: 0xff6b6b },
         { geometry: new THREE.SphereGeometry(0.05, 16, 16), color: 0x4ecdc4 },
         { geometry: new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16), color: 0x45b7d1 },
         { geometry: new THREE.ConeGeometry(0.05, 0.1, 16), color: 0xffa07a },
      ];

      const randomType = objectTypes[Math.floor(Math.random() * objectTypes.length)];

      const material = new THREE.MeshLambertMaterial({
         color: randomType.color,
         transparent: true,
         opacity: 0.9,
      });

      const mesh = new THREE.Mesh(randomType.geometry, material);
      mesh.position.copy(reticleRef.current.position);
      mesh.position.y += 0.05; // Lift slightly above surface
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Add spawn animation
      mesh.scale.setScalar(0);
      sceneRef.current.add(mesh);
      placedObjectsRef.current.push(mesh);

      // Animate spawn
      const animateSpawn = () => {
         if (mesh.scale.x < 1) {
            mesh.scale.setScalar(mesh.scale.x + 0.05);
            requestAnimationFrame(animateSpawn);
         }
      };
      animateSpawn();

      // Add floating animation
      const startY = mesh.position.y;
      const animateFloat = () => {
         mesh.position.y = startY + 0.02 * Math.sin(Date.now() * 0.003 + mesh.id);
         mesh.rotation.y += 0.01;
         requestAnimationFrame(animateFloat);
      };
      animateFloat();
   };

   const clearObjects = () => {
      placedObjectsRef.current.forEach((obj) => {
         // Animate removal
         const animateRemoval = () => {
            if (obj.scale.x > 0) {
               obj.scale.setScalar(obj.scale.x - 0.05);
               requestAnimationFrame(animateRemoval);
            } else {
               sceneRef.current.remove(obj);
            }
         };
         animateRemoval();
      });
      placedObjectsRef.current = [];
   };

   // Handle window resize
   useEffect(() => {
      const handleResize = () => {
         if (rendererRef.current) {
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
         }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   // Handle screen touch for placing objects
   useEffect(() => {
      const handleTouch = (e) => {
         if (isARActive && surfaceDetected) {
            e.preventDefault();
            placeObject();
         }
      };

      if (isARActive) {
         document.addEventListener("touchend", handleTouch);
         document.addEventListener("click", handleTouch);
      }

      return () => {
         document.removeEventListener("touchend", handleTouch);
         document.removeEventListener("click", handleTouch);
      };
   }, [isARActive, surfaceDetected]);

   return (
      <div className="ar-container">
         {/* Renderer mount point */}
         <div ref={mountRef} className="ar-renderer" />

         {/* UI Overlay */}
         {!isARActive && (
            <div className="ar-ui-overlay">
               <div className="ar-info-panel">
                  <h2>🎯 AR Surface Detection</h2>
                  {!isARSupported ? (
                     <div className="ar-error">
                        <p>❌ {error}</p>
                        <p>Necesitas:</p>
                        <ul>
                           <li>Chrome 88+ en Android</li>
                           <li>Safari 15+ en iOS</li>
                           <li>Dispositivo compatible con ARCore/ARKit</li>
                        </ul>
                     </div>
                  ) : (
                     <div className="ar-ready">
                        <p>✅ Tu dispositivo soporta AR</p>
                        <p>La aplicación detectará superficies automáticamente y te permitirá colocar objetos 3D sobre ellas.</p>
                        <button className="ar-start-btn" onClick={startARSession}>
                           🚀 Iniciar AR
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* AR Active UI */}
         {isARActive && (
            <div className="ar-active-ui">
               <div className="ar-instructions">
                  <div className={`surface-indicator ${surfaceDetected ? "detected" : "scanning"}`}>
                     {surfaceDetected ? "✅ Superficie detectada - Toca para colocar objetos" : "🔍 Escaneando superficies..."}
                  </div>
               </div>

               <div className="ar-controls">
                  <button className="ar-control-btn" onClick={placeObject} disabled={!surfaceDetected}>
                     ➕ Colocar
                  </button>
                  <button className="ar-control-btn" onClick={clearObjects}>
                     🗑️ Limpiar
                  </button>
                  <button className="ar-control-btn ar-stop-btn" onClick={stopARSession}>
                     ❌ Salir
                  </button>
               </div>
            </div>
         )}

         <style jsx>{`
            .ar-container {
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

            .ar-ui-overlay {
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               display: flex;
               align-items: center;
               justify-content: center;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               z-index: 1000;
            }

            .ar-info-panel {
               background: rgba(255, 255, 255, 0.95);
               padding: 2rem;
               border-radius: 20px;
               max-width: 400px;
               text-align: center;
               box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
               backdrop-filter: blur(10px);
            }

            .ar-info-panel h2 {
               margin: 0 0 1rem 0;
               color: #333;
               font-size: 1.5rem;
            }

            .ar-error {
               color: #d63031;
            }

            .ar-error ul {
               text-align: left;
               margin: 1rem 0;
            }

            .ar-ready {
               color: #00b894;
            }

            .ar-start-btn {
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
               box-shadow: 0 10px 20px rgba(0, 184, 148, 0.3);
            }

            .ar-start-btn:hover {
               transform: translateY(-2px);
               box-shadow: 0 15px 30px rgba(0, 184, 148, 0.4);
            }

            .ar-active-ui {
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

            .surface-indicator {
               background: rgba(0, 0, 0, 0.8);
               color: white;
               padding: 1rem;
               border-radius: 10px;
               text-align: center;
               font-weight: bold;
               transition: all 0.3s ease;
            }

            .surface-indicator.detected {
               background: rgba(0, 184, 148, 0.9);
               animation: pulse 2s infinite;
            }

            .surface-indicator.scanning {
               background: rgba(255, 165, 0, 0.9);
            }

            @keyframes pulse {
               0%,
               100% {
                  transform: scale(1);
               }
               50% {
                  transform: scale(1.05);
               }
            }

            .ar-controls {
               position: absolute;
               bottom: 30px;
               left: 50%;
               transform: translateX(-50%);
               display: flex;
               gap: 1rem;
               pointer-events: auto;
            }

            .ar-control-btn {
               background: rgba(0, 0, 0, 0.8);
               color: white;
               border: none;
               padding: 1rem 1.5rem;
               border-radius: 50px;
               font-weight: bold;
               cursor: pointer;
               transition: all 0.3s ease;
               backdrop-filter: blur(10px);
               font-size: 0.9rem;
            }

            .ar-control-btn:hover:not(:disabled) {
               background: rgba(0, 150, 255, 0.9);
               transform: scale(1.05);
            }

            .ar-control-btn:disabled {
               opacity: 0.5;
               cursor: not-allowed;
            }

            .ar-stop-btn:hover {
               background: rgba(214, 48, 49, 0.9) !important;
            }
         `}</style>
      </div>
   );
};

export default ARSurfaceDetection;

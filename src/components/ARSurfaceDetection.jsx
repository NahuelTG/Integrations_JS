// ARSurfaceDetection.jsx
import React, { useEffect, useRef, useState } from "react";
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
   const [debugInfo, setDebugInfo] = useState("");

   const addDebugInfo = (info) => {
      setDebugInfo((prev) => prev + "\n" + info);
      console.log("Debug:", info);
   };

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
            } else {
               // Check specific features
               console.log("🔍 Verificando características AR...");

               // Test hit-test support
               try {
                  const testSession = await navigator.xr.requestSession("immersive-ar", {
                     requiredFeatures: ["hit-test"],
                  });
                  await testSession.end();
                  console.log("✅ Hit-test soportado");
               } catch (e) {
                  console.log("❌ Hit-test no soportado" + e);
                  setError("Tu dispositivo no soporta hit-test. Necesitas Chrome 81+ en Android con ARCore.");
                  return;
               }
            }
         } catch (err) {
            setError("Error verificando soporte AR: " + err.message);
         }
      } else {
         setError("WebXR no está disponible. Usa un navegador compatible.");
      }
   };

   const initializeScene = async () => {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera (WebXR will handle this)
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      // Create canvas and get WebGL context
      const canvas = document.createElement("canvas");
      let gl;

      try {
         gl = canvas.getContext("webgl2", {
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            xrCompatible: true, // CRÍTICO: Marca el contexto como XR compatible
         });

         if (!gl) {
            gl = canvas.getContext("webgl", {
               antialias: true,
               alpha: true,
               powerPreference: "high-performance",
               xrCompatible: true,
            });
         }

         if (!gl) {
            throw new Error("No se pudo crear contexto WebGL");
         }

         addDebugInfo("Contexto WebGL creado: " + (gl.constructor.name.includes("2") ? "WebGL2" : "WebGL1"));
      } catch (contextError) {
         addDebugInfo("Error creando contexto WebGL: " + contextError.message);
         throw contextError;
      }

      // Make context XR compatible
      try {
         await gl.makeXRCompatible();
         addDebugInfo("✅ Contexto marcado como XR compatible");
      } catch (xrError) {
         addDebugInfo("❌ Error marcando contexto XR compatible: " + xrError.message);
         throw xrError;
      }

      // Renderer with XR support using the XR-compatible context
      const renderer = new THREE.WebGLRenderer({
         canvas: canvas,
         context: gl,
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

         // Try with plane-detection first, then fallback to just hit-test
         let session;
         try {
            session = await navigator.xr.requestSession("immersive-ar", {
               requiredFeatures: ["hit-test"],
               optionalFeatures: ["plane-detection", "dom-overlay"],
               domOverlay: { root: document.body },
            });
            console.log("✅ AR Session iniciada con hit-test");
         } catch (firstError) {
            console.log("⚠️ Fallback: Intentando sin plane-detection..." + firstError);
            addDebugInfo("Fallback: sin plane-detection");
            session = await navigator.xr.requestSession("immersive-ar", {
               requiredFeatures: ["hit-test"],
               optionalFeatures: ["dom-overlay"],
               domOverlay: { root: document.body },
            });
            console.log("✅ AR Session iniciada (modo compatibilidad)");
            addDebugInfo("AR Session: modo compatibilidad");
         }

         sessionRef.current = session;
         session.updateRenderState({
            baseLayer: new XRWebGLLayer(session, renderer.getContext()),
         });

         // Get reference space
         const referenceSpace = await session.requestReferenceSpace("local");

         // Setup hit test source for surface detection
         const viewerSpace = await session.requestReferenceSpace("viewer");

         try {
            hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });
            console.log("✅ Hit test source creado");
         } catch (hitTestError) {
            console.log("⚠️ Error creando hit test source:", hitTestError);
            // Try alternative hit test setup
            try {
               const localSpace = await session.requestReferenceSpace("local");
               hitTestSourceRef.current = await session.requestHitTestSource({
                  space: localSpace,
                  offsetRay: new XRRay({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }),
               });
               console.log("✅ Hit test source creado (método alternativo)");
            } catch (fallbackError) {
               console.error("❌ No se pudo crear hit test source:", fallbackError);
               setError("Tu dispositivo no soporta detección de superficies");
               return;
            }
         }

         setIsARActive(true);

         // Animation loop
         const onXRFrame = (time, frame) => {
            session.requestAnimationFrame(onXRFrame);

            if (hitTestSourceRef.current) {
               const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);

               if (hitTestResults.length > 0) {
                  const hit = hitTestResults[0];

                  try {
                     const pose = hit.getPose(referenceSpace);

                     if (pose && reticleRef.current) {
                        const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
                        reticleRef.current.visible = true;
                        reticleRef.current.position.setFromMatrixPosition(matrix);
                        reticleRef.current.quaternion.setFromRotationMatrix(matrix);
                        setSurfaceDetected(true);
                     }
                  } catch (poseError) {
                     console.log("Error obteniendo pose:", poseError);
                  }
               } else {
                  if (reticleRef.current) {
                     reticleRef.current.visible = false;
                  }
                  setSurfaceDetected(false);
               }
            } else {
               // Fallback: show reticle at fixed distance
               if (reticleRef.current) {
                  const camera = renderer.xr.getCamera();
                  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                  const position = camera.position.clone().add(direction.multiplyScalar(1.5));
                  position.y -= 0.5; // Lower it a bit

                  reticleRef.current.position.copy(position);
                  reticleRef.current.visible = true;
                  setSurfaceDetected(true);
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
         let errorMessage = "Error iniciando sesión AR: " + err.message;

         if (err.message.includes("WebGL") || err.message.includes("XR compatible")) {
            errorMessage +=
               "\n\nPosibles soluciones:\n• Reinicia el navegador\n• Verifica que WebGL esté habilitado\n• Prueba en modo incógnito\n• Asegúrate de estar en HTTPS";
         }

         setError(errorMessage);
         addDebugInfo("❌ Error fatal: " + err.message);
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

                  {debugInfo && (
                     <div className="debug-info">
                        <details>
                           <summary>🔧 Debug Info</summary>
                           <pre>{debugInfo}</pre>
                        </details>
                     </div>
                  )}
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

            .debug-info {
               background: rgba(0, 0, 0, 0.7);
               color: #00ff00;
               padding: 0.5rem;
               border-radius: 5px;
               margin-top: 0.5rem;
               font-family: monospace;
               font-size: 0.8rem;
            }

            .debug-info pre {
               margin: 0;
               white-space: pre-wrap;
               max-height: 100px;
               overflow-y: auto;
            }

            .debug-info summary {
               cursor: pointer;
               color: white;
               font-weight: bold;
            }
         `}</style>
      </div>
   );
};

export default ARSurfaceDetection;

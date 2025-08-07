// CameraApp.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";

import useCamera from "../hooks/useCamera.js";

function CameraAppThree() {
   const { isActive, videoRef, canvasRef, startCamera, stopCamera, capturePhoto, switchCamera, savePhoto, captureAndSave, savePhotoAs } =
      useCamera();

   const [capturedPhoto, setCapturedPhoto] = useState(null);
   const [showCube, setShowCube] = useState(true);

   // Referencias para Three.js
   const threeCanvasRef = useRef(null);
   const sceneRef = useRef(null);
   const rendererRef = useRef(null);
   const cubeRef = useRef(null);
   const animationIdRef = useRef(null);

   const navigate = useNavigate();

   useEffect(() => {
      startCamera();
   }, [startCamera]);

   // Inicializar Three.js
   useEffect(() => {
      if (!threeCanvasRef.current) return;

      // Crear escena
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Crear cámara (perspectiva)
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // Crear renderer
      const renderer = new THREE.WebGLRenderer({
         canvas: threeCanvasRef.current,
         alpha: true, // Fondo transparente
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // Transparente
      rendererRef.current = renderer;

      // Crear cubo
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({
         color: 0x00ff88,
         shininess: 100,
         transparent: true,
         opacity: 0.8,
      });
      const cube = new THREE.Mesh(geometry, material);
      cubeRef.current = cube;
      scene.add(cube);

      // Agregar luces
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Función de animación
      const animate = () => {
         animationIdRef.current = requestAnimationFrame(animate);

         if (cubeRef.current) {
            cubeRef.current.rotation.x += 0.01;
            cubeRef.current.rotation.y += 0.01;
         }

         renderer.render(scene, camera);
      };

      animate();

      // Manejar redimensionamiento
      const handleResize = () => {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
         window.removeEventListener("resize", handleResize);
         if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
         }
         if (rendererRef.current) {
            rendererRef.current.dispose();
         }
      };
   }, []);

   const handleBackHome = () => {
      stopCamera(); // ← Arreglé esto: faltaban los paréntesis
      navigate("/");
   };

   const handleCapture = () => {
      const photo = capturePhoto();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   const handleSavePhoto = () => {
      if (capturedPhoto) {
         const saved = savePhoto(capturedPhoto);
         if (saved) {
            alert("¡Foto guardada exitosamente!");
            setCapturedPhoto(null); // Cerrar modal
         }
      }
   };

   const handleQuickSave = () => {
      const result = captureAndSave();
      if (result.saved) {
         alert("¡Foto capturada y guardada!");
      }
   };

   const toggleCube = () => {
      setShowCube(!showCube);
      if (cubeRef.current) {
         cubeRef.current.visible = !showCube;
      }
   };
   // ✅ FUNCIÓN AVANZADA: Capturar CON el cubo 3D incluido
   const capturePhotoWith3D = () => {
      if (!videoRef.current || !canvasRef.current || !rendererRef.current) {
         return null;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Configurar canvas con dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 1. Dibujar el video de fondo
      context.drawImage(video, 0, 0);

      // 2. Si el cubo está visible, superponer el render de Three.js
      if (showCube && rendererRef.current && sceneRef.current) {
         // Crear canvas temporal para Three.js
         const tempCanvas = document.createElement("canvas");
         tempCanvas.width = video.videoWidth;
         tempCanvas.height = video.videoHeight;

         const tempRenderer = new THREE.WebGLRenderer({
            canvas: tempCanvas,
            alpha: true,
         });
         tempRenderer.setSize(video.videoWidth, video.videoHeight);
         tempRenderer.setClearColor(0x000000, 0);

         // Crear cámara temporal con las mismas proporciones
         const tempCamera = new THREE.PerspectiveCamera(75, video.videoWidth / video.videoHeight, 0.1, 1000);
         tempCamera.position.z = 5;

         // Renderizar y superponer
         tempRenderer.render(sceneRef.current, tempCamera);
         context.drawImage(tempCanvas, 0, 0);

         // Limpiar
         tempRenderer.dispose();
      }

      return canvas.toDataURL("image/jpeg", 0.9);
   };

   const handleCaptureWith3D = () => {
      const photo = capturePhotoWith3D();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   return (
      <div
         style={{
            position: "relative",
            width: "100vw",
            height: "100dvh",
            margin: 0,
            padding: 0,
            overflow: "hidden",
            backgroundColor: "#000",
         }}
      >
         {/* Controles superiores */}
         <div
            style={{
               position: "absolute",
               top: "20px",
               left: "20px",
               right: "20px",
               zIndex: 10,
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
            }}
         >
            <button
               onClick={handleBackHome}
               style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
               }}
            >
               ← Atrás
            </button>
            <button
               onClick={toggleCube}
               style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
               }}
            >
               {showCube ? "🚫" : "📦"} {showCube ? "Ocultar" : "Mostrar"}
            </button>

            <button
               onClick={switchCamera}
               style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
               }}
            >
               🔄 Cambiar
            </button>
         </div>

         {/* Video de la cámara - PANTALLA COMPLETA */}
         <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               objectFit: "cover", // ← CLAVE: Mantiene proporción y llena la pantalla
               display: isActive ? "block" : "none",
               zIndex: 1,
            }}
         />

         {/* Canvas de Three.js (cubo 3D) - NUEVO */}
         <canvas
            ref={threeCanvasRef}
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               pointerEvents: "none",
               zIndex: 10,
               display: showCube ? "block" : "none",
            }}
         />

         {/* Botones de captura - Parte inferior */}
         <div
            style={{
               position: "absolute",
               bottom: "30px",
               left: "50%",
               transform: "translateX(-50%)",
               zIndex: 10,
               display: "flex",
               gap: "20px",
               alignItems: "center",
            }}
         >
            {/* Botón captura rápida (captura y guarda directo) */}
            <button
               onClick={handleQuickSave}
               style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "2px solid white",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "white",
               }}
            >
               💾
            </button>

            {/* Captura con cubo 3D */}
            <button
               onClick={handleCaptureWith3D}
               style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 255, 136, 0.3)",
                  border: "2px solid #00ff88",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#00ff88",
               }}
            >
               📦
            </button>

            {/* Botón captura normal */}
            <button
               onClick={handleCapture}
               style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
               }}
            >
               📷
            </button>
         </div>

         {/* Canvas oculto para captura */}
         <canvas ref={canvasRef} style={{ display: "none" }} />

         {/* Modal de foto capturada */}
         {capturedPhoto && (
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
               }}
            >
               <h3 style={{ color: "white", marginBottom: "20px" }}>Foto Capturada</h3>

               <img
                  src={capturedPhoto}
                  alt="Foto capturada"
                  style={{
                     maxWidth: "90%",
                     maxHeight: "60%",
                     objectFit: "contain",
                     borderRadius: "10px",
                  }}
               />

               <div style={{ marginTop: "20px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                     onClick={() => setCapturedPhoto(null)}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     ✕ Descartar
                  </button>

                  <button
                     onClick={handleSavePhoto}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#44ff44",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     💾 Guardar JPG
                  </button>

                  <button
                     onClick={() => {
                        savePhotoAs(capturedPhoto, "png", 1.0);
                        setCapturedPhoto(null);
                     }}
                     style={{
                        padding: "12px 24px",
                        backgroundColor: "#4444ff",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                     }}
                  >
                     🖼️ Guardar PNG
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default CameraAppThree;

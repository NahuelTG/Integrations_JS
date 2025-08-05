// CameraApp.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import useCamera from "../hooks/useCamera.js";

function CameraApp() {
   const { isActive, videoRef, canvasRef, startCamera, stopCamera, capturePhoto, switchCamera } = useCamera();

   const [capturedPhoto, setCapturedPhoto] = useState(null);

   const navigate = useNavigate();

   useEffect(() => {
      startCamera();
   }, [startCamera]);

   const handleBackHome = () => {
      stopCamera;
      navigate("/");
   };

   const handleCapture = () => {
      const photo = capturePhoto();
      if (photo) {
         setCapturedPhoto(photo);
      }
   };

   return (
      <div style={{ padding: "20px" }}>
         <button onClick={handleBackHome}>Atras</button>
         <button onClick={switchCamera}>Cambiar Camara</button>
         <button onClick={handleCapture} style={{ marginLeft: "10px" }}>
            Tomar Foto
         </button>
         {/* Video de la cámara */}
         <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
               width: "100%",
               maxWidth: "640px",
               display: isActive ? "block" : "none",
            }}
         />
         {/* Canvas oculto para captura */}
         <canvas ref={canvasRef} style={{ display: "none" }} />
         {/* Foto capturada */}
         {capturedPhoto && (
            <div style={{ marginTop: "20px" }}>
               <h3>Foto Capturada:</h3>
               <img src={capturedPhoto} alt="Foto capturada" style={{ width: "100%", maxWidth: "640px" }} />
            </div>
         )}
      </div>
   );
}
export default CameraApp;

// CameraAppMindAR.jsx
import { useNavigate } from "react-router";
import useMindarThree from "../hooks/useMindarThree.js";

function CameraAppMindAR() {
   const navigate = useNavigate();

   // 🎯 Usar el hook simplificado
   const { loading, isTracking, error, sceneRef } = useMindarThree("/assets/AR/wolf.glb", "/assets/AR/wolf.mind");

   const handleBackHome = () => {
      navigate("/");
   };

   // Mostrar error si hay algún problema
   if (error) {
      return (
         <div
            style={{
               width: "100vw",
               height: "100vh",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               backgroundColor: "#000",
               color: "white",
               padding: "20px",
               textAlign: "center",
            }}
         >
            <h2>❌ Error en AR del Lobo</h2>
            <p>{error}</p>
            <button
               onClick={() => window.location.reload()}
               style={{
                  padding: "12px 24px",
                  backgroundColor: "#44ff44",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginTop: "20px",
               }}
            >
               🔄 Recargar
            </button>
            <button
               onClick={handleBackHome}
               style={{
                  padding: "12px 24px",
                  backgroundColor: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginTop: "10px",
               }}
            >
               ← Volver
            </button>
         </div>
      );
   }

   return (
      <div
         ref={sceneRef}
         style={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
         }}
      >
         {/* Loading screen */}
         {loading && (
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(20, 20, 20, 0.95)",
                  color: "white",
                  zIndex: 10,
                  fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
               }}
            >
               <svg
                  aria-hidden="true"
                  style={{ width: "60px", height: "60px", marginBottom: "24px", color: "#EAB308" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  <animateTransform
                     attributeName="transform"
                     type="rotate"
                     from="0 12 12"
                     to="360 12 12"
                     dur="1.2s"
                     repeatCount="indefinite"
                  />
               </svg>
               <p style={{ fontSize: "1.3em", fontWeight: "600", marginBottom: "12px" }}>Cargando Experiencia AR del Lobo...</p>
               <p style={{ fontSize: "1em", color: "#D1D5DB" }}>Por favor, espera un momento.</p>
            </div>
         )}

         {/* Controles básicos - Solo mostrar cuando no esté cargando */}
         {!loading && (
            <>
               {/* Controles superiores */}
               <div
                  style={{
                     position: "absolute",
                     top: "20px",
                     left: "20px",
                     right: "20px",
                     zIndex: 1000,
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                  }}
               >
                  <button
                     onClick={handleBackHome}
                     style={{
                        padding: "12px 20px",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        cursor: "pointer",
                        backdropFilter: "blur(10px)",
                     }}
                  >
                     ← Atrás
                  </button>

                  {/* Indicador de tracking */}
                  <div
                     style={{
                        padding: "8px 16px",
                        backgroundColor: isTracking ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)",
                        color: "white",
                        borderRadius: "15px",
                        fontSize: "14px",
                        backdropFilter: "blur(10px)",
                     }}
                  >
                     {isTracking ? "🐺 Lobo Detectado" : "🔍 Buscar Target del Lobo"}
                  </div>
               </div>

               {/* Mensaje de instrucciones */}
               <div
                  style={{
                     position: "absolute",
                     bottom: "30px",
                     left: "50%",
                     transform: "translateX(-50%)",
                     zIndex: 1000,
                     textAlign: "center",
                     color: "white",
                     backgroundColor: "rgba(0, 0, 0, 0.7)",
                     padding: "15px 25px",
                     borderRadius: "20px",
                     backdropFilter: "blur(10px)",
                  }}
               >
                  <p style={{ margin: 0, fontSize: "16px" }}>
                     {isTracking
                        ? "🎉 ¡Lobo AR detectado! Mueve tu dispositivo para explorar"
                        : "📱 Apunta la cámara al target del lobo para activar AR"}
                  </p>
               </div>
            </>
         )}
      </div>
   );
}

export default CameraAppMindAR;

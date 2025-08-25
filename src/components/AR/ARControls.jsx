// components/ARControls.js
const ARControls = ({ surfaceDetected, cubeCount, onAddCube, onRemoveLastCube, onRemoveAllCubes, onExit }) => {
   return (
      <>
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
            onClick={onExit}
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

         {/* Botones inferiores */}
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
            {/* Botón añadir cubo */}
            <button
               onClick={onAddCube}
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
                  onClick={onRemoveLastCube}
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
                  onClick={onRemoveAllCubes}
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
      </>
   );
};

export default ARControls;

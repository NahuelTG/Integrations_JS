// components/ARSurfaceIndicator.js
const ARSurfaceIndicator = ({ surfaceDetected }) => {
   if (!surfaceDetected) return null;

   return (
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
   );
};

export default ARSurfaceIndicator;

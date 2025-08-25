// components/ARErrorMessage.js
const ARErrorMessage = ({ isReady, isARSupported }) => {
   if (!isReady || isARSupported) return null;

   return (
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
   );
};

export default ARErrorMessage;

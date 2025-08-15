// components/ARLoadingIndicator.js
const ARLoadingIndicator = ({ isReady }) => {
   if (isReady) return null;

   return (
      <div
         style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "18px",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            pointerEvents: "auto",
         }}
      >
         Cargando WebXR...
      </div>
   );
};

export default ARLoadingIndicator;

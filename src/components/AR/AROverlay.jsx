// components/AROverlay.js
const AROverlay = ({ children }) => {
   return (
      <div
         id="ar-ui"
         style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1000,
         }}
      >
         {children}
      </div>
   );
};

export default AROverlay;

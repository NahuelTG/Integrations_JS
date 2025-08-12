// hooks/useAnimation.js
import { useRef, useCallback, useState } from "react";

/**
 * Hook para manejar SOLO las animaciones
 * Principio SRP: Single Responsibility - Solo maneja animaciones
 */
function useAnimation() {
   const animationIdRef = useRef(null);
   const [isAnimating, setIsAnimating] = useState(false);

   // Iniciar loop de animación
   const startAnimation = useCallback((renderCallback, updateCallback) => {
      if (animationIdRef.current) {
         console.warn("Animation already running");
         return;
      }

      setIsAnimating(true);

      const animate = () => {
         animationIdRef.current = requestAnimationFrame(animate);

         // Ejecutar callback de actualización (ej: rotar cubo)
         if (updateCallback && typeof updateCallback === "function") {
            updateCallback();
         }

         // Ejecutar callback de renderizado (renderizar escena)
         if (renderCallback && typeof renderCallback === "function") {
            renderCallback();
         }
      };

      animate();
      console.log("Animation started");
   }, []);

   // Detener animación
   const stopAnimation = useCallback(() => {
      if (animationIdRef.current) {
         cancelAnimationFrame(animationIdRef.current);
         animationIdRef.current = null;
         setIsAnimating(false);
         console.log("Animation stopped");
      }
   }, []);

   // Pausar/reanudar animación
   const toggleAnimation = useCallback(
      (renderCallback, updateCallback) => {
         if (isAnimating) {
            stopAnimation();
         } else {
            startAnimation(renderCallback, updateCallback);
         }
      },
      [isAnimating, stopAnimation, startAnimation]
   );

   return {
      // Estado
      isAnimating,

      // Funciones de control
      startAnimation,
      stopAnimation,
      toggleAnimation,
   };
}

export default useAnimation;

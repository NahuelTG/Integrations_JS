// hooks/useARRender.js
import { useEffect, useCallback } from "react";

export const useARRender = (renderer, scene, camera, processHitTest) => {
   const render = useCallback(
      (timestamp, frame) => {
         if (!renderer || !scene || !camera) return;

         // Procesar hit test si está disponible
         if (processHitTest) {
            processHitTest(frame);
         }

         renderer.render(scene, camera);
      },
      [renderer, scene, camera, processHitTest]
   );

   useEffect(() => {
      if (!renderer) return;

      renderer.setAnimationLoop(render);

      return () => {
         if (renderer) {
            renderer.setAnimationLoop(null);
         }
      };
   }, [renderer, render]);

   return { render };
};

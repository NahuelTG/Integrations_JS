// hooks/useWindowResize.js
import { useEffect, useCallback } from "react";

export const useWindowResize = (camera, renderer) => {
   const onWindowResize = useCallback(() => {
      if (!camera || !renderer) return;

      if (!renderer.xr.isPresenting) {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
      }
   }, [camera, renderer]);

   useEffect(() => {
      window.addEventListener("resize", onWindowResize, false);

      return () => {
         window.removeEventListener("resize", onWindowResize, false);
      };
   }, [onWindowResize]);

   return { onWindowResize };
};

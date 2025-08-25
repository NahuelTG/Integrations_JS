// hooks/useARSession.js
import { useState, useEffect, useRef, useCallback } from "react";

export const useARSession = (renderer, isARSupported, scene) => {
   const [isStarted, setIsStarted] = useState(false);
   const [isTracked, setIsTracked] = useState(false);
   const isStartedRef = useRef(false);
   const isTrackedRef = useRef(false);

   const startAR = useCallback(async () => {
      if (!isARSupported || !renderer) return;

      try {
         const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.getElementById("ar-ui") },
         });

         renderer.xr.setReferenceSpaceType("local");
         renderer.xr.setSession(session);
      } catch (error) {
         try {
            const session = await navigator.xr.requestSession("immersive-ar", {
               requiredFeatures: ["hit-test"],
            });
            renderer.xr.setReferenceSpaceType("local");
            renderer.xr.setSession(session);
         } catch (fallbackError) {
            console.error("Error iniciando AR:", fallbackError, error);
         }
      }
   }, [isARSupported, renderer]);

   const stopAR = useCallback(() => {
      const session = renderer?.xr.getSession();
      if (session) {
         session.end();
      }
   }, [renderer]);

   useEffect(() => {
      if (!renderer) return;

      const handleSessionStart = () => {
         if (scene) scene.background = null;
         isStartedRef.current = true;
         setIsStarted(true);
      };

      const handleSessionEnd = () => {
         isStartedRef.current = false;
         isTrackedRef.current = false;
         setIsStarted(false);
         setIsTracked(false);
      };

      renderer.xr.addEventListener("sessionstart", handleSessionStart);
      renderer.xr.addEventListener("sessionend", handleSessionEnd);

      return () => {
         renderer.xr.removeEventListener("sessionstart", handleSessionStart);
         renderer.xr.removeEventListener("sessionend", handleSessionEnd);
      };
   }, [renderer, scene]);

   useEffect(() => {
      if (isARSupported && renderer) {
         setTimeout(startAR, 1000);
      }
   }, [isARSupported, renderer, startAR]);

   return {
      startAR,
      stopAR,
      isStarted,
      isTracked,
      isStartedRef,
      isTrackedRef,
      setIsTracked,
   };
};

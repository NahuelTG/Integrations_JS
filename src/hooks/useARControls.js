// hooks/useARControls.js
import { useRef, useCallback, useEffect } from "react";

export const useARControls = (renderer, addCube, shouldIgnoreSelect) => {
   const controllerRef = useRef(null);

   const onSelect = useCallback(() => {
      if (shouldIgnoreSelect && shouldIgnoreSelect()) {
         return;
      }
      addCube();
   }, [addCube, shouldIgnoreSelect]);

   useEffect(() => {
      if (!renderer) return;

      const controller = renderer.xr.getController(0);
      controller.addEventListener("select", onSelect);
      controllerRef.current = controller;

      return () => {
         if (controllerRef.current) {
            controllerRef.current.removeEventListener("select", onSelect);
         }
      };
   }, [renderer, onSelect]);

   return {
      controller: controllerRef.current,
      onSelect,
   };
};

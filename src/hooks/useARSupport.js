// hooks/useARSupport.js
import { useState, useEffect } from "react";

export const useARSupport = () => {
   const [isARSupported, setIsARSupported] = useState(false);

   useEffect(() => {
      const checkARSupport = async () => {
         if ("xr" in navigator) {
            try {
               const supported = await navigator.xr.isSessionSupported("immersive-ar");
               setIsARSupported(supported);
            } catch (error) {
               setIsARSupported(false);
               console.log(error);
            }
         } else {
            setIsARSupported(false);
         }
      };
      checkARSupport();
   }, []);

   return isARSupported;
};

import { useEffect, useState } from "react";
import { useAudioStore } from "../../store/useAudioStore";

const WelcomeTracker = () => {
   const { setAudioTime } = useAudioStore();
   const [isFirstVisit, setIsFirstVisit] = useState(false);

   useEffect(() => {
      const hasEnteredBefore = localStorage.getItem("hasEnteredBefore");

      if (!hasEnteredBefore) {
         // Primera vez
         setIsFirstVisit(true);
         localStorage.setItem("hasEnteredBefore", "true");
      }

      // Detectar cierre o cambio de pestaña
      const handleUnload = () => {
         localStorage.setItem("lastVisit", new Date().toISOString());
         setAudioTime();
      };

      const handleVisibilityChange = () => {
         if (document.visibilityState === "hidden") {
            localStorage.setItem("lastVisit", new Date().toISOString());
            setAudioTime();
         }
      };

      window.addEventListener("beforeunload", handleUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
         window.removeEventListener("beforeunload", handleUnload);
         document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
   }, []);

   return <div>{isFirstVisit ? <p>👋 Bienvenido por primera vez (ingreso inicial)</p> : <p>👋 Bienvenido nuevamente</p>} </div>;
};

export default WelcomeTracker;

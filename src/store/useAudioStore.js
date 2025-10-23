// store/useAudioStore.js
import { create } from "zustand";

export const useAudioStore = create((set, get) => ({
   audioRef: null,
   src: "/demo.mp3",

   setAudioRef: (ref) => set({ audioRef: ref }),
   setSrc: (newSrc) => set({ src: newSrc }),

   playAudio: () => {
      const audio = get().audioRef;
      if (audio?.current) audio.current.play();
   },

   pauseAudio: () => {
      const audio = get().audioRef;
      if (audio?.current) audio.current.pause();
   },

   stopAudio: () => {
      const audio = get().audioRef;
      if (audio?.current) {
         audio.current.pause();
         audio.current.currentTime = 0;
      }
   },
}));

// store/useAudioStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAudioStore = create(
   persist(
      (set, get) => ({
         audioRef: null,
         src: "/demo.mp3",

         audioTime: 0,

         setAudioRef: (ref) => set({ audioRef: ref }),
         setSrc: (newSrc) => set({ src: newSrc }),

         setAudioTime: () => {
            const audio = get().audioRef;
            if (audio?.current) {
               const currentTime = audio.current.currentTime;
               set({ audioTime: currentTime });
            }
            return 0;
         },

         playAudio: () => {
            const audio = get().audioRef;
            const audioTime = get().audioTime;
            if (audio?.current) {
               audio.current.currentTime = audioTime;
               audio.current.play();
            }
         },

         pauseAudio: () => {
            const audio = get().audioRef;
            if (audio?.current) {
               get().setAudioTime();
               audio.current.pause();
            }
         },

         stopAudio: () => {
            const audio = get().audioRef;
            if (audio?.current) {
               audio.current.pause();
               audio.current.currentTime = 0;
               set({ audioTime: 0 });
            }
         },
      }),
      {
         name: "audio-storage",
         partialize: (state) => ({
            audioTime: state.audioTime,
            src: state.src,
         }),
      }
   )
);

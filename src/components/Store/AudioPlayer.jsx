import { useRef, useEffect } from "react";
import { useAudioStore } from "../../store/useAudioStore";

const AudioPlayer = () => {
   const audioRef = useRef(null);
   const { src, setAudioRef } = useAudioStore();

   useEffect(() => {
      setAudioRef(audioRef);
   }, [setAudioRef]);

   return <audio ref={audioRef} src={src} preload="auto" />;
};

export default AudioPlayer;

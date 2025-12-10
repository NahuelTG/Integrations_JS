// components/AudioControls.jsx
import { useAudioStore } from "../../store/useAudioStore";

const AudioControls = () => {
   const { playAudio, pauseAudio, stopAudio, src, setSrc } = useAudioStore();

   const handleChangeAudio = () => {
      const newSrc = src === "/demo.mp3" ? "/demo_2.mp3" : "/demo.mp3";
      setSrc(newSrc);
      stopAudio();
   };

   return (
      <div style={{ marginTop: "1rem" }}>
         <button onClick={playAudio}>▶️ Play</button>
         <button onClick={pauseAudio}>⏸️ Pause</button>
         <button onClick={stopAudio}>⏹️ Stop</button>
         <button onClick={handleChangeAudio}>🎵 Change</button>
      </div>
   );
};

export default AudioControls;

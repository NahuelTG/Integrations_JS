import AudioControls from "./AudioControls";
import AudioPlayer from "./AudioPlayer";
import WelcomeTracker from "./WelcomeTracker";

const Counter = () => {
   return (
      <>
         <section>
            <p>🎶 Música</p>
            <AudioPlayer />
            <AudioControls />
            <WelcomeTracker />
         </section>
      </>
   );
};

export default Counter;

import { useState } from "react";
import { useCounterStore } from "../../store/useCounterStore";
import AudioControls from "./AudioControls";
import AudioPlayer from "./AudioPlayer";

const Counter = () => {
   const [input, setInput] = useState(0);
   const { count, increment, decrement, reset, incrementBy, setNumber } = useCounterStore();

   const [audio, setAudio] = useState("/demo.mp3");

   const handleChange = (event) => {
      setInput(Number(event.target.value));
   };

   const handleIncrementBy = () => {
      incrementBy(input);
   };

   const handleSetNumber = () => {
      setNumber(input);
   };

   return (
      <>
         <section>
            <p>Contador</p>
            <p>{count}</p>

            <button onClick={increment}>Sumar</button>
            <button onClick={decrement}>Restar</button>
            <button onClick={reset}>Reset</button>
            <input type="number" value={input} onChange={handleChange} />
            <button onClick={handleIncrementBy}>Sumar número</button>
            <input type="number" value={input} onChange={handleChange} />
            <button onClick={handleSetNumber}>Número</button>
         </section>

         <section>
            <p>🎶 Música</p>
            <AudioPlayer />
            <AudioControls />
         </section>
      </>
   );
};

export default Counter;

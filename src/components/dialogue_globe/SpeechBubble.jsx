import React, { useState, useEffect } from "react";
import "./SpeechBubble.css";

export default function SpeechBubble({ text, speed = 50, side = "left", character }) {
   const [displayedText, setDisplayedText] = useState("");

   useEffect(() => {
      let index = 0;
      let currentText = "";
      const interval = setInterval(() => {
         currentText += text[index];
         setDisplayedText(currentText);
         index++;
         if (index >= text.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
   }, [text, speed]);

   return (
      <div className={`bubble-container ${side}`}>
         <div className="bubble-wrapper">
            <p className="bubble-character">{character}</p>
            <div className={`speech-bubble ${side}`}>{displayedText}</div>
         </div>
      </div>
   );
}

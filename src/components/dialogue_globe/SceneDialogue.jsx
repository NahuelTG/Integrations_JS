import React from "react";
import SpeechBubble from "./SpeechBubble";
import { dialogueData } from "./dialogueData";

import "./SceneDialogue.css";

const SceneDialogue = () => {
   return (
      <div className="scene-dialogue">
         <p className="scene-title">Escena de Diálogo</p>
         {dialogueData.map((line) => (
            <SpeechBubble key={line.id} text={line.text} side={line.side} character={line.character} speed={40} />
         ))}
      </div>
   );
};

export default SceneDialogue;

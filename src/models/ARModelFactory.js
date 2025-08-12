// models/ARModelFactory.js - Factory Pattern
import { WolfARModel } from "./WolfARModel";
import { DragonARModel } from "./DragonARModel";

export class ARModelFactory {
   static createModel(type, config = {}) {
      switch (type.toLowerCase()) {
         case "wolf":
         case "lobo":
            return new WolfARModel(config);

         case "duende":
         case "gnomo":
            return new DragonARModel(config);

         // 🔄 Fácil añadir más modelos aquí
         // case 'cat':
         //    return new CatARModel(config);
         //
         // case 'robot':
         //    return new RobotARModel(config);

         default:
            throw new Error(`Tipo de modelo AR no soportado: ${type}`);
      }
   }

   static getAvailableModels() {
      return ["wolf", "dragon"]; // Lista de modelos disponibles
   }
}

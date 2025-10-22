// ThemeContext.jsx
import { createContext, useReducer } from "react";

const initialState = {
   theme: "light",
   accentColor: "#007bff",
   highContrast: false,
};

function themeReducer(state, action) {
   switch (action.type) {
      case "TOGGLE_THEME":
         return { ...state, theme: state.theme === "light" ? "dark" : "light" };

      case "SET_ACCENT_COLOR":
         return { ...state, accentColor: action.payload };

      case "TOGGLE_CONTRAST":
         return { ...state, highContrast: !state.highContrast };

      case "RESET_THEME":
         return initialState;

      default:
         return state;
   }
}

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
   const [state, dispatch] = useReducer(themeReducer, initialState);

   const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });
   const setAccentColor = (color) => dispatch({ type: "SET_ACCENT_COLOR", payload: color });
   const toggleContrast = () => dispatch({ type: "TOGGLE_CONTRAST" });
   const resetTheme = () => dispatch({ type: "RESET_THEME" });

   return (
      <ThemeContext.Provider value={{ ...state, toggleTheme, setAccentColor, toggleContrast, resetTheme }}>
         {children}
      </ThemeContext.Provider>
   );
};

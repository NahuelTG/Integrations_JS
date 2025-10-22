import { useTheme } from "./useTheme";

export const Theme = () => {
   const { theme, accentColor, highContrast, toggleTheme, setAccentColor, toggleContrast, resetTheme } = useTheme();

   return (
      <div style={{ padding: "2rem", background: theme === "dark" ? "#333" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}>
         <h2>Theme Manager</h2>
         <p>Tema actual: {theme}</p>
         <p>Color de acento: {accentColor}</p>
         <p>High contrast: {highContrast ? "ON" : "OFF"}</p>

         <button onClick={toggleTheme}>Cambiar tema</button>
         <button onClick={() => setAccentColor("#e63946")}>Cambiar color a rojo</button>
         <button onClick={toggleContrast}>Toggle High Contrast</button>
         <button onClick={resetTheme}>Resetear tema</button>
      </div>
   );
};

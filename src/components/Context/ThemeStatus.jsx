import { ThemeProvider } from "./ThemeContext";
import { Theme } from "./Theme";

const ThemeStatus = () => {
   return (
      <ThemeProvider>
         <Theme />
      </ThemeProvider>
   );
};

export default ThemeStatus;

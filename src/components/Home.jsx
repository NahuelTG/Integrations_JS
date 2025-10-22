import { useNavigate } from "react-router";

const Home = () => {
   const navigate = useNavigate();

   const handleNavigation = (path) => navigate(path);

   return (
      <>
         <p>Welcome</p>
         <section>
            <button onClick={() => handleNavigation("/camera")}>Probar Cámara</button>
            <button onClick={() => handleNavigation("/camera_three")}>Probar Cámara Three</button>
            <button onClick={() => handleNavigation("/camera_mind")}>Probar Cámara Mind</button>
            <button onClick={() => handleNavigation("/camera_surface")}>Probar Cámara WebXR</button>
            <button onClick={() => handleNavigation("/theme")}>Context</button>
         </section>
      </>
   );
};

export default Home;

import { useNavigate } from "react-router";

export const Home = () => {
   const navigate = useNavigate();

   const HandleCamera = () => {
      navigate("/camera");
   };
   const HandleCameraThree = () => {
      navigate("/camera_three");
   };

   return (
      <>
         <p>Welcome</p>
         <section>
            <button onClick={HandleCamera}>Probar Camara</button>
            <button onClick={HandleCameraThree}>Probar Camara Three</button>
         </section>
      </>
   );
};

export default Home;

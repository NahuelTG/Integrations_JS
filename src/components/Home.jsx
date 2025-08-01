import { useNavigate } from "react-router";

export const Home = () => {
   const navigate = useNavigate();

   const HandleClick = () => {
      navigate("/camera");
   };

   return (
      <>
         <p>Welcome</p>
         <section>
            <button onClick={HandleClick}>Probar Camara</button>
         </section>
      </>
   );
};

export default Home;

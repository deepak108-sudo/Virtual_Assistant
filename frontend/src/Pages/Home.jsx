import React, { useContext } from "react";
import { userDataContext } from "../context/userContext";

const Home = () => {
  const { userData } = useContext(userDataContext);
  return (
    <div className="w-full h-[100vh] bg-[#0f172a] flex flex-col justify-center items-center px-4 gap-6">
  {/* Assistant Card with hover effect */}
  <div
    className="w-[320px] h-[420px] p-2 rounded-xl shadow-md transition-all duration-200 
               hover:shadow-2xl hover:shadow-blue-900 hover:scale-105 flex flex-col items-center justify-center"
  >
    <img
      src={userData?.assistantImage}
      alt="Assistant"
      className="w-full h-full object-cover rounded-md"
    />
  </div>

  {/* Assistant Name */}
  <h1 className="mt-6 text-white text-2xl font-semibold tracking-wide">
    I'm {userData?.assistantName}
  </h1>
</div>

  );
};

export default Home;

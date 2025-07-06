import React, { useContext } from "react";
import { userDataContext } from "../context/userContext";
import {useNavigate } from "react-router-dom";

const Home = () => {
  const { serverUrl,userData,setUserData } = useContext(userDataContext);
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
        const result=await axios.get(`${serverUrl}/api/auth/logout`, {
          withCredentials: true})
          navigate("/signin")
          setUserData(null);
    } catch (error) {
        setUserData(null); // Reset user data on error
        console.log(error);
    }
  }
  return (
    <div className="w-full h-[100vh] bg-[#0f172a] flex flex-col justify-center items-center px-4 gap-6">
        <button
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer absolute top-[30px] right-[30px]" onClick={handleLogout}>
          Log Out
        </button>

        <button
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer absolute top-[100px] right-[30px] px-[20px] py-[10px]" onClick={() => navigate("/customize") }>
          Customize Your Assistant
        </button>
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

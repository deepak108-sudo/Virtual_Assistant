import React, { useContext, useState } from "react";
// import bg from "../assets/authBg.png";
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/userContext";
import axios from "axios";


const SignUp = () => {
  const bg = "/authBg.png";
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl,userData,setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before making the request
    setLoading(true); // Set loading state to true
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      setLoading(false); 
      navigate("/customize")
    } catch (error) {
      console.log(error);
      setUserData(null); // Reset user data on error
      setLoading(false); // Reset loading state
      setError(error.response.data.message);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[90%] h-[500px] max-w-[500px] bg-[#00000069] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px]"
        onSubmit={handleSignUp}
      >
        <h1 className="mb-[30px] text-white text-[30px] font-semibold">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="password"
            className="w-full h-full rounded-full px-[20px] py-[10px] outline-none bg-transparent"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword && (
            <LuEye
              className="absolute top-[18px] right-[20px] text-[white] w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}

          {showPassword && (
            <LuEyeClosed
              className="absolute top-[18px] right-[20px] text-[white] w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {error && (
          <p className="text-red-500 text-[16px] mt-[17px]">*{error}</p>
        )}

        <button className="min-w-[180px] h-[60px] mt-[20px] text-white font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow-lg hover:scale-105 transition-transform duration-200 rounded-full text-[20px] tracking-wide" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-white text-[18px] cursor-pointer text-center">
          Already have an account?{" "}
          <span
            className="text-blue-400 underline hover:text-blue-500 transition-colors duration-200"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;

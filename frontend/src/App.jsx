import React, { useContext } from "react";
import {Route, Routes} from 'react-router-dom'

import SignUp from "./Pages/SignUp";
import { Navigate } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import Customize from "./Pages/Customize";
import { UserDataContext } from "./context/userContext";
import Customize2 from "./Pages/Customize2";
import Home from "./Pages/Home";

const App = () => {
  const {userData,setUserData} =useContext(UserDataContext);

  return (
    <Routes>
      <Route path="/" element={userData?.assistantImage?.length > 0 && userData?.assistantName ? <Home /> : <Navigate to="/customize" />} />


      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />

      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />

      <Route path="/customize" element={userData ? <Customize /> : <Navigate to="/signup" />} />

      <Route path="/customize2" element={userData ? <Customize2 /> : <Navigate to="/signup" />} />

      



      {/* <Route path="/" element={userData?.assistanceImage && userData?.assistanceName ?<Home />: <Navigate to={"/customize"}/>} />

      <Route path="/signup" element={!userData ?<SignUp />: <Navigate to={"/"}/>} />

      <Route path="/signin" element={!userData ?<SignUp />: <Navigate to={"/"}/>} />

      <Route path="/customize" element={userData ?<Customize />: <Navigate to={"/signin"}/>} /> */}


    </Routes>
  );
};

export default App;

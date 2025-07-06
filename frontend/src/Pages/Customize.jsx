import React, { useContext, useRef, useState } from "react";
import Card from "../component/Card";
import { RiImageAddFill } from "react-icons/ri";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

const Customize = () => {
  const {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  const inputImage = useRef();
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px]">
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/")}
      />
      <h1 className="text-white text-[30px] mb-[40px] text-center">
        Select your <span className="text-blue-200">Assistance Image</span>
      </h1>
      <div className="'w-full max-w[60%] flex justify-center items-center flex-wrap gap-[20px]">
        <Card image="/image1.png" />
        <Card image="/image2.jpg" />
        <Card image="/image4.png" />
        <Card image="/image5.png" />
        <Card image="/image6.jpeg" />
        <Card image="/image7.jpeg" />

        <div
          className={`w-[90px] h-[150px] lg:w-[150px] lg:h-[250px]  bg-[#030326]  border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 transition-shadow duration-150 cursor-pointer hover:border-4 hover:border-white flex justify-center items-center ${
            selectedImage == "input"
              ? "border-4 border-white shadow-2xl shadow-blue-950"
              : null
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <RiImageAddFill className="text-white w-[25px] h-[25px]" />
          )}

          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        ></input>
      </div>
      {selectedImage && (
        <button
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer"
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Customize;

import React, { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

const Card = ({ image }) => {
  const { setFrontendImage, setBackendImage, selectedImage, setSelectedImage } =
    useContext(UserDataContext);

  return (
    <div
      className={`w-[90px] h-[150px] lg:w-[150px] lg:h-[250px] bg-[#030326]  
      border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl 
      hover:shadow-blue-950 transition-shadow duration-150 cursor-pointer 
      hover:border-4 hover:border-white ${
        selectedImage === image
          ? "border-4 border-white shadow-2xl shadow-blue-950"
          : ""
      }`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img src={image} className="h-full object-cover" />
    </div>
  );
};

export default Card;

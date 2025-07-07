import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Home = () => {
  const { serverUrl, userData, setUserData, getGeminiResponse } =
    useContext(UserDataContext);
  const [listening, setListening] = useState(false);
  const isSpeaking = useRef(false);
  const recognitionRef = useRef(null);
  const synth=window.speechSynthesis;

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      navigate("/signin");
      setUserData(null);
    } catch (error) {
      setUserData(null); // Reset user data on error
      console.log(error);
    }
  };

  //   const speak = (text) => {
  //   const utterance = new SpeechSynthesisUtterance(text);
  //   window.speechSynthesis.speak(utterance);
  // };
  const startRecognition=()=>{
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if(!error.message.includes("start")){
        console.error("Recognition error:",error);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);

    isSpeaking.current = true;
    utterance.onend = () => {
      isSpeaking.current = false;
      startRecognition();
     // Restart recognition after speaking
    };
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    const query = encodeURIComponent(userInput);

    switch (type) {
      case "google_search":
        speak(response || "Searching Google...");
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
        break;

      case "youtube_search":
      case "youtube_play":
        speak(response || "Searching YouTube...");
        window.open(
          `https://www.youtube.com/results?search_query=${query}`,
          "_blank"
        );
        break;

      case "calculator_open":
        speak(response || "Opening calculator.");
        window.open("https://www.google.com/search?q=calculator", "_blank");
        break;

      case "weather_show":
        speak(response || "Showing weather.");
        window.open("https://www.google.com/search?q=weather", "_blank");
        break;

      case "instagram_open":
        speak(response || "Opening Instagram.");
        window.open("https://www.instagram.com/", "_blank");
        break;

      case "facebook_open":
        speak(response || "Opening Facebook.");
        window.open("https://www.facebook.com/", "_blank");
        break;

      case "general":
        speak(response || "Here is what I found.");
        break;

      default:
        console.warn("Unknown command type:", type);
        speak("Sorry, I didn’t understand that command.");
        break;
    }
  };

  //For speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;
    const isRecognizingRef={current: false};

    const safeRecognition=()=>{
      if(!isSpeaking.current && !isRecognizingRef.current){
        try {
          recognition.start();
          console.log("Speech recognition started");
        } catch (error) {
          if(error.name !== "InvalidStateError") {
            console.error("Start Error:", error);
          }
        }
      }
    }

recognition.onstart = () => {
      console.log("Speech recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      isRecognizingRef.current = false;
      setListening(false);

      if(!isSpeaking.current) {
        setTimeout(() => {
          safeRecognition();
        }, 1000); //avoid rapid loop
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && !isSpeaking.current) {
        setTimeout(() => {
          safeRecognition();
        }, 1000); // Restart after a short delay
      }
    };



    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard:", transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {

        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log("response:", data);
        handleCommand(data);
      }
    };

    const fallback=setInterval(() => {
      if (!isRecognizingRef.current && !isSpeaking.current) {
        safeRecognition();
      }
    },10000)

    safeRecognition();
    return ()=>{
      recognition.stop()
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    }
  }, []);

  return (
    <div className="w-full h-[100vh] bg-[#0f172a] flex flex-col justify-center items-center px-4 gap-6">
      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer absolute top-[30px] right-[30px]"
        onClick={handleLogout}
      >
        Log Out
      </button>

      <button
        className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer absolute top-[100px] right-[30px] px-[20px] py-[10px]"
        onClick={() => navigate("/customize")}
      >
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

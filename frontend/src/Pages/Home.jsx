import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMenu } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const { serverUrl, userData, setUserData, getGeminiResponse } =
    useContext(UserDataContext);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isSpeaking = useRef(false);
  const shouldRestartRef = useRef(true);
  const isMountedRef = useRef(true);

  const synth = window.speechSynthesis;

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

  const startRecognition = () => {
    if (!isSpeaking.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (error) {
        if (!error.message.includes("start")) {
          console.error("Recognition error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    isSpeaking.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeaking.current = false;

      setTimeout(() => {
        startRecognition();
        // Restart recognition after speaking
      }, 800); //Delay avoid race condition
    };
    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    const query = encodeURIComponent(userInput);

    switch (type) {
      case "google_search":
        speak(response || "Searching that on Google.");
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
        break;

      case "youtube_search":
      case "youtube_play":
        speak(response || `Playing ${userInput} on YouTube.`);
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
        speak(response || "Showing the current weather.");
        window.open("https://www.google.com/search?q=weather", "_blank");
        break;

      case "instagram_open":
        speak(response || "Opening Instagram.");
        window.open("https://www.instagram.com", "_blank");
        break;

      case "facebook_open":
        speak(response || "Opening Facebook.");
        window.open("https://www.facebook.com", "_blank");
        break;

      case "open_app":
        speak(response || `Opening ${userInput}.`);
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
        break;

      case "joke":
      case "quote":
      case "write_poem":
      case "write_story":
      case "fitness_tip":
      case "diet_tip":
      case "mood_booster":
      case "small_talk":
      case "greeting":
      case "farewell":
      case "feedback_response":
      case "confirm_repeat":
      case "follow_up_context":
        speak(response || "Got it.");
        break;

      case "general":
        speak(response || "Here is the information.");
        break;

      case "fallback_type":
        speak("Let me look that up. Opening a helpful page.");
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
        break;

      default:
        console.warn("Unknown command type:", type);
        speak("Here’s something that might help.");
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
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
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startTimeOut = setTimeout(() => {
      if (isMounted && !isSpeaking.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Speech recognition started");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("Start Error:", error);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      console.log("Speech recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      isRecognizingRef.current = false;
      setListening(false);

      if (isMounted && !isSpeaking.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recogintion restarted");
            } catch (error) {
              if (error.name !== "InvalidStateError") console.error(error);
            }
          }
          //safeRecognition();
        }, 1000); //avoid rapid loop
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);

      const unrecoverableErrors = ["not-allowed", "service-not-allowed"];

      if (unrecoverableErrors.includes(event.error)) {
        alert(
          "Microphone access is blocked. Please allow mic permission from your browser settings."
        );
        recognition.stop();
        return; // ❌ Do NOT restart
      }

      // Only restart if it's a recoverable error like 'network' or 'no-speech'
      if (event.error !== "aborted" && isMounted && !isSpeaking.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted after recoverable error");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard:", transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log("response:", data);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const greeting = new SpeechSynthesisUtterance(
      `Hello ${userData.name}, what can i help you with?`
    );
    greeting.lang = "hi-IN";

    window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeOut);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (ham) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [ham]);

  return (
    <div className="overflow-hidden w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] relative">
      {/* Hamburger menu icon - only for small/medium screens */}
      <IoMenu
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />

      {/* Slide-out Menu - visible only for small/medium screens */}
      <div
        className={`fixed lg:hidden top-0 w-full h-full bg-[#00000000] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${
          ham ? "translate-x-0" : "translate-x-full"
        } transition-transform-300`}
      >
        <RxCross1
          className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer"
          onClick={handleLogout}
        >
          Log Out
        </button>

        <button
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer px-[20px] py-[10px]"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>

        <div className="w-full h-[60%] overflow-y-auto flex flex-col gap-[10px]">
          {userData.history?.map((his, idx) => (
            <span key={idx} className="text-gray-200 text-[18px]">
              {his}
            </span>
          ))}
        </div>
      </div>

      {/* Top-right stacked buttons on large screens */}
      <div className="hidden lg:flex flex-col absolute top-[20px] right-[20px] gap-[15px] items-end">
        <button
          className="px-[20px] py-[10px] text-black font-semibold bg-white rounded-full text-[17px] cursor-pointer shadow-md"
          onClick={handleLogout}
        >
          Log Out
        </button>
        <button
          className="px-[25px] py-[10px] text-black font-semibold bg-white rounded-full text-[17px] cursor-pointer shadow-md"
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>
      </div>

      {/* Assistant Card */}
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

      {/* Status GIF */}
      {!aiText && (
        <img src="/user.gif" alt="User speaking" className="w-[200px]" />
      )}
      {aiText && <img src="/ai.gif" alt="AI replying" className="w-[200px]" />}

      {/* AI/User Text Output with Ellipsis */}
      <div className="mt-3 w-[90%] max-w-[400px] h-[28px] text-white text-[18px] font-semibold text-center overflow-hidden text-ellipsis whitespace-nowrap">
        {userText ? userText : aiText ? aiText : ""}
      </div>
    </div>
  );
};

export default Home;

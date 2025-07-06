import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(400).json({ message: "Get current user Error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error updating assistant" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, userName, assistantName);

    const jsonMatch = result.match(/{[\s\S]}/);
    if (!jsonMatch) {
      return res
        .status(400)
        .json({
          message: "Sorry, I can't understand your request. Please try again.",
        });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get_time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `The current time is ${moment().format("h:mm A")}`,
        });

      case "get_date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today's date is ${moment().format("Do MMMM YYYY")}`,
        });

      case "get_day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get_month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `The current month is ${moment().format("MMMM")}`,
        });

      case "google_search":
      case "youtube_search":
      case "youtube_play":
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "weather_show":
      case "set_alarm":
      case "set_reminder":
      case "note_create":
      case "news_update":
      case "joke":
      case "quote":
      case "translate":
      case "define_word":
      case "call_contact":
      case "send_message":
      case "battery_status":
      case "internet_speed_test":
      case "system_status":
      case "music_play":
      case "calendar_event":
      case "math_solver":
      case "currency_convert":
      case "unit_conversion":
      case "wikipedia_search":
      case "spell_check":
      case "grammar_check":
      case "summarize_text":
      case "expand_text":
      case "email_draft":
      case "write_poem":
      case "write_story":
      case "paraphrase_text":
      case "todo_list_add":
      case "todo_list_show":
      case "email_check":
      case "map_direction":
      case "chatgpt_query":
      case "location_weather":
      case "breathing_exercise":
      case "meditation_guide":
      case "fitness_tip":
      case "diet_tip":
      case "mood_booster":
      case "mood_journal":
      case "habit_tracker":
      case "goal_reminder":
      case "study_mode":
      case "decision_advice":
      case "open_app":
      case "regional_support":
      case "respond_in_language":
      case "dual_language_mode":
      case "detect_language":
      case "small_talk":
      case "greeting":
      case "farewell":
      case "feedback_response":
      case "confirm_repeat":
      case "follow_up_context":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response || "Here's what I found!",
        });

      case "general":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response || "Here is the information I found.",
        });

      case "fallback_type":
      default:
        return res.json({
          type: "fallback_type",
          userInput: gemResult?.userInput || command,
          response:
            "Sorry, I didn't understand that. Please try again with something else.",
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in askToAssistant", error: error.message });
  }
};

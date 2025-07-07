import moment from "moment";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";

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

    if (!command || typeof command !== "string") {
      return res.status(400).json({ message: "Invalid command format." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Save command to user history
    user.history.push(command);
    await user.save();

    const result = await geminiResponse(command, user.assistantName, user.name);

    if (!result || typeof result !== "string") {
      return res.status(500).json({ message: "Invalid response from Gemini." });
    }

    const jsonMatch = result.match(/{[\s\S]+}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "Could not parse response JSON." });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(400).json({ message: "Malformed JSON in response." });
    }

    const { type, userInput, response } = gemResult;

    // Fast paths for time/date responses
    const now = moment();
    if (type === "get_time") {
      return res.json({ type, userInput, response: `The current time is ${now.format("h:mm A")}` });
    }
    if (type === "get_date") {
      return res.json({ type, userInput, response: `Today's date is ${now.format("Do MMMM YYYY")}` });
    }
    if (type === "get_day") {
      return res.json({ type, userInput, response: `Today is ${now.format("dddd")}` });
    }
    if (type === "get_month") {
      return res.json({ type, userInput, response: `The current month is ${now.format("MMMM")}` });
    }

    const validTypes = new Set([
      "google_search", "youtube_search", "youtube_play", "calculator_open",
      "instagram_open", "facebook_open", "weather_show", "set_alarm", "set_reminder",
      "note_create", "news_update", "joke", "quote", "translate", "define_word",
      "call_contact", "send_message", "battery_status", "internet_speed_test",
      "system_status", "music_play", "calendar_event", "math_solver",
      "currency_convert", "unit_conversion", "wikipedia_search", "spell_check",
      "grammar_check", "summarize_text", "expand_text", "email_draft", "write_poem",
      "write_story", "paraphrase_text", "todo_list_add", "todo_list_show", "email_check",
      "map_direction", "chatgpt_query", "location_weather", "breathing_exercise",
      "meditation_guide", "fitness_tip", "diet_tip", "mood_booster", "mood_journal",
      "habit_tracker", "goal_reminder", "study_mode", "decision_advice", "open_app",
      "regional_support", "respond_in_language", "dual_language_mode", "detect_language",
      "small_talk", "greeting", "farewell", "feedback_response", "confirm_repeat",
      "follow_up_context"
    ]);

    // If valid or general type, respond with natural Gemini response
    if (validTypes.has(type) || type === "general") {
      return res.json({
        type,
        userInput,
        response: response || "Here's what I found.",
      });
    }

    // Final fallback (if Gemini returned unknown type)
    return res.json({
      type: "fallback_type",
      userInput: command,
      response: "Sorry, I didn't understand that.",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error in askToAssistant",
      error: error.message,
    });
  }
};

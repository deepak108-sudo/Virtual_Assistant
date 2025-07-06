import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

export const signUp = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    
    //Validate required
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    

    const existEmail = await User.findOne({ email });
    
    if (existEmail) {

      return res.status(400).json({ message: "User already exist" });
      
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    //Generte JWT token
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
    });

    const userResponse = { ...user._doc };
    delete userResponse.password;
    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//LogOut
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Log out Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout Error" });
  }
};

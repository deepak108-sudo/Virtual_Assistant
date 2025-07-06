import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Cookies:", req.cookies);

    if (!token) {
      return res
        .status(400)
        .json({ message: "No token found, please login first" });
    }
    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);

    req.userId = verifyToken.userId;
    next()
  } catch (error) {
    console.error("Error in isAuth middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default isAuth;

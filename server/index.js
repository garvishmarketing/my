import express from "express";
import cors from "cors";
import users from "./Database.js";
import { v4 } from "uuid";
import { setUser, getUser } from "./auth.js";

import cookieParser from "cookie-parser";

const PORT = 3000;
const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = users.find((user) => user.id === userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = v4();

    setUser(token, user);
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Logged in successfully",
      data: { userId, password },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const authenticate = (req, res, next) => {
  const token = req.cookies?.authToken;

  if (!token) {
    res.status(401).json({ message: "No token" });
  }

  if (token) {
    const user = getUser(token);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

app.get("/protected", authenticate, (req, res) => {
  res.status(200).json({ isAuthenticated: "true" });
});

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

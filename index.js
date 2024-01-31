require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const salt = bcrypt.genSaltSync(10);
const secret = "dfkjn239d8schnkd3298dsc2b";

const app = express();

// Production: 8000
// Development: 8000
const PORT = 8000;

connectDB();
// Production:  tbc
// Development: "http://localhost:3000"
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", async (req, res) => {
  res.json("Hello Mate!");
});

app.post("/signup", async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: "Error going on here" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (userDoc) {
    const passwordOk = bcrypt.compareSync(password, userDoc.password);
    if (passwordOk) {
      // User is logged in
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          name: userDoc.name,
          id: userDoc._id,
          username: userDoc.username,
        });
      });
    } else {
      res.status(400).json("Invalid login");
    }
  } else {
    res.status(400).json("Invalid login");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

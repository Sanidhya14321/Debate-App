// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ---------------- Setup ----------------
const app = express();
app.use(express.json());
app.use(cors());

// Load ENV
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/debateDB";
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ---------------- Schemas ----------------
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

const argumentSchema = new mongoose.Schema({
  debateId: String,
  userId: String,
  username: String,
  argument: String,
  sentiment: Number,
  createdAt: { type: Date, default: Date.now }
});

const resultSchema = new mongoose.Schema({
  debateId: String,
  logicScore: Number,
  persuasivenessScore: Number,
  engagementScore: Number,
  winner: String,
  evaluatedAt: { type: Date, default: Date.now }
});

const debateSchema = new mongoose.Schema({
  topic: String,
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// ---------------- Models ----------------
const User = mongoose.model("User", userSchema);
const Debate = mongoose.model("Debate", debateSchema);
const Argument = mongoose.model("Argument", argumentSchema);
const Result = mongoose.model("Result", resultSchema);

// ---------------- Middleware ----------------
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// ---------------- Routes ----------------
// List open debates (less than 2 users)
app.get("/debates/open", async (req, res) => {
  try {
    const openDebates = await Debate.find({
      status: "active",
      $expr: { $lt: [{ $size: "$joinedUsers" }, 2] }
    });
    res.json(openDebates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching open debates" });
  }
});
// Join Debate Room
app.post("/debates/:id/join", authMiddleware, async (req, res) => {
  const debateId = req.params.id;
  const userId = req.user.id;
  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: "Debate not found" });
    if (!debate.joinedUsers.includes(userId)) {
      debate.joinedUsers.push(userId);
      await debate.save();
    }
    res.json({ joinedUsers: debate.joinedUsers });
  } catch (err) {
    res.status(500).json({ message: "Join error" });
  }
});

// Debate Room Status (who has joined)
app.get("/debates/:id/status", async (req, res) => {
  const debateId = req.params.id;
  try {
    const debate = await Debate.findById(debateId).populate("joinedUsers", "username");
    if (!debate) return res.status(404).json({ message: "Debate not found" });
    const canStart = debate.joinedUsers.length >= 2;
    res.json({
      joinedUsers: debate.joinedUsers.map(u => u.username),
      canStart
    });
  } catch (err) {
    res.status(500).json({ message: "Status error" });
  }
});

// Auth - Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashedPassword });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

// Auth - Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

// Create Debate
app.post("/debates", authMiddleware, async (req, res) => {
  const { topic } = req.body;
  const debate = await Debate.create({ topic });
  res.json(debate);
});

// Add Argument
app.post("/debates/:id/arguments", authMiddleware, async (req, res) => {
  const { argument } = req.body;
  const debateId = req.params.id;

  try {
    const response = await axios.post("http://localhost:5000/analyze", { text: argument });
    const sentiment = response.data.sentiment || 0;

    const newArgument = await Argument.create({
      debateId,
      userId: req.user.id,
      username: req.user.username,
      argument,
      sentiment
    });

    res.json(newArgument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ML API Error" });
  }
});

// Finalize Debate (Calculate Results)
app.post("/debates/:id/finalize", authMiddleware, async (req, res) => {
  const debateId = req.params.id;

  const argumentsList = await Argument.find({ debateId });
  if (argumentsList.length === 0) return res.status(400).json({ message: "No arguments found" });

  try {
    const response = await axios.post("http://localhost:5000/finalize", { arguments: argumentsList });
    const { logicScore, persuasivenessScore, engagementScore, winner } = response.data;

    const result = await Result.create({
      debateId,
      logicScore,
      persuasivenessScore,
      engagementScore,
      winner
    });

    await Debate.findByIdAndUpdate(debateId, { status: "completed" });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Finalization Error" });
  }
});

// Get Debate Results
app.get("/debates/:id/results", async (req, res) => {
  const debateId = req.params.id;
  const results = await Result.findOne({ debateId });
  res.json(results);
});

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

// backend_server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017/debateDB";
const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const ML_API_URL = process.env.ML_API_URL || "http://ml-api:5001"; // docker service name

// ---------------- Mongoose Schemas ----------------
const userSchema = new mongoose.Schema({ username: String, email: { type: String, unique: true }, password: String });
const argumentSchema = new mongoose.Schema({
  debateId: String, userId: String, username: String, argumentText: String, sentiment: Number, createdAt: { type: Date, default: Date.now }
});
const resultSchema = new mongoose.Schema({
  debateId: String, logicScore: Number, persuasivenessScore: Number, engagementScore: Number, winner: String, evaluatedAt: { type: Date, default: Date.now }
});
const debateSchema = new mongoose.Schema({
  topic: String, status: { type: String, default: "waiting" }, isPrivate: { type: Boolean, default: false },
  inviteCode: String, createdAt: { type: Date, default: Date.now }, joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startedAt: Date, maxUsers: { type: Number, default: 2 }
});

const User = mongoose.model("User", userSchema);
const Debate = mongoose.model("Debate", debateSchema);
const Argument = mongoose.model("Argument", argumentSchema);
const Result = mongoose.model("Result", resultSchema);

// ---------------- Connect ----------------
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ---------------- Auth Middleware ----------------
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
app.get("/", (req, res) => res.json({ status: "ok", message: "Debate backend running" }));

// Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (err) {
    console.error("[register]", err.message);
    res.status(400).json({ message: "User exists or invalid data" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error("[login]", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create debate
app.post("/debates", authMiddleware, async (req, res) => {
  const { topic, isPrivate = false } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic required" });
  try {
    const debateData = { topic, isPrivate, joinedUsers: [req.user.id] };
    if (isPrivate) debateData.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const debate = await Debate.create(debateData);
    res.json(debate);
  } catch (err) {
    console.error("[create debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
});

// Add argument (calls ML API /analyze)
app.post("/debates/:id/arguments", authMiddleware, async (req, res) => {
  const { argumentText } = req.body;
  const debateId = req.params.id;
  if (!argumentText) return res.status(400).json({ message: "argumentText required" });

  try {
    // call ML API
    const mlResp = await axios.post(`${ML_API_URL}/analyze`, { text: argumentText }, { timeout: 15000 });
    const analysis = mlResp.data;
    const sentiment = (analysis && analysis.sentiment) || 0;

    const newArg = await Argument.create({ debateId, userId: req.user.id, username: req.user.username, argumentText, sentiment });
    res.json({ ...newArg.toObject(), analysis, argument: newArg.argumentText });
  } catch (err) {
    console.error("[add argument] ML or DB error:", err.message);
    // fallback: save argument with neutral sentiment
    try {
      const newArg = await Argument.create({ debateId, userId: req.user.id, username: req.user.username, argumentText, sentiment: 0 });
      res.json({ ...newArg.toObject(), mlAnalysis: false, argument: newArg.argumentText, error: err.message });
    } catch (dbErr) {
      console.error("[add argument] DB error:", dbErr.message);
      res.status(500).json({ message: "Failed to save argument" });
    }
  }
});

// Get arguments
app.get("/debates/:id/arguments", async (req, res) => {
  const debateId = req.params.id;
  try {
    const args = await Argument.find({ debateId }).sort({ createdAt: 1 });
    res.json(args.map(a => ({ ...a.toObject(), argument: a.argumentText })));
  } catch (err) {
    console.error("[get arguments]", err.message);
    res.status(500).json({ message: "Failed to fetch arguments" });
  }
});

// Finalize debate (calls ML API /finalize)
app.post("/debates/:id/finalize", authMiddleware, async (req, res) => {
  const debateId = req.params.id;
  try {
    const argsList = await Argument.find({ debateId });
    if (!argsList.length) return res.status(400).json({ message: "No arguments" });

    // send args to ML API
    const payload = argsList.map(a => ({ userId: a.userId, username: a.username, argumentText: a.argumentText }));
    const mlResp = await axios.post(`${ML_API_URL}/finalize`, { arguments: payload }, { timeout: 45000 });
    const results = mlResp.data;

    const logicScore = results.totals?.A ?? 0;
    const persuasivenessScore = results.scores?.A?.sentiment ?? 0;
    const engagementScore = results.scores?.A?.clarity ?? 0;
    const winner = results.winner ?? "Draw";

    const resultDoc = await Result.create({ debateId, logicScore, persuasivenessScore, engagementScore, winner });
    await Debate.findByIdAndUpdate(debateId, { status: "completed" });
    res.json({ ...resultDoc.toObject(), details: results });
  } catch (err) {
    console.error("[finalize] error:", err.message);
    // fallback scoring if ML fails (basic)
    try {
      const argsList = await Argument.find({ debateId });
      const users = {};
      argsList.forEach(a => {
        if (!users[a.username]) users[a.username] = { count: 0, totalWords: 0, sentiments: [] };
        users[a.username].count++;
        users[a.username].totalWords += a.argumentText.split(/\s+/).length;
        if (a.sentiment !== undefined) users[a.username].sentiments.push(a.sentiment);
      });
      const usernames = Object.keys(users);
      let winner = usernames[0] || "Draw";
      if (usernames.length >= 2) {
        const u1 = users[usernames[0]], u2 = users[usernames[1]];
        const avgSent = arr => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0.5);
        const score1 = u1.count*0.4 + u1.totalWords*0.001 + avgSent(u1.sentiments)*0.6;
        const score2 = u2.count*0.4 + u2.totalWords*0.001 + avgSent(u2.sentiments)*0.6;
        winner = score1 > score2 ? usernames[0] : usernames[1];
      }
      const totalWordCount = argsList.reduce((s,a)=>s+a.argumentText.split(/\s+/).length,0);
      const baseLogic = Math.min(0.9, Math.max(0.3, 0.5 + totalWordCount/argsList.length/50));
      const avgSentiment = argsList.reduce((s,a)=>s+(a.sentiment||0),0)/Math.max(argsList.length,1);
      const basePersuasion = Math.min(0.9, Math.max(0.3, 0.4 + Math.abs(avgSentiment - 0.5)));
      const baseEngagement = Math.min(0.9, Math.max(0.4, argsList.length/10));
      const logicScore = Math.min(0.95, Math.max(0.25, baseLogic + (Math.random()-0.5)*0.2));
      const persuasivenessScore = Math.min(0.95, Math.max(0.25, basePersuasion + (Math.random()-0.5)*0.2));
      const engagementScore = Math.min(0.95, Math.max(0.25, baseEngagement + (Math.random()-0.5)*0.2));
      const result = await Result.create({ debateId, logicScore, persuasivenessScore, engagementScore, winner });
      await Debate.findByIdAndUpdate(debateId, { status: "completed" });
      res.json({ ...result.toObject(), mlAnalysis: false });
    } catch (dbErr) {
      console.error("[finalize fallback] dbErr:", dbErr.message);
      res.status(500).json({ message: "Failed to finalize debate" });
    }
  }
});

app.get("/debates/:id/results", async (req, res) => {
  const debateId = req.params.id;
  try {
    const results = await Result.findOne({ debateId });
    res.json(results);
  } catch (err) {
    console.error("[get results]", err.message);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

app.get("/ml-status", async (req, res) => {
  try {
    const status = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
    res.json({ mlApiStatus: "connected", data: status.data });
  } catch (err) {
    res.json({ mlApiStatus: "disconnected", error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

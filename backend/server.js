import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(cors({
      origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }
  )
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Aether GPT API is running successfully!");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aether GPT backend is running",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Aether GPT server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect database:", error);
    process.exit(1);
  }
};

startServer();
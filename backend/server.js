import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aether GPT backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

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


// app.post("/test", async (req, res) => {

//     const options = {
//         method: "POST",
//         headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//     },
//     body: JSON.stringify({
//         model: "gpt-5.6-luna",
//         messages: [
//             {
//                 role: "user",
//                 content: req.body.message
//             }
//         ]
//     })

//     }

//     try{
//         const response = await fetch("https://api.openai.com/v1/chat/completions", options);
//         const data = await response.json();

//         //console.log(data.choices[0].message.content);
//         res.send({
//             message: data.choices[0].message.content
//         });
//     }
//     catch(error){
//         console.log(error);
//     }
// })
require('dotenv').config(); 
console.log("🔐 Loaded API key:", process.env.REGOLO_API_KEY);
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Function to generate unique code (e.g: A45, T67, O33)
function generateUniqueCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const number1 = numbers.charAt(Math.floor(Math.random() * numbers.length));
  const number2 = numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  return `${letter1}${number1}${number2}`;
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "emergencies",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to MySQL!");
    db.query("DELETE FROM calls", (err) => {
      if (err) console.error("❌ Error during initial cleanup:", err);
      else console.log("🧹 All calls have been deleted on startup.");
    });
  }
});

app.get("/api/calls", (req, res) => {
  db.query("SELECT * FROM calls ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send("Error retrieving calls.");
    res.json(results);
  });
});

app.post("/api/calls", async (req, res) => {
  const { description, address, lat, lng } = req.body;

  if (!description || !address || !lat || !lng) {
    return res.status(400).send("All fields are required.");
  }

  let urgency = "Green";
  let unit = "Not specified";
  let reformulatedDescription = description;
  const code = generateUniqueCode();
  const dateTime = new Date();

  try {
    // 1. AI Classification (urgency + unit)
    const classificationAI = await axios.post(
      process.env.AI_API_URL || "https://api.regolo.ai/v1/chat/completions",
      {
        model: process.env.AI_MODEL || "DeepSeek-R1-Distill-Qwen-32B",
        messages: [
          {
            role: "system",
            content: `You are an emergency assistant. You will be provided with the description of an emergency call. You must do two things:
1. Classify urgency as: Red (very urgent), Yellow (urgent), Green (low urgency)
2. Indicate the most suitable intervention unit among: ambulance, fire department, police
Reply with this format:
URGENCY: <color>
UNIT: <unit>`,
          },
          {
            role: "user",
            content: `Emergency description: "${description}"`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REGOLO_API_KEY}`,
        },
      }
    );

    const text = classificationAI.data.choices[0].message.content.trim();
    console.log("📨 AI classification response:\n" + text);

    const urgencyMatch = text.match(/URGENCY:\s*(Red|Yellow|Green)/i);
    const unitMatch = text.match(/UNIT:\s*(Ambulance|Police|Fire Department)/i);

    if (urgencyMatch) urgency = urgencyMatch[1];
    if (unitMatch) unit = unitMatch[1];

    // 2. Technical reformulation of description IN ITALIAN
    const reformulationAI = await axios.post(
      process.env.AI_API_URL || "https://api.regolo.ai/v1/chat/completions",
      {
        model: process.env.AI_MODEL || "DeepSeek-R1-Distill-Qwen-32B",
        messages: [
          {
            role: "system",
            content: `Riceverai la descrizione di un'emergenza in linguaggio naturale. Riformulala in modo tecnico, breve e preciso, adatto agli operatori di emergenza. Rispondi SOLO con la nuova frase in italiano. Non includere spiegazioni o altre lingue. La descrizione deve essere professionale e utilizzare terminologia tecnica appropriata per il settore emergenze.`,
          },
          {
            role: "user",
            content: `Descrizione emergenza: "${description}"`,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REGOLO_API_KEY}`,
        },
      }
    );

    const rawResponse = reformulationAI.data.choices[0].message.content.trim();
    const lines = rawResponse.split("\n").filter(r => r.trim() !== "");
    reformulatedDescription = lines[lines.length - 1];

  } catch (err) {
    console.error("❌ Error in AI response:", err.message);
    if (err.response?.data) {
      console.error("📩 Details:", err.response.data);
    }
  }

  const query = "INSERT INTO calls (unit, description, address, lat, lng, urgency, code, date_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [unit, reformulatedDescription, address, lat, lng, urgency, code, dateTime];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ Save error:", err);
      return res.status(500).send("Error during insertion.");
    }

    res.status(201).json({
      id: result.insertId,
      unit,
      description: reformulatedDescription,
      address,
      lat,
      lng,
      urgency,
      code,
      date_time: dateTime
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
// server.js
require('dotenv').config(); 
console.log("🔐 Loaded API key:", process.env.REGOLO_API_KEY);

const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Import Sequelize configuration and model
const { sequelize, testConnection } = require('./config/database');
const Call = require('./models/Call');

const app = express();
app.use(cors());
app.use(express.json());

// Function to generate unique code (Letter + 2 numbers)
const generateUniqueCode = async () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random letter + two random numbers
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    code = letter + numbers;
    
    // Check if the code already exists in the database
    const existingCall = await Call.findOne({ where: { code } });
    if (!existingCall) {
      isUnique = true;
    }
  }
  
  return code;
};

// Database initialization
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Drop existing table and recreate it (DEVELOPMENT ONLY!)
    // In production, use migrations
    await sequelize.sync({ force: true });
    console.log("🗄️ Database ricreato con successo!");
    
    // Remove seeding of sample data to start with empty database
    // await seedDatabase();
    
  } catch (error) {
    console.error("❌ Errore durante l'inizializzazione del database:", error);
    throw error;
  }
};

// Function to populate database with sample data (DISABLED)
const seedDatabase = async () => {
  try {
    const sampleCalls = [
      {
        code: await generateUniqueCode(),
        unit: 'Fire Department', // Save in English in DB
        description: 'Incendio in appartamento al terzo piano',
        address: 'Via Roma 15, Milano',
        lat: 45.4642,
        lng: 9.1900,
        urgency: 'Red',
        dateTime: new Date('2025-05-28 14:30:00')
      },
      {
        code: await generateUniqueCode(),
        unit: 'Ambulance', // Save in English in DB
        description: 'Persona anziana caduta in casa',
        address: 'Corso Italia 89, Roma',
        lat: 41.9028,
        lng: 12.4964,
        urgency: 'Yellow',
        dateTime: new Date('2025-05-28 15:15:00')
      },
      {
        code: await generateUniqueCode(),
        unit: 'Police', // Save in English in DB
        description: 'Furto in abitazione segnalato da vicini',
        address: 'Via Garibaldi 33, Torino',
        lat: 45.0703,
        lng: 7.6869,
        urgency: 'Green',
        dateTime: new Date('2025-05-28 16:00:00')
      }
    ];

    await Call.bulkCreate(sampleCalls);
    console.log("🌱 Database popolato con dati di esempio");
    
  } catch (error) {
    console.error("❌ Errore nel seeding:", error);
  }
};

// Function to translate units from Italian to English (for the database)
const translateUnitToEnglish = (italianUnit) => {
  const translations = {
    'Ambulanza': 'Ambulance',
    'Polizia': 'Police',
    'Vigili del Fuoco': 'Fire Department'
  };
  return translations[italianUnit] || italianUnit;
};

// Function to translate units from English to Italian (for display)
const translateUnitToItalian = (englishUnit) => {
  const translations = {
    'Ambulance': 'Ambulanza',
    'Police': 'Polizia',
    'Fire Department': 'Vigili del Fuoco'
  };
  return translations[englishUnit] || englishUnit;
};

// ===== API ENDPOINTS =====

// GET - Retrieve all calls ordered by urgency
app.get("/api/calls", async (req, res) => {
  try {
    const { status, urgency, unit, limit = 50, offset = 0 } = req.query;
    
    let whereClause = {};
    
    // Optional filters
    if (status) whereClause.status = status;
    if (urgency) whereClause.urgency = urgency;
    if (unit) whereClause.unit = unit;
    
    const calls = await Call.findAll({
      where: whereClause,
      order: [
        ['urgency', 'ASC'],
        ['dateTime', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(calls);
  } catch (error) {
    console.error("❌ Errore nel recupero delle chiamate:", error);
    res.status(500).json({ error: "Errore nel recupero delle chiamate" });
  }
});

// GET - Retrieve calls by specific urgency
app.get("/api/calls/urgency/:level", async (req, res) => {
  try {
    const { level } = req.params;
    const calls = await Call.getByUrgency(level);
    res.json(calls);
  } catch (error) {
    console.error("❌ Errore nel recupero per urgenza:", error);
    res.status(500).json({ error: "Errore nel recupero per urgenza" });
  }
});

// GET - Retrieve calls by geographic area
app.get("/api/calls/location/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 5 } = req.query;
    
    const calls = await Call.getActiveByLocation(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius)
    );
    
    res.json(calls);
  } catch (error) {
    console.error("❌ Errore nel recupero per posizione:", error);
    res.status(500).json({ error: "Errore nel recupero per posizione" });
  }
});

// GET - Retrieve single call by ID
app.get("/api/calls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findByPk(id);
    
    if (!call) {
      return res.status(404).json({ error: "Chiamata non trovata" });
    }
    
    res.json(call);
  } catch (error) {
    console.error("❌ Errore nel recupero della chiamata:", error);
    res.status(500).json({ error: "Errore nel recupero della chiamata" });
  }
});

// GET - Retrieve call by unique code
app.get("/api/calls/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const call = await Call.findOne({ where: { code: code.toUpperCase() } });
    
    if (!call) {
      return res.status(404).json({ error: "Chiamata non trovata" });
    }
    
    res.json(call);
  } catch (error) {
    console.error("❌ Errore nel recupero della chiamata per codice:", error);
    res.status(500).json({ error: "Errore nel recupero della chiamata" });
  }
});

// POST - Create new call with AI
app.post("/api/calls", async (req, res) => {
  try {
    const { description, address, lat, lng } = req.body;

    // Input validation
    if (!description || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ 
        error: "Tutti i campi sono obbligatori",
        required: ["description", "address", "lat", "lng"]
      });
    }

    let urgency = "Green";
    let unit = "Police"; // Default in English for the database
    let reformulatedDescription = description;

    try {
      // 1. AI classification (urgency + unit)
      const classificationAI = await axios.post(
        process.env.AI_API_URL || "https://api.regolo.ai/v1/chat/completions",
        {
          model: process.env.AI_MODEL || "DeepSeek-R1-Distill-Qwen-32B",
          messages: [
            {
              role: "system",
              content: `Sei un assistente per emergenze. Ti verrà fornita la descrizione di una chiamata di emergenza in italiano. Devi fare due cose:
1. Classificare l'urgenza come: Red (molto urgente), Yellow (urgente), Green (poco urgente)
2. Indicare l'unità di intervento più adatta tra: Ambulance, Police, Fire Department
Rispondi con questo formato:
URGENCY: <colore>
UNIT: <unità>`,
            },
            {
              role: "user",
              content: `Descrizione emergenza: "${description}"`,
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
      console.log("📨 Risposta classificazione AI:\n" + text);

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
              content: `Riceverai la descrizione di un'emergenza in linguaggio naturale. Riformulala in modo tecnico, breve e preciso, adatto agli operatori di emergenza. Rispondi SOLO con la nuova frase in italiano. Non includere spiegazioni o altre lingue.`,
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

    } catch (aiError) {
      console.error("❌ Errore nella risposta AI:", aiError.message);
      if (aiError.response?.data) {
        console.error("📩 Dettagli:", aiError.response.data);
      }
    }

    // Generate unique code
    const uniqueCode = await generateUniqueCode();

    // Create new call using Sequelize (save unit in English)
    const newCall = await Call.create({
      code: uniqueCode,
      unit, // Save in English in the database
      description: reformulatedDescription,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      urgency,
      dateTime: new Date(),
      status: 'pending'
    });

    console.log("✅ Nuova chiamata creata:", newCall.toJSON());
    
    res.status(201).json(newCall);

  } catch (error) {
    console.error("❌ Errore durante il salvataggio:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: "Errore di validazione",
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    res.status(500).json({ error: "Errore durante l'inserimento" });
  }
});

// PUT - Update existing call
app.put("/api/calls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If the update includes the unit field, translate it to English
    if (updates.unit) {
      updates.unit = translateUnitToEnglish(updates.unit);
    }
    
    // Don't allow updating the code via PUT
    if (updates.code) {
      delete updates.code;
    }
    
    const call = await Call.findByPk(id);
    if (!call) {
      return res.status(404).json({ error: "Chiamata non trovata" });
    }
    
    await call.update(updates);
    res.json(call);
    
  } catch (error) {
    console.error("❌ Errore nell'aggiornamento:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: "Errore di validazione",
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

// PATCH - Update only the status of a call
app.patch("/api/calls/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const call = await Call.findByPk(id);
    if (!call) {
      return res.status(404).json({ error: "Chiamata non trovata" });
    }
    
    await call.updateStatus(status);
    res.json(call);
    
  } catch (error) {
    console.error("❌ Errore nell'aggiornamento status:", error);
    res.status(500).json({ error: "Errore nell'aggiornamento status" });
  }
});

// DELETE - Delete call (soft delete)
app.delete("/api/calls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findByPk(id);
    
    if (!call) {
      return res.status(404).json({ error: "Chiamata non trovata" });
    }
    
    await call.destroy(); // Soft delete thanks to paranoid: true
    res.json({ message: "Chiamata eliminata con successo" });
    
  } catch (error) {
    console.error("❌ Errore nell'eliminazione:", error);
    res.status(500).json({ error: "Errore nell'eliminazione" });
  }
});

// GET - General statistics
app.get("/api/stats", async (req, res) => {
  try {
    const { period = '7' } = req.query; // Days of period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const stats = await Call.getStatsByPeriod(startDate, new Date());
    
    const totalCalls = await Call.count({
      where: {
        dateTime: {
          [sequelize.Op.gte]: startDate
        }
      }
    });
    
    res.json({
      totalCalls,
      period: `${period} giorni`,
      breakdown: stats
    });
  } catch (error) {
    console.error("❌ Errore nelle statistiche:", error);
    res.status(500).json({ error: "Errore nel recupero delle statistiche" });
  }
});

// GET - Dashboard summary
app.get("/api/dashboard", async (req, res) => {
  try {
    const activeCalls = await Call.count({
      where: {
        status: ['pending', 'assigned', 'in_progress']
      }
    });
    
    const urgentCalls = await Call.count({
      where: {
        urgency: 'Red',
        status: ['pending', 'assigned', 'in_progress']
      }
    });
    
    const recentCalls = await Call.findAll({
      order: [['dateTime', 'DESC']],
      limit: 5
    });
    
    res.json({
      activeCalls,
      urgentCalls,
      recentCalls
    });
  } catch (error) {
    console.error("❌ Errore nella dashboard:", error);
    res.status(500).json({ error: "Errore nel recupero dati dashboard" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Errore del server:", error);
  res.status(500).json({ 
    error: "Errore interno del server",
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: "Endpoint non trovato" });
});

// Server startup
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server avviato su http://localhost:${PORT}`);
      console.log(`📊 API disponibili:
      GET    /api/calls                    - Tutte le chiamate (con filtri)
      GET    /api/calls/:id                - Chiamata specifica  
      GET    /api/calls/code/:code         - Chiamata per codice univoco
      GET    /api/calls/urgency/:level     - Chiamate per urgenza
      GET    /api/calls/location/:lat/:lng - Chiamate per area geografica
      POST   /api/calls                    - Crea nuova chiamata
      PUT    /api/calls/:id                - Aggiorna chiamata completa
      PATCH  /api/calls/:id/status         - Aggiorna solo status
      DELETE /api/calls/:id                - Elimina chiamata (soft delete)
      GET    /api/stats                    - Statistiche per periodo
      GET    /api/dashboard                - Riepilogo dashboard`);
    });
  } catch (error) {
    console.error("❌ Errore nell'avvio del server:", error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🔄 Arresto del server in corso...');
  await sequelize.close();
  console.log('✅ Connessioni database chiuse.');
  process.exit(0);
});

startServer();
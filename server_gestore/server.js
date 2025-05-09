const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Funzione per generare codice univoco (es: A45, T67, O33)
function generaCodiceUnivoco() {
  const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeri = '0123456789';
  
  const lettera1 = lettere.charAt(Math.floor(Math.random() * lettere.length));
  const numero1 = numeri.charAt(Math.floor(Math.random() * numeri.length));
  const numero2 = numeri.charAt(Math.floor(Math.random() * numeri.length));
  
  return `${lettera1}${numero1}${numero2}`;
}

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "emergenze",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Errore di connessione al database:", err);
  } else {
    console.log("✅ Connesso a MySQL!");
    db.query("DELETE FROM chiamate", (err) => {
      if (err) console.error("❌ Errore durante la pulizia iniziale:", err);
      else console.log("🧹 Tutte le chiamate sono state eliminate all'avvio.");
    });
  }
});

app.get("/api/chiamate", (req, res) => {
  db.query("SELECT * FROM chiamate ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send("Errore nel recupero delle chiamate.");
    res.json(results);
  });
});

app.post("/api/chiamate", async (req, res) => {
  const { descrizione, via, lat, lng } = req.body;

  if (!descrizione || !via || !lat || !lng) {
    return res.status(400).send("Tutti i campi sono obbligatori.");
  }

  let urgenza = "Verde";
  let unita = "Non specificata";
  let descrizioneRiformulata = descrizione;
  const codice = generaCodiceUnivoco();
  const dataOra = new Date();

  try {
    // 1. Classificazione AI (urgenza + unità)
    const classificazioneAI = await axios.post(
      "https://api.regolo.ai/v1/chat/completions",
      {
        model: "DeepSeek-R1-Distill-Qwen-32B",
        messages: [
          {
            role: "system",
            content: `Sei un assistente di emergenza. Ti verrà fornita la descrizione di una chiamata di emergenza. Devi fare due cose:
1. Classifica l'urgenza come: Rosso (molto urgente), Giallo (urgente), Verde (poco urgente)
2. Indica l'unità di intervento più adatta tra: ambulanza, vigili del fuoco, polizia
Rispondi con questo formato:
URGENZA: <colore>
UNITA: <unità>`,
          },
          {
            role: "user",
            content: `Descrizione emergenza: "${descrizione}"`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-S77vOL9Eg_Vj0-0Z2JBTaw",
        },
      }
    );

    const testo = classificazioneAI.data.choices[0].message.content.trim();
    console.log("📨 Risposta AI classificazione:\n" + testo);

    const matchUrgenza = testo.match(/URGENZA:\s*(Rosso|Giallo|Verde)/i);
    const matchUnita = testo.match(/UNITA:\s*(Ambulanza|Polizia|Vigili del Fuoco)/i);

    if (matchUrgenza) urgenza = matchUrgenza[1];
    if (matchUnita) unita = matchUnita[1];

    // 2. Riformulazione tecnica della descrizione
    const riformulazioneAI = await axios.post(
      "https://api.regolo.ai/v1/chat/completions",
      {
        model: "DeepSeek-R1-Distill-Qwen-32B",
        messages: [
          {
            role: "system",
            content: `Riceverai una descrizione di un'emergenza in linguaggio naturale. Riformulala in modo tecnico, breve e preciso, adatto agli operatori di emergenza. Rispondi solo con la nuova frase in italiano. Non includere spiegazioni o altre lingue.`,
          },
          {
            role: "user",
            content: `Descrizione emergenza: "${descrizione}"`,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-S77vOL9Eg_Vj0-0Z2JBTaw",
        },
      }
    );

    const rispostaGrezza = riformulazioneAI.data.choices[0].message.content.trim();
    const righe = rispostaGrezza.split("\n").filter(r => r.trim() !== "");
    descrizioneRiformulata = righe[righe.length - 1];

  } catch (err) {
    console.error("❌ Errore nella risposta AI:", err.message);
    if (err.response?.data) {
      console.error("📩 Dettagli:", err.response.data);
    }
  }

  const query = "INSERT INTO chiamate (unita, descrizione, via, lat, lng, urgenza, codice, data_ora) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [unita, descrizioneRiformulata, via, lat, lng, urgenza, codice, dataOra];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ Errore salvataggio:", err);
      return res.status(500).send("Errore durante l'inserimento.");
    }

    res.status(201).json({
      id: result.insertId,
      unita,
      descrizione: descrizioneRiformulata,
      via,
      lat,
      lng,
      urgenza,
      codice,
      data_ora: dataOra
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
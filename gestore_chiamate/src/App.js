import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GestoreChiamate from "./GestoreChiamate";
import "./App.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Gestione Emergenze</h1>
      <div className="button-container">
        <Link to="/gestore-chiamate" className="btn">📋 Gestisci Chiamate</Link>
        <Link to="/invia-emergenza" className="btn">🚨 Invia Emergenza</Link>
      </div>
    </div>
  );
}

function InviaEmergenza({ aggiungiChiamata }) {
  const [descrizione, setDescrizione] = useState("");
  const [via, setVia] = useState("");
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore("");
    setSuccesso(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(via)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        aggiungiChiamata({ descrizione, via, lat, lng });
        setDescrizione("");
        setVia("");
        setSuccesso(true);
        setTimeout(() => setSuccesso(false), 3000);
      } else {
        setErrore("Indirizzo non trovato.");
      }
    } catch (error) {
      console.error("Errore durante la richiesta API: ", error);
      setErrore("Errore di connessione.");
    }
  };

  return (
    <div className="content-container">
      <h1 className="title">🚨 Invia Emergenza</h1>
      <form onSubmit={handleSubmit} className="emergency-form">
        <input
          type="text"
          placeholder="Descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Via"
          value={via}
          onChange={(e) => setVia(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="btn-submit">🚀 Invia</button>
        {errore && <p className="errore">{errore}</p>}
        {successo && <p className="notifica-successo">✅ Chiamata inviata con successo!</p>}
      </form>
      <Link to="/" className="btn">⬅️ Torna Indietro</Link>
    </div>
  );
}

function App() {
  const [chiamate, setChiamate] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/chiamate")
      .then((res) => res.json())
      .then((data) => {
        const urgenzaPriorita = { Rosso: 0, Giallo: 1, Verde: 2 };
        const chiamateOrdinate = data.sort((a, b) => urgenzaPriorita[a.urgenza] - urgenzaPriorita[b.urgenza]);
        setChiamate(chiamateOrdinate);
      })
      .catch((err) => console.error("Errore nel caricamento chiamate:", err));
  }, []);

  const aggiungiChiamata = async (nuovaChiamata) => {
    try {
      const res = await fetch("http://localhost:3001/api/chiamate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuovaChiamata),
      });
      const data = await res.json();
      setChiamate((prev) => {
        const nuove = [data, ...prev];
        const urgenzaPriorita = { Rosso: 0, Giallo: 1, Verde: 2 };
        return nuove.sort((a, b) => urgenzaPriorita[a.urgenza] - urgenzaPriorita[b.urgenza]);
      });
    } catch (err) {
      console.error("Errore nel salvataggio chiamata:", err);
    }
  };

  return (
    <div className="app-background">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gestore-chiamate" element={<GestoreChiamate chiamate={chiamate} />} />
          <Route path="/invia-emergenza" element={<InviaEmergenza aggiungiChiamata={aggiungiChiamata} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
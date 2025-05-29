import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CallManager from "./CallManager";
import "./App.css";

// Home component - Main landing page with navigation options
function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Gestione Emergenze</h1>
      <div className="button-container">
        {/* Navigation buttons to main app sections */}
        <Link to="/call-manager" className="btn">📋 Gestisci Chiamate</Link>
        <Link to="/send-emergency" className="btn">🚨 Invia Emergenza</Link>
      </div>
    </div>
  );
}

// SendEmergency component - Form to create new emergency calls
function SendEmergency({ addCall }) {
  // State management for form inputs and UI feedback
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle form submission and geocoding
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      // Use OpenStreetMap Nominatim API for address geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      // If address found, extract coordinates and create call
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        addCall({ description, address, lat, lng });
        
        // Reset form and show success message
        setDescription("");
        setAddress("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Indirizzo non trovato.");
      }
    } catch (error) {
      console.error("Error during API request: ", error);
      setError("Errore di connessione.");
    }
  };

  return (
    <div className="content-container">
      <h1 className="title">🚨 Invia Emergenza</h1>
      <form onSubmit={handleSubmit} className="emergency-form">
        {/* Emergency description input */}
        <input
          type="text"
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="input-field"
        />
        {/* Address input */}
        <input
          type="text"
          placeholder="Via"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="input-field"
        />
        {/* Submit button */}
        <button type="submit" className="btn-submit">🚀 Invia</button>
        
        {/* Error and success messages */}
        {error && <p className="error">{error}</p>}
        {success && <p className="success-notification">✅ Chiamata inviata con successo!</p>}
      </form>
      {/* Back navigation button */}
      <Link to="/" className="btn">⬅️ Torna Indietro</Link>
    </div>
  );
}

// Main App component - Root component with routing and state management
function App() {
  // Global state for emergency calls
  const [calls, setCalls] = useState([]);

  // Load existing calls from server on component mount
  useEffect(() => {
    fetch("http://localhost:3001/api/calls")
      .then((res) => res.json())
      .then((data) => {
        // Sort calls by urgency priority (Red > Yellow > Green)
        const urgencyPriority = { Red: 0, Yellow: 1, Green: 2 };
        const sortedCalls = data.sort((a, b) => urgencyPriority[a.urgency] - urgencyPriority[b.urgency]);
        setCalls(sortedCalls);
      })
      .catch((err) => console.error("Errore nel caricamento chiamate:", err));
  }, []);

  // Function to add new call to server and update local state
  const addCall = async (newCall) => {
    try {
      // Send new call to server
      const res = await fetch("http://localhost:3001/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCall),
      });
      const data = await res.json();
      
      // Update local state with new call, maintaining urgency sort order
      setCalls((prev) => {
        const newCalls = [data, ...prev];
        const urgencyPriority = { Red: 0, Yellow: 1, Green: 2 };
        return newCalls.sort((a, b) => urgencyPriority[a.urgency] - urgencyPriority[b.urgency]);
      });
    } catch (err) {
      console.error("Errore nel salvataggio chiamata:", err);
    }
  };

  return (
    <div className="app-background">
      {/* React Router setup for navigation */}
      <Router>
        <Routes>
          {/* Route definitions */}
          <Route path="/" element={<Home />} />
          <Route path="/call-manager" element={<CallManager calls={calls} />} />
          <Route path="/send-emergency" element={<SendEmergency addCall={addCall} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
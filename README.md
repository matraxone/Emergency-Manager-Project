# 🚨 Responso - Emergency Management System with AI / Sistema di Gestione Emergenze con Intelligenza Artificiale

## 🇬🇧 English Description

An intelligent and interactive web application for emergency management, based on **React**, **Node.js**, **MySQL**, and **AI (via Regolo)**. The app allows users to report emergencies, automatically classifies urgency, selects the most suitable intervention unit, and reformulates the emergency description in a clear and concise way for operators.

### 🔧 Features

- **Emergency Submission:**  
  Users provide a natural language description and address. The system geolocates it using Nominatim (OpenStreetMap).

- **Automatic AI Classification (Regolo):**  
  - **Urgency Level:** High (Red), Medium (Yellow), Low (Green)
  - **Unit Selection:** Ambulance, Police, Fire Department
  - **Technical Reformulation:** Description is rewritten concisely for emergency staff

- **Code & Timestamp:**  
  Each call gets a unique alphanumeric code (e.g., T57) and a timestamp

- **Urgency-Based Sorting:**  
  Calls are automatically sorted from most to least urgent

- **Interactive Map:**  
  Displays all emergency reports on a map (Leaflet.js) with zoom and popup

- **Data Persistence (MySQL):**  
  All calls are stored with details like reformulated text, unit, urgency, coordinates, code, and timestamp

### 🧠 Tech Stack

- **Frontend:** React.js + React Router + Leaflet
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI:** Regolo (DeepSeek-R1-Distill-Qwen-32B)
- **Geolocation:** OpenStreetMap Nominatim API
- **Map Rendering:** Leaflet.js

### 📦 Installation

1. Clone this repo
2. Install frontend and backend dependencies
3. Set up the MySQL database and create the `chiamate` table
4. Add your Regolo API key in `server.js`
5. Run backend (`node server.js`)
6. Run frontend (`npm start`)

---

## 🇮🇹 Descrizione in Italiano

Un'app web intelligente per la gestione delle emergenze, realizzata con **React**, **Node.js**, **MySQL** e **AI (tramite Regolo)**. Permette di inviare segnalazioni, classificare automaticamente l’urgenza, selezionare l’unità più adatta e riformulare tecnicamente la descrizione per gli operatori.

### 🔧 Funzionalità

- **Invio Emergenze:**  
  Inserisci una descrizione e indirizzo. Il sistema calcola latitudine e longitudine con Nominatim (OpenStreetMap).

- **Classificazione Automatica con AI:**  
  - **Livello Urgenza:** Alta (Rosso), Media (Giallo), Bassa (Verde)
  - **Unità Intervento:** Ambulanza, Polizia, Vigili del Fuoco
  - **Riformulazione Tecnica:** Linguaggio adatto agli operatori

- **Codice e Timestamp:**  
  Ogni chiamata è associata a un codice univoco (es. T57) e orario di invio

- **Ordinamento per Urgenza:**  
  Dalle più gravi (Rosso) alle meno gravi (Verde)

- **Mappa Interattiva:**  
  Visualizza tutte le emergenze sulla mappa (Leaflet.js)

- **Salvataggio nel Database (MySQL):**  
  Include testo riformulato, urgenza, unità, latitudine, longitudine, codice e orario

### 🧠 Tecnologie Utilizzate

- **Frontend:** React.js + React Router + Leaflet
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI:** Regolo (DeepSeek-R1-Distill-Qwen-32B)
- **Geolocalizzazione:** OpenStreetMap Nominatim API
- **Mappa:** Leaflet.js

### 📦 Istruzioni

1. Clona il repository
2. Installa le dipendenze frontend e backend
3. Crea il database MySQL e la tabella `chiamate`
4. Inserisci la tua API Key Regolo in `server.js`
5. Avvia il backend (`node server.js`)
6. Avvia il frontend (`npm start`)

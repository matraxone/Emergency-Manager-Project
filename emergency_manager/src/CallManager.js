import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

// Custom red icon for emergency markers on the map
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// CallManager component - Main dashboard for managing emergency calls
function CallManager({ calls }) {
  // Reference to map instance for programmatic control
  const mapRef = useRef(null);

  // Function to zoom map to specific emergency location
  const zoomOnEmergency = (lat, lng) => {
    if (mapRef.current && lat && lng) {
      mapRef.current.setView([lat, lng], 16, { animate: true, duration: 1.5 });
    }
  };

  // Get urgency color based on priority level
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Red":
        return "#ff4444";
      case "Yellow":
        return "#ffcc00";
      case "Green":
      default:
        return "#44ff44";
    }
  };

  // Translate urgency level to Italian display text
  const getUrgencyLevel = (urgency) => {
    switch (urgency) {
      case "Red":
        return "Alta";
      case "Yellow":
        return "Media";
      case "Green":
      default:
        return "Lieve";
    }
  };

  // Translate unit types from English (database) to Italian (display)
  const translateUnit = (unit) => {
    switch (unit) {
      case "Ambulance":
        return "Ambulanza";
      case "Police":
        return "Polizia";
      case "Fire Department":
        return "Vigili del Fuoco";
      default:
        return unit;
    }
  };

  // Format date/time to Italian locale string
  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    
    try {
      const date = new Date(dateString);
      
      // Validate date object
      if (isNaN(date.getTime())) {
        return "Data non valida";
      }
      
      // Format to Italian locale with full date and time
      return date.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Rome'
      });
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return "Errore data";
    }
  };

  // Validate if coordinates are within valid geographic bounds
  const isValidCoordinate = (lat, lng) => {
    return lat !== undefined && lng !== undefined && 
           lat !== null && lng !== null && 
           !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  // Filter calls with valid coordinates for map display
  const callsWithValidCoords = calls.filter(call => 
    isValidCoordinate(call.lat, call.lng)
  );

  return (
    <div className="dashboard">
      {/* Left side: Call list */}
      <div className="call-list-container">
        <h1 className="title">📋 Gestore Chiamate</h1>
        <ul className="call-list">
          {calls.length > 0 ? (
            calls.map((call, index) => (
              <li 
                key={index} 
                className="call-item" 
                // Click handler to zoom map to call location
                onClick={() => {
                  if (isValidCoordinate(call.lat, call.lng)) {
                    zoomOnEmergency(call.lat, call.lng);
                  }
                }}
                // Visual styling based on coordinate validity
                style={{
                  cursor: isValidCoordinate(call.lat, call.lng) ? 'pointer' : 'default',
                  opacity: isValidCoordinate(call.lat, call.lng) ? 1 : 0.7
                }}
              >
                {/* Call header with code and timestamp */}
                <div className="call-header">
                  <span className="call-code">🔢 {call.code || call.id || "N/D"}</span>
                  <span className="call-date">📅 {formatDate(call.dateTime || call.date_time)}</span>
                </div>
                
                {/* Call details */}
                <span className="call-type">{translateUnit(call.unit)}</span> - {call.description}
                <br />
                📍 {call.address}
                
                {/* Warning for invalid coordinates */}
                {!isValidCoordinate(call.lat, call.lng) && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8em' }}> (Coordinate non disponibili)</span>
                )}
                <br />
                
                {/* Urgency level with color coding */}
                <strong style={{ color: getUrgencyColor(call.urgency) }}>
                  🚨 Urgenza: {getUrgencyLevel(call.urgency)}
                </strong>
              </li>
            ))
          ) : (
            <p className="no-calls">Nessuna chiamata registrata.</p>
          )}
        </ul>
      </div>

      {/* Right side: Interactive map */}
      <div className="map-container">
        <MapContainer 
          center={[41.64, 13.32]} // Default center (Italy)
          zoom={13} 
          className="map" 
          whenCreated={(map) => (mapRef.current = map)}
        >
          {/* OpenStreetMap tile layer */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Markers for each call with valid coordinates */}
          {callsWithValidCoords.map((call, index) => (
            <Marker key={index} position={[call.lat, call.lng]} icon={redIcon}>
              <Popup>
                <strong>{translateUnit(call.unit)}</strong><br />
                🔢 Codice: {call.code || call.id || "N/D"}<br />
                📅 {formatDate(call.dateTime || call.date_time)}<br />
                {call.description}<br />
                📍 {call.address}<br />
                🚨 Urgenza: <strong style={{ color: getUrgencyColor(call.urgency) }}>
                  {getUrgencyLevel(call.urgency)}
                </strong>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Warning notification for calls without valid coordinates */}
        {calls.length > callsWithValidCoords.length && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '0.9em',
            maxWidth: '250px',
            zIndex: 1000
          }}>
            ⚠️ {calls.length - callsWithValidCoords.length} chiamata/e senza coordinate valide non mostrate sulla mappa
          </div>
        )}
      </div>
    </div>
  );
}

export default CallManager;
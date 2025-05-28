import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function CallManager({ calls }) {
  const mapRef = useRef(null);

  const zoomOnEmergency = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16, { animate: true, duration: 1.5 });
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleString('it-IT');
  };

  return (
    <div className="dashboard">
      <div className="call-list-container">
        <h1 className="title">📋 Gestore Chiamate</h1>
        <ul className="call-list">
          {calls.length > 0 ? (
            calls.map((call, index) => (
              <li key={index} className="call-item" onClick={() => zoomOnEmergency(call.lat, call.lng)}>
                <div className="call-header">
                  <span className="call-code">🔢 {call.code || "N/D"}</span>
                  <span className="call-date">📅 {formatDate(call.date_time)}</span>
                </div>
                <span className="call-type">{call.unit}</span> - {call.description}
                <br />
                📍 {call.address}
                <br />
                <strong style={{ color: getUrgencyColor(call.urgency) }}>
                  🧠 Urgenza: {getUrgencyLevel(call.urgency)}
                </strong>
              </li>
            ))
          ) : (
            <p className="no-calls">Nessuna chiamata registrata.</p>
          )}
        </ul>
      </div>

      <div className="map-container">
        <MapContainer center={[41.64, 13.32]} zoom={13} className="map" whenCreated={(map) => (mapRef.current = map)}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {calls.map((call, index) => (
            <Marker key={index} position={[call.lat, call.lng]} icon={redIcon}>
              <Popup>
                <strong>{call.unit}</strong><br />
                🔢 Codice: {call.code || "N/D"}<br />
                📅 {formatDate(call.date_time)}<br />
                {call.description}<br />
                📍 {call.address}<br />
                🧠 Urgenza: <strong style={{ color: getUrgencyColor(call.urgency) }}>
                  {getUrgencyLevel(call.urgency)}
                </strong>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default CallManager;
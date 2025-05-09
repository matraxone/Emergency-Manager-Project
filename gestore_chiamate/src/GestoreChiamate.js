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

function GestoreChiamate({ chiamate }) {
  const mapRef = useRef(null);

  const zoomOnEmergenza = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16, { animate: true, duration: 1.5 });
    }
  };

  const getColoreUrgenza = (urgenza) => {
    switch (urgenza) {
      case "Rosso":
        return "#ff4444";
      case "Giallo":
        return "#ffcc00";
      case "Verde":
      default:
        return "#44ff44";
    }
  };

  const getLivelloUrgenza = (urgenza) => {
    switch (urgenza) {
      case "Rosso":
        return "Alta";
      case "Giallo":
        return "Media";
      case "Verde":
      default:
        return "Lieve";
    }
  };

  const formattaData = (dataString) => {
    if (!dataString) return "Data non disponibile";
    const data = new Date(dataString);
    return data.toLocaleString('it-IT');
  };

  return (
    <div className="dashboard">
      <div className="call-list-container">
        <h1 className="title">📋 Gestore Chiamate</h1>
        <ul className="call-list">
          {chiamate.length > 0 ? (
            chiamate.map((chiamata, index) => (
              <li key={index} className="call-item" onClick={() => zoomOnEmergenza(chiamata.lat, chiamata.lng)}>
                <div className="call-header">
                  <span className="call-code">🔢 {chiamata.codice || "N/D"}</span>
                  <span className="call-date">📅 {formattaData(chiamata.data_ora)}</span>
                </div>
                <span className="call-type">{chiamata.unita}</span> - {chiamata.descrizione}
                <br />
                📍 {chiamata.via}
                <br />
                <strong style={{ color: getColoreUrgenza(chiamata.urgenza) }}>
                  🧠 Urgenza: {getLivelloUrgenza(chiamata.urgenza)}
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
          {chiamate.map((chiamata, index) => (
            <Marker key={index} position={[chiamata.lat, chiamata.lng]} icon={redIcon}>
              <Popup>
                <strong>{chiamata.unita}</strong><br />
                🔢 Codice: {chiamata.codice || "N/D"}<br />
                📅 {formattaData(chiamata.data_ora)}<br />
                {chiamata.descrizione}<br />
                📍 {chiamata.via}<br />
                🧠 Urgenza: <strong style={{ color: getColoreUrgenza(chiamata.urgenza) }}>
                  {getLivelloUrgenza(chiamata.urgenza)}
                </strong>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default GestoreChiamate;
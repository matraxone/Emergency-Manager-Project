# 🚨 Emergency Management System - Frontend

## 🇬🇧 English

A modern React.js frontend application for emergency management, featuring AI-powered emergency classification, interactive mapping, and real-time emergency call tracking. Built with React Router for navigation and Leaflet.js for geospatial visualization.

### 🚀 Features

- **Emergency Submission Form**
  - Natural language emergency description input
  - Address geolocation using OpenStreetMap Nominatim API
  - Real-time form validation and user feedback

- **AI-Powered Classification**
  - Automatic urgency level detection (Red, Yellow, Green)
  - Smart unit assignment (Ambulance, Police, Fire Department)
  - Technical description reformulation for emergency operators

- **Interactive Emergency Dashboard**
  - Real-time emergency call list with priority sorting
  - Color-coded urgency indicators
  - Unique alphanumeric call codes (e.g., R45, Y33, G12)
  - Timestamp and location information

- **Interactive Map Visualization**
  - Emergency locations plotted on interactive map (Leaflet.js)
  - Popup information windows with call details
  - Zoom and pan functionality for detailed area analysis
  - Color-coded markers based on urgency level

- **Responsive Design**
  - Mobile-first responsive layout
  - Modern UI with intuitive navigation
  - Accessibility-compliant components

### 🛠️ Tech Stack

- **Framework:** React.js 18.x with functional components and hooks
- **Routing:** React Router DOM 6.x for SPA navigation
- **Mapping:** Leaflet.js with React-Leaflet integration
- **HTTP Client:** Axios for API communication
- **Styling:** CSS3 with CSS modules or styled-components
- **State Management:** React Context API and useState/useEffect hooks
- **Build Tool:** Create React App (Webpack, Babel, ESLint)

### 📦 Installation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1. **Navigate to the frontend directory**
   ```bash
   cd emergency_manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the emergency_manager directory:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3001/api
   REACT_APP_NOMINATIM_URL=https://nominatim.openstreetmap.org
   REACT_APP_DEFAULT_MAP_CENTER_LAT=45.4642
   REACT_APP_DEFAULT_MAP_CENTER_LNG=9.1900
   REACT_APP_DEFAULT_MAP_ZOOM=10
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000) in development mode.

### 🗂️ Project Structure

```
emergency_manager/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── EmergencyForm/
│   │   │   ├── EmergencyForm.js
│   │   │   └── EmergencyForm.css
│   │   ├── EmergencyList/
│   │   │   ├── EmergencyList.js
│   │   │   ├── EmergencyItem.js
│   │   │   └── EmergencyList.css
│   │   ├── InteractiveMap/
│   │   │   ├── InteractiveMap.js
│   │   │   └── InteractiveMap.css
│   │   ├── Navigation/
│   │   │   ├── Navigation.js
│   │   │   └── Navigation.css
│   │   └── Layout/
│   │       ├── Header.js
│   │       ├── Footer.js
│   │       └── Layout.css
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── EmergencyDashboard.js
│   │   ├── MapView.js
│   │   └── SubmitEmergency.js
│   ├── services/
│   │   ├── api.js              # API service functions
│   │   ├── geolocation.js      # Nominatim integration
│   │   └── constants.js        # App constants
│   ├── utils/
│   │   ├── formatters.js       # Date/time formatters
│   │   ├── validators.js       # Form validation
│   │   └── helpers.js          # Utility functions
│   ├── hooks/
│   │   ├── useEmergencies.js   # Custom hook for emergency data
│   │   └── useGeolocation.js   # Custom hook for geolocation
│   ├── context/
│   │   └── EmergencyContext.js # Global state management
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── package-lock.json
└── README.md
```

### 🔌 API Integration

The frontend communicates with the backend server through RESTful API endpoints:

#### Emergency Management
```javascript
// Submit new emergency
const submitEmergency = async (emergencyData) => {
  const response = await axios.post(`${API_BASE_URL}/calls`, emergencyData);
  return response.data;
};

// Get all emergencies
const getEmergencies = async (filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}/calls`, { params: filters });
  return response.data;
};

// Get emergency by ID
const getEmergencyById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/calls/${id}`);
  return response.data;
};
```

#### Geolocation Service
```javascript
// Geocode address using Nominatim
const geocodeAddress = async (address) => {
  const response = await axios.get(`${NOMINATIM_URL}/search`, {
    params: {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 1
    }
  });
  return response.data[0];
};
```

### 🎨 Component Architecture

#### EmergencyForm Component
- Handles emergency submission with natural language input
- Integrates address geocoding
- Provides real-time validation feedback
- Manages form state and submission

#### EmergencyList Component
- Displays paginated list of emergency calls
- Implements urgency-based sorting and filtering
- Shows color-coded urgency indicators
- Provides call detail navigation

#### InteractiveMap Component
- Renders emergency locations on Leaflet map
- Color-coded markers by urgency level
- Popup windows with call information
- Responsive map controls and zoom functionality

#### Navigation Component
- SPA routing with React Router
- Active route highlighting
- Responsive mobile navigation menu

### 📱 Responsive Design

The application is designed with a mobile-first approach:

- **Mobile (320px - 768px):** Stacked layout, touch-friendly controls
- **Tablet (768px - 1024px):** Two-column layout, optimized spacing
- **Desktop (1024px+):** Multi-column layout, enhanced map interaction

### 🎯 Key Features Implementation

#### Emergency Urgency Color Coding
```css
.urgency-red { 
  background-color: #dc3545; 
  color: white; 
}
.urgency-yellow { 
  background-color: #ffc107; 
  color: black; 
}
.urgency-green { 
  background-color: #28a745; 
  color: white; 
}
```

#### Real-time Emergency Updates
```javascript
const useEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmergencies = async () => {
      setLoading(true);
      try {
        const data = await api.getEmergencies();
        setEmergencies(data.sort((a, b) => 
          urgencyPriority[a.urgency] - urgencyPriority[b.urgency]
        ));
      } catch (error) {
        console.error('Failed to fetch emergencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { emergencies, loading };
};
```

### 🔧 Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
The page will reload when you make changes and show lint errors in the console.

#### `npm test`
Launches the test runner in interactive watch mode.
See [running tests documentation](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`
Builds the app for production to the `build` folder.
Correctly bundles React in production mode and optimizes the build for best performance.
The build is minified and filenames include hashes for cache busting.

#### `npm run eject`
**Note: This is a one-way operation. Once you eject, you can't go back!**
Copies all configuration files and transitive dependencies (webpack, Babel, ESLint, etc.) into your project for full control.

### 🌍 Internationalization Support

The application includes bilingual support for Italian and English:

```javascript
const translations = {
  en: {
    'emergency.submit': 'Submit Emergency',
    'emergency.description': 'Emergency Description',
    'emergency.address': 'Address',
    'urgency.high': 'High Priority',
    'urgency.medium': 'Medium Priority',
    'urgency.low': 'Low Priority'
  },
  it: {
    'emergency.submit': 'Invia Emergenza',
    'emergency.description': 'Descrizione Emergenza',
    'emergency.address': 'Indirizzo',
    'urgency.high': 'Priorità Alta',
    'urgency.medium': 'Priorità Media',
    'urgency.low': 'Priorità Bassa'
  }
};
```

### 🚀 Performance Optimizations

- **Code Splitting:** React.lazy() for route-based code splitting
- **Memoization:** React.memo() for expensive components
- **Virtual Scrolling:** For large emergency lists
- **Image Optimization:** WebP format with fallbacks
- **Bundle Analysis:** webpack-bundle-analyzer for size optimization

### 🧪 Testing Strategy

#### Unit Testing
```javascript
// EmergencyForm.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import EmergencyForm from './EmergencyForm';

test('submits emergency form with valid data', async () => {
  render(<EmergencyForm />);
  
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: 'Medical emergency' }
  });
  fireEvent.change(screen.getByLabelText(/address/i), {
    target: { value: 'Via Roma 123, Milano' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(await screen.findByText(/emergency submitted/i)).toBeInTheDocument();
});
```

#### Integration Testing
- API endpoint integration tests
- Map component interaction tests
- Form validation workflow tests

### 🔒 Security Considerations

- **Input Sanitization:** All user inputs are sanitized before submission
- **XSS Prevention:** React's built-in XSS protection
- **HTTPS Enforcement:** Production builds enforce HTTPS connections
- **API Token Security:** Environment variables for sensitive data
- **Content Security Policy:** CSP headers for additional security

### 🐛 Troubleshooting

#### Common Issues

1. **Map Not Loading**
   ```javascript
   // Ensure Leaflet CSS is imported in index.html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
   ```

2. **API Connection Failed**
   ```bash
   # Check backend server is running
   curl http://localhost:3001/api/calls
   
   # Verify CORS configuration in backend
   ```

3. **Geolocation Not Working**
   ```javascript
   // Check browser permissions and HTTPS requirement
   if (!navigator.geolocation) {
     console.error('Geolocation is not supported by this browser.');
   }
   ```

### 📈 Future Enhancements

- **Real-time Notifications:** WebSocket integration for live updates
- **Progressive Web App:** Service worker for offline functionality
- **Advanced Filtering:** Multi-criteria emergency filtering
- **Analytics Dashboard:** Emergency response time analytics
- **Voice Input:** Speech-to-text for emergency descriptions
- **Multi-language Support:** Extended internationalization

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [React Router documentation](https://reactrouter.com/)
- [Leaflet.js documentation](https://leafletjs.com/)

---

## 🇮🇹 Italiano

Un'applicazione frontend React.js moderna per la gestione delle emergenze, con classificazione emergenze basata su AI, mappatura interattiva e tracciamento in tempo reale delle chiamate d'emergenza.

### 🚀 Funzionalità

- **Modulo Invio Emergenze**
  - Input descrizione emergenza in linguaggio naturale
  - Geolocalizzazione indirizzo usando API Nominatim di OpenStreetMap
  - Validazione form in tempo reale e feedback utente

- **Classificazione basata su AI**
  - Rilevamento automatico livello urgenza (Rosso, Giallo, Verde)
  - Assegnazione intelligente unità (Ambulanza, Polizia, Vigili del Fuoco)
  - Riformulazione tecnica descrizione per operatori d'emergenza

- **Dashboard Emergenze Interattiva**
  - Lista chiamate d'emergenza in tempo reale con ordinamento per priorità
  - Indicatori urgenza codificati per colore
  - Codici chiamata alfanumerici univoci (es. R45, Y33, G12)
  - Informazioni timestamp e posizione

- **Visualizzazione Mappa Interattiva**
  - Posizioni emergenze visualizzate su mappa interattiva (Leaflet.js)
  - Finestre popup informative con dettagli chiamata
  - Funzionalità zoom e panoramica per analisi dettagliata area
  - Marcatori codificati per colore basati sul livello di urgenza

- **Design Responsivo**
  - Layout responsivo mobile-first
  - UI moderna con navigazione intuitiva
  - Componenti conformi all'accessibilità

### 🛠️ Stack Tecnologico

- **Framework:** React.js 18.x con componenti funzionali e hooks
- **Routing:** React Router DOM 6.x per navigazione SPA
- **Mappatura:** Leaflet.js con integrazione React-Leaflet
- **Client HTTP:** Axios per comunicazione API
- **Styling:** CSS3 con CSS modules o styled-components
- **Gestione Stato:** React Context API e hooks useState/useEffect
- **Strumento Build:** Create React App (Webpack, Babel, ESLint)

Per informazioni dettagliate su installazione, struttura progetto e funzionalità avanzate, consulta la sezione inglese sopra.

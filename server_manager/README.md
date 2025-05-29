# 🚨 Emergency Management System - Server

## 🇬🇧 English

A powerful Node.js backend for emergency management with AI integration, built with Express.js, Sequelize ORM, and MySQL database.

### 🚀 Features

- **RESTful API** for emergency call management
- **AI Integration** with Regolo API for automatic classification
- **Database ORM** with Sequelize and MySQL
- **Automatic Code Generation** for unique call identifiers
- **Geographic Data Support** with latitude/longitude coordinates
- **Status Management** with workflow tracking
- **Soft Delete** functionality for data integrity
- **Advanced Filtering** and search capabilities
- **Statistics & Dashboard** endpoints

### 🛠️ Tech Stack

- **Runtime:** Node.js (>=16.0.0)
- **Framework:** Express.js 5.1.0
- **Database:** MySQL with Sequelize ORM 6.37.6
- **AI Service:** Regolo API (DeepSeek-R1-Distill-Qwen-32B)
- **HTTP Client:** Axios 1.9.0
- **Environment:** dotenv for configuration

### 📦 Installation

1. **Clone the repository and navigate to server directory**
   ```bash
   cd server_manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REGOLO_API_KEY=your_regolo_api_key_here
   AI_API_URL=https://api.regolo.ai/v1/chat/completions
   AI_MODEL=DeepSeek-R1-Distill-Qwen-32B
   NODE_ENV=development
   PORT=3001
   ```

4. **Setup MySQL Database**
   - Create a MySQL database named `emergencies`
   - Update database credentials in `config/database.js` if needed:
     ```javascript
     const sequelize = new Sequelize('emergencies', 'root', '', {
       host: 'localhost',
       dialect: 'mysql',
       port: 3306,
       // ...
     });
     ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

### 🗄️ Database Schema

The system uses a single `calls` table with the following structure:

```sql
CREATE TABLE calls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(3) UNIQUE NOT NULL,           -- Unique identifier (e.g., R45, Y33)
  unit ENUM('Ambulance', 'Police', 'Fire Department'),
  description TEXT NOT NULL,                 -- Emergency description
  address VARCHAR(255) NOT NULL,             -- Location address
  lat DECIMAL(10,8) NOT NULL,               -- Latitude
  lng DECIMAL(11,8) NOT NULL,               -- Longitude  
  urgency ENUM('Red', 'Yellow', 'Green'),   -- Priority level
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
  dateTime DATETIME DEFAULT NOW(),           -- Call timestamp
  assignedTo VARCHAR(255),                   -- Operator ID/name
  notes TEXT,                                -- Additional notes
  resolvedAt DATETIME,                       -- Resolution timestamp
  created_at DATETIME,
  updated_at DATETIME,
  deleted_at DATETIME                        -- Soft delete
);
```

### 🔌 API Endpoints

#### Emergency Calls Management

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/calls` | Get all calls with optional filters | `?status=pending&urgency=Red&unit=Ambulance&limit=50&offset=0` |
| `GET` | `/api/calls/:id` | Get specific call by ID | - |
| `GET` | `/api/calls/code/:code` | Get call by unique code | - |
| `GET` | `/api/calls/urgency/:level` | Get calls by urgency level | `level: Red|Yellow|Green` |
| `GET` | `/api/calls/location/:lat/:lng` | Get calls by geographic area | `?radius=5` (km) |
| `POST` | `/api/calls` | Create new emergency call | Body: `{description, address, lat, lng}` |
| `PUT` | `/api/calls/:id` | Update entire call record | Body: `{field: value, ...}` |
| `PATCH` | `/api/calls/:id/status` | Update only call status | Body: `{status: "assigned"}` |
| `DELETE` | `/api/calls/:id` | Soft delete call | - |

#### Analytics & Monitoring

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/stats` | Get system statistics | `?period=7` (days) |
| `GET` | `/api/dashboard` | Get dashboard summary | - |

### 📊 API Examples

#### Create New Emergency Call
```bash
curl -X POST http://localhost:3001/api/calls \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Incendio in appartamento al secondo piano",
    "address": "Via Roma 123, Milano",
    "lat": 45.4642,
    "lng": 9.1900
  }'
```

#### Get Urgent Calls
```bash
curl http://localhost:3001/api/calls/urgency/Red
```

#### Update Call Status
```bash
curl -X PATCH http://localhost:3001/api/calls/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### 🤖 AI Integration

The system integrates with Regolo AI for:

1. **Automatic Classification**
   - Urgency levels: Red (high), Yellow (medium), Green (low)
   - Unit selection: Ambulance, Police, Fire Department

2. **Description Reformulation**
   - Converts natural language to technical emergency format
   - Optimized for emergency operators

### 🔧 Configuration Options

#### Database Configuration (`config/database.js`)
```javascript
const sequelize = new Sequelize('emergencies', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  timezone: '+02:00', // Italy timezone
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

#### Available NPM Scripts
```json
{
  "start": "node server.js",           // Production start
  "dev": "nodemon server.js",          // Development with auto-reload
  "db:migrate": "sequelize-cli db:migrate",
  "db:seed": "sequelize-cli db:seed:all",
  "db:reset": "sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate && sequelize-cli db:seed:all"
}
```

### 🔍 Advanced Features

#### Sequelize Model Methods
```javascript
// Static methods
const urgentCalls = await Call.getByUrgency('Red');
const nearbyCalls = await Call.getActiveByLocation(45.4642, 9.1900, 5);
const stats = await Call.getStatsByPeriod(startDate, endDate);
const call = await Call.findByCode('R45');

// Instance methods
await call.updateStatus('completed');
await call.assignTo('operator123');
await call.addNote('Patient transported to hospital');
const resolutionTime = call.getResolutionTime();
```

#### Database Indexes
- Unique index on `code` field
- Composite index on `urgency` + `status`
- Index on `dateTime` for temporal queries
- Spatial index on `lat` + `lng` coordinates
- Status index for filtering active calls

### 🚨 Error Handling

The server implements comprehensive error handling:
- **Validation Errors**: Sequelize validation with detailed field information
- **Database Errors**: Connection and query error management
- **AI Service Errors**: Graceful fallback when AI is unavailable
- **404 Handling**: Clear messages for missing resources
- **500 Errors**: Internal server error logging and user-friendly responses

### 📈 Performance Considerations

- **Connection Pooling**: Configured for optimal database performance
- **Query Optimization**: Indexed fields for fast searches
- **Pagination**: Built-in limit/offset for large datasets
- **Soft Deletes**: Data integrity without performance impact
- **Async/Await**: Non-blocking operations throughout

### 🔒 Security Features

- **Input Validation**: Sequelize model validations
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Sensitive data protection
- **SQL Injection Protection**: ORM-based query building
- **Graceful Shutdown**: Proper cleanup on server termination

### 🐛 Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MySQL service
   sudo systemctl status mysql
   
   # Verify database exists
   mysql -u root -p -e "SHOW DATABASES;"
   ```

2. **AI API Errors**
   ```bash
   # Check environment variables
   echo $REGOLO_API_KEY
   
   # Test API connectivity
   curl -H "Authorization: Bearer $REGOLO_API_KEY" https://api.regolo.ai/v1/models
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

### 📝 Development Notes

- The server automatically recreates the database schema on startup (`force: true`)
- Sample data seeding is disabled by default
- All units are stored in English in the database for consistency
- Timestamps use Italy timezone (`+02:00`)
- Soft delete is enabled for data recovery capabilities

---

## 🇮🇹 Italiano

Un potente backend Node.js per la gestione delle emergenze con integrazione AI, costruito con Express.js, Sequelize ORM e database MySQL.

### 🚀 Funzionalità

- **API RESTful** per la gestione delle chiamate d'emergenza
- **Integrazione AI** con API Regolo per classificazione automatica
- **ORM Database** con Sequelize e MySQL
- **Generazione Automatica Codici** per identificatori univoci delle chiamate
- **Supporto Dati Geografici** con coordinate latitudine/longitudine
- **Gestione Stati** con tracciamento del workflow
- **Eliminazione Soft** per l'integrità dei dati
- **Filtri Avanzati** e capacità di ricerca
- **Statistiche & Dashboard** endpoints

### 🛠️ Stack Tecnologico

- **Runtime:** Node.js (>=16.0.0)
- **Framework:** Express.js 5.1.0
- **Database:** MySQL con Sequelize ORM 6.37.6
- **Servizio AI:** API Regolo (DeepSeek-R1-Distill-Qwen-32B)
- **Client HTTP:** Axios 1.9.0
- **Ambiente:** dotenv per la configurazione

### 📦 Installazione

1. **Clona il repository e naviga nella directory server**
   ```bash
   cd server_manager
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   Crea un file `.env` nella directory root:
   ```env
   REGOLO_API_KEY=your_regolo_api_key_here
   AI_API_URL=https://api.regolo.ai/v1/chat/completions
   AI_MODEL=DeepSeek-R1-Distill-Qwen-32B
   NODE_ENV=development
   PORT=3001
   ```

4. **Configura il Database MySQL**
   - Crea un database MySQL chiamato `emergencies`
   - Aggiorna le credenziali del database in `config/database.js` se necessario

5. **Avvia il server**
   ```bash
   # Modalità sviluppo con riavvio automatico
   npm run dev
   
   # Modalità produzione
   npm start
   ```

Per informazioni dettagliate su endpoint API, schema database e funzionalità avanzate, consulta la sezione inglese sopra.

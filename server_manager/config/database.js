// config/database.js
// Sequelize database configuration and connection setup
const { Sequelize } = require('sequelize');

// Initialize Sequelize instance with MySQL connection parameters
const sequelize = new Sequelize('emergencies', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: console.log, // Show SQL queries (can be disabled with false)
  
  // Dialect-specific options for handling datetime issues
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
    timezone: '+02:00', // Italy timezone
  },
  
  // Connection pool configuration
  pool: {
    max: 10,        // Maximum number of connections
    min: 0,         // Minimum number of connections
    acquire: 30000, // Maximum time to get connection (ms)
    idle: 10000     // Maximum idle time before releasing connection (ms)
  },
  
  // Global model definitions
  define: {
    timestamps: true,      // Enable createdAt and updatedAt
    underscored: false,    // Use camelCase instead of snake_case
    freezeTableName: true, // Don't pluralize table names
  }
});

// Function to test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connessione Sequelize stabilita con successo!');
    return true;
  } catch (error) {
    console.error('❌ Impossibile connettersi al database:', error);
    throw error;
  }
};

// Export sequelize instance and utility functions
module.exports = {
  sequelize,
  testConnection
};
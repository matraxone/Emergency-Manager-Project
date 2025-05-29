// models/Call.js
// Sequelize model definition for emergency calls
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define Call model with all required fields and validations
const Call = sequelize.define('Call', {
  // Primary key - auto-incrementing ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Unique call code (format: Letter + 2 digits, e.g., R45, Y33)
  code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 3],
      is: /^[A-Z][0-9]{2}$/ // One uppercase letter followed by two numbers
    },
    comment: 'Codice univoco formato da una lettera + due numeri (es. R45, Y33)'
  },
  // Emergency response unit type (stored in English in database)
  unit: {
    type: DataTypes.ENUM('Ambulance', 'Police', 'Fire Department'),
    allowNull: false,
    comment: 'Unità di intervento (salvata in inglese nel DB)'
  },
  // Emergency description
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  // Emergency location address
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  // Geographic coordinates - latitude
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  // Geographic coordinates - longitude
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  // Emergency urgency level
  urgency: {
    type: DataTypes.ENUM('Red', 'Yellow', 'Green'),
    allowNull: false,
    defaultValue: 'Green'
  },
  // Call processing status
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  // Call creation timestamp
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // Assigned operator ID or name
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID o nome dell\'operatore assegnato'
  },
  // Additional notes about the emergency
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Note aggiuntive sull\'intervento'
  },
  // Timestamp when call was resolved
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp di risoluzione della chiamata'
  }
}, {
  // Table configuration options
  tableName: 'calls',
  timestamps: true,
  paranoid: true, // Enable soft delete
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  
  // Database indexes for performance optimization
  indexes: [
    {
      name: 'idx_code',
      unique: true,
      fields: ['code']
    },
    {
      name: 'idx_urgency_status',
      fields: ['urgency', 'status']
    },
    {
      name: 'idx_datetime',
      fields: ['dateTime']
    },
    {
      name: 'idx_location',
      fields: ['lat', 'lng']
    },
    {
      name: 'idx_status',
      fields: ['status']
    }
  ]
});

// ===== STATIC METHODS =====

// Find calls by urgency level
Call.getByUrgency = async function(urgencyLevel) {
  return await this.findAll({
    where: {
      urgency: urgencyLevel,
      status: ['pending', 'assigned', 'in_progress']
    },
    order: [['dateTime', 'DESC']]
  });
};

// Find active calls within geographic radius
Call.getActiveByLocation = async function(lat, lng, radiusKm = 5) {
  const { Op } = require('sequelize');
  
  // Approximate degree calculation for radius in km
  const degreeRadius = radiusKm / 111.32; // 1 degree ≈ 111.32 km
  
  return await this.findAll({
    where: {
      status: ['pending', 'assigned', 'in_progress'],
      lat: {
        [Op.between]: [lat - degreeRadius, lat + degreeRadius]
      },
      lng: {
        [Op.between]: [lng - degreeRadius, lng + degreeRadius]
      }
    },
    order: [['urgency', 'ASC'], ['dateTime', 'DESC']]
  });
};

// Get statistics for a specific time period
Call.getStatsByPeriod = async function(startDate, endDate) {
  const { Op } = require('sequelize');
  
  const stats = await this.findAll({
    where: {
      dateTime: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'urgency',
      'unit',
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['urgency', 'unit', 'status'],
    raw: true
  });
  
  return stats;
};

// Find call by unique code (case-insensitive)
Call.findByCode = async function(code) {
  return await this.findOne({
    where: {
      code: code.toUpperCase()
    }
  });
};

// ===== INSTANCE METHODS =====

// Update call status with automatic timestamp handling
Call.prototype.updateStatus = async function(newStatus) {
  const updateData = { status: newStatus };
  
  // Add resolution timestamp if call is completed
  if (newStatus === 'completed') {
    updateData.resolvedAt = new Date();
  }
  
  return await this.update(updateData);
};

// Assign call to an operator
Call.prototype.assignTo = async function(operatorId) {
  return await this.update({
    status: 'assigned',
    assignedTo: operatorId
  });
};

// Add timestamped note to call
Call.prototype.addNote = async function(note) {
  const existingNotes = this.notes || '';
  const timestamp = new Date().toLocaleString('it-IT');
  const newNote = `[${timestamp}] ${note}`;
  
  return await this.update({
    notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote
  });
};

// Calculate call resolution time
Call.prototype.getResolutionTime = function() {
  if (!this.resolvedAt) return null;
  
  const start = new Date(this.dateTime);
  const end = new Date(this.resolvedAt);
  const diffMs = end - start;
  
  return {
    milliseconds: diffMs,
    minutes: Math.floor(diffMs / 60000),
    hours: Math.floor(diffMs / 3600000)
  };
};

// ===== MODEL HOOKS =====

// Before validation: ensure code is uppercase
Call.beforeValidate((call) => {
  if (call.code) {
    call.code = call.code.toUpperCase();
  }
});

// Before save: validate geographic coordinates
Call.beforeSave((call) => {
  if (call.lat < -90 || call.lat > 90) {
    throw new Error('Latitudine non valida: deve essere tra -90 e 90');
  }
  if (call.lng < -180 || call.lng > 180) {
    throw new Error('Longitudine non valida: deve essere tra -180 e 180');
  }
});

module.exports = Call;
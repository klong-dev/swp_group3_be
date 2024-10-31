const { DataTypes } = require("sequelize");
const db = require('../../config/db/index')
const sequelize = db.sequelize;

const Complaint = sequelize.define('complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    allowNull: false
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  freezeTableName: true
});

module.exports = Complaint;
const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const Booking = sequelize.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mentorId: {
    type: DataTypes.INTEGER,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: false,
  freezeTableName: true

});

module.exports = Booking;

const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const Booking = sequelize.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mentor_id: {
    type: DataTypes.INTEGER,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
  },

},{
  timestamps: false,
  freezeTableName: true
});

module.exports = Booking;

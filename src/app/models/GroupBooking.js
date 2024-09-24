const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const GroupBooking = sequelize.define('groupBooking', {
  groupBookingID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  groupID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mentorSlotID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bookingTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true,
});

module.exports = GroupBooking;

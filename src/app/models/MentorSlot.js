const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const MentorSlot = sequelize.define('mentorSlot', {
  mentorSlotID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  mentorID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  unitSlot: {
    type: DataTypes.TIME,
    allowNull: false
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true,
  freezeTableName:true
});

module.exports = MentorSlot;
const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const MentorSchedule = sequelize.define('mentor_schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schedule_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  schedule_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
});

module.exports = MentorSchedule;

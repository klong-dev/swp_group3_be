const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const MentorSkill = sequelize.define('mentorskill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  freezeTableName: true

});

module.exports = MentorSkill;

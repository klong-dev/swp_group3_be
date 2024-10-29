const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const MentorSkill = sequelize.define('mentor_skill', {
  skillId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = MentorSkill;

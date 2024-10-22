const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const MentorSkill = sequelize.define('mentor_skill', {
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true  
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true  
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

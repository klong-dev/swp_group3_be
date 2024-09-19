const { DataTypes } = require("sequelize");
const sequelize = db.sequelize;

const Skill = sequelize.define('skill', {
  skillID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  skillName: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = Skill;

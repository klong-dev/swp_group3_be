const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
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
  timestamps: false, // add createdAt and updatedAt column automatically
});

module.exports = Skill;

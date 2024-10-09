const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const Skill = sequelize.define('skill', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imgPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = Skill;

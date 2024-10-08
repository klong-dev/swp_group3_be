const { DataTypes } = require("sequelize");
const db = require('../../config/db/index')
const sequelize = db.sequelize;

const Admin = sequelize.define('admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = Admin;

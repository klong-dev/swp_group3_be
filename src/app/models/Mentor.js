const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const Mentor = sequelize.define('mentor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  freezeTableName: true

});

module.exports = Mentor;

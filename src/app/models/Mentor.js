const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const Mentor = sequelize.define('mentor', {
  mentorID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  applyStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: true
  },

}, {
  timestamps: false,
});

module.exports = Mentor;

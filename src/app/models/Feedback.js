const { DataTypes } = require("sequelize");
const db = require("../../config/db/index");
const sequelize = db.sequelize;

const Feedback = sequelize.define('feedback', {
  mentorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  freezeTableName: true

});

module.exports = Feedback;

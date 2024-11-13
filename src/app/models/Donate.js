const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const Donate = sequelize.define('donate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mentorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  freezeTableName: true
});

module.exports = Donate;

// Import models after defining Donate
const Item = require('./Item');
const Mentor = require('./Mentor');
const Student = require('./Student');

// Set up associations
Donate.belongsTo(Item, {
  foreignKey: 'itemId',
  as: 'item'
});

Donate.belongsTo(Mentor, {
  foreignKey: 'mentorId',
  as: 'mentor'
});

Donate.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});
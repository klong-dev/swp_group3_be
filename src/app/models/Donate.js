const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;
const Item = require('./Item');
const Mentor = require('./Mentor');
const Student = require('./Student');

const Donate = sequelize.define('donate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
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

Donate.hasOne(Item, { foreignKey: 'id', sourceKey: 'itemId', as: 'item' });
Donate.hasOne(Mentor, { foreignKey: 'accountId', sourceKey: 'mentorId', as: 'mentor' });
Donate.hasOne(Student, { foreignKey: 'accountId', sourceKey: 'studentId', as: 'student' });

module.exports = Donate;

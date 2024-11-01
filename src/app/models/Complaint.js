const { DataTypes } = require("sequelize");
const db = require('../../config/db/index')
const sequelize = db.sequelize;
const Mentor = require('./Mentor');
const Student = require('./Student');

const Complaint = sequelize.define('complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mentorId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    allowNull: false
  },
}, {
  timestamps: true,
  freezeTableName: true
});


Complaint.hasOne(Student, {
  sourceKey: 'studentId',
  foreignKey: 'accountId',
  as: 'student'
})

Complaint.hasOne(Mentor, {
  sourceKey: 'mentorId',
  foreignKey: 'accountId',
  as: 'mentor'
})

module.exports = Complaint;
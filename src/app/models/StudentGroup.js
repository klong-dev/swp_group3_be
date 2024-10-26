const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;
const Booking = require('./Booking');
const StudentGroup = sequelize.define('student_booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: false,
  freezeTableName: true
});

StudentGroup.belongsTo(Booking, {
  foreignKey: 'bookingId', 
  targetKey: 'id',
});

module.exports = StudentGroup;

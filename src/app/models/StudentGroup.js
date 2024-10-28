const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;
const Booking = require('./Booking');
const Student = require('./Student');

const StudentGroup = sequelize.define('student_booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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

StudentGroup.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});


StudentGroup.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking'
});

module.exports = StudentGroup;

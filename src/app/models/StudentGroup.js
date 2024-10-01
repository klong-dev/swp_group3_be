const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const StudentGroup = sequelize.define('student_group', {
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
  freezeTableName: true
});

module.exports = StudentGroup;

const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const StudentGroup = sequelize.define('student_group', {
  group_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  student_id: {
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
});

module.exports = StudentGroup;

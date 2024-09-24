const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const Course = sequelize.define('swpCourse', {
  courseID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semesterID: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = Course;

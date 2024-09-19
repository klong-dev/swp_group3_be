const { DataTypes } = require("sequelize");
const sequelize = db.sequelize;

const Semester = sequelize.define('semester', {
  semesterID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = Semester;

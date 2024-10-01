const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;

const StudentGroup = sequelize.define('studentgroup', {
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
},{
  timestamps: false,
  freezeTableName: true
});

module.exports = StudentGroup;

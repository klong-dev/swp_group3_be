const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;
const Student = sequelize.define('student', {
  studentID: {
    type: DataTypes.STRING,
    primaryKey: true,
    // autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  groupID: {
    type: DataTypes.STRING,
    allowNull: true
  },
},
  {
    timestamps: true, 
  }
);


module.exports = Student;

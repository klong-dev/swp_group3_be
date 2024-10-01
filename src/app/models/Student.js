const { DataTypes } = require("sequelize");
const db = require("../../config/db/index");
const sequelize = db.sequelize;
const Student = sequelize.define(
  "student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    img_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Student;

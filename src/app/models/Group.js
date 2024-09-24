const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const Group = sequelize.define('group', {
  groupID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leaderID: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = Group;

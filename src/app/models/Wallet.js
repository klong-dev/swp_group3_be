const { DataTypes } = require("sequelize");
const db = require("../../config/db/localDB");
const sequelize = db.sequelize;

const Wallet = sequelize.define('wallet', {
  walletID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  groupID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = Wallet;

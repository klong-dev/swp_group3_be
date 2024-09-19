const { DataTypes } = require("sequelize");
const sequelize = db.sequelize;

const Transaction = sequelize.define('transaction', {
  transactionID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  walletID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true,
});

module.exports = Transaction;

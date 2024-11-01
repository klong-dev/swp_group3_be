const { DataTypes } = require("sequelize");
const db = require("../../config/db/index");
const sequelize = db.sequelize;
const Booking = require("./Booking");

const TransactionHistory = sequelize.define('transaction_history', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accountId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    point: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    freezeTableName: true
});

TransactionHistory.hasOne(Booking, {
    foreignKey: 'id',
    sourceKey: 'bookingId',
    as: 'booking'
})

module.exports = TransactionHistory;

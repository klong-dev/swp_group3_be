const { DataTypes } = require("sequelize");
const db = require("../../config/db/index");
const sequelize = db.sequelize;
const Booking = require("./Booking");
const Mentor = require("./Mentor");

const CheckOutHistory = sequelize.define('checkout_history', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accountId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    freezeTableName: true
});

CheckOutHistory.hasOne(Mentor, {
    foreignKey: 'accountId',
    sourceKey: 'accountId',
    as: 'mentor'
})

module.exports = CheckOutHistory;

const { DataTypes } = require("sequelize");
const db = require("../../config/db/index");
const sequelize = db.sequelize;

const Mentor = sequelize.define("mentor", {
  accountId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  imgPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = Mentor;

const Donate = require("./Donate");
const Booking = require("./Booking");

Mentor.hasMany(Booking, {
  foreignKey: 'mentorId',
  as: 'bookings'
});
Mentor.hasMany(Donate, {
  foreignKey: 'mentorId',
  as: 'donates'
});

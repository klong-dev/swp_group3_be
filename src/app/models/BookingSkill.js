const { DataTypes } = require("sequelize");
const sequelize = db.sequelize;

const BookingSkill = sequelize.define('bookingSkill', {
  bookingSkillID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  groupBookingID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillID: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
});

module.exports = BookingSkill;

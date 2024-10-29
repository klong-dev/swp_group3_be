const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const sequelize = db.sequelize;
const moment = require('moment');

const Booking = sequelize.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: 'mentor',
      key: 'accountId'
    }
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return moment(this.getDataValue('startTime')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return moment(this.getDataValue('endTime')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  freezeTableName: true
});

Booking.associate = function (models) {
  Booking.belongsTo(models.Mentor, {
    foreignKey: 'mentorId',
    as: 'mentor'
   });
};

module.exports = Booking;

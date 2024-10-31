const { DataTypes } = require("sequelize");
const db = require("../../config/db/index"); 
const Student = require('./Student');

const sequelize = db.sequelize;

const Feedback = sequelize.define('feedback', {
  mentorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  freezeTableName: true,
});
Feedback.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
module.exports = Feedback;

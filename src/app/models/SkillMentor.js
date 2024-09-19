const { DataTypes } = require("sequelize");
const sequelize = db.sequelize;

const SkillMentor = sequelize.define('skillMentor', {
  skillMentorID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  mentorID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true,
});

module.exports = SkillMentor;

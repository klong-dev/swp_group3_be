const { DataTypes } = require("sequelize");
const db = require('../../config/db/index');
const Mentor = require('../models/Mentor')
const Skill = require('../models/Skill')
const sequelize = db.sequelize;

const MentorSkill = sequelize.define('mentor_skill', {
  skillId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: { model: Skill, key: 'id' }
  },
  mentorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: { model: Mentor, key: 'accountId' }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: false,
  freezeTableName: true
});
Mentor.belongsToMany(Skill, { through: MentorSkill, foreignKey: 'mentorId' });
Skill.belongsToMany(Mentor, { through: MentorSkill, foreignKey: 'skillId' });

module.exports = MentorSkill;

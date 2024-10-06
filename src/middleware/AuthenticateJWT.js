const jwt = require('jsonwebtoken');
const Student = require('../app/models/Student');
const Mentor = require('../app/models/Mentor');

const authenticateJWT = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }
    const data = jwt.decode(token);
    req.accountId = data.accountId;
    const student = await Student.findOne({ where: { accountId: req.accountId } });
    const mentor = await Mentor.findOne({ where: { accountId: req.accountId } });
    if (!student && !mentor) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.rootUser = student != null ? student : mentor;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error});
  }
};

module.exports = authenticateJWT;

const jwt = require('jsonwebtoken');
const Student = require('../app/models/Student');
const Mentor = require('../app/models/Mentor');

const authenticateJWT = async (req, res, next) => {
  try {
    let student, mentor
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please log in' });
    }
    if (token.length < 200) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' })
        }
        const { id, username } = decoded
        req.id = id
        req.username = username
        req.token = token
        next()
      });
    } else {
      const data = jwt.decode(token);
      const { accountId, isMentor } = data
      req.accountId = accountId;
      req.isMentor = isMentor;
      if (isMentor === 1) {
        mentor = await Mentor.findOne({ where: { accountId: req.accountId } })
      } else {
        student = await Student.findOne({ where: { accountId: req.accountId } });
      }

      if (!student && !mentor) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (mentor && mentor.status === 0) {
        return res.status(404).json({ message: "This account is no longer mentor" })
      }
      req.rootUser = student != null ? student : mentor;
      req.token = token;
      next();

    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error });
  }
};

module.exports = authenticateJWT;

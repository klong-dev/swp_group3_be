const mentor = require('./mentor')
const student = require('./student')
const admin = require('./admin')
const mail = require('./mail')
const google = require('./account/google-auth')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google);
  app.use('/student', student);
  app.use('/mentor', mentor);
  app.use('/admin', admin);
  app.use('/mail', mail);
}

module.exports = routes;
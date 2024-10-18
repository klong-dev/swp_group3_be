const mentor = require('./mentor')
const student = require('./student')
const admin = require('./admin')
const google = require('./account/google-auth')
const feedback = require('./feedback')
const booking = require('./booking')
const group = require('./group')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google);
  app.use('/student', student);
  app.use('/mentor', mentor);
  app.use('/admin', admin);
  app.use('/feedback', feedback);
  app.use('/booking', booking);
  app.use('/group', group);
}

module.exports = routes;
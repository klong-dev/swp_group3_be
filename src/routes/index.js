const mentor = require('./mentor')
const student = require('./student')
const admin = require('./admin')
const mail = require('./mail')
const google = require('./account/google-auth')
const feedback = require('./feedback')
const booking = require('./booking')
const group = require('./group')
const schedule = require('./schedule')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google);
  app.use('/student', student);
  app.use('/mentor', mentor);
  app.use('/admin', admin);
  app.use('/feedback', feedback);
  app.use('/booking', booking);
  app.use('/group', group);
  app.use('/schedule', schedule)
  app.use('/mail', mail);
  
}

module.exports = routes;
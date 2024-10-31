const mentor = require('./mentor')
const student = require('./student')
const admin = require('./admin')
const semester = require('./semester')
const google = require('./account/google-auth')
const feedback = require('./feedback')
const booking = require('./booking')
const group = require('./group')
const schedule = require('./schedule')
const item = require("./item")
const vnpay = require("./vnpay")
const mail = require('./mail')
const transactions = require('./transaction')
const donate = require('./donate')
const notification = require('./notification')
const complaint = require('./complaint')
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
  app.use('/semester', semester);
  app.use('/item', item)
  app.use('/vnpay', vnpay)
  app.use('/transaction', transactions)
  app.use('/donate', donate)
  app.use('/notification', notification)
  app.use('/complaint', complaint)
}

module.exports = routes;
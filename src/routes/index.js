const mentor = require('./mentor')
const google = require('./account/google-auth')
const admin = require('./admin')
const feedback = require('./feedback')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google); 
  app.use('/mentor', mentor);
  app.use('/admin', admin);
  app.use('/feedback', feedback);
}

module.exports = routes;
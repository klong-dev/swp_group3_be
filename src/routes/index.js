const mentor = require('./mentor')
const google = require('./account/google-auth')
const admin = require('./admin')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google); 
  app.use('/mentor', mentor);
  app.use('/admin', admin);
}

module.exports = routes;
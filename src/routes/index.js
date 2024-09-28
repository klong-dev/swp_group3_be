const google = require('./account/google-auth')

function routes(app) {
  app.use('/auth/google', google);
  app.use('/auth/google/callback', google); 
}

module.exports = routes;
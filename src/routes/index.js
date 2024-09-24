const mentor = require('./mentor')
function routes(app) {
  app.use('/mentor', mentor);
}

module.exports = routes;
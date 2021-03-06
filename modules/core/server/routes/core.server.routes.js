'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  app.route('/deploy').post(core.deployStack);
  app.route('/list').post(core.ListDeployments);


    // Define application route
  app.route('/*').get(core.renderIndex);
};

'use strict';

var validator = require('validator'),
path = require('path'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
config = require(path.resolve('./config/config'));

const Kubernetes = require('kubernetes-client');
const KubeClient = Kubernetes.Client;
const KubeConfig = Kubernetes.config;
var fs = require('fs');

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  var safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: validator.escape(req.user.displayName),
      provider: validator.escape(req.user.provider),
      username: validator.escape(req.user.username),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: validator.escape(req.user.email),
      lastName: validator.escape(req.user.lastName),
      firstName: validator.escape(req.user.firstName),
      additionalProvidersData: req.user.additionalProvidersData
    };
    
  }

  console.log(safeUserObject);

  res.render('modules/core/server/views/index', {
    user: JSON.stringify(safeUserObject),
    sharedConfig: JSON.stringify(config.shared)
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function ErrorReport(type, response) {
  return function (error) {
    console.log("Couldn't create the " + type);
    console.log(error);
    response.json({ error: error });
  };
}

function UpdateDeployments(user, new_deployment){
  var safeUserObject = null;

  if (user) {
    safeUserObject = {
      displayName: validator.escape(user.displayName),
      provider: validator.escape(user.provider),
      username: validator.escape(user.username),
      created: user.created.toString(),
      roles: user.roles,
      profileImageURL: user.profileImageURL,
      email: validator.escape(user.email),
      lastName: validator.escape(user.lastName),
      firstName: validator.escape(user.firstName),
      additionalProvidersData: user.additionalProvidersData
    };
    User.findOneAndUpdate({'username': safeUserObject.username}, {$push: {deployments: new_deployment}}, {new: true}, function (error, success) {
      if (error) {
        console.log("Error: " + error);
      } else {
          console.log("Success: " + success);
      }
    });
  }
}

exports.deployStack = function (req, res) {
  console.log('Deploying from server side');
  console.log(req.body);

  const client = new KubeClient({ config: KubeConfig.fromKubeconfig(), version: '1.9' });

  // 1. First create the PHP deployment
  fs.readFile('modules/core/server/kubernetes-templates/lamp/php-deployment.json', 'utf8', function (err, text) {

    var uniqueid = getRandomInt(0, 5000).toString();
    text = text.replace(new RegExp('UNIQUEID', 'g'), uniqueid);
    text = text.replace(new RegExp('MYSQLPASSWORD', 'g'), req.body.lamp_mysql_pwd);
    text = JSON.parse(text);

    client.api.apps.v1.namespaces('default').deployments.post({ body: text }).then(php_deployment_result => {
      console.log(php_deployment_result);
      // 2. Create the PHP service
      fs.readFile('modules/core/server/kubernetes-templates/lamp/php-service.json', 'utf8', function (err, text) {
        text = text.replace(new RegExp('UNIQUEID', 'g'), uniqueid);
        text = JSON.parse(text);

        client.api.v1.namespaces('default').services.post({ body: text }).then(php_svc_result => {
          console.log(php_svc_result);

          // 3. Create the MySQL deployment
          fs.readFile('modules/core/server/kubernetes-templates/lamp/mysql-deployment.json', 'utf8', function (err, text) {
            text = text.replace(new RegExp('UNIQUEID', 'g'), uniqueid);
            text = text.replace(new RegExp('MYSQLPASSWORD', 'g'), req.body.lamp_mysql_pwd);
            text = JSON.parse(text);

            client.api.apps.v1.namespaces('default').deployments.post({ body: text }).then(mysql_deployment_result => {
              console.log(mysql_deployment_result);

              // 4. Create the MySQL service
              fs.readFile('modules/core/server/kubernetes-templates/lamp/mysql-service.json', 'utf8', function (err, text) {
                text = text.replace(new RegExp('UNIQUEID', 'g'), uniqueid);
                text = JSON.parse(text);

                client.api.v1.namespaces('default').services.post({ body: text }).then(mysql_svc_result => {
                  console.log(mysql_svc_result);
                  res.json({
                    php: {
                      deployment_result: php_deployment_result,
                      svc_result: php_svc_result
                    },
                    mysql: {
                      deployment_result: mysql_deployment_result,
                      svc_result: mysql_svc_result
                    }
                  });

                  UpdateDeployments(req.user, {
                    uniqueid: uniqueid,
                    php: JSON.stringify(php_svc_result),
                    mysql: JSON.stringify(mysql_svc_result),
                  });

                }, ErrorReport("mysql-service", res));
              });
            }, ErrorReport("mysql-deployment", res));
          });
        }, ErrorReport("php-service", res));
      });
    }, ErrorReport("php-deployment", res));
  });
};

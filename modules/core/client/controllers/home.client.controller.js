(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$http'];

  function HomeController($scope, $http) {
    var vm = this;

    $scope.stacks = [{
      'label': "LAMP",
    },
    {
      'label': 'MEAN',
    }];

    // Load the default form data
    $scope.formData = {
      stack_name: $scope.stacks[0],
      num_replicas: 1,
      lamp_mysql_pwd: '12345',
    };

    $scope.success = undefined;

    $scope.deploy = function () {
      console.log("Deploying LAMP");
      DeployLAMP($scope, $http);
    }
  }

  function DeployLAMP($scope, $http) {
    $http.post('/deploy', $scope.formData).success(function (data) {
      console.log("Deploy post success");
      var php_deployment_result = data.php.deployment_result;
      var php_svc_result = data.php.svc_result;
      var mysql_deployment_result = data.mysql.deployment_result;
      var mysql_svc_result = data.mysql.svc_result;

      if (php_deployment_result.statusCode == 201 && php_svc_result.statusCode == 201 &&
        mysql_deployment_result.statusCode == 201 && mysql_svc_result.statusCode == 201) {
        // Everything was created successfully
        $scope.success = true;
        $scope.php_port = php_svc_result.body.spec.ports[0].nodePort;
        $scope.mysql_port = mysql_svc_result.body.spec.ports[0].nodePort;
      } else {
        // There was some kind of error
        $scope.success = false;
      }
    }).error(function (error) {
      console.log("Deploy post error");
      console.log(error);
    });
  }
}());

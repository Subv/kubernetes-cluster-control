(function (){
    'use strict';

    angular
        .module('core')
        .controller('DeploymentListController',DeploymentListController);

        DeploymentListController.$inject = ['$scope', '$http', '$window'];
    
    function DeploymentListController($scope,$http , w){

    $scope.ListDeployments = function () {
      console.log("Deployments");
      ListDeploys($scope, $http);
    }
    $scope.ReturnTo = function() {
        console.log("Redirecting");
        w.location = '/deployment'
  
      }
    }

    function ListDeploys($scope ,$http){
        $http.post('/list', $scope.list).success(function(data){
            console.log("List post success");
        }).error(function (error) {
      console.log("List error");
      console.log(error);
    });
    }
}());
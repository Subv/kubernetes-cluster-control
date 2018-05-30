(function (){
    'use strict';

    angular
        .module('core')
        .controller('DeploymentListController',DeploymentListController);

        DeploymentListController.$inject = ['$scope', '$http', '$window', 'Authentication'];
    
    function DeploymentListController($scope,$http , w , A){

    

    $scope.ListDeployments = function () {
      console.log("Deployments");
      ListDeploys($scope, $http);
    }
    $scope.ReturnTo = function() {
        console.log("Redirecting");
        w.location = '/deployment';
  
      }
    $scope.user =  A.user.username,
    $scope.Headers = [{
        'link' : 'link',
        'ide': 'ide',
    }];

    }

    function ListDeploys($scope ,$http){
        $http.post('/list', $scope.list).success(function(data){
            /*console.log("List post success");
            console.log("data is");
            console.log(data);*/
            $scope.list = data;
            $scope.found = [];
            for (var i=0;i<data.length;i++){
                $scope.found[i] = data[i].uniqueid;
            }
            console.log($scope.found);
        }).error(function (error) {
      console.log("List error");
      console.log(error);
    });
    }
}());
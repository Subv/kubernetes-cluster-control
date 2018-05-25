(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$state', 'Authentication', 'menuService', '$window'];

  function HomeController($scope, $state, Authentication, menuService, w) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }

    $scope.sign_out = function(){
      vm.authentication.user = null;
      w.location = '/api/auth/signout'
    }
  }
}());

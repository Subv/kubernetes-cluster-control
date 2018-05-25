(function () {
    'use strict';
    angular
        .module('core')
        .controller('LoginController', LoginController);
    LoginController.$inject = [];

    function LoginController(){
        var vm = this;
    }
}());

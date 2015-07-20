(function() {

    angular
        .module('ldr.nav', [])
        .directive('ldrNav', ldrNav);

    /* @ngInject */
    function ldrNav($http, $state, store) {
        return {
            restrict: 'E',
            templateUrl: 'nav/nav.html',
            link: linkFunc
        };

        /////////////

        function linkFunc(scope, el, attr, vm) {

            vm.user = getCurrentUser();
            vm.showFailMessage = false;

            vm.register = register;
            vm.login = login;
            vm.logout = logout;
            vm.getCurrentUser = getCurrentUser;
            vm.setCurrentUser = setCurrentUser;

            function getCurrentUser() {
                var user = store.get('currentUser');
                vm.isLoggedIn = true;
                vm.isLoggedInAdmin = user.admin;
                vm.isAdmitted = user.admitted;
                return user;
            }

            function setCurrentUser(user, token) {
                vm.currentUser = user;
                store.set('currentUser', user);
                if (token) {
                    store.set('jwt', token);
                }
                vm.isLoggedIn = true;
                vm.isLoggedInAdmin = user.admin;
                vm.isAdmitted = user.admitted;
            }

            function register() {
                vm.isLoggedIn = false;
                vm.isLoggedInAdmin = false;
                vm.isAdmitted = false;
                vm.showFailMessage = false;
                $state.go('userRegistration');
            }

            function login(user) {
                $http({
                    url: 'login',
                    method: 'POST',
                    data: user || vm.user
                }).then(function(result) {
                    if (result) {
                        // No error: authentication OK
                        // Set current user and jwt. Then go to forms page
                        setCurrentUser(result.data.user, result.data.id_token);
                        $state.go('home');
                    } else {
                        vm.showFailMessage = true;
                    }
                }, function() {
                    vm.showFailMessage = true;
                });
            }

            function logout() {
                vm.isLoggedIn = false;
                vm.isLoggedInAdmin = false;
                vm.isAdmitted = false;
                store.remove('currentUser');
                store.remove('jwt');
                vm.showFailMessage = false;
                $state.go('home');
            }

        }
    }
})();
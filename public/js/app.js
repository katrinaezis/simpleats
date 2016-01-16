
var SEModule = angular.module('se', ['ngRoute',
                                      'btford.socket-io'])

    .config(function($routeProvider) {
	function r(path, template, controller) {
	    $routeProvider
		.when(path, {
		    templateUrl:  template,
		    controller:   controller}); }

	r('/', 'templates/homepage.html', 'HomeController');
	r('/order', 'templates/make_order.html', 'OrderController');
	r('/dashboard', 'templates/orders.html', 'DashboardController');
        
	$routeProvider
	    .otherwise({
		redirectTo: '/'});
    })

    .factory('Socket', function (socketFactory) {
        return socketFactory();
    })

    .factory('Api', function($http, $location) {
	function request(method, path, data) {
	    if (method == 'get') {
		path += '?';
		for (var k in data) {
		    path += k + '=';
		    path += encodeURIComponent(data[k]) + '&'; }}
		
	    return $http({method: method, url: ("api" + path), data: data})
		.error(function(data) {
		    if (!data) {
			toastr.options = {
			    "closeButton": true,
			    "debug": false,
			    "positionClass": "toast-bottom-right",
			    "onclick": null,
			    "showDuration": "300",
			    "hideDuration": "1000",
			    "timeOut": "5000",
			    "extendedTimeOut": "1000",
			    "showEasing": "swing",
			    "hideEasing": "linear",
			    "showMethod": "fadeIn",
			    "hideMethod": "fadeOut"
			}

			toastr.error('Connection lost!'); } }); }
	return {
	    get: function(path, data, success, failure) {
		request('get', path, data)
		    .success(success || function() {})
		    .error(failure || function() {}) },
	    post: function(path, data, success, failure) {
		request('post', path, data)
		    .success(success || function() {})
		    .error(failure || function() {}) }}; 
    })

    .controller('DashboardController', function($scope, Socket) {
        var connection = Socket.connect(function(x) { console.log('connected', x); });

        $scope.orders = menu_items;
        function add_order(order) {
            $scope.$apply(function() {
                $scope.orders.push(order); }); }
        connection.on('new_order', function(order) {
            add_order(order); });
    })

    .controller('OrderController', function($scope, Socket) {
        $scope.menu_items = menu_items;
        console.log(Socket);
        var connection = Socket.connect();
        $scope.make_order = function() {
            var order = {tickets: [{item: menu_items[0],
                                    options: {'with swiss': true}},
                                   {item: menu_items[2],
                                    options: {}}],
                         time_due:   new Date(new Date() - 1 + 1000 * 60 * 28)};
            console.log(order);
            connection.emit('new_order', order); };
        
    })

    .controller('HomeController', function($scope) {
        $scope.test = 123;

    });



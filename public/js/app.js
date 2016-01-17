
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
        var count      = Math.floor(Math.random() * 8) + 5;

        $scope.orders  = [];
        
        function get_tickets() {
            return $scope.orders.map(function(order) {
                return order.tickets.map(function(ticket) {
                    ticket.time_due = new Date(order.time_due);
                    ticket.order    = order;
                    return ticket; }); })
                .reduce(function(a, b) {
                    return a.concat(b); }); }

        function add_order(order) {
            $scope.$apply(function() {
                $scope.orders.push(order); }); }
        
        connection.on('new_order', function(order) {
            add_order(order); });

        for (;count>0;count--)
            $scope.orders.push(generate_order());

        $scope.get_minutes = function(order) {
            return get_difference(order.time_due); };

        $scope.get_minutes_start = function(order) {
            return get_difference(start_time(order)); };

        $scope.get_percent = function(order) {
            return get_percent(order.time_due); };

        $scope.$watch('orders', function(orders) {
            orders.map(function(order) {
                if (!order.table)
                    find_and_reserve_table(order); }); });
    })

    .controller('OrderController', function($scope, Socket) {
        $scope.menu_items = menu_items;
        console.log(Socket);
        var connection = Socket.connect();
        $scope.make_order = function() {
            var order = generate_order();
            console.log(order);
            connection.emit('new_order', order); };
        
    })

    .controller('HomeController', function($scope) {
        $scope.test = 123;

    });



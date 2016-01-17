
var SEModule = angular.module('se', ['ngRoute',
                                      'btford.socket-io'])

    .config(function($routeProvider) {
	function r(path, template, controller) {
	    $routeProvider
		.when(path, {
		    templateUrl:  template,
		    controller:   controller}); }

	r('/order', 'templates/make_order.html', 'OrderController');
	r('/review_order', 'templates/review_order.html', 'ReviewOrderController');
	r('/dashboard', 'templates/orders.html', 'DashboardController');

	r('/dine_in', 'templates/dine_in.html', 'DineInController');
        

    r('/thankyou', 'templates/thankyou.html', 'ThankYouController');
    

	$routeProvider
	    .otherwise({
		redirectTo: '/dashboard'});
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

    .service('Order', function() {
        var order = {};

        function set_order(o) {
            order = o;
            return order; }

        function get_order() {
            return order; }

        return {set:   set_order,
                get:   get_order}; })


    .controller('DashboardController', function($scope, Socket, $location) {
        var connection = Socket.connect(function(x) { console.log('connected', x); });
        var count      = 5;

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
                $scope.orders.push(order);
                process_orders(); }); }
        
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

        $scope.homeFun = function() {
            $location.path("/"); }

        $scope.starting_orders = function() {
            return $scope.orders.filter(function(o) {
                return o.minutes_start > 0  && o.minutes_start > -3; })
                .sort(function(a, b) {
                    return a.minutes_start - b.minutes_start; }); };

        $scope.cooking_orders = function() {
            return $scope.orders.filter(function(o) {
                return o.minutes_start <= 0 && o.minutes_due > -3; })
                .sort(function(a, b) {
                    return a.minutes_due - b.minutes_due; }); };

        $scope.background_color = function(time) {
            var color;
            time = Math.abs(time);
            var color1 = [71,44,117];
            var color2 = [240,84,35];
            var pos;
            var in_between = function (color_index, time) {
                var col1 = color1[color_index];
                var col2 = color2[color_index];
                return (col1 + ((col2 - col1) * (1 -  (time / 20)))).toFixed(); }
            
            if (time > 5) {
                color = [in_between(0, time),
                         in_between(1, time),
                         in_between(2, time), 0.66 - (time / 65)];
                console.log(color);
                return 'rgba(' + color.join(",") + ')'; }
            if (time <= 5) {
                color = [255,115,71, 1 - (time / 50)];
                return 'rgba(' + color.join(",") + ')'; }};

        function process_orders() {
            $scope.orders.map(function(order) {
                if (!order.table)
                    find_and_reserve_table(order);
                
                order.minutes_start = $scope.get_minutes_start(order);
                order.minutes_due   = $scope.get_minutes(order); }); }

        var run = 0;
        function timer() {
            run ++;
            if (run > 1)
                $scope.$apply(process_orders);
            else
                process_orders();

            setTimeout(timer, 4 * 1000); }
        timer();
    })

    .controller('OrderController', function($scope, Socket, Order, $location) {
        $scope.menu_items = menu_items;
        $scope.order_in = { menuItems: [] };
        console.log(Socket);
        var connection = Socket.connect();
        $scope.add_to_order = function(menuItem) {
            $scope.order_in.menuItems.push(generate_ticket(menuItem));
            console.log('added menu item to order: ' + menuItem);
        };
        $scope.make_order = function() {
            var order = generate_order();
            console.log(order);
            connection.emit('new_order', $scope.order_in); 
        };
        $scope.orderItemQuantity = function(menuItemTitle) {
        	var q = 0;
        	var menuItems = $scope.order_in.menuItems;
        	for (var i = 0; i < menuItems.length; i++) {
        		if (menuItems[i].item.title == menuItemTitle) {
        			q++;
        		}
        	}
        	return q;
        }

        $scope.checkout = function() {
            Order.set($scope.order_in);
            $location.path('/review_order'); };
    })

    .controller('ReviewOrderController', function($scope, Order, $location) {
        $scope.order = Order.get();

        $scope.subtotal = 0;
        $scope.order.menuItems.map(function(item) {
            $scope.subtotal += item.item.price; });
        
        $scope.tax       = $scope.subtotal * 0.085;
        $scope.total     = $scope.subtotal + $scope.tax;
        $scope.prep_time = longest_prep_time($scope.order) / 1000 / 60;

        $scope.checkout  = function(type) {
            $scope.order.dining_type = type;
            Order.set($scope.order)
            if (type  == 'dine_in')
                $location.path('/dine_in');
            else
                $location.path('/checkout'); };
    })

    .controller('DineInController', function($scope, Order, $location) {
        $scope.order    = Order.get();
        $scope.checked  = false;

        $scope.checkout = function() {
            $location.path('/check_out'); };
        
    })

    .controller('HomeController', function($scope) {
        $scope.test = 123;

    });



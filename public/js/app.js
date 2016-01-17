
var SEModule = angular.module('se', ['ngRoute',
                                      'btford.socket-io',
                                      'ui.timepicker'])
                                      

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
        r('/', 'templates/homepage.html', 'HomeController');
                r('/demo', 'templates/demo.html', 'DemoController');
            r('/order_button', 'templates/order_button.html', 'OrderButtonController');
    

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
        var num_people;
        var time ;

        function set_order(o) {
            order = o;
            return order; }

        function get_order() {
            return order; }

        function set_num_people(o) {
            num_people = o;
            return num_people; }

        function get_num_people() {
            return num_people; }

        function set_time(o) {
            time = o;
            return time; }

        function get_time() {
            return time; }

        return {set:   set_order,
                set_num_people: set_num_people,
                get_num_people: get_num_people,
                set_time: set_time,
                get_time: get_time,
                get:   get_order}; })


    .controller('DashboardController', function($scope, Socket, $location) {
        var connection = Socket.connect(function(x) { console.log('connected', x); });
        var count      = 5;

        $scope.orders  = [];

        $scope.print_time = function(order) {
            var time = new Date(order.time_due);

            var hour    = time.getHours().toString();
            var minutes = time.getMinutes().toString();
            if (hour.length == 1) hour = "0" + hour;
            if (minutes.length == 1) minutes = "0" + minutes;
            
            return hour + ":" + minutes; }

        $scope.close   = function(order) {
            var orders = $scope.orders;
            var ret    = [];
            for (var i in orders)
                if (orders[i] != order)
                    ret.push(orders[i]);
            $scope.orders = ret; };
        
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
                $scope.orders.push(process_an_order(order));
                process_orders(); }); }
        
        connection.on('new_order', function(order) {
            add_order(order); });

        for (;count>0;count--)
            $scope.orders.push(generate_order());
        console.log($scope.orders);
        $scope.get_minutes = function(order) {
            return get_difference(order.time_due); };

        $scope.get_minutes_start = function(order) {
            return get_difference(start_time(order)); };

        $scope.get_percent = function(order) {
            return get_percent(order.time_due); };

        $scope.homeFun = function() {
            $location.path("/"); }

        function matches(order, query) {
            return order.name.toLowerCase().match((query || "").toLowerCase()); }

        $scope.starting_orders = function() {
            return $scope.orders.filter(function(o) {
                return o.minutes_start > 0  && o.minutes_start > -3
                    && matches(o, $scope.query); })
                .sort(function(a, b) {
                    return a.minutes_start - b.minutes_start; }); };

        $scope.orders_col = function(col) {
            var order = $scope.starting_orders();
            console.log(order)
            var ret   = [];

            var add = col == 0;
            for (var i in order) {
                if (add)
                    ret.push(order[i]);
                add = !add; }
            return ret; }

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
            $scope.orders.map(process_an_order); }
        
        function process_an_order(order) {
            if (!order.table)
                find_and_reserve_table(order);
                
            order.minutes_start = $scope.get_minutes_start(order);
            order.minutes_due   = $scope.get_minutes(order);
            return order; }

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


    .controller('OrderButtonController', function($scope, Socket, Order, $location) {
        var connection = Socket.connect();
        $scope.make_order = function() {
            var order = generate_order();
            order = {"tickets":[{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"medium rare, tator tots","options":{}},{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"Give me all of the bacon and eggs you have. Do you understand?","options":{"with swiss":true}},{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"xtra mayo","options":{"with swiss":true}}],"name":"David Karn","time_due":"2016-01-17T20:00:12.622Z"};
            order = Order.get();
            order.name = "David Karn";
            order.time_due = new Date() - (-1000 * 60 * 18);
            console.log(order);
            connection.emit('new_order', order); }; })


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
            connection.emit('new_order', order); 
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

        $scope.homeFun = function() {
        	console.log("kk");
        	$location.path("/");
        }
    })

    .controller('ReviewOrderController', function($scope, Order, $location, Socket) {
    	
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
                $location.path('/checkout'); }

        var connection = Socket.connect();
        $scope.checkout = function() {
            var order = generate_order();
            order = {"tickets":[{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"medium rare, tator tots","options":{}},{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"Give me all of the bacon and eggs you have. Do you understand?","options":{"with swiss":true}},{"item":{"type":"sandwich","title":"Pastrami","description":"house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side","price":12.5,"prep_time":14,"options":[{"name":"with swiss","price":1.5,"type":"boolean"}],"thumbnail":"PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg"},"comments":"xtra mayo","options":{"with swiss":true}}],"name":"David Karn","time_due":"2016-01-17T20:00:12.622Z"};
            order.time_due = new Date() - (-1000 * 60 * 18);
            console.log(order);
            connection.emit('new_order', order); }; })
        
    .controller('DineInController', function($scope, Order, $location) {
    	
        $scope.order    = Order.get();
        $scope.checked  = false;

        $scope.checkout = function() {
            $location.path('/check_out'); };
        
    })

        .controller('DemoController', function($scope) {
            })
    .controller('HomeController', function($scope, Order) {
    	var freewallContent;
    	
        $scope.update_stuff = function() {
            Order.set_num_people($scope.num_people);
            Order.set_time($scope.time_due);
            console.log(Order.get_time(), Order.get_num_people());
            
            
            $("#freewall").html(freewallContent);
            $(".busy").remove();
            var wall = new Freewall("#freewall");
    		wall.reset({
    			selector: '.brick',
    			animate: false,
    			cellW: 260,
    			cellH: 200,
    			delay: 30,
    			onResize: function() {
    				//wall.refresh(wall.fitWidth(), wall.fitHeight());
    			}
    		});
    		wall.fitZone(wall.fitWidth(), wall.fitHeight());
        };
        
    	$scope.time_due = new Date();
    	
    	var temp = "<div class='brick' style='width:{width}px; height: {height}px; background-image: {images}; background-size: cover'><div class='cover'></div></div>";
    	var images = [
    		"url(../images/restruantImg/restaurant.jpg)",
    		"url(../images/restruantImg/restruant2.jpg)",
    		"url(../images/restruantImg/restruant3.jpg)",
    		"url(../images/restruantImg/restruant4.jpg)",
    		"url(../images/restruantImg/restruant5.jpg)"
    	];

    	var w = 1, h = 1, html = '', color = '', limitItem = images.length;
    	for (var i = 0; i < limitItem; ++i) {
    		h = 1 + 3 * Math.random() << 0;
    		w = 1 + 3 * Math.random() << 0;
			html += temp.replace(/\{height\}/g, h*200).replace(/\{width\}/g, w*250).replace("{images}", images[i]);
    	}
    	
    	freewallContent = $("#freewall").html();
    	//$("#freewall").html(html);

    	$(function() {
    		var wall = new Freewall("#freewall");
    		wall.reset({
    			selector: '.brick',
    			animate: false,
    			cellW: 260,
    			cellH: 200,
    			delay: 30,
    			onResize: function() {
    				//wall.refresh(wall.fitWidth(), wall.fitHeight());
    			}
    		});
    		wall.fitZone(wall.fitWidth(), wall.fitHeight());
    	});

    });



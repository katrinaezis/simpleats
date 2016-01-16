var months_list = ["January","February","March","April","May","June",
	      "July","August","September","October","November",
	      "December"];

var month_lengths = [31, 29, 31, 30, 31, 30, 
		     31, 31, 30, 31, 30, 31]; 

Number.parseFloat = parseFloat;
Number.parseInt = parseInt;

function tester(a) {
    return function(b) {
        return a == b; }; }

function not_tester(a) {
    return function(b) {
        return a != b; }; }

function uniq(array, processer) {
    var values = {};
    var unique_array = [];
    processer = processer || function(a) { return a; }

    for (var i in array) {
        if (array[i]) {
            var processed = processer(array[i]);
            if (!values[processed]) {
                unique_array.push(array[i]);
                values[processed] = true; }}}

    return unique_array; }

function root_url() {
    var root = document.URL;
    return root.slice(0, root.indexOf('#')); }

function capitalize(string) {
    return string.split(" ")
	.map(function(word) {
	    return word.charAt(0).toUpperCase() 
		+ word.slice(1); })
	.join(" "); }

function write_out_price(price) {
    var thousands = Math.floor(price / 1000);
    var hundreds = Math.floor((price % 1000) /100);
    var tens = Math.floor((price % 100) / 10);
    var single = price % 10;

    var digit_words = ['zero', 'one', 'two', 'three', 'four', 'five', 
		       'six', 'seven', 'eight', 'nine'];
    var double_words = ['', 'ten', 'twenty' ,'thirty', 'forty', 'fifty', 
			'sixty', 'seventy', 'eighty', 'ninety'];
    var teen_words = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
		      'fifteen', 'sixteen', 'seventeen', 'eighteen', 
		      'nineteen'];

    var strings = []
    if (thousands > 0)
	strings.push(digit_words[thousands] + ' thousand');
    if (hundreds > 0)
	strings.push(digit_words[hundreds] + ' hundred');
    if (strings.length > 0) 
	strings.push("and");

    if (tens > 0) {
	if (tens >= 2) {
	    if (single == 0)
		strings.push(double_words[tens]);
	    else
		strings.push(double_words[tens] 
			     + "-" + digit_words[single]); }
	else { 
	    strings.push(teen_words[single]); }}
    else if (single > 0) {
	strings.push(digit_words[single]); }

    return capitalize(strings.join(" ")); }

function break_up_word(word, length) {
    var i = 0;
    var split_up = [];
    var current_word = "";

    function can_skip() {
	return current_word.length > 0
	    && !current_word.match(/^[^a-z]+$/); }

    function skip(c) {
	split_up.push(current_word);
	current_word = c || ""; }    

    while (i < word.length) {
	var c = word[i];
	if (!c.match(/[a-z]/)) {
	    if (can_skip()) 
		skip(c); 
	    else 
		current_word += c; }
	else {
	    if (current_word.length >= length) 
		skip(c); 
	    current_word += c; }

	i += 1; }

    skip();
    return split_up.join("\u200b"); }

function ensure_wraps(chars, string) {
    if (string.length < chars)
	return string;

    var words = string.split(/\s+/);
    if (words.length > 1)
	return (words.map(delay(ensure_wraps, chars))
		.join(" "));

    var word = words[0];
    if (word.length <= chars)
	return word;
    else
	return break_up_word(word, chars); }

function setter(key, to) {
    return function(obj) {
	obj[key] = to; 
	return obj; }; }

function add_to_set(list, value) {
    if (list.indexOf(value) >= 0)
	return list;

    return list.concat(value); }

function remove_from_set(list, value) {
    var index = list.indexOf(value);
    if (index == -1)
	return list;
    
    return list.slice(0, index)
	.concat(list.slice(index + 1)); }

function combiner(key) {
    return function(a, b) {
	return a[key](b); }; }

function toggle(obj, key) {
    obj[key] = !obj[key];
    return obj; }

function toggler(key) {
    return function(obj) {
	obj[key] = !obj[key]; }; }

function do_nothing() {}

function member(array, value) {
    for (var i in array) 
        if (array[i] == value)
            return true; }

function date_to_string(date, format) {
    format = format || 'YYYY-MM-DD';

    if (typeof date == "string") {
	date = new Date(date);
	date = new Date(date.getTime() 
			+ (date.getTimezoneOffset() * 1000 * 60)); }

    if (!date)
	return '';

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (day < 10)
	day = '0' + day.toString();

    if (month < 10)
	month = '0' + month.toString();

    return format.replace("YYYY", year)
	.replace("MM", month)
	.replace("DD", day); }

function key_lookup(array, value) {
    for (var i in array) 
	if (array[i] == value)
	    return i;

    return false; }

function curry(that) {
    var args = _to_array(arguments).slice(1);

    return function() {
	var oldargs = args.slice(0);
	var newargs = _to_array(arguments);
	var j = 0;
	for (var i in oldargs)
	    if (oldargs[i] == undefined) {
		oldargs[i] = newargs[j];
		j += 1; }

	var as = oldargs.concat(newargs.slice(j));

	return that.apply(that, as); }};

var delay = curry;

function _to_array(what) {
    var i; 
    var ar = [];
 
    for (i = 0; i < what.length; i++) {
	ar.push(what[i]); }

    return ar; }

function obj_to_array(what) {
    var i; 
    var ar = [];
 
    for (i in what) {
	ar.push(what[i]); }

    return ar; }

function validate_password() {
    if ($('#password').val() != $('#password2').val()) {
	$('#password').addClass('has-error').removeClass('has-success');
	$('#password2').addClass('has-error').removeClass('has-success');
	$('#password2').addClass('has-success').removeClass('has-error');;

	return $('#form-errors').text("Passwords don't match"); }
    else {
	$('#password').addClass('has-success').removeClass('has-error');
	$('#password2').addClass('has-success').removeClass('has-error');
	$('#password2').addClass('has-error').removeClass('has-success'); }}

function process_template($http, $templateCache, $compile, elem, url, scope) {
    $http.get(templateUrl, {cache: $templateCache})
	.success(function(html) {
	    elem.html(html);
	    elem.replaceWith($compile(elem.html())(scope)); }); 
}

function ask_are_you_sure($modal, then, message) {
    var modal = $modal.open({
	templateUrl: 'templates/are_you_sure.html',
	controller: 'AreYouSureModal',
	size: 'sm',
	resolve: {
	    message: function() {
		return message || 'Are you sure?'; }}});
    
    modal.result.then(then); 

    return modal; }

function popup($modal, template, then, controller, resolve) {
    var modal = $modal.open({
	templateUrl: 'templates/' + template,
	resolve: (resolve || {}),
	controller: (controller || 'PopupModal')});
    
    if (then) 
	modal.result.then(then); 

    return modal; }

function relocator($location, path) {
    return function() {
	$location.path(path); }; }

function relocator_with_ids($location, path, users_list, key) {
    return function() {
	$location.path(path + "/" 
		       + (users_list.filter(param_returner(key))
			  .map(param_returner('id'))
			  .join(","))); }; }

function sum(a, b) {
    return a + b; }

function setup_relocators($scope, $location, setup) {
    for (var key in setup) 
	$scope[key] = relocator($location, setup[key]); }

function opfn(fn) {
    return function(a) {
	return !fn(a); }; }

function o(fn1, fn2) {
    return function(a) {
	return fn1(fn2(a)); }; }

function param_returner(param_name) {
    return function(obj) {
	return obj[param_name]; }; }

function returner(value) {
    return function() {
        return value; }; }

function dob_to_birthday(dob) {
    var month = dob.slice(5,7);
    var day = dob.slice(8,10);

    return month + '/' + day;}

function comma_list_contains(list, contains) {
    if (!list)
        return false;

    return (list
	    .split(",")
	    .indexOf(contains)) > -1; }

function is_formatted_price(price) {
    return price.match(/^[0-9]+\.[0-9]{2}$/); }

function format_price(price, no_dollar_sign, show_commas) {
    var as_float = parseFloat(price);
    if (isNaN(as_float)) 
	as_float = 0.0;

    var str = "" + as_float;
    var dot_index = str.indexOf(".");
    var int_part = str.substr(0, dot_index);
    var dec_part = str.substr(dot_index + 1);

    if (dot_index < 0) {
	int_part = str;
	dec_part = '00'; }

    while (dec_part.length < 2)
	dec_part = dec_part + '0';
    dec_part = dec_part.slice(0,2);

    if (show_commas) 
	if (parseInt(int_part) >= 1000) {
	    var l = int_part.split("").reverse();
	    int_part = l.slice(0,3).concat(",").concat(l.slice(3))
		.reverse()
		.join(""); }
    
    return (no_dollar_sign ? '' : '$')
	+ int_part.toString() 
	+ '.' 
	+ dec_part.toString(); }

function double_space_sentences(string) {
    return string.split(". ").join(".\xA0 "); }

function number_suffix(num) {
    if (num > 10 && num < 20)
        return 'th';

    var last_digit = num.toString().slice(-1);
    var suffixes = ['th', 'st', 'nd', 'rd', 'th', 
                    'th', 'th', 'th', 'th', 'th'];
    return suffixes[Number.parseInt(last_digit)]; }

function date_from_string(string) {
    var year = Number.parseInt(string.slice(0,4));
    var month = Number.parseInt(string.slice(5,7)) - 1;
    var day = Number.parseInt(string.slice(8,10));

    return new Date(year, month, day); }
	    
function long_date(birthday) {
    if (!birthday) 
	return '?';
            
    birthday = date_from_string(birthday);

    var months = months_list;
    var month = birthday.getMonth();
    var day = birthday.getDate();
    var year = birthday.getFullYear();

    if (year == 1900)
	year = '';

    return months[month] + " " + day + number_suffix(day); }

function add_progressive_loading(BCFriends, $scope) {
    var dont_scroll = false;
    $(document).scroll(function() {
        var load_more_top = $('#load-more').offset().top;
        var top = $(window).scrollTop();
        var bottom = window.innerHeight + top;
        
        if (load_more_top > top
            && load_more_top < bottom
            && !dont_scroll) {
            BCFriends.get_next_page(function() {
                dont_scroll = false; });
            
            dont_scroll = true; }});

    $scope.get_next_page = function() {
        BCFriends.get_next_page(); }; }

function clone(i) {
    if (i instanceof Array)
        return i.slice(o);

    if (typeof i != "object")
        return i;
    
    var o = {};
    for (var j in i) 
        o[j] = clone(i[j]); 
    return o; }

function toast(type, message) {
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

    toastr[type](message); }


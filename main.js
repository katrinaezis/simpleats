var express         = require('express'),
    errorHandler    = require('errorhandler'),
    http            = require('http'),
    querystring     = require('querystring'),
    request         = require('request');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var methodOverride  = require('method-override');
var session         = require('express-session');

var app             = express();
var port            = process.env.PORT || 8080;
var names           = [];
var courses         = [];
var assignments     = [];
var server          = require('http').Server(app);
var io              = require('socket.io')(server);

server.listen(port);


io.on('connection', function (socket) {
  socket.on('new_order', function (data) {
      socket.emit('new_order', data);
  });
});


function curry(that) {
    var args = to_array(arguments).slice(1);

    return function() {
	var oldargs = args.slice(0);
	var newargs = to_array(arguments);
	var j = 0;
	for (var i in oldargs)
	    if (oldargs[i] === undefined) {
		oldargs[i] = newargs[j];
		j += 1; }

	var as = oldargs.concat(newargs.slice(j));

        if (that instanceof Array)
            return that[0].apply(that[1], as);
        else
	    return that.apply(that, as); }; }

function to_array(what) {
    var i; 
    var ar = [];
 
    for (i = 0; i < what.length; i++) {
        ar.push(what[i]); }

    return ar; }

var env = process.env.NODE_ENV || 'development';
if (env == 'development') {
    app.use(errorHandler()); }

if (env == 'production') {}

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret:               'aldsjflaksjfadlskjf2342',
                  saveUninitialized:     true,
                  resave:                true}));

function do_nothing() {}

function extractor(x) {
    return function(y) {
        return y[x]; }; }

function runner(x) {
    return function(y) {
        return y[x](); }; }

function member(ar, value) {
    return ar.indexOf(value) >= 0; }

function member_i(ar, value) {
    for (var i in ar)
        if (cmpi(ar[i], value))
            return ar[i];
    return false; }   

app.use(express.static(process.cwd() + '/public')); 

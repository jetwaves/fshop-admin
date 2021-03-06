var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var init = require('./routes/init');
var routes = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/products');
var clients = require('./routes/clients');
var models = require('./routes/models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 用ejs来解析html
app.engine('html', require('ejs').renderFile);

// 设置静态路由
app.use('/bootstrap', express.static(__dirname + '/bower_components/bootstrap/dist'));      // bootstrap
app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist'));            // jQuery
app.use('/ng', express.static(__dirname + '/bower_components/angularjs'));                  // angularjs
app.use('/dt', express.static(__dirname + '/bower_components/datatables/media'));                  // datatables
app.use('/file', express.static(__dirname + '/file'));                  // datatables


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/init', init);     // 用于初始化
app.use('/', routes);
app.use('/users', users);
app.use('/products', products);
app.use('/clients', clients);

app.use('/models', models);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')


var init = require('./routes/init');
var routes = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/products');
var clients = require('./routes/clients');
var models = require('./routes/models');
var messages = require('./routes/messages');

var app = express();
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 用ejs来解析html
app.engine('html', require('ejs').renderFile);
// 默认ejs解析引擎,  设定模板所在目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 设置静态路由
app.use('/bootstrap', express.static(__dirname + '/bower_components/bootstrap/dist'));      // bootstrap
app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist'));            // jQuery
app.use('/ng', express.static(__dirname + '/bower_components/angularjs'));                  // angularjs
app.use('/dt', express.static(__dirname + '/bower_components/datatables/media'));           // datatables
app.use('/file', express.static(__dirname + '/file'));                                      // 用于文件下载的中转目录



var mongo_uri = 'mongodb://localhost/fshop';
mongoose.connect(mongo_uri);            // 设定mongodb连接字并且连接数据库（其他routers会共享这个连接）
app.use('/init', init);                 // 用于初始化超级用户，自个去init.js 里面改超级用户初始用户名和加密算法

app.use('/', messages);
app.use('/users', users);
app.use('/products', products);
app.use('/clients', clients);
app.use('/models', models);
app.use('/messages', messages);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
//          will print stacktrace
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
//          no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.on('close', function(){     // 在程序关闭的时候，关闭mongoose维持的数据库连接
    mongoose.disconnect();
});

module.exports = app;

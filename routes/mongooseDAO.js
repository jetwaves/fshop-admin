// 数据库连接
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fshop');

module.exports = mongoose;

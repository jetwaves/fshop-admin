var express = require('express');
var router = express.Router();

var crypto = require('crypto');

function md5 (text) {
 	return crypto.createHash('md5').update(text).digest('hex');
};

var mongojs =require('mongojs');	// mongojs 访问数据库

// var dbName = "fshopAdmin";
var dbName = "fshop";
var collectionName = "users";
var db = require('mongojs').connect(dbName,["users"]);

// var suName = "su";		// 超级用户名，这里改成用户自己需要的超级用户名
// var password = "admin";	// 初始化的超级用户密码
// var salt = '685214';	// 这里改成用户自己需要的超级用户salt

var suName = "";		// 超级用户名，这里改成用户自己需要的超级用户名
var password = "";		// 初始化的超级用户密码
var salt = '';			// 这里改成用户自己需要的超级用户salt

// 模型内部路由设置
// router.get('/', list );
router.get('/init', init );

function encryptPassword( pwd, salt){
	return md5( salt.concat(md5(pwd)).concat(salt) );
}

// 初始化超级用户
function init(req, res){
	var pwdmd5 = encryptPassword(password, salt);
	var superAdmin = { user_name : suName, password: pwdmd5, user_right: 9, salt: salt };
	// res.json(superAdmin);
	db.users.insert(superAdmin, function(err, result){
		_infoJump(res, '初始化超级用户成功，即将返回首页', '/');
	});
}

function _infoJump(res, info, targetUrl){
	rend = { msg : info, targetUrl : targetUrl };
	res.render("./public/info.html", rend);
}

module.exports = router;

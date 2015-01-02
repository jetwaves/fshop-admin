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

const USER_LIST_PAGE = "/users/list";
const ADD_FORM_PAGE_URL = "/users/add";

var MODEL_NAME = "users";
var MODEL_NAME_TEXT = "用户";
var FORM_ADD_URL = "/" + MODEL_NAME + "/addAction";
var FORM_UPDATE_URL = "/" + MODEL_NAME + "/updateAction";
var FORM_DELETE_URL = "/" + MODEL_NAME + "/delAction";

// 模型内部路由设置
// 

// router.get('/', list );
router.get('/init', init );
router.get('/info', info );

function encryptPassword( pwd, salt){
	return md5( salt.concat(md5(pwd)).concat(salt) );
}

// 初始化超级用户
function init(req, res){
	var suName = "su";		// 超级用户名，这里改成用户自己需要的超级用户名
	var password = "admin";	// 初始化的超级用户密码
	var salt = '685214';	// 这里改成用户自己需要的超级用户salt
	var pwdmd5 = encryptPassword(password, salt);
	var superAdmin = { user_name : suName, password: pwdmd5, user_right: 9, salt: salt };
	// res.json(superAdmin);
	db.users.insert(superAdmin, function(err, result){
		_infoJump(res, '初始化超级用户成功，即将返回首页', '/');
	});
}

function info(req, res){
	console.log(' init.js 	info');
	_infoJump(res, '测试跳转', '/');
}

function _infoJump(res, info, targetUrl){
	rend = { msg : info, targetUrl : targetUrl };
	res.render("./public/info.html", rend);
}

module.exports = router;

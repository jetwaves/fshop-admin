var express = require('express');
var router = express.Router();
var crypto = require('crypto');		// 加密用

function md5 (text) {
 	return crypto.createHash('md5').update(text).digest('hex');
};

var mongojs =require('mongojs');	// mongojs 访问数据库

// var dbName = "fshopAdmin";
var dbName = "testforwx";
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

router.get('/', list );
router.get('/list', list );
router.get('/listData', listData );
router.get('/mgtest', mgtest );
router.get('/init', init );

function encryptPassword( pwd, salt){
	return md5( salt.concat(md5(pwd)).concat(salt) );
}

// 初始化超级用户
function init(req, res){
	var suName = "su";
	var password = "admin";//	初始化的超级用户密码
	var salt = '685214';
	var pwdmd5 = encryptPassword(password, salt);
	var superAdmin = { user_name : suName, password: pwdmd5, user_right: 9, salt: salt };
	res.json(superAdmin);

}

function test2(req, res){
	res.send('this is a test2');
}

function mgtest(req, res){
	db.users.find({}, function(err,records){
		res.json(records);
	});
}


function index(req,res){
	res.render("./pois/index.html");
};

// URL:  /users/
function list(req,res){
	var rend = {
			formUrl : FORM_UPDATE_URL,
			pageName : "修改" + MODEL_NAME_TEXT,
			pageAction : "update",
	};
	res.render("./users/list.html", rend);
};

function listData(req,res){
	db["users"].find(function(err,eles){
		if (err) {
			console.log(" listData err  " + JSON.stringify(err));
			return;
		} 
		var elesData = { "data" : eles};
		res.json(elesData);
	});
};

function add(req,res){
	var msg = null
	if (res.locals.msg != null ) {
		msg = res.locals.msg;
		console.log("	users.js 	add 	111111 msg = " + msg );
	} else {
		msg = req.params.msg;
		console.log("	users.js 	add 	222222 msg = " + msg );
	}
	console.log("	users.js 	add 	msg = " + msg );
	if (msg == "") {msg = "na"};
	var rend = {
			formUrl : FORM_ADD_URL,
			pageName : "添加" + MODEL_NAME_TEXT,
			pageAction : "add",
			msg : msg
	};
	res.render("./users/update.html", rend);

};

var htmlRes = null;
var user_name = null;
var password = null;
var user_right = null;
var salt = null;

// 用户信息
function userInfo(req,res){
	var id = req.params.id;						// 用户记录的NativeId
	var cond = { _id : mongojs.ObjectId(id) };	// 找到指定id对应的记录
	db.users.findOne(cond , function(err, userInfo){
		console.log(JSON.stringify(err));
		res.json(userInfo);
	});
}

// 插入用户的回调
function userInsertResponse(err, result){
	if (err != null ) {
		console.log(JSON.stringify(err));
		htmlRes.redirect(ADD_FORM_PAGE_URL + "/添加用户失败");
		return;
	} else{
		// 添加成功
		htmlRes.redirect(ADD_FORM_PAGE_URL);
		return;
	};
}

// 查找重名用户的回调
function userNameDuplicateResponse(err, cnt){
	console.log("重名查询done");
	if (err != null ) {
		console.log(JSON.stringify(err));
		htmlRes.redirect(ADD_FORM_PAGE_URL + "/重名检测失败");
		return;
	} else{
		if (cnt > 0 ) {
			htmlRes.redirect(ADD_FORM_PAGE_URL+ "/用户名已经存在");
		} else{
			salt = Math.floor(Math.random() * ( 10000 ));
			var saltMd5 = md5(salt.toString());
			salt = saltMd5.substr(5,6);
			// 添加入数据库
			password = md5( md5(password) + salt);		// 先加密
			var userInfo = {
					user_name: user_name, 
					password: password, 
					user_right:user_right,
					salt:salt };
			db.users.insert(userInfo, userInsertResponse);
		};
	};
}

// 检查用户权限，在添加修改的时候判断用户是否有权限继续进行操作
function checkRight(req, res, next){
	//=======================================================================
	// 权限判断：
	// 0. sys表 sys_status = 0 时候才能添加权限4用户
	// 			其他时候不能添加权限4用户
	// 1. 权限4才能添加权限3以下用户
	// 
	var currentUserRight = res.locals.user_right;
	var targetUserRight = req.param('user_right');
	console.log("	users.checkRight 	currentUserRight = " + currentUserRight);
	console.log("	users.checkRight 	targetUserRight = " + targetUserRight);
	if ( currentUserRight != 4) {
		res.locals.msg = "权限不足";
		res.redirect("/users/add/权限不足");
		return;
	};

	//=======================================================================
	next();
}

function addAction(req,res){
	htmlRes = res;
	user_name = req.param('user_name') ;		// 用户名
	password = req.param('password');			// 密码
	user_right = req.param('user_right');
	console.log("user_name = " + user_name);
	console.log("password = " + password);
	console.log("user_right = " + user_right);
	if (user_right == "" ) { user_right = 1 };	// 默认权限是1 查看
	console.log("user_right = " + user_right);
	if (user_name == null || password == null || user_name == "" || password == "") {
		res.redirect(ADD_FORM_PAGE_URL + "/缺乏参数" );
		return;
	};
	// 查看是否重名
	var query = { user_name : user_name };
	db.users.count(query, userNameDuplicateResponse);
};

function update(req,res){
	var rend = {
			formUrl : FORM_UPDATE_URL,
			pageName : "修改" + MODEL_NAME_TEXT,
			pageAction : "update",
			msg: ""
	};
	res.render("./users/update.html", rend);
};


function updateAction(req,res){
	var id = req.param('uid');						// 用户记录的NativeId
	var input_password = req.param('password');
	var user_right = req.param('user_right');
	var new_pwd = null;
	var cond = null;
	var update = null;
	// console.log("query content = " + JSON.stringify(req.body ) );
	var query = { _id : mongojs.ObjectId(id) };	// 找到指定id对应的记录
	// console.log("query string json = " + JSON.stringify(req.query) );
	if (input_password.length > 0 ) {
		// 修改密码
		db.users.findOne( query, function(err, user){
			var salt = user['salt'];
			new_pwd = md5( md5(input_password) + salt);		// 先加密
			password = new_pwd;
			update = { $set :  {password:password, user_right: user_right }};
			cond = {query: query , update: update };
			db.users.findAndModify( cond, function(err,result){
				res.redirect(USER_LIST_PAGE);
			});
		});
	} else {
		update = { $set :  { user_right: user_right }};
		cond = {query: query , update: update };
		db.users.findAndModify( cond, function(err,result){
			res.redirect(USER_LIST_PAGE);
		});
	}
};


function deleteAction(req,res){
	var id = req.params.id;		// 商铺记录的NativeId
	var cond = {_id: new mongojs.ObjectId(id) };
	db.users.remove( cond , function(err,shop){
		if (err) {
			console.log(JSON.stringify(err));
			res.send(JSON.stringify(err));
		};
		res.redirect(USER_LIST_PAGE);
	});	
};


function login(req,res){
	res.render("./users/login.html");
};

function loginAction(req,res){
	user_name = req.param('user_name') ;		// 用户名
	password = req.param('password');			// 密码
	// 先找用户名是否存在
	var cond = {user_name: user_name};
	var uid = null;
	db.users.findOne(cond, function(err, user){
		if (err || user == null) {
			console.log("	users.loginAction  Error,   err = " + JSON.stringify(err));
			res.redirect("/users/login");
		} else {
			var salt = user['salt'];
			var old_pwd = user['password'];
			var check_pwd = md5( md5(password) + salt);		// 先加密
			uid = user['_id'];
			console.log("	salt = " + salt);
			console.log("	old_pwd = " + old_pwd);
			console.log("	check_pwd = " + check_pwd);
			if (old_pwd == check_pwd) {
				// 计算cookie
				var cUsername = user['user_name'];
				var cUserRight = user['user_right'];
				var cUid = uid.toString().substr(0,10);
				var cSalt = md5(salt.toString() + salt.toString());
				var cCheck = md5(cUid + cSalt + cUid + cUsername  + cUid + cUserRight);
				res.cookie('pois_username', cUsername, { maxAge: 3600000, httpOnly: true });
				res.cookie('pois_uid', cUid, { maxAge: 3600000, httpOnly: true });
				res.cookie('pois_salt', cSalt, { maxAge: 3600000, httpOnly: true });
				res.cookie('pois_check', cCheck, { maxAge: 3600000, httpOnly: true });
				res.cookie('pois_right', cUserRight, { maxAge: 3600000, httpOnly: true });
				console.log("	cUsername = " + cUsername);
				console.log("	cUserRight = " + cUserRight);
				console.log("	cUid = " + cUid);
				console.log("	cSalt = " + cSalt);
				console.log("	cCheck = " + cCheck);
				console.log(" 登录成功");
				res.redirect("/");
			} else {
				console.log(" 登录失败02");
				res.redirect("/users/login");
			};
		}
	});
};

// 用cookie检查用户身份
function checkUser(req, res){
	var cUsername = req.cookies.cUsername;
	var cUid = req.cookies.cUid;
	var cSalt = req.cookies.cSalt;
	var cCheck = req.cookies.cCheck;
	var checkRes = md5(cUid + cSalt + cUid);
	if (cCheck == checkRes ) {
		return true;
	} else {
		return false;
	}

}

function logout(req,res){
	res.cookie('pois_username', "", { maxAge: 1, httpOnly: true });
	res.cookie('pois_uid', "", { maxAge: 1, httpOnly: true });
	res.cookie('pois_salt', "", { maxAge: 1, httpOnly: true });
	res.cookie('pois_check', "", { maxAge: 1, httpOnly: true });
	res.redirect('back');
};


function showMessage(req, res, msg){
	res.send(msg);
}


module.exports = router;

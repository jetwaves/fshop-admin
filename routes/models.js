var express = require('express');
var router = express.Router();
// var _ = require('underscore');			// 酌情考虑是否需要使用underscore
// mongoose 数据库连接			注意这里的数据库连接是在app.js里面执行的连接和断开
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// ========= 开始设定模型名称 ==================		☆★☆
// 以下2项是跟模型相关的自定义参数
var modelName 			= 'models';				// 模型英文名称
var modelStr 			= '书';					// 模型中文名称
// --------- 结束设定模型名称 ------------------
/*										======== 过时 =========
								使用mongojs 访问数据库的方法		
								var dbName 				= "fshop";				// 数据库名称		// mongojs需要用, mongoose 不用
								var mongojs =require('mongojs');	// mongojs 访问数据库
								var collectionName = modelName;
								var db = require('mongojs').connect(dbName,[modelName]);		*/

// ======== 开始定义文档模型 ===================		☆★☆
var objSchema = new Schema({
	title:  String,
	author: String,
	body:   String,
	hidden: Boolean,
});
var objModel = mongoose.model('book', objSchema);
// -------- 结束定义文档模型 -------------------

// ===================  	设定自定义路由规则		==================  			☆★☆
// 										注意跟下面的通用路由规则是否有重复
		// router.HttpVerb(	'/path_to_visit0', function_name_to_deal_with_0 );
		// router.get(		'/path_to_visit1', function_name_to_deal_with_1 );
		// router.post(		'/path_to_visit2', function_name_to_deal_with_2 );
// -------------------      结束自定义路由规则      ------------------

// ========== 自定义的处理http请求的方法 =============== ☆★☆


// ------------------------------------------------------------


// 从这里往下是数据库模型访问的通用CRUD，跟数据库名称，字段名称，字段数量无关
// ========= 开始通用路由规则 ==================
router.get(	'/list', list );
router.get(	'/listData', listData );
router.get(	'/info/:id', info );
router.get(	'/update/:id', update );
router.post('/updateAction', updateAction );
router.get(	'/add', add );
router.post('/addAction', addAction );
router.get(	'/del/:id', del );
// --------- 结束设定路由规则 ------------------

var listDataUrl 			= '/' + modelName + '/listData';
var addObjectPageName 		= '添加' + modelStr;
var updateObjectPageName 	= '修改' + modelStr;
var formUrl 				= '/' + modelName + '/update';

function _infoJump(res, info, targetUrl){
	rend = { msg : info, targetUrl : targetUrl };
	res.render("./public/info.html", rend);
}

function list(req, res){
	var rend = { 
					modelStr : modelStr,
					modelName: modelName,
					listDataUrl  : listDataUrl
				}
	res.render("./" + modelName + "/list.html", rend );
} 

function listData(req, res){
	objModel.find({}, function(err, records){
		res.set('Access-Control-Allow-Origin', '*');		// 让来自于APP和网页的程序可以跨域访问
		res.json({data: records});
	});
}

function add(req, res){
	formUrl = '/' + modelName + '/addAction';
	var rend = { 
					modelStr : modelStr,
					modelName: modelName,
					pageName : addObjectPageName,
					formUrl  : formUrl,
					msg      : "无", 
				}
	res.render("./" + modelName + "/update.html", rend );
}

function addAction(req, res){
	updateInfo =  req.body;
	updateInfo = _.omit(req.body, '_id');
	var obj = new objModel(updateInfo);
	obj.save(function(err,saveRes){
		if (err) {
			console.log(' ERROR: 	' + modelName + '.js 	addAction.   Message : ');	console.dir(err);
			_infoJump(res, '添加' + modelStr + '失败，即将跳转回首页' , '/');
		} else{
			_infoJump(res, '添加' + modelStr + '成功，即将跳转回首页' , '/');
		};
	});
}

function update(req, res){
	formUrl = '/' + modelName + '/updateAction';
	var rend = { 
					modelStr : modelStr,
					modelName: modelName,
					pageName : updateObjectPageName,
					formUrl  : formUrl,
					msg      : "无", 
				}
	res.render("./" + modelName + "/update.html", rend );		
}

function info(req, res){
	objectId = req.params.id;
	// console.log(modelName + ' 	info 		objectId = ' + objectId );
	// 把指定对象的信息找回来
	objModel.findById(objectId).exec(function(err, thing){
		res.json(thing);
	});
}

function updateAction(req, res){
	var objectId = req.param('_id');
	// console.log(modelName + ' 	updateAction 		objectId = ' + objectId );
	var updateInfo =  req.body;
	var updateInfo = _.omit(req.body, '_id');
	var cond = {_id: objectId};
	objModel.update(cond, updateInfo, function(err, result){
		if (err) {
			console.log(' ERROR: 	' + modelName + '.js 	addAction.   Message : ');
			console.dir(err);
			_infoJump(res, '修改' + modelStr + '失败，即将跳转回首页' , '/');
		};
		_infoJump(res, '修改' + modelStr + '成功，即将跳转回首页' , '/');
	});
}


function del(req, res){
	objectId = req.params.id;
	// console.log(modelName + ' 	del 		objectId = ' + objectId );
	var cond = { _id : objectId };
	objModel.remove(cond, function(err, result){
		if (err) {
			console.log(' ERROR: 	' + modelName + '.js 	del Action.   Message : ');
			console.dir(err);
			_infoJump(res, '删除' + modelStr + '失败，即将跳转回首页' , '/');
		};
		_infoJump(res, '删除' + modelStr + '成功，即将跳转回首页' , '/');
	});
}

module.exports = router;

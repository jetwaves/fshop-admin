var express = require('express');
var router = express.Router();

// 以下三项是跟模型相关的自定义参数
var modelName 			= 'products';				// 模型英文名称
var modelStr 			= '商品';					// 模型中文名称
var dbName 				= "fshop";					// 数据库名称

var listDataUrl = '/' + modelName + '/listData';
var addObjectPageName = '添加' + modelStr;
var updateObjectPageName = '修改' + modelStr;
var formUrl = '/' + modelName + '/update';

var mongojs =require('mongojs');	// mongojs 访问数据库
var collectionName = modelName;
var db = require('mongojs').connect(dbName,[modelName]);

var _ = require('underscore');

router.get(	'/list', list );
router.get(	'/listData', listData );
router.get(	'/info/:id', info );
router.get(	'/update/:id', update );
router.post('/updateAction', updateAction );
router.get(	'/add', add );
router.post('/addAction', addAction );
router.get(	'/del/:id', del );


function _infoJump(res, info, targetUrl){
	rend = { msg : info, targetUrl : targetUrl };
	res.render("./public/info.html", rend);
}

// same
function list(req, res){
	var rend = { 
					modelStr : modelStr,
					modelName: modelName,
					listDataUrl  : listDataUrl
				}
	res.render("./" + modelName + "/list.html", rend );
} 

function listData(req, res){
	db[modelName].find({}, function(err, records){
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

// 保存信息入数据库
function addAction(req, res){
	// console.dir(req.body);	res.json(req.body);
	updateInfo =  req.body;
	updateInfo = _.omit(req.body, '_id');
	db[modelName].insert(updateInfo, function(err, result){
		if (err) {
			console.log(' ERROR: 	' + modelName + '.js 	addAction.   Message : ');
			console.dir(err);
			_infoJump(res, '添加' + modelStr + '失败，即将跳转回首页' , '/');
		};
		_infoJump(res, '添加' + modelStr + '成功，即将跳转回首页' , '/');
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
	var cond = { _id : mongojs.ObjectId(objectId) };
	db[modelName].findOne(cond, function(err, thing){
		res.json(thing);
	});
}

function updateAction(req, res){
	objectId = req.param('_id');
	// console.log(modelName + ' 	updateAction 		objectId = ' + objectId );
	var query = { _id : mongojs.ObjectId(objectId) };
	updateInfo =  req.body;
	updateInfo = _.omit(req.body, '_id');
	update = { $set :  updateInfo };
	var cond = { query : query, update : update };
	db[modelName].findAndModify(cond, function(err, result){
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
	var cond = { _id : mongojs.ObjectId(objectId) };
	db[modelName].remove(cond, function(err, result){
		if (err) {
			console.log(' ERROR: 	' + modelName + '.js 	del Action.   Message : ');
			console.dir(err);
			_infoJump(res, '删除' + modelStr + '失败，即将跳转回首页' , '/');
		};
		_infoJump(res, '删除' + modelStr + '成功，即将跳转回首页' , '/');
	});
}

module.exports = router;

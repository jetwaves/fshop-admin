var express = require('express');
var router = express.Router();

// 以下三项是跟模型相关的自定义参数
var dbName 				= "fshop";					// 数据库名称
var modelName 			= 'messages';				// 模型英文名称
var modelStr 			= '群发消息';				// 模型中文名称

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
router.get(	'/send/', sendPage );
router.get(	'/', sendPage );
router.post('/sendAction', sendAction );
router.post('/sendActionPROD', sendActionPROD );

// router.get('/madd', madd);

// 数据库连接
// mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/fshop');
// var mongoose = require('./mongooseDAO.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objSchema = new Schema({
	content:  String,
});
var objModel = mongoose.model('message', objSchema);

//==================== 微信发消息用的 ====================


function sendPage(req, res){
	formUrl = '/' + modelName + '/sendAction';
	formUrlPROD = '/' + modelName + '/sendActionPROD';
	var rend = { 
					modelStr : modelStr,
					modelName: modelName,
					pageName : '群发自定义文本消息',
					formUrl  : formUrl,
					formUrlPROD  : formUrlPROD,
					msg      : "无", 
				}
	res.render("./" + modelName + "/msgsender.html", rend );
}


function sendAction(req, res){
	var app_id = req.param('app_id');
	var app_secret = req.param('app_secret');
	var content = req.param('content');
	console.log('	messages.js 		sendAction 		app_id = ' + app_id);
	console.log('	messages.js 		sendAction 		app_secret = ' + app_secret);
	console.log('	messages.js 		sendAction 		content = ' + content);
	var CMessenger = require('CWxMessenger.js');
	var messenger = new CMessenger(app_id, app_secret);
	messenger.bulkSend(content);

	setTimeout(function(){
		var statsRes = {};
		var aSendRes = messenger.aSendRes;
		for(idx in aSendRes){
			var item = aSendRes[idx];
			console.log(' item = '); console.dir(item);
			console.log(' statsRes[item.errcode] = '); console.dir(statsRes[item.errcode]);
			if (statsRes[item.errcode] == null || statsRes[item.errcode] == undefined) {
				 statsRes[item.errcode] = { code: item.errcode, msg: item.errmsg, count: 1};
			} else{
				console.log(' statsRes[item.errcode].count = '); console.dir(statsRes[item.errcode].count);
				statsRes[item.errcode].count = eval(eval(statsRes[item.errcode].count) + 1);
			};
		}
		var aStatsRes = new Array();
		for(idx in statsRes){
			aStatsRes.push(statsRes[idx]);
		}
		res.json(aStatsRes);
	}, 5000);
}

function sendActionPROD(req, res){
	var content = req.param('content');

	appID = 'wxa42620c7089e1381';						// 正式环境使用的AppID和AppSecret
	appSecret = 'a235c8b4691d4c13694e082c8e3e620d';
	console.log('	messages.js 		sendActionPROD 		appID = ' + appID);
	console.log('	messages.js 		sendActionPROD 		appSecret = ' + appSecret);
	console.log('	messages.js 		sendActionPROD 		content = ' + content);
	getTokenAction 		= 'cgi-bin/token?grant_type=client_credential&appid=' + appID + '&secret=' + appSecret;
	sendServiceMsgAction= '/cgi-bin/message/custom/send?access_token=';		// 因为这个url访问是post，因此最左边的/必不可少
	getFansListAction 	= 'cgi-bin/user/get?access_token=';

	bulkSend(content);
	setTimeout(function(){
		var statsRes = {};
		for(idx in aSendRes){
			var item = aSendRes[idx];
			console.log(' item = '); console.dir(item);
			console.log(' statsRes[item.errcode] = '); console.dir(statsRes[item.errcode]);
			if (statsRes[item.errcode] == null || statsRes[item.errcode] == undefined) {
				 statsRes[item.errcode] = { code: item.errcode, msg: item.errmsg, count: 1};
			} else{
				console.log(' statsRes[item.errcode].count = '); console.dir(statsRes[item.errcode].count);
				statsRes[item.errcode].count = eval(eval(statsRes[item.errcode].count) + 1);
			};
		}
		var aStatsRes = new Array();
		for(idx in statsRes){
			aStatsRes.push(statsRes[idx]);
		}
		res.json(aStatsRes);
	}, 30000);
	// _infoJump(res, '真实消息发送成功，去看看自个手机吧' , '/messages/send');
}



//==================普通CRUD================

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

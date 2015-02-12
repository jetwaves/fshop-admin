var https = require('https');

var messenger = new Object();
messenger.appID = '';
messenger.appSecret = '';
messenger.appToken = '';
messenger.baseUrl = 'https://api.weixin.qq.com/';
messenger.getTokenAction = 'cgi-bin/token?grant_type=client_credential&appid=' + this.appID + '&secret=' + this.appSecret;
messenger.sendServiceMsgAction = '/cgi-bin/message/custom/send?access_token=';
messenger.getFansListAction = 'cgi-bin/user/get?access_token=';

messenger.createMessenger = function(app_id, app_secret){
		this.baseUrl = 'https://api.weixin.qq.com/';
		this.appID = app_id;
		this.appSecret = app_secret;
		this.getTokenAction = 'cgi-bin/token?grant_type=client_credential&appid=' + this.appID + '&secret=' + this.appSecret;
		this.sendServiceMsgAction = '/cgi-bin/message/custom/send?access_token=';
		this.getFansListAction = 'cgi-bin/user/get?access_token=';
		return this;
};

messenger.bulkSend = function(msg)
{
	// 获取token
	var fullUrl = this.baseUrl + this.getTokenAction; 	console.log(' full URL = ' + fullUrl);
	var _messenger = this;
	https.get(_messenger.baseUrl + _messenger.getTokenAction, function(res){
		console.log("statusCode: ", res.statusCode);
		console.log("headers: ", res.headers);
		res.on('data', function(body) {
			// console.log(' res.onData  body: ');			console.dir(body);
			parsedbody=JSON.parse(body);
			console.log(' res.onData  parsed Body');	console.dir(parsedbody);
			messenger.appToken = parsedbody.access_token;
			messenger.sendMessageToGroup(msg, '');

		});		
	}).on('error', function(errMsg){
		console.log(' https.onError ');		console.dir(errMsg)
	});
};

messenger.sendMessageToGroup = function (msg, nextOpenId )
{
	// 循环群发消息
	var getFansListURL = this.baseUrl + this.getFansListAction;
	getFansListURL = getFansListURL + this.appToken;
	// 获取用户列表	get方法，因此不同情况下path是不同的
	if (nextOpenId  == '' || nextOpenId  == null) {
		// 拉取第一批用户  getFansListURL 没有变化
	} else{
		// 用nextOpenId 做参数拉取下一批用户
		getFansListURL = getFansListURL + '&next_openid=' + nextOpenId
	};

	https.get(getFansListURL, function(res){
		res.on('data', function(body) {
			// console.log(' sendMessageToGroup res.onData  body: ');			console.dir(body);
			parsedbody=JSON.parse(body);
			// console.log(' sendMessageToGroup res.onData  parsed Body');	console.dir(parsedbody);
			total = parsedbody.total;
			count = parsedbody.count;
			data = parsedbody.data;
			next_openid = parsedbody.next_openid;
			console.log('	sendMessageToGroup 	body.total = ' + total);
			console.log('	sendMessageToGroup 	body.count = ' + count);
			console.log('	sendMessageToGroup 	body.next_openid = ' + next_openid);
			if (next_openid != '') {
				// 拉取下一组用户并发送消息
				this.sendMessageToGroup(msg, next_openid);
			} 
			if ( count == 0) {
				console.log('	sendMessageToGroup 	no more fans, exit loop');
				return; 
			};
			console.log('  body.data'); console.dir(data);;
			// oidList = data.openid;
			// console.log('  oidList'); console.dir(oidList);
			// 当前一组用户群发消息
			for(userIdx in data.openid){
				var uid = data.openid[userIdx];
				console.log('	sendMessageToGroup 	loop   uid = ' + uid);
				this.sendMessageToOpenId(msg, uid);
			}
		});		
	}).on('error', function(errMsg){
		console.log(' sendMessageToGroup.onError ');		console.dir(errMsg)
	});

};
messenger.sendMessageToOpenId = function (msg, openId)
{
	// 发送消息给一个用户
	if (openId == '') { return; };
	var optSendSingleMsg = {
		hostname: 'api.weixin.qq.com',
		port: 443,
		path: this.sendServiceMsgAction + this.appToken,
		method: 'POST',
	};
	var msgBody = 	{
					    "touser": openId, 
					    "msgtype": "text", 
					    "text": {
					        "content": msg
					    }
					};
	var msgBody02 = {
					    "touser": openId,
					    "msgtype":"news",
					    "news":{
					        "articles": [
					         {
					             "title":"花果山水果特价活动",
					             "description":"走过路过不要错过",
					             "url":"http://mp.weixin.qq.com/mp/appmsg/show?__biz=MjM5NjM4ODgyNA==&appmsgid=10000016&itemidx=1&sign=de8846e854ba25cc7298759d1cdc30b7#wechat_redirect",
					             "picurl":"http://mmsns.qpic.cn/mmsns/Cv5dXkfOQoU3yX9aA5OibWWs6F0oC3T7K0AliciaJNEBaRgVOqiasM1BTA/0"
					         },
					         {
					             "title":"好吃水果哪里强？",
					             "description":"花果山上大哥强",
					             "url":"http://mp.weixin.qq.com/mp/appmsg/show?__biz=MjM5NjM4ODgyNA==&appmsgid=10000012&itemidx=1&sign=952fb473103ab93c84608aa657ccbf82#wechat_redirect",
					             "picurl":"http://mmsns.qpic.cn/mmsns/Cv5dXkfOQoU3yX9aA5OibWWs6F0oC3T7KFZn4BskFlHSp9GaBOovm3w/0"
					         }
					         ]
					    }
					}

	postData = JSON.stringify(msgBody02);
	/*console.log('	sendMessageToOpenId: Trying:   send text message to :' + openId);
	console.log('   sendMessageToOpenId:   options = '); console.dir(optSendSingleMsg);*/
	var req = https.request(optSendSingleMsg, function(res) {
		res.on('data', function(res) {
			console.log('	sendMessageToOpenId: Success:   text message sent to :' + openId);
		});
	});
	req.write(postData);
	req.on('error', function(e) {
		console.log(' sendMessageToOpenId.onError ');
		console.error(e);
	});
	req.end();

};



module.exports = messenger;



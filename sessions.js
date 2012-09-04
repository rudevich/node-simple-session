//simple sessions module

var crypto = require('crypto');

var obj = {
		'salt':'supersecret',
		//sessions expiration timers | {session_id:expiration_timer,...}
		'array':{},
		//starting a session
		'start': function(){
				var md5 = crypto.createHash('md5');
				md5.update(Date.now()+obj.salt);
				var session_id = md5.digest('hex')
				if (obj.array.hasOwnProperty(session_id)) return obj.start();
				else
				{
					obj.time.set(session_id);
					return session_id;
				}
			},
		//stopping a session
		'stop': function(session_id){
				if (obj.array.hasOwnProperty(session_id))
				{
					delete obj.array[session_id];
					return true;
				}
				return false;
			},
		//check for session id
		'check': function(session_id){
				if (obj.array.hasOwnProperty(session_id))
				{
					obj.time.set(session_id);
					return true;
				}
				else return false;
			},
		//session livetime controller
		'time':{
				//remove session
				'up':function(session_id){
						if (obj.array.hasOwnProperty(session_id))
						{
							clearTimeout(obj.array[session_id]);
							delete obj.array[session_id];
						}
					},
				//set session time
				'set':function(session_id){
						if (obj.array.hasOwnProperty(session_id)) clearTimeout(obj.array[session_id]);
						obj.array[session_id] = setTimeout(function(){
								obj.time.up(session_id);
							}, (60*1000*60*24*10));
					}
			},
		//session storage {session_id:{key:value,..}}
		'storage':{}
	};

function init(req, res){
		//detecting the sesson or starting new session
		var cookies = [];
		req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
				var parts = cookie.split('=');
				cookies[parts[0].trim()] = (parts[1] || '').trim();
			});
		var session_id = cookies.hasOwnProperty('session')? cookies.session: '';

		if (session_id=='' || !obj.check(session_id))
		{
			session_id = obj.start();
			res.setHeader('Set-Cookie',['session='+session_id]);
		}
		return session_id;
	}

function set(session_id, key, value){
		if (obj.array.hasOwnProperty(session_id))
		{
			if(!obj.storage.hasOwnProperty(session_id)) obj.storage[session_id] = {};
			obj.storage[session_id][key] = value;
		}
		else return false;
	}

function get(session_id, key){
		if (obj.array.hasOwnProperty(session_id) && obj.storage.hasOwnProperty(session_id) && obj.storage[session_id].hasOwnProperty(key)) return [obj.storage[session_id][key]];
		else return false;
	}

module.exports.init = init;
module.exports.set = set;
module.exports.get = get;
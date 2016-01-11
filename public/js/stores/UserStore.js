/**
 * 用户数据存储
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/27
 * 
 */

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;

var FormatUtil = require('../utils/FormatUtil');

var CHANGE_EVENT = 'USER_CHANGE';

var _user = {};

var _favoriteProjectGroup = {};
var _postResult = {};

/**
 * 用户数据Store
 */
var UserStore = assign({}, EventEmitter.prototype, {

	POST_EVENT: 'POST_EVENT',

	QUERY_FAVORITE_EVENT: 'QUERY_FAVORITE_EVENT',

	setUser: function(user) {

		if (!FormatUtil.isEmpty(user)) {

			if (user[0]) {
				_user = user[0];
			}
			else {
				_user = user;
			}
			

			var storage = window.localStorage;

			if ( window.location.href.indexOf('alipay_wallet')!=-1 ){
				storage.userId_alipay = _user._id;
				storage.username_alipay = _user.name;
				storage.thumbnail_alipay = _user.thumbnail;
				storage.openId_alipay = _user.openid;
			} else{
				storage.userId = _user._id;
				storage.username = _user.name;
				storage.thumbnail = _user.thumbnail;
				storage.openId = _user.openid;
			}
			
		}
	},

	/**
	 * 取得用户信息
	 */
	getUser: function() {
		return _user;
	},

	/**
	 * 判断是否是用户收藏过的项目
	 */
	isFavoriteProject: function(projectId) {
		
		console.log('UserStore isFavoriteProject');
		console.log(_favoriteProjectGroup);
		if (projectId != null) {
			for (var key in _favoriteProjectGroup) {
				if (_favoriteProjectGroup[key].project_id == parseInt(projectId)) {
					return true;
				}
			}
		}
		return false;
	},

	/**
	 * 取得提交结果
	 */
	getPostResult: function() {

		if (!FormatUtil.isEmpty(_postResult)) {
			return _postResult;
		}
		return {};
	},

	/**
	 * 取得用户收藏的项目列表
	 */
	getFavoriteProjectGroup: function() {
		return _favoriteProjectGroup;
	},

	emitChange: function(event) {
		this.emit(event);
	},

	addChangeListener: function(event, callback) {
		this.on(event, callback);
	},

	removeChangeListener: function(event, callback) {
		this.removeListener(event, callback);
	}
});


/**
 * Dispatcher注册
 */
UserStore.dispatchToken = AppDispatcher.register(function(action) {

	switch(action.type) {

		// 查询到用户信息
		case ActionTypes.QUERY_USER:
			console.debug('UserStore QUERY_USER');
			console.debug(action.data);
			UserStore.setUser(action.data);
			UserStore.emitChange(UserStore.QUERY_USER_EVENT);
			break;

		// 查询到用户收藏项目
		case ActionTypes.QUERY_FAVORITE_PROJECT_GROUP:


			_favoriteProjectGroup = action.data;
			console.log('UserStore QUERY_FAVORITE_PROJECT_GROUP start');
			console.log(_favoriteProjectGroup);
			console.log('UserStore QUERY_FAVORITE_PROJECT_GROUP end');
			UserStore.emitChange(UserStore.QUERY_FAVORITE_EVENT);
			break;

		// 提交用户收藏项目
		case ActionTypes.POST_FAVORITE:

			_postResult = action.data;
			_postResult.time = (new Date()).getTime();

			UserStore.emitChange(UserStore.POST_EVENT);
			break;
	}

	return true;
});

module.exports = UserStore;
/**
 * 通知数据存储
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/22
 * 
 */

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;

var FormatUtil = require('../utils/FormatUtil');

var _newsGroup = {};

/**
 * 用户数据Store
 */
var NewsStore = assign({}, EventEmitter.prototype, {

	QUERY_NEWS_EVENT: 'QUERY_NEWS_EVENT',

	getNews: function(id) {

		for (var key in _newsGroup) {
			if (_newsGroup[key]._id == id) {
				return _newsGroup[key];
			}
		}

		return {};
	},

	/**
	 * 取得通知列表
	 */
	getNewsGroup: function() {
		return _newsGroup;
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
NewsStore.dispatchToken = AppDispatcher.register(function(action) {

	switch(action.type) {

		// 查询到用户信息
		case ActionTypes.QUERY_NEWS:
			console.debug('NewsStore QUERY_NEWS');
			console.debug(action.data);
			_newsGroup = action.data;
			NewsStore.emitChange(NewsStore.QUERY_NEWS_EVENT);
			break;
	}

	return true;
});

module.exports = NewsStore;
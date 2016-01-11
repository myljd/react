/**
 * 评论相关数据存储
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/29
 * 
 */

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;

var CHANGE_EVENT = 'change';

var FormatUtil = require('../utils/FormatUtil');

var _commentBriefMap = new Array();
var _commentGroupMap = new Array();
var _postResult = {};

/**
 * 项目数据Store
 */
var CommentStore = assign({}, EventEmitter.prototype, {

	POST_EVENT: 'POST_EVENT',

	QUERY_EVENT: 'QUERY_EVENT',

	QUERY_COMMENT_BRIEF_EVENT: 'QUERY_COMMENT_BRIEF_EVENT',

	/**
	 * 初始化
	 */
	init: function() {
		_commentBriefMap = new Array();
		_commentGroupMap = new Array();
		_postResult = {};
	},

	/**
	 * 取得评论简介
	 */
	getCommentBrief: function(projectId) {

		console.debug('CommentStore getCommentBrief');
		console.debug('projectId = ' + projectId);
		console.debug(_commentBriefMap);

		if (projectId != null && _commentBriefMap[projectId] != null) {
			return _commentBriefMap[projectId];
		}
		return null;
	},

	/**
	 * 取得评论列表
	 */
	getCommentGroup: function(projectId) {

		if(projectId != null && _commentGroupMap[projectId] != null) {
			return _commentGroupMap[projectId];
		}
		return null;
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
CommentStore.dispatchToken = AppDispatcher.register(function(action) {

	switch(action.type) {

		// 查询到评论列表
		case ActionTypes.QUERY_COMMENT_GROUP:

			var commentGroup = action.data;
			var projectId = action.projectId;
			_commentGroupMap[projectId] = commentGroup;

			CommentStore.emitChange(CommentStore.QUERY_EVENT);
			break;

		// 查询到评论简要信息
		case ActionTypes.QUERY_COMMENT_BRIEF:

			console.debug('CommentStore QUERY_COMMENT_BRIEF');
			console.debug(action.data);

			var commentBrief = action.data;
			var projectId = action.projectId;

			commentBrief.time = (new Date()).getTime();
			_commentBriefMap[projectId] = commentBrief;

			CommentStore.emitChange(CommentStore.QUERY_COMMENT_BRIEF_EVENT);
			break;

		// 提交评论结果
		case ActionTypes.POST_COMMENT:

			_postResult = action.data;
			_postResult.time = (new Date()).getTime();
			CommentStore.emitChange(CommentStore.POST_EVENT);
			break;

		case ActionTypes.LOCAL_COMMENT_QUERY:

			CommentStore.emitChange(CommentStore.QUERY_EVENT);
			break;
	}

	return true;
});

module.exports = CommentStore;
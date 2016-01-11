
/**
 * 数据查询Action
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/7
 * 
 */

var WebAPIUtil = require('../utils/WebAPIUtil');
var FormatUtil = require('../utils/FormatUtil');

var ActionTypes = require('../Constants/AppConstants').ActionTypes;

var CommentStore = require('../stores/CommentStore');
var ProjectStore = require('../stores/ProjectStore');
var UserStore = require('../stores/UserStore');
var LocationStore = require('../stores/LocationStore');

var AppDispatcher = require('../dispatcher/AppDispatcher');

/**
 * 查询处理
 */
var QueryAction = {

	/**
	 * 通过Ping结果判断资源地址
	 */
	queryResourcePath: function() {
		console.log('QueryAction queryResourcePath');
		WebAPIUtil.execPing();
	},

	/**
	 * 查询信息列表
	 */
	queryNewsGroup: function() {
		WebAPIUtil.queryNewsGroup();
	},

	/**
	 * 取得本机最后一次定位
	 */
	getLocalLocation: function() {

		console.debug('QueryAction getLocalLocation');

		var storage = window.localStorage;
		var location = {};

		if (storage.lng_foot && storage.lng_foot != 'undefined') {
			location = {
				lng: storage.lng_foot,
				lat: storage.lat_foot
			};
		}

		return location;
	},

	/**
	 * 取得本机用户
	 */
	getLocalUser: function() {

		console.debug('QueryAction getLocalUser');

		var storage = window.localStorage;
		var user = {}

		if (storage.openId && storage.openId != 'undefined') {
			user = {
				openid: storage.openId,
				name: storage.username,
				thumbnail: storage.thumbnail
			}
		}

		console.debug(user);

		return user;
	},

	/**
	 * 取得本机支付宝用户
	 */
	getAlipayLocalUser: function() {

		console.debug('QueryAction getAlipayLocalUser');

		var storage = window.localStorage;
		var user = {};
		if (storage.openId_alipay && storage.openId_alipay != 'undefined') {
			user = {
				openid: storage.openId_alipay,
				name: storage.username_alipay,
				thumbnail: storage.thumbnail_alipay
			}
		}
		console.debug(user);

		return user;
	},

	/**
	 * 查询用户
	 */
	queryUser: function(user) {
		console.debug('QueryAction queryUser');
		WebAPIUtil.queryUser(user);
	},

	/**
	 * 取得设施列表
	 */
	queryFacilityGroup: function() {

		console.log('QueryAction queryFacilityGroup');
		WebAPIUtil.queryFacilityGroup();
	},

	/**
	 * 取得项目定义列表
	 */
	queryProjectDefGroup: function() {

		console.log('QueryAction queryProjectDefGroup');
		WebAPIUtil.queryProjectDefGroup();
	},

	/**
	 * 取得项目详细信息
	 */
	queryProjectDetail: function(projectId) {

		console.debug('QueryAction queryProjectDetail projectId = ' + projectId);
		WebAPIUtil.queryProjectDetail(projectId);
	},

	/**
	 * 取得项目详细信息详情内容
	 */
	queryProjectDetailContent: function(projectId, needTimeCheck) {

		console.log('QueryAction queryProjectDetailContent');
		var projectDetail = ProjectStore.getProjectDetail(projectId, needTimeCheck);
		
		if (projectDetail == null || projectDetail.detail == null) {
			WebAPIUtil.queryProjectDetailContent(projectId);
		}
		else {
			AppDispatcher.dispatch({
				type: ActionTypes.LOCAL_PROJECT_QUERY,
				event: ProjectStore.QUERY_DETAIL_EVENT
			});
		}
	},

	/**
	 * 取得我的附近项目列表
	 */
	queryNearbyProjectLocationGroup: function() {

		var location = LocationStore.getLocation();
		console.log('QueryAction queryNearbyProjectLocationGroup');
		console.log(location);
		WebAPIUtil.queryNearbyProjectLocationGroup(location.lng, location.lat);
	},

	/**
	 * 取得项目排队信息
	 */
	queryProjectQueue: function(projectId) {
		WebAPIUtil.queryProjectQueue(projectId);
	},

	/**
	 * 取得附近项目信息列表
	 */
	queryNearbyProjectQueueGroup: function(latitude, longitude) {
		WebAPIUtil.queryNearbyProjectQueueGroup(latitude, longitude);
	},

	/**
	 * 取得收藏项目信息列表
	 */
	queryFavoriteProjectGroup: function() {

		console.log('QueryAction queryFavoriteProjectGroup');
		var userId = UserStore.getUser()._id;
		WebAPIUtil.queryFavoriteProjectGroup(userId);
	},

	/**
	 * 取得项目排队信息列表
	 */
	queryProjectQueueGroup: function() {
		WebAPIUtil.queryProjectQueueGroup();
	},

	/**
	 * 取得项目基本信息列表
	 */
	queryProjectGroup: function(category) {

		var location = LocationStore.getLocation();
		WebAPIUtil.queryProjectGroup(category, location);
	},

	/**
	 * 取得足迹信息
	 */
	queryFootbById: function() {
		var userId = UserStore.getUser()._id;
		WebAPIUtil.queryFootbById(userId);
	},
	/**
	 * 获取导航纪录
	 */
	getAllNavRecord: function() {
		var userId = UserStore.getUser()._id;
		WebAPIUtil.getAllNavRecord(userId);
	},
	/**
	 * 获取所有项目信息
	 */
	getAllProject: function() {
		WebAPIUtil.getAllProject();
	},
	/**
	 * 取得搜索关键字
	 */
	queryProjectKeywords: function() {

		console.log('QueryAction queryProjectKeywords');
		var projectKeywords = ProjectStore.getProjectKeywords();

		if (FormatUtil.isEmpty(projectKeywords)) {
			WebAPIUtil.queryProjectKeywords();
		}
		else {
			AppDispatcher.dispatch({
				type: ActionTypes.LOCAL_PROJECT_QUERY,
				event: ProjectStore.QUERY_KEYWORD_EVENT
			});
		}
	},

	/**
	 * 取得评论简要信息
	 */
	queryCommentBrief: function(projectId) {

		// var brief = CommentStore.getCommentBrief(projectId);
		
		// if (brief == null) {
			WebAPIUtil.queryCommentBrief(projectId);
		// }
		// else {
		// 	AppDispatcher.dispatch({
		// 		type: ActionTypes.LOCAL_COMMENT_QUERY
		// 	});
		// }
	},

	/**
	 * 取得评论列表
	 */
	queryCommentGroup: function(projectId) {

		console.debug('WebAPIUtil queryCommentGroup');
		// var commentGroup = CommentStore.getCommentGroup(projectId);
		
		// if (commentGroup == null) {
		WebAPIUtil.queryCommentGroup(projectId);
		// }
		// else {
		// 	AppDispatcher.dispatch({
		// 		type: ActionTypes.LOCAL_COMMENT_QUERY
		// 	});
		// }
	}

	// /**
	//  * 取得评论列表（某用户对某项目的评论列表）
	//  */
	// queryCommentGroup: function(projectId, userId) {
	// 	WebAPIUtil.queryCommentGroup(projectId, userId);
	// }
};

module.exports = QueryAction;
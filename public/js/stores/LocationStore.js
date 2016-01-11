/**
 * 定位相关数据存储
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/19
 * 
 */

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;

var CHANGE_EVENT = 'change';

var FormatUtil = require('../utils/FormatUtil');

var _location = {};
var _projectLocations = new Array();
var _mapFoot = {};
var _navStart = {};
var _navEnd = {};
var _allNavRecord = {};
var _busPlan ={};
var _allProject ={};
var is_start_in;
var _alipayUserInfo ={};
/**
 * 定位数据Store
 */
var LocationStore = assign({}, EventEmitter.prototype, {

	LOCATION_EVENT: 'LOCATION_EVENT',
	PROJECT_LOCATION_EVENT: 'PROJECT_LOCATION_EVENT',
	LOCATION_MAP_FOOT:'LOCATION_MAP_FOOT',
	LOCATION_NAV_START:'LOCATION_NAV_START',
	LOCATION_NAV_END:'LOCATION_NAV_END',
	JUMP_TO_NAV_RESULT:'JUMP_TO_NAV_RESULT',
	QUERY_ALL_NAV_RECORD:'QUERY_ALL_NAV_RECORD',
	DELETE_NAV_RECORD:'DELETE_NAV_RECORD',
	SAVE_NAV_RECORD:'SAVE_NAV_RECORD',
	LOCATION_BUS_PLAN:'LOCATION_BUS_PLAN',
	LOCATION_ALL_PROJECT:'LOCATION_ALL_PROJECT',
	LOCATION_GET_WX:'LOCATION_GET_WX',
	LOCATION_LOADING_HIDE:'LOCATION_LOADING_HIDE',
	IS_START_IN:'IS_START_IN',
	POST_ALIPAY_USERINFO:'POST_ALIPAY_USERINFO',
	/**
	 * 设置定位
	 */
	setLocation: function(location) {
		_location = location;
	},

	/**
	 * 取得最新定位
	 */
	getLocation: function() {
		return _location;
	},

	/**
	 * 取得支付宝用户信息
	 */
	getAlipayUserInfo: function() {
		return _alipayUserInfo;
	},
	

	getAllNavRecord: function() {
		return _location;
	},

	getIsStartIn: function() {
		return is_start_in;
	},

	/**
	 * 取得足迹数据
	 */
	getMapFoot: function() {
		return _mapFoot;
	},
	/**
	 * 取得起始点查询后数据
	 */
	getNavStart: function() {
		return _navStart;
	},
	/**
	 * 取得目的地查询后数据
	 */
	getNavEnd: function() {
		return _navEnd;
	},
	/**
	 * 获取所有项目信息
	 */
	getAllProject: function() {
		return _allProject;
	},
	/**
	 * 取得导航纪录数据
	 */
	getAllNavRecord: function() {
		return _allNavRecord;
	},
	/**
	 * 取得公交路线
	 */
	getBusPlan: function() {
		return _busPlan;
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
LocationStore.dispatchToken = AppDispatcher.register(function(action) {

	switch(action.type) {

		case ActionTypes.LOCATE_POSITION:
			console.log('LOCATE_POSITION');
			console.log(localStorage.lng_foot,localStorage.lat_foot,localStorage.cityCode_foot,localStorage.update_time);
			//本地数据存储
			_location = {
				lng: localStorage.lng_foot,
				lat: localStorage.lat_foot,
				cityCode: localStorage.cityCode_foot,
				updateTime:localStorage.update_time,
			}
			//足迹数据储存
			if (localStorage.my_foot_data==null ) {
				localStorage.my_foot_data = localStorage.lng_foot + ',' + localStorage.lat_foot + ',' + localStorage.update_time;
			} else {
				localStorage.my_foot_data += "|" + localStorage.lng_foot + ',' + localStorage.lat_foot + ',' + localStorage.update_time;
			}
			LocationStore.emitChange(LocationStore.LOCATION_EVENT);
			break;

		//----------------------地图相关  start----------------------------
		case ActionTypes.QUERY_MAP_FOOT:
			_mapFoot = action.data;
			LocationStore.emitChange(LocationStore.LOCATION_MAP_FOOT);
			break;
		case ActionTypes.QUERY_NAV_START:
			_navStart = action.data;
			LocationStore.emitChange(LocationStore.LOCATION_NAV_START);
			break;
		case ActionTypes.QUERY_NAV_END:
			_navEnd = action.data;
			LocationStore.emitChange(LocationStore.LOCATION_NAV_END);
			break;
		case ActionTypes.JUMP_TO_NAV_RESULT:
			LocationStore.emitChange(LocationStore.JUMP_TO_NAV_RESULT);
			break;
		case ActionTypes.QUERY_ALL_NAV_RECORD:
			_allNavRecord = action.data;
			LocationStore.emitChange(LocationStore.QUERY_ALL_NAV_RECORD);
			break;
		case ActionTypes.DELETE_NAV_RECORD:
			LocationStore.emitChange(LocationStore.DELETE_NAV_RECORD);
			break;
		case ActionTypes.SAVE_NAV_RECORD:
			LocationStore.emitChange(LocationStore.SAVE_NAV_RECORD);
			break;
		case ActionTypes.LOCATION_BUS_PLAN:
			_busPlan = action.data;
			LocationStore.emitChange(LocationStore.LOCATION_BUS_PLAN);
			break;
		case ActionTypes.QUERY_ALL_PROJECT:
			_allProject = action.data;
			LocationStore.emitChange(LocationStore.LOCATION_ALL_PROJECT);
			break;
		case ActionTypes.POST_GET_WX:
			LocationStore.emitChange(LocationStore.LOCATION_GET_WX);
			break;
		case ActionTypes.LOCATION_LOADING_HIDE:
			LocationStore.emitChange(LocationStore.LOCATION_LOADING_HIDE);
			break;
		case ActionTypes.LODING_SHOW:
			LocationStore.emitChange(LocationStore.LODING_SHOW);
			break;
		case ActionTypes.LODING_HIDE:
			LocationStore.emitChange(LocationStore.LODING_HIDE);
			break;
		case ActionTypes.IS_START_IN:
			LocationStore.emitChange(LocationStore.IS_START_IN);
			break;
		case ActionTypes.POST_ALIPAY_USERINFO:
			_alipayUserInfo = action.data;
			LocationStore.emitChange(LocationStore.POST_ALIPAY_USERINFO);
			break;
		//----------------------地图相关  end ----------------------------
	}

	return true;
});

module.exports = LocationStore;
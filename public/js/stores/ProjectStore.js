/**
 * 项目相关数据存储
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/7
 * 
 */

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var LocationStore = require('./LocationStore');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/AppConstants');
var ActionTypes = Constants.ActionTypes;

var FormatUtil = require('../utils/FormatUtil');

var _districtArray = [];
var _facilityArray = [];
var _publicArray = [];
var _foodArray = [];
var _foodGroup = [];
var _branchArray = [];

var _projectKeywords = {};
var _postResult = {};
var _resourcePath = Constants.Url.QINIU_URL;

/**
 * 项目数据Store
 */
var ProjectStore = assign({}, EventEmitter.prototype, {

	QUERY_ALL_FACILITY_EVENT: 'QUERY_ALL_FACILITY_EVENT',
	QUERY_ALL_DISTRICT_EVENT: 'QUERY_ALL_DISTRICT_EVENT',
	QUERY_ALL_PUBLIC_EVENT: 'QUERY_ALL_PUBLIC_EVENT',
	QUERY_ALL_FOOD_EVENT: 'QUERY_ALL_FOOD_EVENT',
	QUERY_ALL_BRANCH_EVENT: 'QUERY_ALL_BRANCH_EVENT',
	QUERY_DETAIL_EVENT: 'QUERY_DETAIL_EVENT',
	QUERY_SEARCH_EVENT: 'QUERY_SEARCH_EVENT',
	QUERY_NEARBY_EVENT: 'QUERY_NEARBY_EVENT',
	QUERY_KEYWORD_EVENT: 'QUERY_KEYWORD_EVENT',
	POST_EVENT: 'POST_EVENT',

	/**
	 * 取得资源路径
	 */
	getResourcePath: function() {
		return _resourcePath;
	},

	/**
	 * 取得设施列表
	 *     districtId: 区域ID，设定时取得该区域项目列表
	 */
	getFacilityGroup: function(districtId) {

		// 未设定区域ID，则取得所有设施
		if (!districtId) {
			return _facilityArray;
		}

		// 设定区域ID，取得该区域下得所有设施
		var resultList = [];
		for (var i = 0; i < _facilityArray.length; i++) {
			if (_facilityArray[i].parent_id == districtId) {
				resultList[i] = _facilityArray[i];
			}
		}

		return resultList;
	},

	/**
	 * 取得分设施雷彪
	 *     facilityId: 设施ID
	 */
	getBranchGroup: function(facilityId) {

		// console.log('ProjectStore getBranchGroup facilityId=' + facilityId);

		if (!facilityId) {
			return [];
		}

		var resultList = [];
		for (var i = 0; i < _branchArray.length; i++) {
			if (_branchArray[i].parent_id == facilityId) {
				resultList[i] = _branchArray[i];
			}
		}

		// console.log(resultList);

		return resultList;
	},

	/**
	 * 取得区域列表
	 */
	getDistrictGroup: function() {
		return _districtArray;
	},

	/**
	 * 取得所有项目
	 */
	getAllProject: function() {

		var resultList = new Array();
		for (var key in _projectDetailMap) {
			var project = _projectDetailMap[key];
			if (project.category == Constants.Category.FACILITY) {
				resultList.push(project);
			}
		}

		return resultList;
	},


	/**
	 * 根据关键字搜索项目
	 */
	getProjectKeywordGroup: function(keyword) {

		// console.log('getProjectKeywordGroup');
		// console.log(keyword);

		var resultList = [];

		if (FormatUtil.isEmpty(keyword)) {
			return {};
		}
		else {
			for (var i = 0; i < _facilityArray.length; i++) {
				if (_facilityArray[i].name.indexOf(keyword) >= 0) {
					resultList.push(_facilityArray[i]);
				}
			}
			for (var i = 0; i < _districtArray.length; i++) {
				if (_districtArray[i].name.indexOf(keyword) >= 0) {
					resultList.push(_districtArray[i]);
				}
			}
			for (var i = 0; i < _publicArray.length; i++) {
				if (_publicArray[i].name.indexOf(keyword) >= 0) {
					resultList.push(_publicArray[i]);
				}
			}
			for (var i = 0; i < _foodArray.length; i++) {
				if (_foodArray[i].name.indexOf(keyword) >= 0) {
					resultList.push(_foodArray[i]);
				}
			}
		}

		return resultList;
	},

	/**
	 * 取得项目详细信息
	 */
	getProjectDetail: function(projectId) {

		console.log('abc getProjectDetail projectId = ' + projectId);
		console.log(_facilityArray);
		console.log(_districtArray);
		console.log(_branchArray);

		if (projectId == null) {
			return {};
		}

		for (var i = 0; i < _facilityArray.length; i++) {
			if (_facilityArray[i]._id == projectId) {
				var facility = _facilityArray[i];
				var branches = this.getBranchGroup(projectId);
				if (!FormatUtil.isEmpty(branches)) {
					facility.projects = branches;
				}
				return facility;
			}
		}

		for (var i = 0; i < _districtArray.length; i++) {
			if (_districtArray[i]._id == projectId) {
				var district = _districtArray[i];
				district.projects = this.getFacilityGroup(projectId);
				return district;
			}
		}

		for (var i = 0; i < _foodArray.length; i++) {
			if (_foodArray[i]._id == projectId) {
				return _foodArray[i];
			}
		}

		for (var i = 0; i < _publicArray.length; i++) {
			if (_publicArray[i]._id == projectId) {
				return _publicArray[i];
			}
		}

		for (var i = 0; i < _branchArray.length; i++) {
			if (_branchArray[i]._id == projectId) {
				var branch = _branchArray[i];
				var branches = this.getBranchGroup(projectId);
				if (!FormatUtil.isEmpty(branches)) {
					branch.projects = branches;
				}
				return branch;
			}
		}



		return {};
	},

	setNearbyFoodGroup: function(foodGroup) {

		var _resultGroup = [];

		if (!FormatUtil.isEmpty(foodGroup)) {

			for (var i = 0; i < foodGroup.length; i++) {
				_resultGroup.push(foodGroup[i]);
			}
			console.log(_resultGroup);
		}

		for (var i = 0; i < _foodArray.length; i++) {
			console.log(_foodArray[i] + ' ' + (_foodArray[i]._id > 0));
			if (_foodArray[i]._id > 0) {
				_resultGroup.push(_foodArray[i]);
			}
		}
		
		console.log(_resultGroup);

		_foodArray = _resultGroup;
	},

	/**
	 * 取得我的附近项目列表
	 */
	getNearbyProjectGroup: function(category) {

		console.debug('ProjectStore getNearbyProjectGroup category=' + category);

		switch(category) {

		case Constants.Category.FACILITY:
			console.debug(_facilityArray);
			return _facilityArray;
		case Constants.Category.PUBLIC:
			return _publicArray;
		case Constants.Category.FOOD:
			return _foodArray;	
			// return _foodGroup;
		default:
			return [];
		}

	},

	/**
	 * 取得项目搜索关键字列表
	 */
	getProjectKeywords: function() {
		return _projectKeywords;
	},

	/**
	 * 取得提交结果
	 */
	getPostResult: function() {
		return _postResult;
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
 * 取得资源路径（判断数据源路径）
 */
function getResourceUrl(url , flag) {
	
	var resourcePath = ProjectStore.getResourcePath();

	// 资源路径是阿里云
	if (resourcePath.indexOf('qiniucdn') >= 0) {
		// 七牛路径还不能访问
		if (flag == 0) {
			url = Constants.Url.IMG_URL + url;
		}
		// 七牛可以访问
		else {
			url = resourcePath + url;
		}
			
	}
	// 资源路径是园区内
	else {
		url = resourcePath + url;
	}
	return url;
}

/**
 * 取得距离
 */
function getDistance(uLocation, pLocation) {

	// 如果当前有定位信息，计算距离
	if (!FormatUtil.isEmpty(uLocation)) {
		return FormatUtil.getDistanceRange(uLocation.lng, uLocation.lat, pLocation[0], pLocation[1]);
	}
	else {
		return '距离获取中';
	}
}

/**
 * 初始化项目详细信息数据
 */
function initialProjectDetail(project) {

	// 初始化缩略图
	if (!project.thumbnail) {
		project.thumbnail = Constants.Images.DEFAULT_SQUARE;
	}
	else {
		project.thumbnail = getResourceUrl(project.thumbnail, project.flag);
	}

	// 初始化评分
	if (!project.rating) {
		project.rating = 5;
	}

	// 初始化排队信息
	if (!project.queue) {
		project.queue = {
			monitored: 0
		}
	}

	// 初始化位置信息
	if (!project.location) {
		project.location = {
			distance: '距离获取中'
		}
	}
	else {
		var location = LocationStore.getLocation();
		project.location.distance = getDistance(location, project.location);
	}

	// 初始化资源路径
	if(!FormatUtil.isEmpty(project.resources)) {
		var resources = project.resources;
		for (var i = 0; i < resources.length; i++) {
			var url = getResourceUrl(resources[i].url, resources[i].flag);
			resources[i].url = url;
		}
	}
	else {
		project.resources = [];
	}

	return project;
}

function sortByDistance(project1, project2) {

	var distance1 = project1.location.distance;
	var distance2 = project2.location.distance;

	if (distance1 && distance2) {

		if (distance1 == '距离获取中' || distance2 == '距离获取中') {
			return -1;
		}
		else {
			return parseInt(distance1) - parseInt(distance2)
		}
	}
	else {
		return -1;
	}
}

/**
 * Dispatcher注册
 */
ProjectStore.dispatchToken = AppDispatcher.register(function(action) {

	switch(action.type) {

		case ActionTypes.INTERNAL_PING:

			// 如果PING通内网，使用内网资源路径
			if (action.data) {
				_resourcePath = Constants.Url.INTERNAL_IMG_URL;
				console.log('PING成功，地址为：' + _resourcePath);
			}
			// PING不通，从七牛上取得资源
			else {
				_resourcePath = Constants.Url.QINIU_URL;
				console.log('PING失败，地址为：' + _resourcePath);
			}
			break;

		// 获取的最新定位，更新距离信息
		case ActionTypes.LOCATE_POSITION:

			// console.log('LOCATE_POSITION');

			var uLocation = {
				lng: localStorage.lng_foot,
				lat: localStorage.lat_foot,
			}

			for (var i = 0; i < _districtArray.length; i++) {
				var district = _districtArray[i];
				district.location.distance = getDistance(uLocation, district.location);
				// console.log(district);
				// console.log('District Distance = ' + district.location.distance);
				_districtArray[i] = district;
			}
			_districtArray = _districtArray.sort(sortByDistance);

			for (var i = 0; i < _facilityArray.length; i++) {
				var facility = _facilityArray[i];
				facility.location.distance = getDistance(uLocation, facility.location);
				// console.log(facility);
				// console.log('Facility Distance = ' + facility.location.distance);
				_facilityArray[i] = facility;
			}
			_facilityArray = _facilityArray.sort(sortByDistance);

			for (var i = 0; i < _publicArray.length; i++) {
				var publics = _publicArray[i];
				publics.location.distance = getDistance(uLocation, publics.location);
				// console.log(publics);
				// console.log('Public Distance = ' + publics.location.distance);
				_publicArray[i] = publics;
			}
			_publicArray = _publicArray.sort(sortByDistance);

			for (var i = 0; i < _foodArray.length; i++) {
				var food = _foodArray[i];
				food.location.distance = getDistance(uLocation, food.location);
				// console.log(food);
				// console.log('Food Distance = ' + food.location.distance);
				_foodArray[i] = food;
			}
			_foodArray = _foodArray.sort(sortByDistance);

			ProjectStore.emitChange(ProjectStore.QUERY_ALL_DISTRICT_EVENT);
			ProjectStore.emitChange(ProjectStore.QUERY_ALL_FACILITY_EVENT);
			ProjectStore.emitChange(ProjectStore.QUERY_ALL_PUBLIC_EVENT);
			ProjectStore.emitChange(ProjectStore.QUERY_ALL_FOOD_EVENT);
			break;

		// 查询到项目详细信息
		case ActionTypes.QUERY_PROJECT_DETAIL:

			var projectDetail = action.data;

			var projectId = projectDetail._id;
			var category = projectDetail.category;

			console.log('abc ProjectStore QUERY_PROJECT_DETAIL id = ' + projectId);

			// 通过判断category来更新项目详情
			if (category == Constants.Category.DISTRICT) {
				for (var i = 0; i < _districtArray.length; i++) {
					if (_districtArray[i]._id == projectId) {
						_districtArray[i] = initialProjectDetail(projectDetail);
						break;
					}
				}
			}
			else if (category == Constants.Category.FACILITY) {
				for (var i = 0; i < _facilityArray.length; i++) {
					if (_facilityArray[i]._id == projectId) {
						_facilityArray[i] = initialProjectDetail(projectDetail);
						break;
					}
				}
			}
			else if (category == Constants.Category.PUBLIC) {
				for (var i = 0; i < _publicArray.length; i++) {
					if (_publicArray[i]._id == projectId) {
						_publicArray[i] = initialProjectDetail(projectDetail);
						break;
					}
				}
			}
			else if (category == Constants.Category.FOOD) {
				for (var i = 0; i < _foodArray.length; i++) {
					if (_foodArray[i]._id == projectId) {
						_foodArray[i] = initialProjectDetail(projectDetail);
						break;
					}
				}
			}

			ProjectStore.emitChange(ProjectStore.QUERY_DETAIL_EVENT);
			break;

		// 查询所有区域列表
		case ActionTypes.QUERY_PROJECT_GROUP_DISTRICT:

			console.log('abc ProjectStore QUERY_PROJECT_GROUP_DISTRICT');

			_districtArray = action.data;
			for (var i = 0; i < _districtArray.length; i++) {
				_districtArray[i] = initialProjectDetail(_districtArray[i]);
			}

			ProjectStore.emitChange(ProjectStore.QUERY_ALL_DISTRICT_EVENT);
			break;

		// 查询所有设施列表
		case ActionTypes.QUERY_PROJECT_GROUP_FACILITY:

			console.log('abc ProjectStore QUERY_PROJECT_GROUP_FACILITY');
			
			_facilityArray = action.data;
			for (var i = 0; i < _facilityArray.length; i++) {
				_facilityArray[i] = initialProjectDetail(_facilityArray[i]);
			}

			ProjectStore.emitChange(ProjectStore.QUERY_ALL_FACILITY_EVENT);
			break;

		// 查询所有公共列表
		case ActionTypes.QUERY_PROJECT_GROUP_PUBLIC:
			
			_publicArray = action.data;
			for (var i = 0; i < _publicArray.length; i++) {
				_publicArray[i] = initialProjectDetail(_publicArray[i]);
			}

			ProjectStore.emitChange(ProjectStore.QUERY_ALL_PUBLIC_EVENT);
			break;

		// 查询所有美食列表
		case ActionTypes.QUERY_PROJECT_GROUP_FOOD:

			var _resultGroup = [];
			for (var key in _foodArray) {
				console.log(_foodArray[key]);
				if (isNaN(_foodArray[key]._id)) {
					_resultGroup.push(_foodArray[key]);
				}
			}

			_foodArray = action.data;
			for (var i = 0; i < _foodArray.length; i++) {
				_resultGroup.push(initialProjectDetail(_foodArray[i]));
			}
			_foodArray = _resultGroup;


			ProjectStore.emitChange(ProjectStore.QUERY_ALL_FOOD_EVENT);
			break;

		// 查询所有子设施列表
		case ActionTypes.QUERY_PROJECT_GROUP_BRANCH:

			console.log('QUERY_PROJECT_GROUP_BRANCH');
			// console.log(action.data);
			
			_branchArray = action.data;
			for (var i = 0; i < _branchArray.length; i++) {
				_branchArray[i] = initialProjectDetail(_branchArray[i]);
			}
			// console.log(_branchArray);

			ProjectStore.emitChange(ProjectStore.QUERY_ALL_BRANCH_EVENT);
			break;

		// 查询到项目搜索关键字列表
		case ActionTypes.QUERY_PROJECT_KEYWORDS:
			_projectKeywords = action.data;

			ProjectStore.emitChange(ProjectStore.QUERY_KEYWORD_EVENT);
			break;

		// 本地数据查询
		case ActionTypes.LOCAL_PROJECT_QUERY:

			var event = action.event;
			ProjectStore.emitChange(event);
			break;

		default:
			return true;
	}

	return true;
});

module.exports = ProjectStore;
/**
 * 我的附近界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/7
 * 
 */

var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;

var Constants = require('../../constants/AppConstants');

var ListItem = require('../component/ListItem.react');
var Toast = require('../component/Toast.react');
var Prompt = require('../component/Prompt.react');

var AppHeader = require('../AppHeader.react');
var ProjectList = require('../ProjectList.react');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var QueryAction = require('../../actions/QueryAction');

var ProjectStore = require('../../stores/ProjectStore');
var LocationStore = require('../../stores/LocationStore');

var SELECTION_FACILITY = 0;
var SELECTION_FOOD = 1;
var SELECTION_GIFT = 2;
var SELECTION_PUBLIC = 3;
var SELECTION_EDUCATION = 4;
var SELECTION_SHOW = 5;
var SELECTION_AMUSEMENT = 6;

var _selection = SELECTION_EDUCATION;
var _foodProjects = [];

/**
 * 我的收藏
 */
var NearbyPage = React.createClass({

	mixins: [Navigation, State],

	_goToClicked: false,

	getInitialState: function() {
		return {
			projects: []
		};
	},

	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
		LocationStore.removeChangeListener(LocationStore.LOCATION_EVENT, this._onLocationChange);
	},

	componentWillUpdate: function() {

	},

	componentDidUpdate: function() {
		
		this.refs.projects.scrollToTop();

		ViewUtil.hasfixBar();

		setTimeout(this.refs.prompt.hide, 200);
	},

	componentDidMount: function() {

		// if (_selection == SELECTION_GIFT) {
		// 	_selection = SELECTION_FACILITY;
		// }

		// $('#projectItem').removeClass('nearby-select');
		// $('#foodItem').removeClass('nearby-select');
		// $('#commodityItem').removeClass('nearby-select');
		// $('#publicItem').removeClass('nearby-select');
		// switch(_selection) {

		// case SELECTION_FACILITY:
		// 	$('#projectItem').addClass('nearby-select');
		// 	break;
		// case SELECTION_FOOD:
		// 	$('#foodItem').addClass('nearby-select');
		// 	break;
		// case SELECTION_PUBLIC:
		// 	$('#publicItem').addClass('nearby-select');
		// 	break;
		// }

		// $('#projectItem').bind('tap', this._onSelectProject);
		// $('#foodItem').bind('tap', this._onSelectFood);
		// $('#commodityItem').bind('tap', this._onSelectCommodity);
		// $('#publicItem').bind('tap', this._onSelectPublic);

		// $('.nearby-bar').bind('touchmove', this._onTouchBar);

		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
		LocationStore.addChangeListener(LocationStore.LOCATION_EVENT, this._onLocationChange);

		var location = LocationStore.getLocation();
		if (!location) {
			this.refs.toast.show('定位中，请稍候');
		}

		this._promptAndUpdate();
	},

	/**
	 * 提示即将更新
	 */
	_promptAndUpdate: function() {
		this.refs.prompt.show('载入中，请稍候');
		console.log('prompt show');
		setTimeout(this._updateProjects, 100);
	},

	/**
	 * 更新列表
	 */
	_updateProjects: function() {

		console.log('_updateProjects selection=' + _selection);

		switch (_selection) {

		case SELECTION_GIFT:
			this.setState({
				projects: ProjectStore.getNearbyProjectGroup(Constants.Category.COMMODITY),
				selectedType: _selection,
			});
			break;
		case SELECTION_PUBLIC:
			this.setState({
				projects: ProjectStore.getNearbyProjectGroup(Constants.Category.PUBLIC),
				selectedType: _selection,
			});
			break;
		case SELECTION_FOOD:
			this.setState({
				projects: ProjectStore.getNearbyProjectGroup(Constants.Category.FOOD),
				selectedType: _selection,
			});
			break;
		default:
			var projects = ProjectStore.getNearbyProjectGroup(Constants.Category.FACILITY);
			// projects = this._getProjectsByCategory(projects, _selection);

			this.setState({
				projects: projects,
				selectedType: _selection,
			});
		}
	},

	_getProjectsByCategory: function(projects, selection) {

		var tmpProjects = [];
		for (var i = 0; i < projects.length; i++) {

			var project = projects[i];
			if ((selection == SELECTION_EDUCATION && project.category_type == '0') ||
				(selection == SELECTION_SHOW && project.category_type == '1') ||
				(selection == SELECTION_AMUSEMENT && project.category_type == '2')) {
				tmpProjects.push(project);
			}
		}

		return tmpProjects;
	},

	render: function() {

		// 生成项目列表
		var projectComps = [];
		var projects = this.state.projects;
		var selection = this.state.selectedType;
		console.debug(projects);

		return (
			<div>
				<div className='cover'>
					<AppHeader title='我的附近' backBtn />
				</div>
				<div className='container'>
					<div className='nearby-bar'>
						<div className='nearby-row'>
							<div onClick={this._selectEducation} className={this.state.selectedType == SELECTION_EDUCATION ? 'selected' : ''} >
								科普教育
							</div>
							<div onClick={this._selectShow} className={this.state.selectedType == SELECTION_SHOW ? 'selected' : ''} >
								演艺演出
							</div>
							<div onClick={this._selectAmusement} className={this.state.selectedType == SELECTION_AMUSEMENT ? 'selected' : ''} >
								主题游乐
							</div>
						</div>
						<div className='nearby-row'>
							<div onClick={this._selectFood} className={this.state.selectedType == SELECTION_FOOD ? 'selected' : ''} >
								心动美食
							</div>
							<div onClick={this._selectGift} className={this.state.selectedType == SELECTION_GIFT ? 'selected' : ''}>
								创意礼品
							</div>
							<div onClick={this._selectPublic} className={this.state.selectedType == SELECTION_PUBLIC ? 'selected' : ''}>
								公共服务
							</div>
						</div>
					</div>
					<ProjectList ref='projects' projects={projects} onTapItem={this._onTapItem}/>
				</div>
				<Toast ref='toast' />
				<Prompt ref='prompt' />
			</div>
		);
	},

	/**
	 * 点击科普教育
	 */
	_selectEducation: function() {

		_selection = SELECTION_EDUCATION;
		this._promptAndUpdate();
	},

	/**
	 * 点击演艺演出
	 */
	_selectShow: function() {

		_selection = SELECTION_SHOW;
		this._promptAndUpdate();
	},

	/**
	 * 点击主题游乐
	 */
	_selectAmusement: function() {

		_selection = SELECTION_AMUSEMENT;
		this._promptAndUpdate();
	},

	/**
	 * 点击心动美食
	 */
	_selectFood: function() {

		_selection = SELECTION_FOOD;
		this._promptAndUpdate();
	},

	/**
	 * 点击创意礼品
	 */
	_selectGift: function() {
		
		_selection = SELECTION_GIFT;
		this._promptAndUpdate();
	},

	/**
	 * 点击公共服务
	 */
	_selectPublic: function() {

		_selection = SELECTION_PUBLIC;
		this._promptAndUpdate();
	},

	_onTouchBar: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	// _onSelectProject: function() {

	// 	$('#projectItem').addClass('nearby-select');
	// 	$('#foodItem').removeClass('nearby-select');
	// 	$('#commodityItem').removeClass('nearby-select');
	// 	$('#publicItem').removeClass('nearby-select');

	// 	_selection = SELECTION_FACILITY;
	// 	this._promptAndUpdate();
	// },

	// _onSelectFood: function() {

	// 	$('#projectItem').removeClass('nearby-select');
	// 	$('#foodItem').addClass('nearby-select');
	// 	$('#commodityItem').removeClass('nearby-select');
	// 	$('#publicItem').removeClass('nearby-select');

	// 	_selection = SELECTION_FOOD;
	// 	this._promptAndUpdate();
	// },

	// _onSelectCommodity: function() {

	// 	$('#projectItem').removeClass('nearby-select');
	// 	$('#foodItem').removeClass('nearby-select');
	// 	$('#commodityItem').addClass('nearby-select');
	// 	$('#publicItem').removeClass('nearby-select');
	// 	$('.project-item-list').css('display', 'none');

	// 	_selection = SELECTION_GIFT;

	// 	window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3610d458218f003&redirect_uri=http://ws.cnkly.com/ssg/index&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect';
	// },

	// _onSelectPublic: function() {

	// 	$('#projectItem').removeClass('nearby-select');
	// 	$('#foodItem').removeClass('nearby-select');
	// 	$('#commodityItem').removeClass('nearby-select');
	// 	$('#publicItem').addClass('nearby-select');
	// 	// $('.project-item-list').css('display', 'none');

	// 	_selection = SELECTION_PUBLIC;
	// 	this._promptAndUpdate();
	// },

	_onGoto: function() {
		this._goToClicked = true;
	},

	_onTapItem: function(projectId) {

		if (this._goToClicked) {
			this._goToClicked = false;
			return;
		}

		console.log(projectId + ' ' + isNaN(projectId));

		var project = ProjectStore.getProjectDetail(projectId);
		for (var i = 0; i < this.state.projects.length; i++) {
			if (this.state.projects[i]._id == projectId) {
				project = this.state.projects[i];
			}
		}

		console.log(this.state.projects);

		if (project.category == Constants.Category.DISTRICT) {
			this.transitionTo(Constants.Url.DISTRICT, {}, {title: project.name, projectId: project._id});
		}
		else if (project.category == Constants.Category.FACILITY) {
			this.transitionTo(Constants.Url.FACILITY, {}, {title: project.name, projectId: project._id});
		}
		else if (project.category == Constants.Category.FOOD) {
			// if (project._id.indexOf('food') >= 0) {
			// 	window.location.href = project.url;
			// }
			// window.location.href = project.url;
			this.transitionTo(Constants.Url.FACILITY, {}, {title: project.name, projectId: project._id});
		}
		else if (project.category == Constants.Category.COMMODITY) {
			this.transitionTo(Constants.Url.FACILITY, {}, {title: project.name, projectId: project._id});
		}
	},

	_onLocationChange: function() {
		this.refs.toast.show('获取最新定位成功');
		this._onProjectChange();
	},

	_onProjectChange: function() {
		this._updateProjects();
	}

});

module.exports = NearbyPage;
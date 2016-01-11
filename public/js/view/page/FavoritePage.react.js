/**
 * 我的收藏界面
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
var Prompt = require('../component/Prompt.react');

var AppHeader = require('../AppHeader.react');
var ProjectList = require('../ProjectList.react');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var QueryAction = require('../../actions/QueryAction');

var UserStore = require('../../stores/UserStore');
var ProjectStore = require('../../stores/ProjectStore');
var LocationStore = require('../../stores/LocationStore');

/**
 * 我的收藏
 */
var FavoritePage = React.createClass({

	mixins: [Navigation, State],

	goToClicked: false,

	getInitialState: function() {
		return {
			projects: [],
			hintClosedOnce: false,
		};
	},

	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onDistrictUpdate);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onFacilityUpdate);
		LocationStore.removeChangeListener(LocationStore.LOCATION_EVENT, this._onLocationChange);
		UserStore.removeChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onUserUpdate);
	},

	componentDidMount: function() {

		console.log('FavoritePage componentDidMount');

		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onDistrictUpdate);
		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onFacilityUpdate);
		LocationStore.addChangeListener(LocationStore.LOCATION_EVENT, this._onLocationChange);
		UserStore.addChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onUserUpdate);

		QueryAction.queryFavoriteProjectGroup();

		this._promptAndUpdate();
	},

	componentDidUpdate: function() {
		console.log('FavoritePage componentDidUpdate');
		setTimeout(this.refs.prompt.hide, 500);
		// this.refs.prompt.hide();
	},

	render: function() {

		console.log('FavoritePage render');

		// 生成项目列表
		var projectComps = [];
		var projects = this.state.projects;

		if (FormatUtil.isEmpty(projects) || projects.length == 0) {
			projectComps = (
				<div className='empty-result'>
					<i><img src={Constants.Images.NO_FAVORITE} /></i>
					<span>尚未添加收藏哦~</span>
				</div>
			);
		}
		else {
			projectComps = (
				<ProjectList ref='projects' projects={projects} onTapItem={this._onTapItem}/>
			);
		}

		var hintComp = {};
		if ((FormatUtil.isEmpty(projects) || projects.length == 0) && !this.state.hintClosedOnce) {
			hintComp = (
				<div onClick={this._onClickHint} >
					<div className='favorite-empty-hint' />
					<img className='favorite-empty-hint-img' src={Constants.Images.FAVORITE_HINT} />
				</div>
			);
		}

		return (
			<div>
				<div className='cover'>
					<AppHeader title='我的收藏' backBtn />
				</div>
				<div className='container favorite-page'>
					{projectComps}
				</div>
				<Prompt ref='prompt' />
				{hintComp}
			</div>
		);
	},

	/**
	 * 关掉提示收藏的信息
	 */
	_onClickHint: function() {

		this.setState({
			hintClosedOnce: true
		});
	},

	/**
	 * 提示即将更新
	 */
	_promptAndUpdate: function() {
		console.log('FavoritePage _promptAndUpdate');
		this.refs.prompt.show('载入中，请稍候');
		console.log('prompt show');
		setTimeout(this._updateProjects, 100);
	},

	_updateProjects: function() {

		console.log('FavoritePage _updateProjects');

		this.setState({
			projects: this._getFavoriteProjects()
		});
	},

	/**
	 * 取得最新的用户收藏项目信息
	 */
	_getFavoriteProjects: function() {

		var projectGroup = [];

		var favoriteProjectGroup = UserStore.getFavoriteProjectGroup();
		for (var key in favoriteProjectGroup) {
			var projectId = favoriteProjectGroup[key].project_id;
			var project = ProjectStore.getProjectDetail(projectId, false);
			if (!FormatUtil.isEmpty(project)) {
				projectGroup.push(project);
			}
		}

		return projectGroup;
	},

	_onGoto: function() {
		this.goToClicked = true;
	},

	_onTapItem: function(key) {

		if (this.goToClicked) {
			return;
		}

		var project = ProjectStore.getProjectDetail(key);

		if (project.category == Constants.Category.DISTRICT) {
			console.log('goto district page');
			this.transitionTo(Constants.Url.DISTRICT, {}, {title: project.name, projectId: project._id});
		}
		else if (project.category == Constants.Category.FACILITY) {
			console.log('goto facility page');
			this.transitionTo(Constants.Url.FACILITY, {}, {title: project.name, projectId: project._id});
		}
	},

	/**
	 * 获得最新定位后，重新查询一次
	 */
	_onLocationChange: function() {
		console.log('NearbyPage _onLocationChange');
		this._updateProjects();
	},

	_onUserUpdate: function() {
		console.log('_onUserUpdate');
		this._updateProjects();
	},

	_onFacilityUpdate: function() {
		console.log('FavoritePage _onFacilityUpdate');
		QueryAction.queryFavoriteProjectGroup();
	},

	_onDistrictUpdate: function() {
		console.log('FavoritePage _onDistrictUpdate');
		QueryAction.queryProjectGroup(Constants.Category.FACILITY);
	}

});

module.exports = FavoritePage;
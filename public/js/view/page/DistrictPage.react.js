/**
 * 区域详情界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/26
 * 
 */

var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;

var $ = require('jquery');

var Constants = require('../../constants/AppConstants');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var AppHeader = require('../AppHeader.react');
var AppFooter = require('../AppFooter.react');
var Rating = require('../Rating.react');
var MediaSwiper = require('../MediaSwiper.react');

var QueryAction = require('../../actions/QueryAction');
var PostAction = require('../../actions/PostAction');
var ProjectStore = require('../../stores/ProjectStore');
var CommentStore = require('../../stores/CommentStore');
var UserStore = require('../../stores/UserStore');

var CommentBrief = require('../CommentBrief.react');
var ProjectDetail = require('../ProjectDetail.react');

/**
 * 区域详情
 */
var DistrictPage = React.createClass({

	mixins: [Navigation, State],

	_getProjectId: function() {

		var storage = window.localStorage;
		var projectId = this.getQuery().projectId;

		if (FormatUtil.isEmpty(projectId)) {
			projectId = storage.projectId;
		}

		return projectId;
	},

	getInitialState: function() {

		var projectId = this._getProjectId();

		return {
			project: ProjectStore.getProjectDetail(projectId),
			commentBrief: CommentStore.getCommentBrief(projectId),
			isFavorite: UserStore.isFavoriteProject(projectId)
		}
	},

	componentWillUnmount: function() {

		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onProjectChange);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
		CommentStore.removeChangeListener(CommentStore.QUERY_COMMENT_BRIEF_EVENT, this._onCommentChange);
		UserStore.removeChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onProjectChange);
	},

	componentDidUpdate: function() {

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		var projects = this.state.project.projects;
		for (var key in projects) {
			$('#proword' + key).bind('tap', this._onTapProject);
		}
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onProjectChange);
		ProjectStore.addChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
		CommentStore.addChangeListener(CommentStore.QUERY_COMMENT_BRIEF_EVENT, this._onCommentChange);
		UserStore.addChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onProjectChange);

		QueryAction.queryProjectGroup(Constants.Category.FACILITY);
		QueryAction.queryProjectGroup(Constants.Category.DISTRICT);

		QueryAction.queryFavoriteProjectGroup();

		QueryAction.queryProjectDetail(this._getProjectId());
		QueryAction.queryCommentBrief(this._getProjectId());
	},

	render: function() {

		var project = this.state.project;
		var brief = this.state.commentBrief;
		var projectComp = '';

		projectComp = this._createProjectComp(project, brief);

		var gotoDisabled = false;
		if (FormatUtil.isEmpty(project.location) || FormatUtil.isEmpty(project.location[0]) ||
				project.location[0] == '2') {
			gotoDisabled = true;
		}

		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='facilityPage'>
					<div className='cover'>
						<AppHeader title={project.name} backBtn />
						<AppFooter disableGoto={gotoDisabled} onGoto={this._onGoto} isFavorite={this.state.isFavorite} onPostFavorite={this._onPostFavorite} />
					</div>
					<div className='container'>
						{projectComp}
					</div>
				</div>
			</div>
		);
	},
	
	_onPostFavorite: function() {
		PostAction.postFavoriteProject(this._getProjectId());
	},

	_onGoto: function() {
		var projectId = this._getProjectId();
		var project = ProjectStore.getProjectDetail(this.projectId);
		localStorage.removeItem("navWay");
		this.transitionTo(Constants.Url.MAP_NAV_RESULT, {}, {lng: project.location[0], lat: project.location[1]});
	},
	
	_createProjectComp: function(project, brief) {


		var projects = project.projects;
		var projectComps = [];

		for (var key in projects) {
			console.debug(projects[key]);
			projectComps.push(
				<div key={key} id={'proword' + key} className='keyword-item'>
					{projects[key].name}
				</div>
			);
		}

		return (
			<div>
				<MediaSwiper resources={project.resources}  title={project.name}/>
				<div className='project-intro'>
					<Rating rating={project.rating} />
				</div>
				<CommentBrief onViewMore={this._onViewMore} brief={brief} />
				<div className='project-list'>
					<span>项目列表</span>
					<div className='keyword'>
						{projectComps}
					</div>
				</div>
				<ProjectDetail detail={project.detail} onRequest={this._requestContent}/>
			</div>
		);
	},

	_onTapProject: function(e) {
		var key = e.target.id.substring(7);
		var project = this.state.project.projects[key];
		this.transitionTo(Constants.Url.FACILITY, {}, {projectId: project._id});
	},

	_onViewMore: function() {
		this.transitionTo(Constants.Url.COMMENT_LIST, {}, {projectId: this._getProjectId()})
	},

	_requestContent: function() {
		this.setState({
			project: ProjectStore.getProjectDetail(this._getProjectId())
		});
	},

	_onProjectChange: function() {
		this.setState({
			project: ProjectStore.getProjectDetail(this._getProjectId()),
			isFavorite: UserStore.isFavoriteProject(this._getProjectId())
		});
	},

	_onCommentChange: function() {
		this.setState({
			commentBrief: CommentStore.getCommentBrief(this._getProjectId())
		})
	}
});

module.exports = DistrictPage;
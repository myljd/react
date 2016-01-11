/**
 * 设施详情界面
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

var Constants = require('../../constants/AppConstants');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var Header = require('../Header.react');
var AppHeader = require('../AppHeader.react');
var AppFooter = require('../AppFooter.react');
var Rating = require('../Rating.react');
var Queue = require('../Queue.react');
var Opening = require('../Opening.react');
var MediaSwiper = require('../MediaSwiper.react');

var QueryAction = require('../../actions/QueryAction');
var PostAction = require('../../actions/PostAction');
var ProjectStore = require('../../stores/ProjectStore');
var CommentStore = require('../../stores/CommentStore');
var UserStore = require('../../stores/UserStore');

var CommentBrief = require('../CommentBrief.react');
var ProjectDetail = require('../ProjectDetail.react');

var AudioPlayer = require('../component/AudioPlayer.react');

/**
 * 设施详情
 */
var FacilityPage = React.createClass({

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

	componentDidUpdate: function() {

		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		var projects = this.state.project.projects;
		for (var key in projects) {
			$('#proword' + key).bind('tap', this._onTapProject);
		}
	},

	componentDidMount: function() {

		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		// 添加事件监听
		this._addListener();

		var projectId = this._getProjectId();
		QueryAction.queryProjectDetail(projectId);
		QueryAction.queryCommentBrief(projectId);
	},

	render: function() {

		console.log('FacilityPage render');

		var project = this.state.project;
		var brief = this.state.commentBrief;
		var projectComp = '';

		console.log(project);

		// 取得项目详情，开始渲染
		if (!FormatUtil.isEmpty(project)) {
			projectComp = this._createProjectComp(project, brief);
		}

		var gotoDisabled = false;
		if (FormatUtil.isEmpty(project.location) || project.location[0] == '2') {
			gotoDisabled = true;
		}

		// 如果是恐龙馆中厅，头部要显示上一个和下一个
		var headerContentComp = {};
		if (project.category == Constants.Category.BRANCH) {
			headerContentComp = (
				<div>

				</div>
			);
		}

		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='facilityPage'>
					<div className='cover'>
						<Header>
							<Header.Left icon={Constants.Images.BACK} />
							<Header.Content title={project.name}>
								{headerContentComp}
							</Header.Content>
							<Header.Right />
						</Header>
						<AppFooter disableGoto={gotoDisabled} onGoto={this._onGoto} isFavorite={this.state.isFavorite} onPostFavorite={this._onPostFavorite} />
					</div>
					<div className='container'>
						{projectComp}
					</div>
				</div>
			</div>
		);
	},

	_removeListener: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
		CommentStore.removeChangeListener(CommentStore.QUERY_COMMENT_BRIEF_EVENT, this._onCommentChange);
		UserStore.removeChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onProjectChange);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_BRANCH_EVENT, this._onProjectChange);
	},

	_addListener: function() {
		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_BRANCH_EVENT, this._onProjectChange);
		ProjectStore.addChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
		CommentStore.addChangeListener(CommentStore.QUERY_COMMENT_BRIEF_EVENT, this._onCommentChange);
		UserStore.addChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onProjectChange);
	},

	_onBack: function() {

		// 跳转前删除所有监听
		this._removeListener();
	},

	_onPostFavorite: function() {
		PostAction.postFavoriteProject(this._getProjectId());
	},

	_onGoto: function() {

		// 跳转前删除所有监听
		this._removeListener();

		var projectId = this._getProjectId();
		var project = ProjectStore.getProjectDetail(projectId);
		localStorage.removeItem("navWay");
		this.transitionTo(Constants.Url.MAP_NAV_RESULT, {}, {lng: project.location[0], lat: project.location[1]});
	},

	_onTapProject: function(e) {

		var key = e.target.id.substring(7);
		var project = this.state.project.projects[key];

		// 取得父项目，判断是否是项目。如果是项目，则当前项目是[恐龙馆]的厅，可以跳转
		var parentProject = ProjectStore.getProjectDetail(project.parent_id);
		if (!FormatUtil.isEmpty(parentProject) && parentProject.category == '1') {
			this.transitionTo(Constants.Url.FACILITY, {}, {projectId: project._id});
		}
	},

	_createProjectComp: function(project, brief) {

		var queueComp = {};
		if ('1' == project.queue.monitored) {
			queueComp = (
				<Queue type='time' queue={project.queue} />
			);
		}

		var projectListComp = {};
		var projects = project.projects;
		console.log(projects);
		if (projects) {

			var projectComps = [];
			var style = 'keyword';

			// 如果父级项目是恐龙馆里的[厅],则显示试听列表
			if (project.category == '5') {
				style += ' playlist';
				for (var key in projects) {
					console.debug(projects[key]);
					projectComps.push(
						<div key={key} className='playlist-item'>
							{projects[key].name}
							<AudioPlayer id={key} index={key} url={projects[key].resources[0].url} control />
						</div>
					);
				}
			}
			// 否则显示普通列表
			else {
				for (var key in projects) {
					console.debug(projects[key]);
					projectComps.push(
						<div key={key} id={'proword' + key} className='keyword-item'>
							{projects[key].name}
						</div>
					);
				}
			}

			console.log(projectComps);

			projectListComp = (
				<div className='project-list'>
					<span>项目列表</span>
					<div className={style}>
						{projectComps}
					</div>
				</div>
			);
		}

		return (
			<div>
				<MediaSwiper resources={project.resources} title={project.name}/>
				<div className='project-content'>
					<div className='project-intro'>
						<Rating rating={project.rating} />
						{queueComp}
						<Opening opening={project.opening} />
					</div>
					<CommentBrief onViewMore={this._onViewMore} brief={brief} />
					{projectListComp}
					<ProjectDetail detail={project.detail} onRequest={this._requestContent}/>
				</div>
			</div>
		);
	},

	_onViewMore: function() {

		// 跳转前删除所有监听
		this._removeListener();
		this.transitionTo(Constants.Url.COMMENT_LIST, {}, {projectId: this._getProjectId()})
	},

	_requestContent: function() {
		this.setState({
			project: ProjectStore.getProjectDetail(this._getProjectId())
		});
	},

	_onProjectChange: function() {
		console.log('FacilityPage _onProjectChange projectId=' + this._getProjectId());
		console.log(ProjectStore.getProjectDetail(this._getProjectId()));
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

module.exports = FacilityPage;
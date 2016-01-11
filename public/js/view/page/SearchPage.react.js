/**
 * 项目搜索界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/1
 * 
 */

var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;

var $ = require('jquery');

var AppHeader = require('../AppHeader.react');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');
var Constants = require('../../constants/AppConstants');

var ListItem = require('../component/ListItem.react');

var ProjectStore = require('../../stores/ProjectStore');
var QueryAction = require('../../actions/QueryAction');

var FancyModal = require('../FancyModal.react');

var deg = 0;
var rotationTimer = null;

function startRotation(el) {

	rotationTimer = setInterval(function() {

		deg = (deg + 20) % 360;
		var rotation = 'rotate(' + deg + 'deg)';

		el.css({
            'webkitTransform':  rotation,
            'oTransform':       rotation,
            'msTransform':      rotation,
            'mozTransform':     rotation,
            'transform':        rotation
        });
	}, 50);

}

var SearchBar = React.createClass({

	componentDidMount: function() {
		$('#searchInput').bind('input', this._onTextChange);
	},

	render: function() {
		return (
			<div className='search-input'>
				<i><img src={Constants.Images.SEARCH}/></i>
				<input id='searchInput' type='text' placeholder='搜索商家、片区、项目'/>
			</div>
		);
	},

	_onTextChange: function() {
		var inputVal = $('#searchInput').val();

		if (!FormatUtil.isEmpty(inputVal)) {
			$('#searchInput').css('color', '#000');
		}
		else {
			$('#searchInput').css('color', '#B3B3B3');
		}

		this.props.onTextChange(inputVal);
	}
});

var SearchList = React.createClass({

	getInitialState: function() {
		return {
			searchResult: {}
		}
	},

	componentWillReceiveProps: function(nextProps) {

		if (FormatUtil.isEmpty(nextProps.keyword)) {
			this.setState({
				searchResult: {}
			});
		}
		else {
			this.setState({
				searchResult: ProjectStore.getProjectKeywordGroup(nextProps.keyword)
			});
		}
	},

	render: function() {

		var resultList = this.state.searchResult;
		var listComps = [];

		if (FormatUtil.isEmpty(resultList) && !FormatUtil.isEmpty(this.props.keyword)) {
			listComps = (
				<div className='empty-result'>
					<i><img src={Constants.Images.NOTICE} /></i>
					<span>很抱歉，未找到结果</span>
					<span>您可以换一个词试试哦~</span>
				</div>
			);
		}
		else {
			for(var key in resultList) {
				var result = resultList[key];
				listComps.push(
					<ListItem id={key} key={key} onTap={this._onTapItem} type='button' value={result.name} />
				);
			}
		}

		return (
			<div>
				{listComps}
			</div>
		)
	},

	_onTapItem: function(id) {
		var resultList = this.state.searchResult;
		this.props.onSelectProject(resultList[id]);
	}
});

var SearchModal = React.createClass({

	show: function() {
		this.refs.modal.show();
		startRotation($('#refresh-img'));
	},

	hide: function() {
		this.refs.modal.hide();
		clearInterval(rotationTimer);
		rotationTimer = null;
	},

	render: function() {

		console.log('SearchModal render');

		return (
			<FancyModal ref='modal' modalClass=' search-modal'>
				<div>
					<i><img id='refresh-img' src={Constants.Images.DETAILS} /></i>
					<span>正在搜索，请稍候</span>
				</div>
			</FancyModal>
		);
	}
});

var SearchPage = React.createClass({

	selectedProject: {},

	mixins: [Navigation],

	getInitialState: function() {
		return {
			projectKeywords: {},
			keyword: ''
		}
	},

	componentDidMount: function() {

		$('#hiddenSpan').bind('tap', this._onTapSpan);
		$('#hiddenBtn').bind('tap', this._onTapBtn);

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onGetDetail);
		ProjectStore.addChangeListener(ProjectStore.QUERY_KEYWORD_EVENT, this._onProjectChange);
		QueryAction.queryProjectKeywords();

		QueryAction.queryProjectGroup(Constants.Category.FACILITY);
		QueryAction.queryProjectGroup(Constants.Category.DISTRICT);
	},

	componentDidUpdate: function() {

		var projectKeywords = this.state.projectKeywords;
		for (var key in projectKeywords) {
			$('#keyword' + key).bind('tap', this._onTapProject);
		}
	},

	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onGetDetail);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_KEYWORD_EVENT, this._onProjectChange);
	},

	render: function() {

		var projectKeywords = this.state.projectKeywords;
		var projectComps = [];

		for (var key in projectKeywords) {
			projectComps.push(
				<input type='button' key={key} id={'keyword' + key} className='keyword-item' value={projectKeywords[key].name} />
			);
		}

		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover-front' id='searchPage'>
					<div className='cover'>
						<AppHeader title='搜索' backBtn />
					</div>
					<div className='container'>
						<div>
							<div className='project-search'>
								<SearchBar onTextChange={this._onTextChange} />
							</div>
							<div className='project-search-result'>
								<div className='keyword'>
									{projectComps}
								</div>
								<SearchList keyword={this.state.keyword} onSelectProject={this._onSelectProject}/>
							</div>
						</div>
					</div>
				</div>
				<SearchModal ref='searchModal' ops='搜索'/>
			</div>

		);
	},

	_onTextChange: function(text) {

		console.log(text);
		if (!FormatUtil.isEmpty(text)) {
			$('.keyword').css('display', 'none');
		}
		else {
			$('.keyword').css('display', 'inline-block');
		}

		this.setState({
			keyword: text
		})
	},

	_onSelectProject: function(project) {

		this.selectedProject = project;
		$('#searchInput').val(project.name);

		this._showModal(project.name);
		console.log('_onSelectProject' + project._id);
		
		setTimeout(function() {
			QueryAction.queryProjectDetail(project._id);
		}, 750);
	},

	_onTapProject: function(e) {
		
		var key = e.target.id.substring(7);
		this.selectedProject = this.state.projectKeywords[key];

		$('#searchInput').css('color', '#000');
		$('#searchInput').val(this.selectedProject.name);

		this._showModal(this.selectedProject.name);

		var id = this.selectedProject._id;
		setTimeout(function() {
			QueryAction.queryProjectDetail(id)
		}, 500);
	},

	_hideModal: function() {
		this.refs.searchModal.hide();
	},

	_showModal: function(name) {
		this.refs.searchModal.show();
	},

	_onGetDetail: function() {
		
		this._hideModal();

		var project = this.selectedProject;

		console.log('projectId = ' + project._id + ' category = ' + project.category);
		if (project.category == Constants.Category.DISTRICT) {
			console.log('goto district page');
			this.transitionTo(Constants.Url.DISTRICT, {}, {title: project.name, projectId: project._id});
		}
		else if (project.category == Constants.Category.FACILITY) {
			console.log('goto facility page');
			this.transitionTo(Constants.Url.FACILITY, {}, {title: project.name, projectId: project._id});
		}
	},

	_onProjectChange: function() {
		this.setState({
			projectKeywords: ProjectStore.getProjectKeywords()
		});
	}
});

module.exports = SearchPage;
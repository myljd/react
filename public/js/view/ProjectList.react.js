/**
 * 项目列表组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/25
 * 
 */

var React = require('react');

var ListItem = require('./component/ListItem.react');
var ScrollView = require('./component/ScrollView.react');
var ProjectItem = require('./ProjectItem.react');

var FormatUtil = require('../utils/FormatUtil');
var ViewUtil = require('../utils/HowUIUtil');

var Constants = require('../constants/AppConstants');
var PROJECT_NUM = 1000;

var ProjectList = React.createClass({

	/**
	 * 当前显示数量
	 */
	_currentCnt: PROJECT_NUM,

	_onGotoClicked: false,

	/**
	 * 滑动到顶部
	 */
	scrollToTop: function() {
		this.refs.scrollView.scrollToTop();
	},

	/**
	 * 查看更多
	 */
	_viewMore: function() {

		var projects = this.props.projects;
		this._currentCnt += PROJECT_NUM
		if (this._currentCnt> projects.length) {
			this._currentCnt = projects.length;
		}

		this.forceUpdate();
		this.refs.scrollView.stopLoading();
	},

	componentDidMount: function() {

	},

	/**
	 * 数据被更新后
	 */
	componentDidUpdate: function() {

	},

	render: function() {

		var projects = this.props.projects;
		var projectComps = [];

		for (var i = 0; i < projects.length; i++) {

			if (i > this._currentCnt - 1) {
				break;
			}

			var project = projects[i];
			projectComps.push(
				<ListItem id={project._id} key={i} onTap={this._onTapItem}>
					<ProjectItem key={i} onGoto={this._onGoto} project={project}/>
				</ListItem>
			);
		}

		var hasMore = true;
		if (this._currentCnt >= projects.length) {
			hasMore = false;
		}

		return (
			<div className='project-item-list' onTouchMove={this._onTouchList}>
				<ScrollView ref='scrollView' pullToLoad onStartLoading={this._onLoad} hasMore={hasMore}>
					{projectComps}
				</ScrollView>
			</div>
		)
	},

	_onTouchList: function(e) {
		e.stopPropagation();
	},

	_onLoad: function() {
		setTimeout(this._viewMore, 300);
	},

	_onGoto: function() {
		this._onGotoClicked = true;
	},

	_onTapItem: function(id) {
		if (this.props.onTapItem && !this._onGotoClicked) {
			this.props.onTapItem(id);
		}

		this._onGotoClicked = false;
	},
});

module.exports = ProjectList;
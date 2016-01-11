
/**
 * 排队详情界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/26
 * 
 */

var React = require('react');
var Router = require('react-router');
var State = Router.State;
var Navigation = Router.Navigation;

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var ProjectStore = require('../../stores/ProjectStore');
var QueryAction = require('../../actions/QueryAction');

var AppHeader = require('../AppHeader.react');
var ScrollView = require('../component/ScrollView.react');

var QueueDetailPage = React.createClass({

	mixins: [State, Navigation],

	getInitialState: function() {
		return ({
			project: ProjectStore.getProjectDetail(this.getQuery().projectId)
		});
	},

	componentDidUpdate: function() {
		setTimeout(this.refs.scrollView.stopRefresh, 300);
	},

	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_DETAIL_EVENT, this._onProjectChange);
		QueryAction.queryProjectDetail(this.getQuery().projectId);
	},

	render: function() {

		var project = this.state.project;
		console.log(project);
		var time = FormatUtil.getFormatQueueTime(project.queue.time);
		var count = project.queue.count;

		return (
			<div>
				<div className='cover'>
					<AppHeader title='排队详情' backBtn/>
				</div>
				<div className='container'>
					<ScrollView ref='scrollView' pullToRefresh onStartRefresh={this._onRefresh}>
						<div className='queue-detail'>
							<li className="list-item">排队情况：预计需要等待{time}</li>
							<li className="list-item">排队人数：约{count}人</li>
						</div>
					</ScrollView>
					<span className='queue-puller'>下拉获取最新信息</span>
				</div>
			</div>
		)
	},

	/**
	 * 下拉刷新
	 */
	_onRefresh: function() {
		QueryAction.queryProjectDetail(this.getQuery().projectId);
	},

	_onProjectChange: function() {
		this.setState({
			project: ProjectStore.getProjectDetail(this.getQuery().projectId)
		});
	}
});

module.exports = QueueDetailPage;
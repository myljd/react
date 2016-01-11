
/**
 * 评论列表界面
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

var Constants = require('../../constants/AppConstants');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var AppHeader = require('../AppHeader.react');
var CommentItem = require('../CommentItem.react');

var QueryAction = require('../../actions/QueryAction');

var CommentStore = require('../../stores/CommentStore');

var CommentListPage = React.createClass({

	mixins: [State, Navigation],

	getInitialState: function() {
		return {
			commentGroup: {}	
		}
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		CommentStore.addChangeListener(CommentStore.QUERY_EVENT, this._onCommentChange);
		QueryAction.queryCommentGroup(this.getQuery().projectId);
	},

	componentWillUnmount: function() {
		CommentStore.removeChangeListener(CommentStore.QUERY_EVENT, this._onCommentChange);
	},

	render: function() {


		var commentGroup = this.state.commentGroup;
		var commentComps = [];
		console.log('CommentListPage render');
		console.log(commentGroup);

		if (!FormatUtil.isEmpty(commentGroup)) {
			for (var key in commentGroup) {

				console.log('in for');
				console.log(commentGroup[key]);
				commentComps.push(
					<CommentItem key={key} comment={commentGroup[key]} />
				);
			}
		}
		else {
			commentComps.push(
				<div className='empty-result'>
					<i><img src={Constants.Images.NO_FAVORITE} /></i>
					<span>当前没有评论哦</span>
				</div>
			);
		}
		
		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='queueDetailPage'>
					<div className='cover'>
						<AppHeader title='评论' backBtn />
					</div>
					<div className='container'>
						<div className='comment-list'>
							{commentComps}
						</div>
					</div>
				</div>
			</div>
		)
	},

	_onCommentChange: function() {

		console.log('_onCommentChange');
		console.log(CommentStore.getCommentGroup(this.getQuery().projectId));

		this.setState({
			commentGroup: CommentStore.getCommentGroup(this.getQuery().projectId)
		});
	}
});

module.exports = CommentListPage;
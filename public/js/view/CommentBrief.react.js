/**
 * 评论简要组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/26
 * 
 */

var React = require('react');

var Constants = require('../constants/AppConstants');
var CommentItem = require('./CommentItem.react');

var CommentBrief = React.createClass({

	_getDefaultProps: function() {
		return {
			count: 0,
			comment: {
				content: '',
				insert_time: 0,
				status: 0,
				user: {
					id: '0',
					wechat_id: '0',
					name: '用户'
				}
			}
		};
	},

	componentDidMount: function() {
		console.debug('CommentBrief componentDidMount called');
		$('.more').bind('tap', this._onViewMore);
		$('.more').bind('touchstart', this._onStartTouchMove);
		$('.more').bind('touchend', this._onEndTouchMove);
	},

	componentDidUpdate: function() {
		console.debug('CommentBrief componentDidUpdate called');
		$('.more').bind('tap', this._onViewMore);
		$('.more').bind('touchstart', this._onStartTouchMove);
		$('.more').bind('touchend', this._onEndTouchMove);
	},

	render: function() {

		console.log('CommentBrief render');

		var brief = this.props.brief;
		var commentComp = {};

		console.log(brief);

		if (brief == null || brief.comment == null || brief.count == 0) {
			commentComp = (
				<div className='empty-result'>
					暂无评论
				</div>
			);
		}
		else {
			commentComp = (
				<div>
					<div className='title'>
						项目评论 ({brief.count})
					</div>
					<CommentItem comment={brief.comment} />
					<div className='more'>
						<div className='before' />
						<span>查看更多评论</span>
					</div>
				</div>
			);
		}

		return (
			<div className='project-comment'>
				{commentComp}
			</div>
		);
	},

	_onStartTouchMove: function() {
		console.debug('CommentBrief _onStartTouchMove called');
		$('.more').addClass('tapped');
	},

	_onEndTouchMove: function() {
		$('.more').removeClass('tapped');
	},

	_onViewMore: function() {
		console.debug('CommentBrief _onViewMore called');
		this.props.onViewMore();
	}
});

module.exports = CommentBrief;
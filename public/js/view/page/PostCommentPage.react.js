/**
 * 评价发表界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/27
 * 
 */

var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;
var $ = require('jquery');

var AppHeader = require('../AppHeader.react');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var Constants = require('../../constants/AppConstants');

var QueryAction = require('../../actions/QueryAction');
var PostAction = require('../../actions/PostAction');

var UserStore = require('../../stores/UserStore');
var CommentStore = require('../../stores/CommentStore');
var ProjectStore = require('../../stores/ProjectStore');

var Rating = require('../Rating.react');
var RatingModal = require('../RatingModal.react');
var CommentModal = require('../CommentModal.react');

var PostCommentPage = React.createClass({

	mixins: [Navigation, State],

	getInitialState: function() {
		return {
			rating: ProjectStore.getProjectDetail(this.getQuery().projectId).rating
		}
	},

	componentWillUnmount: function() {
		CommentStore.removeChangeListener(CommentStore.QUERY_EVENT, this._onCommentChange);
		CommentStore.removeChangeListener(CommentStore.POST_EVENT, this._onCommentPost);
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		CommentStore.addChangeListener(CommentStore.QUERY_EVENT, this._onCommentChange);
		CommentStore.addChangeListener(CommentStore.POST_EVENT, this._onCommentPost);
		QueryAction.queryCommentGroup(this.getQuery().projectId, UserStore.getUser().id);

		$('#commentInput').bind('input', this._onTextChange);
		$('.commentPost').bind('tap', this._onPostComment);
		$('.commentPost').bind('touchstart', this._onTapCommentStart);
		$('.commentPost').bind('touchend touchcancel', this._onTapCommentEnd);
	},

	render: function() {

		var rating = this.state.rating;
		if (!rating) {
			rating = 5;
		}

		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='facilityPage'>
					<div className='cover'>
						<AppHeader title='发表评论' backBtn onNavBack={this._onNavBack} />
					</div>
					<div className='container'>
						<div className='comment-detail'>
							<Rating rating={rating} showModal={this._showModal} />
							<div className='after' />
							<textarea ref='textInput' id='commentInput' placeholder='写点评价吧，对其他小伙伴帮助很大哦' rows='3' />
							<div className='commentPost'>发表看法</div>
						</div>
					</div>
				</div>
				<RatingModal ref='ratingModal' rating={rating} onSelectRating={this._onSelectRating} />
				<CommentModal ref='commentModal' onConfirmResult={this._onConfirmResult} />
			</div>
		);
	},

	_onTextChange: function() {
		var inputVal = $('#commentInput').val();

		if (!FormatUtil.isEmpty(inputVal)) {
			$('#commentInput').css('color', '#000');
		}
		else {
			$('#commentInput').css('color', '#B3B3B3');
		}
	},

	_onTapCommentStart: function() {
		$('.commentPost').addClass('tapped');
	},

	_onTapCommentEnd: function() {
		$('.commentPost').removeClass('tapped');
	},

	_onCommentChange: function() {

		var comments = CommentStore.getCommentGroup(this.getQuery().projectId);
		console.log('PostCommentPage _onCommentChange');
		console.log(comments);
		if (comments == null || comments.length == 0) {
			return;
		}

		if (!FormatUtil.isEmpty(comments[0].rating)) {
			this.setState({
				rating: comments[0].rating
			});
		}		
	},

	_onSelectRating: function(rating) {
		this.setState({
			rating: rating
		});
	},

	_onNavBack: function() {

		var goBack = this.goBack;
		setTimeout(function() {
			goBack();
		}, 750);
	},

	_onConfirmResult: function() {
		console.log('onConfirmResult call')

		var goBack = this.goBack;
		setTimeout(function() {
			goBack();
		}, 750);
	},

	_onCommentPost: function() {

		var postResult = CommentStore.getPostResult();
		console.log(postResult);
		if (postResult.success == true) {
			this.refs.commentModal.show();
		}
		else {
			//
		}
	},

	_onPostComment: function() {

		var projectId = this.getQuery().projectId;
		var rating = this.state.rating;
		var comment = React.findDOMNode(this.refs.textInput).value;

		console.log('PostCommentPage _onPostComment');

		PostAction.postComment(projectId, comment, rating);
	},

	_showModal: function() {
		this.refs.ratingModal.show();
	}
});

module.exports = PostCommentPage;
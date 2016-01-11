
var React = require('react');
var Router = require('react-router');

var $ = require('jquery');

var ViewUtil = require('../utils/HowUIUtil');
var Constants = require('../constants/AppConstants');

var State = Router.State;
var Navigation = Router.Navigation;

var PostAction = require('../actions/PostAction');
var QueryAction = require('../actions/QueryAction');
var UserStore = require('../stores/UserStore');

var AppFooter = React.createClass({

	propTypes: {
		disableGoto: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			disableGoto: false
		};
	},

	mixins: [State, Navigation],

	componentWillUnmount: function() {
		UserStore.removeChangeListener(UserStore.POST_EVENT, this._onUserPost);
	},

	componentDidMount: function() {

		this._setClickEvent();
		UserStore.addChangeListener(UserStore.POST_EVENT, this._onUserPost);

	},

	render: function() {

		var favoriteIcon = Constants.Images.FAVORITE;
		console.log('AppFooter isFavorite = ' + this.props.isFavorite);
		if (this.props.isFavorite) {
			favoriteIcon = Constants.Images.FAVORITE_FULL;
		}

		var gotoStyle = 'grid-item';
		var gotoImg = Constants.Images.GOTO_FOOTER;
		console.log('################### disableGoto=' + this.props.disableGoto);
		if (this.props.disableGoto) {
			gotoStyle += ' disable';
			gotoImg = Constants.Images.GOTO_DISABLE;
		}

		return (
			<section id='footerSection' className='back-cover tab-bar'>
				<ul id='appTab' className='grid four-item'>
					<li id='goto' className={gotoStyle}>
						<i className='footer-icon'><img src={gotoImg} /></i>
						<a><span >到这去</span></a>
					</li>
					<li id='nearby' className='grid-item'>
						<i className='footer-icon'><img src={Constants.Images.NEARBY} /></i>
						<a><span >附近</span></a>
					</li>
					<li id='comment' className='grid-item'>
						<i className='footer-icon'><img src={Constants.Images.COMMENT} /></i>
						<a><span >评论</span></a>
					</li>
					<li id='favorite' className='grid-item'>
						<i className='footer-icon'><img src={favoriteIcon} /></i>
						<a><span >收藏</span></a>
					</li>
				</ul>
			</section>
		);
	},

	_onUserPost: function() {
		QueryAction.queryFavoriteProjectGroup();
	},

	_onGoto: function() {

		if (this.props.onGoto && !this.props.disableGoto) {
			this.props.onGoto();
		}
	},

	_onSelectTab: function(e) {
		console.log(e);
	},

	_onSelectNearby: function() {
		this.transitionTo(Constants.Url.NEARBY, {}, {title: '我的附近'});
	},

	_onPostComment: function() {
		this.transitionTo(Constants.Url.POST_COMMENT, {}, {title: '发表评论', projectId: this.getQuery().projectId});
	},

	_onPostFavorite: function() {
		this.props.onPostFavorite();
	},

	_setClickEvent: function() {

		$('#goto').bind('tap', this._onGoto);
		$('#nearby').bind('tap',this._onSelectNearby);
		$('#comment').bind('tap', this._onPostComment);
		$('#favorite').bind('tap', this._onPostFavorite);
	}
});

module.exports = AppFooter;
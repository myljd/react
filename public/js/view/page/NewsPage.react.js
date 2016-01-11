
/**
 * 信息中心界面
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

var ListItem = require('../component/ListItem.react');
var ScrollView = require('../component/ScrollView.react');

var AppHeader = require('../AppHeader.react');

var NewsStore = require('../../stores/NewsStore');
var ProjectStore = require('../../stores/ProjectStore');

var QueryAction = require('../../actions/QueryAction');

var NEWS_NUM = 5;

/**
 * 信息组件
 */
var NewsItem = React.createClass({

	componentDidMount: function() {

		var imgUrl = ProjectStore.getResourcePath() + this.props.news.image;
		var id = this.props.id;

		$('#news-item' + id).attr('style', 'background-image:url(' + Constants.Images.DEFAULT_NEWS + ')');

		var Img = new Image();
		Img.src = imgUrl;
		Img.onload = function() {
			$('#news-item' + id).attr('style', 'background-image:url(' + imgUrl + ')');
		}
	},

	render: function() {

		var news = this.props.news;
		console.debug('NewsItem render');
		console.debug(news);

		var id = this.props.id;

		return (
			<div id={'news-item' + id} className='news-item'>
				<div className='news-title'>
					{news.title}
				</div>
			</div>
		);
	}
});

var PROJECT_NUM = 1;

/**
 * 信息列表组件
 */
var NewsPage = React.createClass({

	/**
	 * 当前显示数量
	 */
	_currentCnt: NEWS_NUM,

	mixins: [State, Navigation],

	getInitialState: function() {
		return {
			newsGroup: NewsStore.getNewsGroup()
		}
	},

	componentDidMount: function() {

		console.log('NewsPage componentDidMount');

		// HowUI初始化
		ViewUtil.hasfixBar();

		NewsStore.addChangeListener(NewsStore.QUERY_NEWS_EVENT, this._onNewsChange);
		QueryAction.queryNewsGroup(this.getQuery().projectId);
	},

	componentWillUnmount: function() {
		NewsStore.removeChangeListener(NewsStore.QUERY_NEWS_EVENT, this._onNewsChange);
	},

	render: function() {

		var newsGroup = this.state.newsGroup;
		var newsComps = [];
		var hasMore = false;

		if (!FormatUtil.isEmpty(newsGroup)) {

			for (var i = 0; i < newsGroup.length; i++) {

				if (i > this._currentCnt - 1) {
					break;
				}

				var project = newsGroup[i];
				newsComps.push(
					<ListItem id={i} key={i} onTap={this._onTapItem}>
						<NewsItem key={i} id={i} news={newsGroup[i]} />
					</ListItem>
				);
			}
			
			if (this._currentCnt < newsGroup.length) {
				hasMore = true;
			}

			newsComps = (
				<ScrollView ref='scrollView' pullToLoad onStartLoading={this._onLoad} hasMore={hasMore}>
					{newsComps}
				</ScrollView>
			);
		}
		else {
			newsComps.push(
				<div className='empty-result'>
					<i><img src={Constants.Images.NO_FAVORITE} /></i>
					<span>当前没有通知信息</span>
				</div>
			);
		}
		
		return (
			<div>
				<div className='cover'>
					<AppHeader title='信息中心' backBtn phone />
				</div>
				<div className='container'>
					<div className='news-list'>
						{newsComps}
					</div>
				</div>
			</div>
		)
	},

	/**
	 * 查看更多
	 */
	_viewMore: function() {

		var news = this.state.newsGroup;
		this._currentCnt += PROJECT_NUM
		if (this._currentCnt> news.length) {
			this._currentCnt = news.length;
		}

		this.forceUpdate();
		this.refs.scrollView.stopLoading();
	},

	_onLoad: function() {
		setTimeout(this._viewMore, 300);
	},

	_onTapItem: function(key) {

		var newsGroup = this.state.newsGroup;
		var news = newsGroup[key];
		this.transitionTo(Constants.Url.NEWS_DETAIL, {}, {newsId: news._id});
	},

	_onNewsChange: function() {
		this.setState({
			newsGroup: NewsStore.getNewsGroup()
		});
	}
});

module.exports = NewsPage;
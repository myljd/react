
/**
 * 信息详情界面
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

var NewsStore = require('../../stores/NewsStore');
var ProjectStore = require('../../stores/ProjectStore');

var QueryAction = require('../../actions/QueryAction');


/**
 * 信息详情组件
 */
var NewsDetailPage = React.createClass({

	mixins: [State, Navigation],

	componentDidMount: function() {

		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		var news = NewsStore.getNews(this.getQuery().newsId);

		var resourcePath = ProjectStore.getResourcePath();
		if (resourcePath.indexOf('qiuniucdn') >= 0) {
			if (news.detail && news.detail.flag == 0) {
				resourcePath = Constants.Url.IMG_URL;
			}
		}

		$('.news-detail img').each(function() {
			var src = $(this).attr('src');
			console.log(src);
			if (src.indexOf('http') < 0) {
				$(this).attr('src', resourcePath + src);
				$(this).css('width', '100%');
			}
		});
	},

	render: function() {

		var news = NewsStore.getNews(this.getQuery().newsId);

		var innerHTML = {__html: ''};
		if (!FormatUtil.isEmpty(news.detail)) {
			innerHTML = {__html: news.detail.content};
		}
	
		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='newsDetailPage'>
					<div className='cover'>
						<AppHeader title='信息详情' backBtn />
					</div>
					<div className='container'>
						<div className='news-detail'>
							<div className='news-detail-header'>
								<span className='news-detail-title'>{news.title}</span>
								<span className='news-detail-date'>{news.insert_time}</span>
							</div>
							<div className='news-detail-content' dangerouslySetInnerHTML={innerHTML} />
						</div>
					</div>
				</div>
			</div>
		)
	},
});

module.exports = NewsDetailPage;
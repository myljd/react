
/**
 * 智慧游园App入口程序
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/7
 * 
 */

var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Navigation = Router.Navigation;
var State = Router.State;

var WebAPIUtil = require('./utils/WebAPIUtil');

var AppDispatcher = require('./dispatcher/AppDispatcher');

var Constants = require('./constants/AppConstants');
var ActionTypes = Constants.ActionTypes;
var ViewUtil = require('./utils/HowUIUtil');
var FormatUtil = require('./utils/FormatUtil');

var UserStore = require('./stores/UserStore');
var ProjectStore = require('./stores/ProjectStore');
var CommentStore = require('./stores/CommentStore');
var LocationStore = require('./stores/LocationStore');

var QueryAction = require('./actions/QueryAction');

var Favorite = require('./view/page/FavoritePage.react');
var Facility = require('./view/page/FacilityPage.react');
var District = require('./view/page/DistrictPage.react');
var QueueDetail = require('./view/page/QueueDetailPage.react');
var CommentList = require('./view/page/CommentListPage.react');
var PostComment = require('./view/page/PostCommentPage.react');
var Nearby = require('./view/page/NearbyPage.react');
var Search = require('./view/page/SearchPage.react');
var Loading = require('./view/page/LoadingPage.react');
var Plan = require('./view/page/PlanPage.react');
var News = require('./view/page/NewsPage.react');
var NewsDetail = require('./view/page/NewsDetailPage.react');
//----------------------地图相关js页面 start --------------------
var MapIndex = require('./view/page/MapIndex.react');
var MapFoot = require('./view/page/MapFoot.react');
var MapNav = require('./view/page/MapNav.react');
var MapNavResult = require('./view/page/MapNavResult.react');
var MapNavResultDetail = require('./view/page/MapNavResultDetail.react');
var MapNavBusResult = require('./view/page/MapNavBusResult.react');
var MapNavWalkResult = require('./view/page/MapNavWalkResult.react');
var MapLocationUtil = require('./utils/MapLocationUtil');
//----------------------地图相关js页面 end  --------------------
var level = 1;
var transition = 'static';
var filterUrl = 'map_nav_walk_result'

/**
 * App主界面
 */
var App = React.createClass({

	mixins: [Navigation, State],

	_foodFrame: '',

	componentWillMount: function() {

		console.log('abc App componentWillMount');

		QueryAction.queryResourcePath();

		// 取得用户信息
		var user = QueryAction.getLocalUser();
		
		
		// if (FormatUtil.isEmpty(user)) {
		// 	if ( !FormatUtil.isEmpty(this.getQuery().source) && this.getQuery().source=='alipay_wallet') {
		// 		//支付宝验证入口
		// 		alert(window.location.href);
		// 		WebAPIUtil.getAlipayUserInfo(this.getQuery().auth_code);
		// 	}else{
		// 		//微信验证入口
		// 		console.log('No user in cache. Openid=' + this.getQuery().openid);

		// 		// 认证完成后传递的openid
		// 		if (this.getQuery().openid) {
		// 			var user = {
		// 				openid: this.getQuery().openid,
		// 				name: this.getQuery().nickname,
		// 				thumbnail: this.getQuery().headimgurl,
		// 			}
		// 			QueryAction.queryUser(user);
		// 		}
		// 		else
		// 		// 没有认证过，跳转到认证画面
		// 		{

		// 			console.log('No openid in url');

		// 			//旅通接口过滤，不需要验证
		// 			if (this.getPathname().indexOf(filterUrl)==-1) {
		// 				var path = this.getPathname();
		// 				var redirection = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5a2d2fbadff2d52&redirect_uri=http://m.store.konglongcheng.com/daolan' + path + '.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
						
		// 				if (path.indexOf(Constants.Url.DISTRICT) >= 0 ||
		// 					path.indexOf(Constants.Url.FACILITY) >= 0) {
		// 					var storage = window.localStorage;
		// 					storage.projectId = this.getQuery().projectId;
		// 				}

		// 				console.log('Jump to wechat authentication page');

		// 				console.log(redirection);
		// 				window.location.href = redirection;
		// 			};
		// 		}
		// 	}
			
		// }
		// else {
		// 	QueryAction.queryUser(user);
		// }

		//定位坐标数据及足迹数据存储
		var location = QueryAction.getLocalLocation();
		if (!FormatUtil.isEmpty(location)) {
			LocationStore.setLocation(location);
		}

		// 取得区域和设施详情列表
		QueryAction.queryProjectGroup(Constants.Category.DISTRICT);
		QueryAction.queryProjectGroup(Constants.Category.FACILITY);
		QueryAction.queryProjectGroup(Constants.Category.PUBLIC);
		QueryAction.queryProjectGroup(Constants.Category.FOOD);
		console.log('start to query branch');
		QueryAction.queryProjectGroup(Constants.Category.BRANCH);

		// 取得收藏的项目列表
		QueryAction.queryFavoriteProjectGroup();
	},

	_loadFood: function() {

		console.log('app _loadFood');

		this._foodFrame = document.createElement('iframe');
		this._foodFrame.src = Constants.Url.FOOD_DATA_URL;
		if (this._foodFrame.attachEvent) {
			console.log('_loadFood onload')
			this._foodFrame.attachEvent('onload', this._onFoodLoad);
		}
		else {
			console.log('_loadFood onload')
			this._foodFrame.onload = this._onFoodLoad;
		}

		this._foodFrame.style['display'] = 'none';
		document.body.appendChild(this._foodFrame);
		console.log('app _loadFood end');
	},

	_firstLoad: true,

	_onFoodLoad: function() {

		console.log('_onFoodLoad');

		if (this._firstLoad) {
			console.log('_firstLoad');
			this._foodFrame.contentWindow.location = 'http://dpins.breadtech.cn/proxy.html';
			// this._foodFrame.contentWindow.location = 'http://10.0.0.108/dpins-dev-pro/proxy.html';
			this._firstLoad = false;
		}
		else {
			var data = this._foodFrame.contentWindow.name;
			data = new Function("return" + data)();
			var location = LocationStore.getLocation();
			var foodProjects = FormatUtil.parseFoodString(data.data, location);

			console.log('Set food');
			console.log(foodProjects);
			ProjectStore.setNearbyFoodGroup(foodProjects);
		}
	},

	componentDidMount: function() {

		// ViewUtil.init();
		MapLocationUtil.init();

		// 取得美食详情列表
		this._loadFood();
	},

	componentWillUpdate: function() {

		if (level == Router.History.length) {
			transition = 'static';
		}
		else if (level < Router.History.length) {
			transition = 'forward';
		}
		else {
			transition = 'backward';
		}

		level = Router.History.length;
	},

	_hide: function() {
		var modal = $('#alertBefore');
		var modalDiv = $('#alertAfter');

		modal.removeClass('show');
		modalDiv.css('width', '0px');
		modalDiv.css('height', '0px');
	},
	render: function() {
		//<ReactCSSTransitionGroup transitionName={transition}>
		//</ReactCSSTransitionGroup>
		var pageComps = (
		    <RouteHandler key={this.getPath()}/>
		);

		return (
			<div className='shelf'>
				{pageComps}
				<div id='appMap' style={{'display': 'none'}}/>
				<div id='alertAfter' className="alert-modalDiv" style={{"width": "0px","height": "0px"}}></div>
				<div id="alertBefore" className="alert-fancy alert-modal alert-comment-modal" style={{"textAlign":"left"}}>
					<div><span id='alertTxt' >111</span></div>
					<div className='clear-float'></div>
					<div id="comment-confirm" className="alert-link" onClick={this._hide}>
						<span >确定</span>
					</div>
				</div>
			</div>
		);
	}
});

// 访问路径跳转定义
var routes = (
	<Route path='/' handler={App}>
		<Route name={Constants.Url.FAVORITE} path='favorite' handler={Favorite} /> // 我的收藏
		<Route name={Constants.Url.FACILITY} path='facility' handler={Facility} /> // 设施详情
		<Route name={Constants.Url.DISTRICT} path='district' handler={District} /> // 区域详情
		<Route name={Constants.Url.QUEUE_DETAIL} path='queueDetail' handler={QueueDetail} /> // 排队详情
		<Route name={Constants.Url.COMMENT_LIST} path='commentList' handler={CommentList} /> // 评论列表
		<Route name={Constants.Url.POST_COMMENT} path='postComment' handler={PostComment} /> // 发表评论
		<Route name={Constants.Url.NEARBY} path='nearby' handler={Nearby} /> // 我的附近
		<Route name={Constants.Url.SEARCH} path='search' handler={Search} /> // 项目搜索
		<Route name={Constants.Url.PLAN} path='plan' handler={Plan} /> // 游玩攻略
		<Route name={Constants.Url.NEWS} path='news' handler={News} /> // 信息中心
		<Route name={Constants.Url.NEWS_DETAIL} path='newsDetail' handler={NewsDetail} /> // 信息详情
		//-----------------------------地图相关页面  start------------------------------
		<Route name={Constants.Url.MAP_INDEX} path='map_index' handler={MapIndex} /> // 景区导航主页
		<Route name={Constants.Url.MAP_FOOT} path='map_foot' handler={MapFoot} /> // 足迹页面
		<Route name={Constants.Url.MAP_NAV} path='map_nav' handler={MapNav} /> // 导航页面
		<Route name={Constants.Url.MAP_NAV_RESULT} path='map_nav_result' handler={MapNavResult} /> // 导航结果页面
		<Route name={Constants.Url.MAP_NAV_RESULT_DETAIL} path='map_nav_result_detail' handler={MapNavResultDetail} /> // 导航结果详情页面
		<Route name={Constants.Url.MAP_NAV_BUS_RESULT} path='map_nav_bus_result' handler={MapNavBusResult} /> // 公交导航结果页面
		<Route name={Constants.Url.MAP_NAV_WALK_RESULT} path='map_nav_walk_result' handler={MapNavWalkResult} /> // 步行导航结果页面
		//-----------------------------地图相关页面  end--------------------------------
	</Route>
);

Router.run(routes, function(Root) {
	React.render(<Root />, document.body);
});
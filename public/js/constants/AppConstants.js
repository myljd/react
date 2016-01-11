
/**
 * 常量定义
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/7
 * 
 */

var keyMirror = require('key-mirror');

module.exports = {

	Url: {
		FAVORITE: '/favorite',
		FACILITY: '/facility',
		QUEUE_DETAIL: '/queueDetail',
		COMMENT_LIST: '/commentList',
		POST_COMMENT: '/postComment',
		NEARBY: '/nearby',
		SEARCH: '/search',
		DISTRICT: '/district',
		LOADING: '/loading',
		PLAN: '/plan',
		NEWS: '/news',
		NEWS_DETAIL: '/newsDetail',
		//-----地图页面 start--------
		MAP_INDEX: '/map_index',
		MAP_FOOT: '/map_foot',
		MAP_NAV: '/map_nav',
		MAP_NAV_RESULT: '/map_nav_result',
		MAP_NAV_RESULT_DETAIL: '/map_nav_result_detail',
		MAP_NAV_BUS_RESULT: '/map_nav_bus_result',
		MAP_NAV_WALK_RESULT: '/map_nav_walk_result',
		//-----地图页面 end--------

		IMG_URL: 'http://konglongchen.breadtech.cn',
		QINIU_URL: 'http://7xlyt3.com2.z0.glb.qiniucdn.com',
		INTERNAL_URL: 'http://10.0.0.200:8001',
		INTERNAL_IMG_URL: 'http://10.0.0.200:7878',
		FOOD_DATA_URL: 'http://ws.cnkly.com/smartguiders/service/rest/shop/list',
	},

	// 图片路径定义
	Images: {
		BACK: 'public/images/back_nav.svg',
		SHARE: '../public/images/xxx.png',
		SEARCH: 'public/images/search_gray.svg',
		COMMENT: 'public/images/comment.svg',
		GOTO: 'public/images/goto.svg',
		GOTO_DISABLE: 'public/images/goto_disable.svg',
		GOTO_FOOTER: 'public/images/goto_footer.svg',
		FAVORITE: 'public/images/favorite.png',
		FAVORITE_FULL: 'public/images/favorite_full.png',
		DEFAULT_SQUARE: 'public/images/thumbnail_square.jpg',
		DEFAULT_RECTANGLE: 'public/images/thumbnail_rectangle.jpg',
		STAR_ON: 'public/images/star_on.svg',
		STAR_OFF: 'public/images/star_off.svg',
		QUEUE_IDLE: 'public/images/queue_idle.svg',
		QUEUE_MEDIUM: 'public/images/queue_medium.svg',
		QUEUE_BUSY: 'public/images/queue_busy.svg',
		HEAD: 'public/images/head.svg',
		NEARBY: 'public/images/nearby.svg',
		DETAILS: 'public/images/details.svg',
		POST: 'public/images/check.svg',
		NOTICE: 'public/images/notice.png',
		NO_FAVORITE: 'public/images/no_favorite.png',
		ARROW_UP: 'public/images/arrow_up.svg',
		DEFAULT_NEWS: 'public/images/default_news.jpg',
		TELEPHONE: 'public/images/telephone.svg',
		PLAY: 'public/images/play_play.svg',
		PAUSE: 'public/images/play_pause.svg',
		AUDIO_BG: 'public/images/play_bg.jpg',
		FAVORITE_HINT: 'public/images/favorite_hint.png',
	},

	Titles: {
		FAVORITE: '我的收藏'
	},

	// 文字常量定义
	Strings: {
		SHARE: '分享',
		NEARBY: '附近',
		COMMENT: '评论',
		GOTO: '到这去',
		FAVORITE: '收藏',
		QUEUE_IDLE: '畅通',
		QUEUE_MEDIUM: '适中',
		QUEUE_BUSY: '拥挤'
	},

	Resource: {
		IMAGE: "1",
		VIDEO: "0",
		AUDIO: "2",
	},

	// 项目类型
	Category: {
		DISTRICT: '0',
		FACILITY: '1',
		FOOD: '2',
		COMMODITY: '3',
		PUBLIC: '4',
		BRANCH: '5',
	},

	// 排队
	QueueStatus: {
		IDLE: 0,
		MEDIUM: 1,
		BUSY: 2
	},

	// Action类型
	ActionTypes: keyMirror({
		QUERY_PROJECT_GROUP_FACILITY: null,
		QUERY_PROJECT_GROUP_DISTRICT: null,
		QUERY_PROJECT_GROUP_PUBLIC: null,
		QUERY_PROJECT_GROUP_FOOD: null,
		QUERY_PROJECT_GROUP_COMMODITY: null,
		QUERY_PROJECT_GROUP_BRANCH: null,
		QUERY_PROJECT_DETAIL: null,
		QUERY_PROJECT_QUEUE: null,
		QUERY_PROJECT_KEYWORDS: null,
		QUERY_COMMENT_GROUP: null,
		QUERY_COMMENT_BRIEF: null,
		QUERY_NEARBY_PROJECT_LOCATION_GROUP: null,
		QUERY_FAVORITE_PROJECT_GROUP: null,
		QUERY_QUEUE_GROUP: null,
		QUERY_PROJECT_DETAIL_CONTENT: null,
		QUERY_COMMENT_GROUP: null,
		QUERY_USER: null,
		QUERY_SEARCH_PROJECT_GROUP: null,
		POST_COMMENT: null,
		POST_FAVORITE: null,
		POST_FAVORITE_PROJECT: null,
		LOCAL_COMMENT_QUERY: null,
		LOCAL_PROJECT_QUERY: null,
		LOCATE_POSITION: null,
		QUERY_NAV_START: null,
		QUERY_NAV_END: null,
		QUERY_MAP_FOOT: null,
		JUMP_TO_NAV_RESULT:null,
		QUERY_ALL_NAV_RECORD:null,
		DELETE_NAV_RECORD:null,
		SAVE_NAV_RECORD:null,
		LOCATION_BUS_PLAN:null,
		QUERY_ALL_PROJECT:null,
		QUERY_USER: null,
		LOCATE_UP_FOOT_DATA: null,
		QUERY_NEWS: null,
		INTERNAL_PING: null,
		POST_GET_WX: null,
		LOCATION_LOADING_HIDE:null,
		IS_START_IN:null,
		LODING_SHOW:null,
		LODING_HIDE:null,
		POST_ALIPAY_USERINFO:null,
	})
}
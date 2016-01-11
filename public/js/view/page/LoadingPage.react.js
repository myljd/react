/**
 * 数据加载界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/8
 * 
 */

var React = require('react');
var Router = require('react-router');
var Navigation = Router.Navigation;
var State = Router.State;

var UserStore = require('../../stores/UserStore');
var ProjectStore = require('../../stores/ProjectStore');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var Constants = require('../../constants/AppConstants');
var ActionTypes = Constants.ActionTypes;

var QueryAction = require('../../actions/QueryAction');

var AppHeader = require('../AppHeader.react');
var AppDispatcher = require('../../dispatcher/AppDispatcher');

var LoadingPage = React.createClass({

	mixins: [State, Navigation],

	componentWillUnmount: function() {

		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onAllFacilityUpdate);
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onAllDistrictUpdate);
		UserStore.removeChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onFavoriteUpdate);
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onAllFacilityUpdate);
		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_DISTRICT_EVENT, this._onAllDistrictUpdate);
		UserStore.addChangeListener(UserStore.QUERY_FAVORITE_EVENT, this._onFavoriteUpdate);


		QueryAction.queryProjectGroup(Constants.Category.FACILITY);
		ProjectStore.setResourcePath(this.getQuery().imgPath);

		var map = new AMap.Map('map', {

    	});

	    map.plugin('AMap.Geolocation', function() {
	        geolocation = new AMap.Geolocation({
	            enableHighAccuracy: true, //是否使用高精度定位，默认:true
	            timeout: 15000, //超过10秒后停止定位，默认：无穷大
	            maximumAge: 0, //定位结果缓存0毫秒，默认：0
	            // convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
	            // showButton: false, //显示定位按钮，默认：true
	            // buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
	            // buttonOffset: new AMap.Pixel(15, 80), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
	            // showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
	            // showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
	            // panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
	            // zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
	        });
	        map.addControl(geolocation);
	        AMap.event.addListener(geolocation, 'complete', function(data) {
				AppDispatcher.dispatch({
					type: ActionTypes.LOCATE_POSITION,
					data: data,
					result: true
				});
	        }); //返回定位信息
	        AMap.event.addListener(geolocation, 'error', function(data) {
				AppDispatcher.dispatch({
					type: ActionTypes.LOCATE_POSITION,
					data: data,
					result: false
				});
	        }); //返回定位出错信息
	        geolocation.getCurrentPosition();
	    });
	},

	render: function() {

		return (
			<div className="book book-current" id="book">
				<div className='page page-current hascover' id='facilityPage'>
					<div className='cover'>
						<AppHeader backBtn />
					</div>
					<div className='container marginTop'>
						<div>加载中，请稍候</div>
						<div id="map" style={{'display': 'none'}}></div>
					</div>
				</div>
			</div>
		);
	},

	_onAllFacilityUpdate: function() {
		console.log('LoadingPage _onAllFacilityUpdate')
		QueryAction.queryProjectGroup(Constants.Category.DISTRICT);
	},

	_onAllDistrictUpdate: function() {
		console.log('LoadingPage _onAllDistrictUpdate');
		QueryAction.queryFavoriteProjectGroup();
	},

	_onFavoriteUpdate: function() {

		console.log('LoadingPage _onFavoriteUpdate');

		var url = this.getQuery().nextUrl;
		if (url != null && url.indexOf('/') < 0) {
			var url = '/' + url;
		}
		var title = FormatUtil.getTitle(url);

		var projectId =this.getQuery().projectId;
		console.log(this.getPath());
		console.log('projectId = ' + projectId);

		ProjectStore.initApp();
		this.replaceWith(url, {}, {title: title, projectId: projectId});
	}
});

module.exports = LoadingPage;
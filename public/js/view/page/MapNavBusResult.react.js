/**
 * 我的收藏界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/8
 * 
 */

var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;

var Constants = require('../../constants/AppConstants');

var ListItem = require('../component/ListItem.react');
var AppHeader = require('../AppHeader.react');
var ProjectItem = require('../ProjectItem.react');
var PostAction = require('../../actions/PostAction');
var ViewUtil = require('../../utils/HowUIUtil');
var MapUtil = require('../../utils/MapUtil');
var Prompt = require('../component/Prompt.react');
var QueryAction = require('../../actions/QueryAction');
var LocationStore = require('../../stores/LocationStore');

/**
 * 我的收藏
 */
var MapNavBusResultPage = React.createClass({

	mixins: [Navigation, State],

	componentWillUnmount: function() {
		MapUtil.clearWatchMyPosition();
		MapUtil.destroyMap();
		LocationStore.removeChangeListener(LocationStore.LODING_SHOW, this._lodingPngShow);
		LocationStore.removeChangeListener(LocationStore.LOCATION_HIDE, this._lodingHide);
		// LocationStore.removeChangeListener(LocationStore.LOCATION_GET_WX, this._getWxSignature);
	},

	componentDidMount: function() {
		// MapUtil.setInIndex(0);
		// MapUtil.setZoomFlag(16);
		// MapUtil.init();
		// MapUtil.setAllOffset(20);
		// MapUtil.initGeolocation();
		// MapUtil.startMapInterval();
		

		MapUtil.setInIndex(2);
		MapUtil.setZoomFlag(16);
		MapUtil.init();
		MapUtil.setAllOffset(20);
		MapUtil.initAreaResult();
		MapUtil.initGeolocation();

		MapUtil.setNavMineFlag(1);
	   	MapUtil.setNavFlag(1);

		MapUtil.bus_route();
		MapUtil.startMapInterval();


		LocationStore.addChangeListener(LocationStore.LODING_SHOW, this._lodingPngShow);
		LocationStore.addChangeListener(LocationStore.LOCATION_HIDE, this._lodingHide);
		// LocationStore.addChangeListener(LocationStore.LOCATION_GET_WX, this._getWxSignature);
		//获取微信定位
		// PostAction.getSignature();

	},

	/**
	 * 提示即将载入
	 */
	_lodingPngShow: function() {
		this.refs.prompt.show('高清图加载中，请稍候...');
	},

	/**
	 * 载入完成
	 */
	_lodingHide: function () {
	    setTimeout(this.refs.prompt.hide, 200);
	},
	/**
	 * 提示即将载入
	 */
	_lodingShow: function() {
		this.refs.prompt.show('加载中，请稍候...');
	},
	// _getWxSignature: function() {
		
	// },

	_onNavBack: function() {
		if (this.getQuery().back_url!=null) {
			this.transitionTo(this.getQuery().back_url, {}, {});
		}else{
			this.goBack();
		}
	},
	render: function() {
		return (						
			<div>
				<div className='cover'>
					<AppHeader title='导航路线' backBtn />
				</div>
				
				<div className="nav_result_header">
			        <div className="nav_header_img">
			            <div style={{"width":"100%","float":"left"}}>
			                <a className="bus_nav"><i></i></a>
			            </div>
			            
			        </div>
			    </div>
			    <div id="map"></div>

			    <div className="map_zoom map_icon_shadow" style={{"bottom":"20px"}}>
			        <a className="map_zoomin" onClick={MapUtil.mapIn}></a>
			        <a className="map_zoomout" onClick={MapUtil.mapOut}></a>
			    </div>
			    <div className="map_locate map_icon_shadow" style={{"bottom":"20px"}}>
			        <a className="location_icon" onClick={MapUtil.getMyPosition}></a>
			    </div>
			    <Prompt ref='prompt'/>
			</div>		    
			    	
		);
	},

});

module.exports = MapNavBusResultPage;
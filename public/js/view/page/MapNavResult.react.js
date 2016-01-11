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
var ProjectStore = require('../../stores/ProjectStore');

/**
 * 我的收藏
 */
var MapNavResultPage = React.createClass({

	mixins: [Navigation, State],
	getInitialState: function() {
		return {
			busPlanData: {},
			isInKly:false,
		};
	},

	componentWillUnmount: function() {
		MapUtil.destroyMap();
		LocationStore.removeChangeListener(LocationStore.LOCATION_BUS_PLAN, this._getBusPlan);
		LocationStore.removeChangeListener(LocationStore.LODING_SHOW, this._lodingPngShow);
		LocationStore.removeChangeListener(LocationStore.LOCATION_HIDE, this._lodingHide);
		LocationStore.removeChangeListener(LocationStore.LOCATION_LOADING_HIDE, this._lodingHide);
		LocationStore.removeChangeListener(LocationStore.IS_START_IN, this._is_start_in1);
		MapUtil.clearMyInterval();
	},

	_getBusPlan: function() {
		this.setState({
			busPlanData: LocationStore.getBusPlan()
		});
	},

	componentDidMount: function() {
		MapUtil.setInIndex(2);
		MapUtil.setZoomFlag(16);
		MapUtil.init();
		MapUtil.setAllOffset(70);
		MapUtil.initAreaResult();
		MapUtil.initGeolocation();
		this._initResult();
		MapUtil.startMapInterval();
		// this._getWxSignature();
		$('.map_zoomin').bind('click', MapUtil.mapIn);
		$('.map_zoomout').bind('click', MapUtil.mapOut);

		$('.result_message_right').bind('click', this._goDetail);

		
		$('.location_icon').bind('click', MapUtil.getMyPosition);

		if (localStorage.is_start_in == true) {
			this.setState({
				isInKly: true
			})
		};
		LocationStore.addChangeListener(LocationStore.LOCATION_BUS_PLAN, this._getBusPlan);
		LocationStore.addChangeListener(LocationStore.LODING_SHOW, this._lodingPngShow);
		LocationStore.addChangeListener(LocationStore.LOCATION_HIDE, this._lodingHide);
		LocationStore.addChangeListener(LocationStore.LOCATION_LOADING_HIDE, this._lodingHide);
		LocationStore.addChangeListener(LocationStore.IS_START_IN, this._is_start_in1);
		//获取微信定位
	},
	_is_start_in1: function () {
		// console.log('IS_START_IN11111',IS_START_IN)
		if (localStorage.is_start_in == true || localStorage.is_start_in=='true') {
			this.setState({
				isInKly: true
			})
		}else{
			this.setState({
				isInKly: false
			})
		}
	},

	/**
	 * 提示即将载入
	 */
	_lodingPngShow: function() {
		this.refs.prompt.show('高清图加载中，请稍候...');
	},

	_removeItem: function () {
	   	localStorage.removeItem("text_end");
	   	localStorage.removeItem("lng_end");
	   	localStorage.removeItem("lat_end");
	   	localStorage.removeItem("cityCode_end");
	   	localStorage.removeItem("text_start");
	   	localStorage.removeItem("lng_start");
	   	localStorage.removeItem("lat_start");
	   	localStorage.removeItem("cityCode_start");
	},

	_initResult: function () {
	   console.log(localStorage.navWay);
	   this._lodingShow();
	   //如果有项目id参数,进行项目导航
	   if (this.getQuery().lng!=null) {
	   		this._removeItem();
	   		localStorage.lng_end = this.getQuery().lng;
	        localStorage.lat_end = this.getQuery().lat;
	        localStorage.cityCode_end = "0519";

	        localStorage.lng_hold_end = localStorage.lng_end;
	   		localStorage.lat_hold_end = localStorage.lat_end;
	   		localStorage.cityCode_hold_end = localStorage.cityCode_end;

	        if (localStorage.navWay==null) {
	   			localStorage.navWay = 'walk_nav';
	   		};
	   		if (localStorage.lng_mine!=null && localStorage.lng_mine!='undefined') {
		        MapUtil.setNavMineFlag(0);
		        MapUtil.setNavFlag(0);
	        }else{
	        	MapUtil.setNavFlag(0);
	        }
	        
	   }else{
	   		MapUtil.setNavMineFlag(1);
	   		MapUtil.setNavFlag(1);
	   		
	   		if (localStorage.navWay.indexOf("bus_nav") != -1) {
                MapUtil.bus_plan();
            }
            if (localStorage.navWay.indexOf("car_nav") != -1) {
                MapUtil.driving_route();
            }
            if (localStorage.navWay.indexOf("walk_nav") != -1) {
                MapUtil.walking_route();
            }
	   		// MapUtil.getMyPosition();
	   		
	   }
		
	},

	_goBusDetail: function (event) {
		localStorage.busStep = event.currentTarget.id;
	    this.transitionTo(Constants.Url.MAP_NAV_RESULT_DETAIL, {}, {})
	},

	_goDetail: function () {
	    this.transitionTo(Constants.Url.MAP_NAV_RESULT_DETAIL, {}, {})
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

	/*
	 *解析定位结果
	 */
	_completeOnHtml: function (data) {
	    $(".location_icon").css('background-image', 'url(public/images/after_location.svg)');
	},
	
	_chooseNav: function (event) {
		this._lodingShow();
	    var chooseWay = event.currentTarget.getAttribute('class');
	    localStorage.navWay = chooseWay;
	    console.log(localStorage.lng_start, localStorage.lat_start,localStorage.cityCode_start);
	    console.log(localStorage.lng_end, localStorage.lat_end,localStorage.cityCode_end);
	    $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
	    if (chooseWay == "bus_nav") {
	        MapUtil.bus_plan();
	    }
	    if (chooseWay == "car_nav") {
	        
	        MapUtil.driving_route();
	    }
	    if (chooseWay == "walk_nav") {
	        
	        MapUtil.walking_route();
	    }
	},

	render: function() {
		var listComps = [];
		if (this.state.busPlanData!=null && this.state.busPlanData.plans!=null) {			
		  	var data = this.state.busPlanData;
		    var btPlans = data.plans;
		    //遍历每种换乘方案 
		    for (var i = 0; i < btPlans.length; i++) {
		        var btDistance = btPlans[i].distance;
		        var btseg = btPlans[i].segments;
		        var lineName = '';
		        var lineBusStop = 0;
		        var lineWalkDis = MapUtil.getTotalDistance(btPlans[i].walking_distance);
		        var lineTime = MapUtil.getTotalTime(btPlans[i].time);
		        for (var j = 0; j < btseg.length; j++) {
		            if (btseg[j].transit_mode != "WALK") {
		                if (btseg[j].transit.via_num != null) {
		                    lineBusStop += btseg[j].transit.via_num;
		                }
		                if (lineName == '') {
		                    if (btseg[j].transit_mode == "BUS") {
		                        lineName = btseg[j].transit.lines[0].name.split("(")[0];
		                    }else if(btseg[j].transit_mode == "RAILWAY") {
		                        lineName = btseg[j].transit.trip;
		                    }else if(btseg[j].transit_mode == "SUBWAY") {
		                        lineName = btseg[j].transit.lines[0].name.split("号线")[0]+"号线";
		                    }     
		                } else {
		                    if (btseg[j].transit_mode == "BUS") {
		                        lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
		                    }else if(btseg[j].transit_mode == "RAILWAY") {
		                        lineName += "→" + btseg[j].transit.trip;
		                    }else if(btseg[j].transit_mode == "SUBWAY") {
		                        lineName += "→" + btseg[j].transit.lines[0].name.split("号线")[0]+"号线";
		                    }     
		                    // lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
		                }
		            }
		        }
		        listComps.push(
		        	<div id={i} className='common_light navigation_buslist_content_item ' onClick={this._goBusDetail}>
		        		<div className=''>
		        			<div className='navigation_buslist_content_content clearfix'>
		        				<h3>{lineName}</h3> 
		        			</div>
			        		<div className='navigation_buslist_content_desc_content clearfix text-overflow'>
			        			<span className='bus-eta-status-1'>畅通</span>
			        			<span className='bus-info-divide'> | </span> 
			        			<span>{'约' + lineTime}</span>
			        			<span className='bus-info-divide'> | </span> 
			        			<span>{lineBusStop + '站'}</span>
			        			<span className='bus-info-divide'> | </span> 
			        			<span>{'步行' + lineWalkDis}</span> 
			        		</div>
			        	</div>
		        	</div>
		        );

		   }

		}

		var headerComps = [];
		console.log('this.state.isInKly',this.state.isInKly)
        if (!this.state.isInKly) {
        	headerComps.push(

        		<div className="nav_header_img">
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="bus_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="car_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="walk_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		        </div>
        	);
        }else{
        	headerComps.push(
        		<div className="nav_header_img">
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="bus_nav" ><i style={{backgroundImage:'url(public/images/bus_gray.svg)'}}></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="car_nav" ><i style={{backgroundImage:'url(public/images/car_gray.svg)'}}></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} >
		                <a className="walk_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		        </div>
        	);
        }

		return (						
			<div className='map_nav_result'>
				<div className='cover'>
					<AppHeader title='导航路线' backBtn />
				</div>
				<div className="nav_result_header">
			        {headerComps}
			    </div>
			    <div id="bus_div" style={{"display":"none"}}>
			    	<div className='common_shadow navigation_buslist_content common_light' key={0}>
						{listComps}
					</div>
			    </div>
			    <div id="map_div" >
			        <div id="map"></div>
			        <div className="map_zoom map_icon_shadow" style={{"bottom":"70px"}}>
			            <a className="map_zoomin"></a>
			            <a className="map_zoomout"></a>
			        </div>
			        <div className="map_locate map_icon_shadow" style={{"bottom":"70px"}}>
			            <a className="location_icon"></a>
			        </div>
			        <div className="message_box map_icon_shadow" style={{"bottom":"10px","height":"50px"}}>
			            <div className="message_left">
			                <div className="time_dis"></div>
			            </div>
			            <div className="result_message_right">
			                <div className="message_pic"></div>
			                <div className="message_desc">详情</div>
			            </div>
			        </div>
			    </div>
			    <Prompt ref='prompt'/>
			</div>		    
			    	
		);
	},

});

module.exports = MapNavResultPage;
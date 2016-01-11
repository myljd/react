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

var ViewUtil = require('../../utils/HowUIUtil');
var MapUtil = require('../../utils/MapUtil');
var WebAPIUtil = require('../../utils/WebAPIUtil');

var QueryAction = require('../../actions/QueryAction');
var PostAction = require('../../actions/PostAction');
var LocationStore = require('../../stores/LocationStore');
var AppHeader = require('../AppHeader.react');
var AppFooter = require('../AppFooter.react');
var Prompt = require('../component/Prompt.react');
/**
 * 我的收藏
 */
var MapIndexPage = React.createClass({

	mixins: [Navigation, State],
	chooseItem : 'zhklg',

	componentWillUnmount: function() {
		LocationStore.removeChangeListener(LocationStore.LOCATION_ALL_PROJECT, this._getAllProject);
		// LocationStore.removeChangeListener(LocationStore.LOCATION_GET_WX, this._getWxSignature);
		LocationStore.removeChangeListener(LocationStore.LODING_SHOW, this._lodingShow);
		LocationStore.removeChangeListener(LocationStore.LODING_HIDE, this._lodingHide);
		MapUtil.destroyMap();
		MapUtil.clearMyInterval();
	},

	componentDidMount: function() {
		this._emptyLocalStorage();
		

		$('.map_zoomin').bind('click', MapUtil.mapIn);
		$('.map_zoomout').bind('click', MapUtil.mapOut);
		$('.location_icon').bind('click', MapUtil.getMyPosition);

		$('#nav').bind('click', this._nav);
		$('#near').bind('click', this._near);
		$('#search').bind('click', this._search);
		$('#foot').bind('click', this._foot);
		$('.message_right').bind('click', this._goDetails);

		// localStorage.removeItem("open_id");

		LocationStore.addChangeListener(LocationStore.LOCATION_ALL_PROJECT, this._getAllProject);
		LocationStore.addChangeListener(LocationStore.LODING_SHOW, this._lodingShow);
		LocationStore.addChangeListener(LocationStore.LODING_HIDE, this._lodingHide);

		QueryAction.getAllProject();
		//获取微信定位
		// PostAction.getSignature();
	},

	// _getWxSignature: function() {
		
	// },

	_getAllProject: function() {
		MapUtil.setProjectData( LocationStore.getAllProject() );
		// MapUtil.initArea();
		
		MapUtil.setShowType('zhklg');
		MapUtil.setInIndex(1);
		MapUtil.setZoomFlag(16);
		MapUtil.init();
		MapUtil.initAreaResult();
		MapUtil.initGeolocation();
		MapUtil.startMapInterval();
		
	},

	
	_emptyLocalStorage: function() {
		localStorage.removeItem("is_start_in");
		localStorage.removeItem("lat_start");
	    localStorage.removeItem("lng_start");
	    localStorage.removeItem("text_start");
	    localStorage.removeItem("cityCode_start");

	    localStorage.removeItem("lat_end");
	    localStorage.removeItem("lng_end");
	    localStorage.removeItem("text_end");
	    localStorage.removeItem("cityCode_end");

	    localStorage.removeItem("isInFeature");
	    localStorage.removeItem("navWay");
	},
	//导航
	_nav: function() {
		// alert("评论成功11");
		this.transitionTo(Constants.Url.MAP_NAV, {}, {})
	},
	//附近
	_near: function() {
		this.transitionTo(Constants.Url.NEARBY, {}, {title: "我的附近",lng:"",lat:""})
	},

	//搜索
	_search: function() {
		this.transitionTo(Constants.Url.SEARCH, {}, {title: "搜索"})
	},

	//足迹
	_foot: function() {
		this.transitionTo(Constants.Url.MAP_FOOT, {}, {})
	},
	//详情
	_goDetails: function() {
		if(localStorage.isProject == 0){
			this.transitionTo(Constants.Url.DISTRICT, {}, {projectId:localStorage.chooseId})
		}else{
			this.transitionTo(Constants.Url.FACILITY, {}, {projectId:localStorage.chooseId})
		}
	},
	_showAllType: function() {

		if ($('#allType').css('display') == 'none') {
			$('#all').html('全部');
			$('#allType').css('display','inline');
		}else{
			if (this.chooseItem != 'all') {
				this._confirm('全部显示数据较多,可能产生卡顿现象,您确认全部显示吗?');
			}else{
				$('#allType').css('display','none');
			}
		}
		
	},
	_showType: function(event) {

		console.log(event.currentTarget);
		var id = event.currentTarget.id;
		
		
		$('#all').html($('#'+id).html());
		$('#allType').css('display','none');
		$('#'+this.chooseItem).css('background-color','#fff');
		$('#'+this.chooseItem).css('border','1px solid #ccc');
		$('#'+this.chooseItem).css('color','#333333')
		$('#'+id).css('background-color','#f7931e')
		$('#'+id).css('border','1px solid #d16605')
		$('#'+id).css('color','#fff')
		this.chooseItem = id;

		MapUtil.setShowType(id);
		MapUtil.reDrawByType();
		
	},

	_confirm: function(txt) {
	    var modal = $('#confirmBefore');
	    var modalDiv = $('#confirmAfter');
	    $('#confirmTxt').empty();
	    $('#confirmTxt').append(txt);
	    
	    modal.addClass('show');
	    modalDiv.css('width', '100%');
	    modalDiv.css('height', '100%');
	},

	_hide: function() {
		var modal = $('#confirmBefore');
		var modalDiv = $('#confirmAfter');

		modal.removeClass('show');
		modalDiv.css('width', '0px');
		modalDiv.css('height', '0px');
	},

	_showAll: function() {
		var modal = $('#confirmBefore');
		var modalDiv = $('#confirmAfter');

		modal.removeClass('show');
		modalDiv.css('width', '0px');
		modalDiv.css('height', '0px');

		$('#all').html('全部');
		$('#allType').css('display','none');

		$('#'+this.chooseItem).css('background-color','#fff');
		$('#'+this.chooseItem).css('border','1px solid #ccc');
		$('#'+this.chooseItem).css('color','#333333')
		$('#all').css('background-color','#f7931e')
		$('#all').css('border','1px solid #d16605')
		$('#all').css('color','#fff')
		this.chooseItem = 'all';

		MapUtil.setShowType('all');
		MapUtil.reDrawByType();

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
		this.refs.prompt.show('高清图加载中，请稍候...');
	},

	render: function() {
		var screenH = screen.height;
		var hComps =[];
		if (screenH <= 480) {
			hComps.push(
				<div>
					<div id='food' className="map_type" style={{'top':'60px','right':'115px'}} onClick={this._showType}>
				        美食
					</div>
					<div id='other' className="map_type" style={{'top':'95px','right':'115px'}} onClick={this._showType}>
				        公共
				    </div>
			    </div>
			);
		}else{
			hComps.push(
				<div>
					<div id='food' className="map_type" style={{'top':'375px'}} onClick={this._showType}>
				        美食
					</div>
					<div id='other' className="map_type" style={{'top':'410px'}} onClick={this._showType}>
				        公共
				    </div>
			    </div>
			);
		}
		return (						
			<div className='map_nav_result'>
				<div id='appMap' style={{'display': 'none'}}/>
					<div id='confirmAfter' className="alert-modalDiv" style={{"width": "0px","height": "0px"}}></div>
					<div id="confirmBefore" className="alert-fancy alert-modal alert-comment-modal" style={{"textAlign":"left"}}>
					<span id='confirmTxt' >全部显示数据较多,可能产生卡顿现象,您确认全部显示吗?</span>
					<div id="confirmYes" className="alert-link" style={{'margin-right': '50px'}} onClick={this._showAll} >
						<span >确定</span>
					</div>
					<div id="confirmCancle" className="alert-link" onClick={this._hide}>
						<span >取消</span>
					</div>
				</div>

				<div className='cover'>
					<AppHeader title={'景区导航'} />
				</div>
				<div id="map"></div>


				

				<div id='all' className="map_type" onClick={this._showAllType} >
					全部
			    </div>
			    <div id='allType'>
					<div id='zhklg' className="map_type" style={{'top':'95px'}} onClick={this._showType}>
						中华恐龙馆
				    </div>
				    <div id='xhklc'  className="map_type" style={{'top':'130px'}} onClick={this._showType}>
				        嘻哈恐龙城
				    </div>
				    <div id='kksk' className="map_type" style={{'top':'165px'}} onClick={this._showType}>
				        库克苏克
				    </div>
				    <div id='lbl' className="map_type" style={{'top':'200px'}} onClick={this._showType}>
				        鲁布拉
				    </div>
				    <div id='mhyl' className="map_type" style={{'top':'235px'}} onClick={this._showType}>
				        魔幻雨林
				    </div>
				    <div id='mhzy' className="map_type" style={{'top':'270px'}} onClick={this._showType}>
				        梦幻庄园
				    </div>
				    <div id='dnsz' className="map_type" style={{'top':'305px'}} onClick={this._showType}>
				        迪诺水镇
				    </div>
				    <div id='shop' className="map_type" style={{'top':'340px'}} onClick={this._showType}>
				        商店
				    </div>
				    {hComps}
			    </div>
				<div className="map_zoom map_icon_shadow">
			        <a className="map_zoomin" ></a>
			        <a className="map_zoomout" ></a>
			    </div>
			    <div className="map_locate map_icon_shadow">
			        <a className="location_icon" ></a>
			    </div>
			     <div className="map_footer map_icon_shadow">
			        <div className="message_index_box" style={{"display":"none"}}>
			        	<div className="message_index_box_bottom">
				            <div className="message_left">
				                <div className="message_name">雷龙过山车</div>
				                <div className="message_dis">140米</div>
				            </div>
				            <div className="message_right">
				                <div className="message_pic_index"></div>
				                <div className="message_desc">详情</div>
				            </div>
			            </div>
			        </div>
			        <div className="map_font" style={{"width":"100%","height":"40px"}}>
			            <div id="nav" className="float_div" style={{"width":"24%"}}>
			                <a><img id="nav_i" src="public/images/nav.svg"/><span id="navSpan">导航</span></a>
			            </div>
			            <div className="float_div" id="near">
			                <a><img id="near_i" src="public/images/near.svg"/>附近</a>
			            </div>
			            <div className="float_div" id="search">
			                <a><img id="search_i" src="public/images/search.svg"/>搜索</a>
			            </div>
			            <div className="float_div" id="foot" style={{"width":"26%"}}>
			                <a><img id="foot_i" src="public/images/foot.svg"/>足迹</a>
			            </div>
			        </div>
			    </div>
			    <Prompt ref='prompt' />
			</div>		    
			    	
		);
	}


});

module.exports = MapIndexPage;
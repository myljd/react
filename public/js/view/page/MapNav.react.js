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

var MapUtil = require('../../utils/MapUtil');
var ViewUtil = require('../../utils/HowUIUtil');

var QueryAction = require('../../actions/QueryAction');
var PostAction = require('../../actions/PostAction');
// var ProjectStore = require('../../stores/ProjectStore');
var LocationStore = require('../../stores/LocationStore');

var SearchStart = require('../../utils/SearchStart');
var SearchEnd = require('../../utils/SearchEnd');




var Start = React.createClass({

	mixins: [Navigation, State],
	getInitialState: function() {
		return {
			navStartData: []
		};
	},

	componentWillUnmount: function() {
		LocationStore.removeChangeListener(LocationStore.LOCATION_NAV_START, this._onNavStartChange);
	},

	componentDidMount: function() {

		LocationStore.addChangeListener(LocationStore.LOCATION_NAV_START, this._onNavStartChange);
		
	},

	
	_onNavStartChange: function() {
		this.setState({
			navStartData: LocationStore.getNavStart()
		});
	},
	
	render: function() {
		if (this.state.navStartData!=null) {	

		  	var tipArr = this.state.navStartData.tips;
		    var listComps = [];
		    if (tipArr && tipArr.length > 0) {
		        
		        for (var i = 0; i < tipArr.length && i < 7; i++) {

		            listComps.push(
		                <li id={'divid_'+(i+1)} key={'divid_'+i} onClick={SearchStart.selectResultStart}  className='text-overflow'>
		                    <span id={'span_' + (i + 1)} key={'span_' +i} className='poi-name'>{tipArr[i].name}</span>
		                    <span id={'district_' + (i + 1)} key={'district_' +i} className='search_history_item_district'>{ tipArr[i].district }</span>
		                    <input id={'lat_' + (i + 1)} key={'lat_' +i} type='hidden' value={ tipArr[i].location.lat } />
		                    <input id={'lng_' + (i + 1)} key={'lng_' +i} type='hidden' value={ tipArr[i].location.lng } />
		                    <input id={'cityCode_' + (i + 1)} key={'cityCode_' +i} type='hidden' value={ tipArr[i].adcode } />
		                </li> 
		            );
		        }
		        
		    } else {
		        listComps.push(
		                <li  className=' text-overflow' key={'start_'+0}>
		                    <span className='poi-name'>未找到结果,请尝试不同的关键字</span>
		                </li>
		            );
		    } 
		}

		return (						
			<div key={'start'}>
				<div className='input_line'></div>
				<ul className='history_item shadow' >
				    {listComps}
				</ul>
			</div>		  
		);
	},


});


var End = React.createClass({

	mixins: [Navigation, State],
	getInitialState: function() {
		return {
			navEndData: []
		};
	},

	componentWillUnmount: function() {
		LocationStore.removeChangeListener(LocationStore.LOCATION_NAV_END, this._onNavEndChange);
	},

	componentDidMount: function() {

		LocationStore.addChangeListener(LocationStore.LOCATION_NAV_END, this._onNavEndChange);
		
	},

	_onNavEndChange: function() {
		this.setState({
				navEndData: LocationStore.getNavEnd()
		});
	},
	
	render: function() {

		if (this.state.navEndData!=null) {	

		  	var tipArr = this.state.navEndData.tips;
		    var listComps = [];
		    if (tipArr && tipArr.length > 0) {
		        
		        for (var i = 0; i < tipArr.length && i < 7; i++) {

		            listComps.push(
		                <li id={'dividEnd_'+(i+1)} key={'dividEnd_'+(i+1)} onClick={SearchEnd.selectResultEnd}  className='text-overflow'>
		                    <span id={'spanEnd_' + (i + 1)} key={'spanEnd_' + (i + 1)} className='poi-name'>{tipArr[i].name}</span>
		                    <span id={'districtEnd_' + (i + 1)} key={'districtEnd_' + (i + 1)} className='search_history_item_district'>{ tipArr[i].district }</span>
		                    <input id={'latEnd_' + (i + 1)} key={'latEnd_' + (i + 1)} type='hidden' value={ tipArr[i].location.lat } />
		                    <input id={'lngEnd_' + (i + 1)} key={'lngEnd_' + (i + 1)} type='hidden' value={ tipArr[i].location.lng } />
		                    <input id={'cityCodeEnd_' + (i + 1)} key={'cityCodeEnd_' + (i + 1)} type='hidden' value={ tipArr[i].adcode } />
		                </li> 
		            );
		        }
		        
		    } else {
		        listComps.push(
		                <li  className=' text-overflow' key={'end_'+0}>
		                    <span className='poi-name'>未找到结果,请尝试不同的关键字</span>
		                </li>
		            );
		    } 
			
		}

		return (						
			<div key={'end'}>
				<div className='input_line'></div>
				<ul className='history_item shadow'>
				    {listComps}
				</ul>
			</div>		  
		);
	},


});

/**
 * 我的收藏
 */
var MapNavPage = React.createClass({

	mixins: [Navigation, State],
	getInitialState: function() {
		return {
			allNavRecord: {},
			isInKly:false,
		};
	},

	componentWillUnmount: function() {
		MapUtil.destroyMap();
		MapUtil.clearMyInterval();
		LocationStore.removeChangeListener(LocationStore.JUMP_TO_NAV_RESULT, this._saveNavRecord);
		LocationStore.removeChangeListener(LocationStore.QUERY_ALL_NAV_RECORD, this._getAllNavRecord);
		LocationStore.removeChangeListener(LocationStore.SAVE_NAV_RECORD, this._jumpToNavResule);
		LocationStore.removeChangeListener(LocationStore.DELETE_NAV_RECORD, this._updateNavRecord);
		LocationStore.removeChangeListener(LocationStore.IS_START_IN, this._is_start_in);
	},

	componentDidMount: function() {
		// localStorage.removeItem('is_start_in');
		MapUtil.setInIndex(6);
		MapUtil.init();
		MapUtil.initAreaResult();
		this._setMineLocation();
		$('#switch').bind('click', this._switchStartEnd);
		// $('#switch').click(this._switchStartEnd);
		$('#key_start').keyup( SearchStart.keydownStart);
		$('#key_end').keyup( SearchEnd.keydownEnd);

		

		QueryAction.getAllNavRecord();
		LocationStore.addChangeListener(LocationStore.JUMP_TO_NAV_RESULT, this._saveNavRecord);
		LocationStore.addChangeListener(LocationStore.QUERY_ALL_NAV_RECORD, this._getAllNavRecord);
		LocationStore.addChangeListener(LocationStore.SAVE_NAV_RECORD, this._jumpToNavResule);
		LocationStore.addChangeListener(LocationStore.DELETE_NAV_RECORD, this._updateNavRecord);
		LocationStore.addChangeListener(LocationStore.IS_START_IN, this._is_start_in);
	},

	_is_start_in: function() {
	    // var is_start_in = LocationStore.getIsStartIn();
	    console.log('MapNav',localStorage.is_start_in)
	    if(localStorage.is_start_in == true || localStorage.is_start_in=='true'){
	    	localStorage.is_start_in = 1;
	    	this.setState({
				isInKly: true
			});
	    	// React.forceUpdate();

	    	
	    }else{
	    	localStorage.is_start_in = 0;
	    	this.setState({
				isInKly: false
			});
	    	// React.forceUpdate();
	    }
	},

	_updateNavRecord: function() {
	    QueryAction.getAllNavRecord();
	},

	_getAllNavRecord: function(chooseWay) {
	    this.setState({
			allNavRecord: LocationStore.getAllNavRecord()
		});
	},

	_jumpToNavResule: function(chooseWay) {
		if (localStorage.lng_start==null) {
	        alert("请选择正确的起点");
	        return false;
	    }
	    if (localStorage.lng_end==null) {
	        alert("请选择正确的终点");
	        return false;
	    }
	    localStorage.lng_hold_end = localStorage.lng_end;
   		localStorage.lat_hold_end = localStorage.lat_end;
   		localStorage.cityCode_hold_end = localStorage.cityCode_end;
   		localStorage.text_hold_end = localStorage.text_end;
	    this.transitionTo(Constants.Url.MAP_NAV_RESULT, {}, {})
	},

	_saveNavRecord: function(chooseWay) {
		PostAction.saveNavRecord();
	},
	//导航
	_chooseNav: function(event) {
	    if ($("#key_start").val()==null || $("#key_start").val()=='') {
	        alert("请输入起点");
	        return false;
	    }
	    if ($("#key_end").val()==null || $("#key_end").val()=='') {
	        alert("请输入终点");
	        return false;
	    }
	    localStorage.navWay = event.currentTarget.getAttribute('class');
	    console.log(localStorage.navWay);
	    // alert(localStorage.navWay);
	    this._saveNavRecord();
	},

	_setMineLocation: function() {
		localStorage.navWay = "car_nav";
		if (localStorage.isInFeature=="true" || localStorage.isInFeature==true || localStorage.is_start_in==1) {
			this.setState({
				isInKly: true
			})
			localStorage.is_start_in = 1;
		}
	    if (localStorage.text_start!=null && localStorage.text_start!='') {
	        $("#key_start").val(localStorage.text_start);
	    }else{
	    	if (localStorage.text_mine!=null) {
	            localStorage.lng_start = localStorage.lng_mine;
	            localStorage.lat_start = localStorage.lat_mine;
	            localStorage.text_start = localStorage.text_mine;
	            localStorage.cityCode_start = localStorage.cityCode_mine;
	            $("#key_start").val(localStorage.text_mine);
	        }
	    }

	    if (localStorage.text_end!=null && localStorage.text_end!='') {
	        $("#key_end").val(localStorage.text_end);
	    }else{
	        if (localStorage.isInFeature=="false") {
	            localStorage.lng_end = "120.00218";
                localStorage.lat_end = "31.816845";
                localStorage.text_end = "迪诺水镇停车场1号入口";
	            localStorage.cityCode_end = "0519";
	            $("#key_end").val("迪诺水镇停车场1号入口");
	            localStorage.navWay = "car_nav";

	        }
	    }
	},

	_deleteNavRecord:function () {
		$("#search_list").hide();
		PostAction.deleteNavRecord();
	},

	_navByRecord: function (event) {
		// console.log(event.currentTarget);
		// console.log(event.currentTarget.id);
		var index = event.currentTarget.id.split("_")[1];
		event.currentTarget.setAttribute('style','background-color:#ecf5fe;');
		
		var navRecord = this.state.allNavRecord.data[index];
		
	    localStorage.lng_start = navRecord.lng_start;
	    localStorage.lat_start = navRecord.lat_start;
	    localStorage.cityCode_start = navRecord.cityCode_start;
	    localStorage.text_start = navRecord.text_start;

	    localStorage.lng_end = navRecord.lng_end;
	    localStorage.lat_end = navRecord.lat_end;
	    localStorage.cityCode_end = navRecord.cityCode_end;
	    localStorage.text_end = navRecord.text_end;

	    $("#key_start").val(navRecord.text_start);
	    $("#key_end").val(navRecord.text_end);

	    console.log(localStorage.lng_start,localStorage.lat_start,localStorage.cityCode_start,localStorage.text_start);
	    console.log(localStorage.lng_end,localStorage.lat_end,localStorage.cityCode_end,localStorage.text_end);
	    
	    localStorage.navWay = "walk_nav";
	    this._saveNavRecord();
	    // this.transitionTo(Constants.Url.MAP_NAV_RESULT, {}, {})

	},


	_switchStartEnd: function () {
	    lng_hold = localStorage.lng_end;
	    lat_hold = localStorage.lat_end;
		cityCode_hold = localStorage.cityCode_end;
	    text_hold = localStorage.text_end;
	    val_hold = $("#key_end").val();

	    localStorage.lng_end = localStorage.lng_start;
	    localStorage.lat_end = localStorage.lat_start;
	    localStorage.cityCode_end = localStorage.cityCode_start;
	    localStorage.text_end = localStorage.text_start;
		$("#key_end").val($("#key_start").val());

	    localStorage.lng_start = lng_hold;
	    localStorage.lat_start = lat_hold;
	    localStorage.cityCode_start = cityCode_hold;
	    localStorage.text_start = text_hold;
	    $("#key_start").val(val_hold);

	    console.log(localStorage.lng_start ,localStorage.lat_start, localStorage.cityCode_start, localStorage.text_start);
	    console.log(localStorage.lng_end ,localStorage.lat_end, localStorage.cityCode_end, localStorage.text_end);
	},

	render: function() {
		$("#search_list").hide();
		var listComps = [];
		var hisList = [];
		var data = this.state.allNavRecord.data;

		if (data!=null && data.length!=0){
			$("#search_list").show();
	        for (var i = 0; i < data.length && i < 10; i++) {

	            listComps.push(
	            	<div className='navi-search-history' id={'record1_'+i} key={'record1_'+i} onClick={this._navByRecord}>
		            	<div  className='navi-history-item' key={'record2_'+i} >
		                	<a key={'record_a'+i}  className='history-item'  >{data[i].text_start + "→" + data[i].text_end}
			                </a>
			            </div>  
		            </div>  
	            );
        	}
        	hisList.push(
				<div id='search_record' key={'search_record'} className='common_light search_history ' >
	                {listComps}	
	            	<div className='navi-history-item_clear'>
		            	<a className='clearhistory' onClick={this._deleteNavRecord}>删除全部历史记录</a>
		            </div>
	            </div>  
	        );     	   
        }
        // isInKly
        var headerComps = [];
        if (!this.state.isInKly) {
        	console.log('false',this.state.isInKly)
        	headerComps.push(
        		<div className="nav_header_img">
		            <div style={{"width":"33%","float":"left"}} className="nav_bus_img" >
		                <a className="bus_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} className="nav_car_img" >
		                <a className="car_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} className="nav_walk_img" >
		                <a className="walk_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		        </div>
        	);
        }else{
        	console.log('true',this.state.isInKly)
        	headerComps.push(
        		<div className="nav_header_img">
		            <div style={{"width":"33%","float":"left"}} className="nav_bus_img" >
		                <a className="bus_nav" ><i style={{backgroundImage:'url(public/images/bus_gray.svg)'}}></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} className="nav_car_img" >
		                <a className="car_nav" ><i style={{backgroundImage:'url(public/images/car_gray.svg)'}}></i></a>
		            </div>
		            <div style={{"width":"33%","float":"left"}} className="nav_walk_img" >
		                <a className="walk_nav" onClick={this._chooseNav}><i></i></a>
		            </div>
		        </div>
        	);
        }
		return (						
			<div>
				<div className='cover'>
					<AppHeader title='选择出行方式' backBtn />
				</div>

				<div className="nav_header">

			        {headerComps}
			    </div>
			    <div className="navigation_nav_carSearchBox clearfix" style={{"border":"1px solid #e5e5e5"}}>
			        <div className="navigation_nav_busWalkIcon floatl"> </div>
			        <div className="navigation_nav_switchStartEnd floatr icon-index-searchbox " id="switch"></div>
			        <form>
			            <ul className="navigation_nav_carSearchBoxFileset">
			                <li className="navigation_nav_carSearchBoxInput">
			                    <input type="text" placeholder="输入起点"  id="key_start" name="key_start"/> 
			                    <i className="icon-close hidden"></i> 
			                    <span className="navi-hint-text">从</span> 
			                </li>
			                    <div id="result_start" name="result_start" className="navi-history" >
			                    <Start />
			                    </div>
			                <li className="navigation_nav_carSearchBoxInput hidden">
			                    <input type="text" placeholder="输入途径点" className="J_carMaddr"/> 
			                    <i className="icon-close hidden"></i> 
			                </li>
			                <li className="navigation_nav_carSearchBoxInput">
			                    <input type="text" placeholder="输入终点" data-type="daddr" id="key_end" name="key_end" style={{"borderBottom":"0px"}}/> 
			                    <i className="icon-close hidden"></i> <span className="navi-hint-text">到</span> 
			                </li>
			                    <div id="result_end" name="result_end" className="navi-history">
			                    <End />
			                    </div>
			            </ul>
			        </form>
			    </div>

			    <div id="search_list">
			    	{hisList}
			    </div>
			    <div id='map' style={{'display': 'none'}}/>
			</div>		    
			    	
		);
	},


});

module.exports = MapNavPage;
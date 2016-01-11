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
var MapLocationUtil = require('../../utils/MapLocationUtil');
var QueryAction = require('../../actions/QueryAction');

var LocationStore = require('../../stores/LocationStore');

/**
 * 我的足迹
 */
var MapFootPage = React.createClass({
	mixins: [Navigation, State],

	getInitialState: function() {
		return {
			mapFoot: []
		};
	},

	componentWillUnmount: function() {
		MapUtil.destroyMap();
		MapUtil.clearMyInterval();
		LocationStore.removeChangeListener(LocationStore.LOCATION_MAP_FOOT, this._onMapFootChange);
	},

	componentDidMount: function() {
		MapUtil.setInIndex(8);
		MapUtil.init();
		MapUtil.initGeolocation();
		MapLocationUtil.upFooterToServer();
		QueryAction.queryFootbById();
		LocationStore.addChangeListener(LocationStore.LOCATION_MAP_FOOT, this._onMapFootChange);
	},


	_onMapFootChange: function() {
		var footData=LocationStore.getMapFoot();
		footData = this._sortFooterData(footData.data);
		this.setState({
			mapFoot: footData
		});
	},

	_filtFooterData: function(footerData) {
	    var nameList = new Array();
	    var drawData = new Array();
	    console.log(footerData)
	    for (var i = 0; i < footerData.length; i++) {
	        flag = 0;
	        if (nameList != null && nameList.length != 0) {
	            for (var j = 0; j < nameList.length; j++) {
	                if (footerData[i].project_name.toString() == nameList[j].toString()) {
	                    flag = 1;
	                    break;
	                }
	            }
	        }
	        if (flag == 0) {
	            nameList.push(footerData[i].project_name);
	            drawData.push(footerData[i]);
	        }
	    }
	    return drawData;
	},
	_sortFooterData: function (footData) {
		if (footData!=null && footData!='') {
			console.log(footData);
			var listArray = new Array();
		    var list = new Array();
		    var hold = footData[0];
		    list.push(hold);
		    var holdDate1 = new Date(parseInt(footData[0].update_time)).getDate();
		    for (var i = 1; i < footData.length; i++) {
		        var holdData2 = new Date(parseInt(footData[i].update_time)).getDate();
		        if (holdDate1 == holdData2) {
		            list.push(footData[i]);
		        } else {
		            list.reverse();
		            listArray.push(list);
		            list = new Array();
		            holdDate1 = holdData2;
		            list.push(footData[i]);
		        }
		    };
		    listArray.push(list);
	    };
	    return listArray;
	},

	getDataA: function (date) {
	    var dataA = date.getFullYear();
	    if ((date.getMonth()+1)<10) {
	        dataA+= ".0"+(date.getMonth()+1);
	    }else{
	        dataA+= "."+(date.getMonth()+1);
	    }
	    if (date.getDate()<10) {
	        dataA+= ".0"+date.getDate();
	    }else{
	        dataA+= "."+date.getDate();
	    }
	    dataA+=" "+this.getWeekName(date.getDay());
	    return dataA;
	},

	getDataB: function (date){
	    var dataB = "";
	    if (date.getHours()<10) {
	        dataB+= "0"+date.getHours();
	    }else{
	        dataB+= date.getHours();
	    }
	    if (date.getSeconds()<10) {
	        dataB+= ":0"+date.getSeconds();
	    }else{
	        dataB+= ":"+date.getSeconds();
	    }
	    return dataB;
	},

	getWeekName: function (day){
	    if (day==1) {
	        return "周一";
	    }else if (day==2) {
	        return "周二";
	    }else if (day==3) {
	        return "周三";
	    }else if (day==4) {
	        return "周四";
	    }else if (day==5) {
	        return "周五";
	    }else if (day==6) {
	        return "周六";
	    }else if (day==0) {
	        return "周日";
	    }
	},

	_showHistoryList: function() {

		$("#his_div").css("display", "block");
    	$("#map_div").css("display", "none");
	},

	

	render: function() {
		var footComps = [];

		if (this.state.mapFoot!=null && this.state.mapFoot.length!=0) {
			//数据进行排序
			var footData = this.state.mapFoot;
			console.log(this.state.mapFoot)
			// this.state.mapFoot = footData;
			MapUtil.drawFooter(0,this.state.mapFoot[0]);
			
			// console.log(this.state.mapFoot);
			
			for (var i = 0; i < footData.length; i++) {
				var filtData = this._filtFooterData(footData[i]);
				var dataF = new Date(parseInt(filtData[0].update_time));
		        var dataA = this.getDataA(dataF);
		        var dataB = this.getDataB(dataF);

				footComps.push(
					<div key={'foot_'+i} >
						<div className='his_1'>
							<div className='foot_his_time_pic foot_1'></div>
							<div className='foot_his_time foot_2'>{dataA}</div>
							<div className='foot_3'></div>
						</div>
						<div id={'foot_'+i} className='his_2' onClick={this._showMap}>
							<div id={'foot1_'+i} className='foot_his_pic foot_1'></div>
							<div id={'foot2_'+i} className='foot_his_pro_name foot_2'>
								<div id={'footname_'+i} className='foot_his_name'>{filtData[0].project_name + "   等"+filtData.length+"个景点"}</div>
								<div id={'footdatab_'+i} className='foot_his_pro_time'>{dataB}</div>
							</div>
							<div id={'foot3_'+i} className='foot_his_go_pic foot_3'></div>
						</div>
					</div>
				)
			}
		} else{
			footComps.push(
				<div key={'foot_'} className='empty-result' style={{'backgroundColor':'#f3f3f7'}}>
					<i><img src={Constants.Images.NO_FAVORITE} /></i>
					<span>尚未产生足迹哦</span>
				</div>
			);
		}

		return (		
			<div>
				<div className='cover'>
					<AppHeader title='我的足迹' backBtn />
				</div>
				<div id="his_div" style={{"display":"none","marginTop":"49px"}}>
		       		{footComps}
			    </div>
			    <div id="map_div">
			        <div id="map"></div>

			        <div className="map_footer map_icon_shadow" style={{"display":"none","bottom":"60px"}}>
				        <div className="message_index_box" style={{"display":"none"}}>
				        	<div className="message_index_box_bottom">
					            <div className="message_left">
					                <div className="message_name">雷龙过山车</div>
					                <div className="message_dis">140米</div>
					            </div>
				            </div>
				        </div>
				    </div>

			        <div className="message_box map_icon_shadow" style={{"bottom":"10px","height":"40px"}}>
			            <div className="foot_left" >
			                <div className="foot_left_in">
			                <a id="foot_count"><img  className="pic_size" src="public/images/foot_mine.svg" />0景点 &nbsp; 0片区</a>
			                </div>
			            </div>
			            <div onClick={this._showHistoryList} className="foot_right" style={{"textAlign":"right"}}>
			                <div className="foot_right_in">
			                	<a style={{"color":"#0093fe"}}><img  className="pic_size" src="public/images/foot.svg" />历史足迹</a>
			                </div>
			            </div>
			        </div>


			    </div>
			</div>		    	
		);
	},

	_showMap: function (event) {
		console.log(event.target);
		var id = event.target.id.split("_")[1];
		console.log(id);
		// console.log(this.state.mapFoot[id]);
	    $("#his_div").css("display", "none");
	    $("#map_div").css("display", "block");
	    MapUtil.drawFooter(id,this.state.mapFoot[id]);
	    // $("#his_div").hide();
	    // $("#map_div").show();
	},

});

module.exports = MapFootPage;
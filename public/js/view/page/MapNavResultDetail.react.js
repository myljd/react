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

var QueryAction = require('../../actions/QueryAction');
var ProjectStore = require('../../stores/ProjectStore');

/**
 * 我的收藏
 */
var MapNavResultDetailPage = React.createClass({

	mixins: [Navigation, State],

	componentDidMount: function() {
		MapUtil.driving_detail();	
	},

	_showBusRoute: function() {
		this.transitionTo(Constants.Url.MAP_NAV_BUS_RESULT, {}, {})
	},

	render: function() {
		return (						
			<div>
				<div className='cover'>
					<AppHeader title='导航详情' backBtn />
				</div>
				<div className="common_content common_dark" style={{"marginTop": "49px", "display": "block", "transformOrigin": "0px 0px 0px", "opacity": "1", "transform": "scale(1, 1)"}}>
			        <div className="common_light navigation_carmap_footer" id="detail_header" >
			            <div className="navigation_carmap_footer_content" >
			                <h4 className="navigation_carmap_footer_time text-overflow time_dis" style={{"float": "none"}}> </h4> 
			            </div>
			            
			        </div>
			        <div style={{"display":"none"}} className='new_blueButton floatr' onClick={this._showBusRoute} >地图</div>
			        <div className="common_card common_light" style={{"paddingLeft": "0","paddingBottom":"0","paddingTop":"0"}}>
			            <div id="detail_main" className="walkdetail_back walkdetail">
			            </div>
			        </div>
			    </div>
			</div>   	
		);
	},
});

module.exports = MapNavResultDetailPage;
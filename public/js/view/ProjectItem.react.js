/**
 * 项目组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');
var $ = require('jquery');
 
var Router = require('react-router');
var State = Router.State;
var Navigation = Router.Navigation;

var Rating = require('./Rating.react');
var Queue = require('./Queue.react');

var UserStore = require('../stores/UserStore');
var ProjectStore = require('../stores/ProjectStore');
var LocationStore = require('../stores/LocationStore');

var FormatUtil = require('../utils/FormatUtil');
var Constants = require('../Constants/AppConstants');

var NOW = Date.now || function () { return new Date().getTime();};

/**
 * 项目组件
 */
var ProjectItem = React.createClass({

	_tapStartTime: 0,

	mixins: [State, Navigation],

	componentDidMount: function() {

		var project = this.props.project;
		$('#project-goto' + project._id).bind('touchstart', this._onTapStart);
		$('#project-goto' + project._id).bind('touchend', this._onTapEnd);

		React.findDOMNode(this.refs.thumbnail).src = Constants.Images.DEFAULT_SQUARE;

		var img = new Image();
		img.onload = this._onLoadImage;
		img.src = project.thumbnail;
		if (img.complete) {
			this._onLoadImage;
		}
	},

	_onLoadImage: function() {

		if (this.refs.thumbnail) {
			React.findDOMNode(this.refs.thumbnail).src = this.props.project.thumbnail;
		}
	},

	componentWillUpdate: function(nextProps, nextState) {

		React.findDOMNode(this.refs.thumbnail).src = Constants.Images.DEFAULT_SQUARE;

		var img = new Image();
		img.onload = this._onLoadImage;
		img.src = nextProps.project.thumbnail;
		if (img.complete) {
			this._onLoadImage;
		}
	},



	// _onLoadImage: function() {

	// 	console.log('_onLoadImage pic changed');

	// 	this.setState({
	// 		thumbnail: this.props.project.thumbnail
	// 	});
	// 	// this.forceUpdate();
	// },

	shouldComponentUpdate: function(nextProps, nextState) {

 
		var projectId = nextProps.project._id;
		if (projectId == this.props.project._id) {
			console.log('Project' + projectId + ' will not update');
			return false;
		}

 		return true;
	},

	render: function() {

		var project = this.props.project;
		var queueComp = {};
		if (project.queue.monitored == '1') {
			queueComp = (
				<Queue type='status' queue={project.queue} />
			);
		}
		var distance = FormatUtil.getDistanceTitle(project.location.distance);
		// var distance = project.location.distance;

		var rating = (
			<Rating rating={project.rating} />
		);
		if (project.category == Constants.Category.PUBLIC || project.category == Constants.Category.FOOD) {
			rating = {};
		}

		return (
			<div className='project-item' id='project-item'>
				<div className='item-image' >
					<img ref='thumbnail' />
				</div>
				<div className='item-content'>
					<p>{project.name}</p>
					{rating}
					{queueComp}
					<span>{distance}</span>
				</div>
				<div className='item-navi' id={'project-goto' + project._id}>
					<div>
						<img src={Constants.Images.GOTO} />
					</div>
					<div>
						<span>到这去</span>
					</div>
				</div>
			</div>
		)
	},

	_onTapEnd: function(e) {
		
		var time = NOW();
		console.log(time + ' ' + this._tapStartTime);
		if ((time - this._tapStartTime) < 100) {
			if (this.props.onGoto) {
				this.props.onGoto();
			}

			var project = this.props.project;
			localStorage.removeItem("navWay");
			this.transitionTo(Constants.Url.MAP_NAV_RESULT, {}, {lng: project.location[0], lat: project.location[1]});
		}
	},

	_onTapStart: function(e) {
		
		e.stopPropagation();
		this._tapStartTime = NOW();
	},

});

module.exports = ProjectItem;
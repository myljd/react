
/**
 * 媒体滑动组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/10
 * 
 */

var React = require('react');
var ReactSwipe = require('react-swipe');

var AudioPlayer = require('./component/AudioPlayer.react');
var Constants = require('../constants/AppConstants');

var STATUS_INITIAL = 0;
var STATUS_PLAYING = 1;
var STATUS_PAUSED = 2;

var AUDIO_COUNT = 0;

var VideoPlayer = React.createClass({

	propTypes: {
		url: React.PropTypes.string,
		id: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			url: '',
			id: '',
		}
	},

	getInitialState: function() {
		return {
			status: STATUS_INITIAL
		}
	},

	_onTapVideo: function() {

		console.debug('MediaSwiper _onTapVideo');
		// alert('tapVideo');

		var media = React.findDOMNode(this.refs.video);
		media.addEventListener('webkitfullscreenchange', this._onFullScreenChange);

		var requestMethod = 
			media.requestFullScreen || 
			media.webkitRequestFullScreen || 
			media.mozRequestFullScreen || 
			media.msRequestFullScreen;
		requestMethod.call(media);

		// media.play();
	},

	_onFullScreenChange: function(e) {

		var media = React.findDOMNode(this.refs.video);

		if (document.webkitIsFullScreen) {
			media.play();
		}
		else {
			media.pause();
		}
	},

	componentDidMount: function() {

	},

	render: function() {

		console.debug('MediaSwiper render');

		return (
			<div className='media' onClick={this._onTapVideo}>
				<video ref='video' id={'video' + this.props.id} preload='auto'>
					<source src={this.props.url} />
				</video>
			</div>
		);
	}
});

/**
 * 媒体滑动组件
 */
var MediaSwiper = React.createClass({

	mediaId: 0,

	componentDidMount: function() {

		for (var key in this.props.resources) {
			var resource = this.props.resources[key];
			console.debug(resource);
			if (resource.type == Constants.Resource.VIDEO) {
				$('#media' + key).bind('tap', this._onTapVideo);
				console.log('#media' + key);
			}
		}
	},

	_onTapVideo: function(e) {

		console.debug('_onTapVideo' + e);
		alert('tapVideo');

		var id = e.target.id;
		this.mediaId = id;
		var media = document.getElementById(id);
		var key = this.mediaId.substring(5);
		var resource = this.props.resources[key];

		console.debug(key);
		console.debug(resource);

		media.addEventListener('webkitfullscreenchange', this._onFullScreenChange);
		media.webkitRequestFullScreen();

		// media.play();
	},

	_onFullScreenChange: function(e) {

		var media = document.getElementById(this.mediaId);
		var key = this.mediaId.substring(5);
		var resource = this.props.resources[key];

		if (document.webkitIsFullScreen) {
			media.play();
		}
		else {
			media.pause();
		}
	},

	getInitialState: function() {
		return {
			activeIndex: 0
		}
	},

	render: function() {

		var resources = this.props.resources;
		var imageComps = [];
		var indicatorComps = [];

		var i = 0;
		var audioCnt = 0;
		for (var key in resources) {

			console.log('aaaaa',resources);

			// 轮播显示圆点
			var itemStyle = 'indicator-item';
			console.log('i =' + i + ' activeIndex=' + this.state.activeIndex%resources.length);
			if (i == this.state.activeIndex%resources.length) {
				itemStyle += ' active';
			}

			indicatorComps.push(
				<div className={itemStyle} />
			);

			// 轮播图片
			var resource = resources[key];
			if (resource.type == Constants.Resource.IMAGE) {
				imageComps.push(
					<div className='media'>
						<img id={'media' + key} src={resources[key].url} />
					</div>
				);
			}
			else if (resource.type == Constants.Resource.VIDEO) {
				imageComps.push(
					<VideoPlayer id={key} url={resources[key].url} />
					
				);
			}
			else if (resource.type == Constants.Resource.AUDIO) {
				audioCnt++;
				imageComps.push(
					<AudioPlayer id={key} index={audioCnt} url={resources[key].url} title={this.props.title + '的音频解说'}/>
				);
			}
			
			i++;
			console.debug(key);
		}

		AUDIO_COUNT = audioCnt;

		if (imageComps.length == 0) {
			imageComps = (
				<img id='media0' className='media' src={Constants.Images.DEFAULT_RECTANGLE}/>
			);
		}

		return (
			<div className='project-swiper' >
				<ReactSwipe continuous={true} stopPropagation={true} callback={this.onSwipeEnd}>
					{imageComps}
				</ReactSwipe>
				<div className='swiper-indicator'>
					{indicatorComps}
				</div>
			</div>
		);
	},

	onSwipeEnd: function(index) {
		console.log('active index=' + index);
		this.setState({
			activeIndex: index
		});
	}
});

module.exports = MediaSwiper;
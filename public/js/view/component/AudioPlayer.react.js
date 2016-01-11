
var React = require('react');
var Constants = require('../../constants/AppConstants');

var STATUS_INITIAL = 0;
var STATUS_PLAYING = 1;
var STATUS_PAUSED = 2;

var AUDIO_COUNT = 0;

var AudioPlayer = React.createClass({

	playing: false,
	timer: null,

	propTypes: {
		control: React.PropTypes.bool,
		url: React.PropTypes.string,
		id: React.PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			control: false,
			url: '',
			id: '',
			title: '',
		}
	},

	getInitialState: function() {
		return {
			status: STATUS_INITIAL,
			duration: 0,
			curTime: 0,
		}
	},

	componentDidMount: function() {

		var media = React.findDOMNode(this.refs.audio);
		media.load();
		media.oncanplay = this._onLoaded;
	},

	_onPlaying: function() {
		var media = React.findDOMNode(this.refs.audio);
		this.setState({
			duration: media.duration,
			curTime: media.currentTime,
		})
	},

	_onPlay: function() {
		var media = React.findDOMNode(this.refs.audio);
		media.play();

		this._onPlaying();
		this.timer = setInterval(this._onPlaying, 1000);
	},

	_onPause: function() {
		var media = React.findDOMNode(this.refs.audio);
		media.pause();

		clearInterval(this.timer);
	},

	_onProgress: function(progress) {
		var media = React.findDOMNode(this.refs.audio);
		media.currentTime = progress * media.duration;
		this.setState({
			curTime: media.currentTime,
		});
	},

	_onLoaded: function() {
		var media = React.findDOMNode(this.refs.audio);
		this.setState({
			duration: media.duration,
			curTime: media.currentTime,
		});
	},

	_onCanPlay: function() {
		console.debug('_onCanPlay');
	},

	render: function() {

		var style = {};
		var titleComp = {};

		if (!this.props.control) {
			
			style = {
				'backgroundImage': 'url(' + Constants.Images.AUDIO_BG + ')',
				'backgroundSize': 'contain',
				'backgroundPosition': 'center',
			};

			var title = this.props.title;
			if (AUDIO_COUNT > 1) {
				title += this.props.index;
			}
			titleComp = (
				<span className='media-title'>{title}</span>
			);
		}
		

		

		return (
			
			<div className='media' style={style}>
				{titleComp}
				<audio ref='audio' id={'audio' + this.props.id}>
					<source src={this.props.url} />
				</audio>
				<Controller
					onPlay={this._onPlay} onPause={this._onPause}
					onProgress={this._onProgress}
					duration={this.state.duration} curTime={this.state.curTime} />
			</div>
			
		);
	}
});



var Controller = React.createClass({

	propTypes: {
		onPlay: React.PropTypes.func.isRequired,
		onPause: React.PropTypes.func.isRequired,
		onProgress: React.PropTypes.func.isRequired,
		duration: React.PropTypes.number,
		curTime: React.PropTypes.number,
	},

	getInitialState: function() {
		return {
			playing: false,
			progressing: false,
		}
	},

	componentDidMount: function() {
		this.progressBarWidth = React.findDOMNode(this.refs.mediaBar).clientWidth;

		var progressor = React.findDOMNode(this.refs.progressor);
		progressor.addEventListener('touchmove', this._onTouch, false);
		progressor.addEventListener('touchstart', this._onTouch, false);
		progressor.addEventListener('touchend', this._onTouchEnd, false);
		progressor.addEventListener('touchcancel', this._onTouchEnd, false);
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.curTime == nextProps.duration) {
			this.setState({
				playing: false
			});
		}
	},

	render: function() {

		var btnSrc = Constants.Images.PLAY;
		if (this.state.playing) {
			btnSrc = Constants.Images.PAUSE;
		}

		var progressorClass = 'media-progressor';
		var progressorPosition = -6;

		var loadingPrecent = '0%';

		// 如果有时间
		if (this.props.curTime && this.props.duration) {
			loadingPrecent = this.props.curTime / this.props.duration *100 + '%';
			progressorClass += ' enabled';
			progressorPosition += this.props.curTime / this.props.duration * this.progressBarWidth;
		}

		// 如果正在调解进度条
		if (this.state.progressing) {
			progressorPosition = (this._curY - this._startY) - 6;
		}

		var loadingStyle = {'width': loadingPrecent};
		var progressorStyle = {'left': progressorPosition + 'px'};

		return (
			<div className='media-control'>
				<img className='media-play' src={btnSrc} onClick={this._onClickPlay}/>
				<div ref='mediaBar' className='media-loading-bar'>
					<div className='media-loading' style={loadingStyle} />
					<div ref='progressor' className={progressorClass} style={progressorStyle} />
				</div>
				<div className='media-time'>
					{this._parseToMin(this.props.curTime)} | {this._parseToMin(this.props.duration)}
				</div>
				
			</div>
		);
	},

	_startY: 0,
	_curY: 0,

	_onTouch: function(e) {


		console.debug('MediaSwiper _onTouch');
		console.debug(e);
		var pageY = e.touches[0].pageX;

		if (this._startY == 0) {
			this._startY = pageY;
			this._curY = pageY;
		}
		else {
			if (pageY < this._startY) {
				pageY = this._startY;
			}
			else if (pageY >= this._startY + this.progressBarWidth) {
				pageY = this._startY + this.progressBarWidth;
			}

			this._curY = pageY;
		}

		console.debug('startY = ' + this._startY);
		console.debug('curY = ' + this._curY);
		console.debug('progressBarWidth = ' + this.progressBarWidth);

		this.setState({
			progressing: true
		});

		e.preventDefault();
		e.stopPropagation();
	},

	_onTouchEnd: function(e) {

		console.debug('MediaSwiper _onTouchEnd');

		this.setState({
			progressing: false,
		});
		console.debug('playing = ' + this.state.playing);

		// 通知进度栏调节事件
		this.props.onProgress((this._curY - this._startY) / this.progressBarWidth);

		// 通知
		e.preventDefault();
		e.stopPropagation();
	},

	_parseToMin: function(time) {

		if (!time) {
			return '0:00';
		}

		var totolSec = parseInt(time);
		var sec = totolSec%60;
		var min = (totolSec - sec)/60;

		if (sec < 10) {
			sec = '0' + sec;
		}

		return min + ':' + sec;
	},

	_onClickPlay: function() {

		console.debug('MediaSwiper _onClickPlay');
		console.debug('playing = ' + this.state.playing);

		this.setState({
			playing: !this.state.playing
		});

		if (!this.state.playing) {
			this.props.onPlay();
		}
		else {
			this.props.onPause();
		}
	}
});

module.exports = AudioPlayer;
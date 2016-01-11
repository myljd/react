
/**
 * 项目详情组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/27
 * 
 */

var React = require('react');
var $ = require('jquery');

var ViewUtil = require('../utils/HowUIUtil');
var FormatUtil = require('../utils/FormatUtil');
var Constants = require('../constants/AppConstants');
var ProjectStore = require('../stores/ProjectStore');

var QueryAction = require('../actions/QueryAction');

var deg = 0;
var rotationTimer = null;

function startRotation(el) {

	rotationTimer = setInterval(function() {

		deg = deg + 10;
		var rotation = 'rotate(' + deg + 'deg)';

		el.css({
            'webkitTransform':  rotation,
            'oTransform':       rotation,
            'msTransform':      rotation,
            'mozTransform':     rotation,
            'transform':        rotation
        });
	}, 50);

}

var ProjectDetail = React.createClass({

	getInitialState: function() {
		return {
			content: {}
		}
	},

	componentWillUnmount: function() {

	},

	componentDidMount: function() {

		ViewUtil.hasPuller();
		React.findDOMNode(this.refs.puller).addEventListener('onPull', this._onPull);
	},

	componentWillReceiveProps: function(nextProps){

		console.log('ProjectDetail componentWillReceiveProps');

		if (!FormatUtil.isEmpty(nextProps.content)) {
			this.setState({
				content: nextProps.content
			});
		}

		if (rotationTimer != null) {

			setTimeout(function() {

				clearInterval(rotationTimer);
				rotationTimer = null;
				
				$('.refresh').addClass('hide');
				$('.content').removeClass('hide');
			}, 300);
		}
	},

	componentDidUpdate: function() {

		console.debug('ProjectDetail componentDidUpdate called');
		var detail = this.props.detail;
		var resourcePath = ProjectStore.getResourcePath();
		if (resourcePath.indexOf('qiniucdn') >= 0) {
			if (detail && detail.flag == 0) {
				resourcePath = Constants.Url.IMG_URL;
			}
		}

		$('.project-detail .content img').each(function() {
			var src = $(this).attr('src');
			console.log(src);
			if (src.indexOf('http') < 0) {
				$(this).attr('src', resourcePath + src);
				$(this).css('width', '100%');
			}
		});

		ViewUtil.init();
		ViewUtil.fxTap();
		ViewUtil.hasfixBar();
	},

	render: function() {

		console.debug('ProjectDetail render called');

		var innerHTML = {__html: ''};
		console.log(this.props.detail);

		var content = '';
		if (this.props.detail) {
			content = this.props.detail.content;
		}
		
		if (!FormatUtil.isEmpty(content)) {
			innerHTML = {__html: content};
		}

		return (
			<div className='project-detail'>
				<div ref='puller' className='puller'>
					<div>
						<span className='before' />
						<span>继续拖动，查看详情</span>
						<span className='after' />
					</div>
				</div>
				<div ref='refresh' className='refresh hide'>
					<div>
						<span className='before' />
						<i><img id='refresh-img' src={Constants.Images.DETAILS} /></i>
						<span className='after' />
					</div>
				</div>
				<div ref='content' className='content hide'>
					<div className='project-detail-title'>项目详情</div>
					<div dangerouslySetInnerHTML={innerHTML} />
				</div>
			</div>
		);
	},

	_onPull: function() {

		console.log('ProjectDetail _onPull');

		$('.puller').addClass('hide');
		$('.refresh').removeClass('hide');

		startRotation($('#refresh-img'));
		this.props.onRequest();
	}
});

module.exports = ProjectDetail;
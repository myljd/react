
/**
 * 排队组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');

var Router = require('react-router');
var Navigation = Router.Navigation;
var State = Router.State;

var Constants = require('../constants/AppConstants');
var FormatUtil = require('../utils/FormatUtil');
 

function getQueue(status) {

	switch (parseInt(status)) {

	case Constants.QueueStatus.IDLE:
		return {
			url: Constants.Images.QUEUE_IDLE, 
			title: Constants.Strings.QUEUE_IDLE,
			style: 'queue-idle'
		};
	case Constants.QueueStatus.MEDIUM:
		return {
			url: Constants.Images.QUEUE_MEDIUM, 
			title: Constants.Strings.QUEUE_MEDIUM,
			style: 'queue-medium'
		};
	default:
		return {
			url: Constants.Images.QUEUE_BUSY, 
			title: Constants.Strings.QUEUE_BUSY,
			style: 'queue-busy'
		};
	}
}

/**
 * 排队组件
 */
var Queue = React.createClass({

	mixins: [Navigation, State],

	getDefaultProps: function() {
		return {
			queue: {
				time: '0',
				status: '0',
				count: '0',
				interval: '0',
				limit: '0'
			},
			type: 'status'
		};
	},

	componentDidMount: function() {
		$('.link').bind('tap', this._onViewDetail);
	},

	render: function() {

		var queue = this.props.queue;
		var type = this.props.type;
		
		if (type == 'status') {

			var queue = getQueue(queue.status);
			return (
				<div className='queue'>
					<span>排队：</span>
					<img src={queue.url} /><span className={queue.style}>{queue.title}</span>
				</div>
			)
		}
		else if (type == 'time') {

			var time = FormatUtil.getFormatQueueTime(queue.time);
			return (
				<div className='queue'>
					<span>排队等待：</span>
					<span>预计{time}</span>
					<div className='link'>
						<span>查看详情</span>
					</div>
				</div>
			)
		}
		else {
			return (
				<div></div>
			)
		}
		
	},

	_onViewDetail: function() {
		console.log('查看详情被点击');
		this.transitionTo(Constants.Url.QUEUE_DETAIL, {}, {title:'排队详情', projectId: this.getQuery().projectId});
	}
});

module.exports = Queue;
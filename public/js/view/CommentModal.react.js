
/**
 * 评分模态框
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');

var ViewUtil = require('../utils/HowUIUtil');

/**
 * 评分模态框
 */
var Modal = React.createClass({

	show: function() {
		
		var modal = $('#commentModal');
		var modalDiv = $('.comment-modalDiv');

		modal.addClass('show');
		modalDiv.css('width', '100%');
		modalDiv.css('height', '100%');
	},

	componentDidMount: function() {
		$('#comment-confirm').bind('tap', this._onConfirmResult);
	},

	render: function() {

		return (
			<div>
				<div className='comment-modalDiv' />
				<div id='commentModal' className='fancy modal comment-modal'>
					<span>评论成功！</span>
					<div id='comment-confirm' className='link'>
						<span>确定</span>
					</div>
				</div>
			</div>
		)
	},

	_onConfirmResult: function() {

		this.props.onConfirmResult();
		this._hide();
	},

	_hide: function() {

		var modal = $('#commentModal');
		var modalDiv = $('.comment-modalDiv');

		modal.removeClass('show');
		modalDiv.css('width', '0px');
		modalDiv.css('height', '0px');
	}
});

module.exports = Modal;
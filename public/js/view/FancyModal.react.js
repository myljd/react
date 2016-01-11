
/**
 * 模态框
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/21
 * 
 */

var React = require('react');

var FancyModal = React.createClass({

	componentDidMount: function() {

		$('.modal-bg').bind('tap', this._onTapBg);
		$('.modal-bg').bind('touchmove', this._onMoveBg);
	},

	render: function() {

		return (
			<div>
				<div className='modal-bg' />
				<div id='myModal' className={'fancy modal' + this.props.modalClass}>
					{this.props.children}
				</div>
			</div>
		);
	},

	_onMoveBg: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	_onTapBg: function() {
		if (this.props.onTapBg) {
			this.props.onTapBg();
		}
	},

	slideup: function() {

		console.log('slideup');

		var bg = $('.modal-bg');
		var modal = $('.modal');

		bg.addClass('modal-bg-show');
		if (this.props.fullscreen) {
			bg.css('marginTop', '0px')
		}
		
		modal.addClass('slideup');
	},

	slidedown: function() {

		var bg = $('.modal-bg');
		var modal = $('.modal');

		modal.bind('webkitTransitionEnd', this._onSlideDown);

		bg.removeClass('modal-bg-show');
		modal.removeClass('slideup');
	},

	_onSlideDown: function() {

		console.log('onAnimationEnd');
		var modal = $('.modal');
		modal.unbind('webkitTransitionEnd', this._onSlideDown);
		if (this.props.onSlideDown) {
			this.props.onSlideDown();
		}
	},

	show: function() {

		var bg = $('.modal-bg');
		var modal = $('.modal');

		bg.addClass('modal-bg-show');
		if (this.props.fullscreen) {
			bg.css('marginTop', '0px');
		}
		
		modal.addClass('show');
	},

	hide: function() {

		var bg = $('.modal-bg');
		var modal = $('.modal');

		bg.removeClass('modal-bg-show');
		modal.removeClass('show');
	}
});

module.exports = FancyModal;
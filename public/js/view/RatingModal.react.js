
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

var RatingInput = require('./RatingInput.react');

/**
 * 评分模态框
 */
var Modal = React.createClass({

	show: function() {
		
		var modal = $('#ratingModal');
		var modalDiv = $('.rating-modalDiv');

		modal.addClass('show');
		modalDiv.css('width', '100%');
		modalDiv.css('height', '100%');
	},

	componentDidMount: function() {
		$('#rating-confirm').bind('tap', this._onSelectRating);
	},

	render: function() {

		return (
			<div>
				<div className='rating-modalDiv' />
				<div id='ratingModal' className='fancy modal rating-modal'>
					<RatingInput ref='rating' editable rating={this.props.rating} />
					<div id='rating-confirm' className='link'>
						<span>确定</span>
					</div>
				</div>
			</div>
		)
	},

	_onSelectRating: function() {

		var rating = this.refs.rating.getRating();
		this.props.onSelectRating(rating);
		this._hide();
	},

	_hide: function() {

		var modal = $('#ratingModal');
		var modalDiv = $('.rating-modalDiv');

		modal.removeClass('show');
		modalDiv.css('width', '0px');
		modalDiv.css('height', '0px');
	}
});

module.exports = Modal;
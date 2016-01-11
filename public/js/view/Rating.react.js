
/**
 * 评分组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');
var State = require('react-router').State;

var Constants = require('../constants/AppConstants');
var FormatUtil = require('../utils/FormatUtil');

/**
 * 评分组件
 */
var Rating = React.createClass({

	mixins: [State],

	componentDidMount: function() {

		if (this.props.showModal != null) {
			$('.rating').bind('tap', this._showModal);	
		}
	},

	getRating: function() {
		return this.state.rating;
	},

	render: function() {

		var rating = this.props.rating;
		if (!rating) {
			rating = 5;
		}
		var ratingComps = [];

		for (var i = 1; i <= 5; i++) {

			if (i <= rating) {
				ratingComps.push(
					<img src={Constants.Images.STAR_ON} />
				);
			}
			else {
				ratingComps.push(
					<img src={Constants.Images.STAR_OFF} />
				);
			}
		}

		var title = '评分：';
		if (this.getPath().indexOf(Constants.Url.FACILITY) >= 0 || 
			this.getPath().indexOf(Constants.Url.DISTRICT) >= 0) {
			title = '用户评分：';
		}

		return (
			<div className='rating'>
				<span>{title}</span>
				<div className='rating-img'>
					{ratingComps}
				</div>
			</div>
		)
	},

	_showModal: function() {
		if (this.props.showModal != null) {
			this.props.showModal();	
		}
	},
});

module.exports = Rating;
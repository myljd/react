
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

var Constants = require('../constants/AppConstants');
var FormatUtil = require('../utils/FormatUtil');

/**
 * 评分组件
 */
var Rating = React.createClass({

	getInitialState: function() {

		var rating = this.props.rating;
		if (!rating) {
			rating = 5;
		}

		return {
			rating: rating
		}
	},

	componentDidMount: function() {

		if (this.props.editable != null) {

			for (var i = 1; i <= 5; i++) {
				console.log($('#ratingStar' + i));
				$('#ratingStar' + i).bind('tap', this._onTouchStar);
			}
		}
	},

	getRating: function() {
		return this.state.rating;
	},

	render: function() {

		var rating = this.state.rating;
		var ratingComps = [];

		for (var i = 1; i <= 5; i++) {

			if (i <= rating) {
				ratingComps.push(
					<img id={'ratingStar' + i} src={Constants.Images.STAR_ON} />
				);
			}
			else {
				ratingComps.push(
					<img id={'ratingStar' + i} src={Constants.Images.STAR_OFF} />
				);
			}
		}

		return (
			<div ref='container' className='rating'>
				<span>评分</span>
				<div className='rating-img'>
					{ratingComps}
				</div>
			</div>
		)
	},

	_onTouchStar: function(e) {

		console.log(e.target.id);
		var rating = e.target.id.substring(10);
		this.setState({
			rating: rating
		});
	}
});

module.exports = Rating;
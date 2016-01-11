
/**
 * 营业时间组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');

var Constants = require('../constants/AppConstants');
 

/**
 * 营业时间组件
 */
var Rating = React.createClass({

	getDefaultProps: function() {
		return {
			opening: [
				{
					start: '00:00',
					end: '00:00'
				}
			]
		}
	},

	render: function() {

		var opening = this.props.opening;
		var openingComps = [];

		for (var i = 0; i < opening.length; i++) {

			var text = opening[i].start + ' - ' + opening[i].end;
			openingComps.push(
				<div>{text}</div>
			);
		}

		return (
			<div className='opening'>
				<span>开放时间：</span>
				<div>
					{openingComps}
				</div>
			</div>
		)
	}
});

module.exports = Rating;
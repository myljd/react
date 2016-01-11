
/**
 * 搜索模态框
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/1
 * 
 */

var React = require('react');

var ViewUtil = require('../utils/HowUIUtil');
var Constants = require('../constants/AppConstants');

var deg = 0;
var rotationTimer = null;

function startRotation(el) {

	rotationTimer = setInterval(function() {

		deg = (deg + 20) % 360;
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

/**
 * 搜索模态框
 */
var Modal = React.createClass({

	_name: '',

	show: function(name) {
		
		var modal = $('#searchModal');
		var modalDiv = $('.search-modalDiv');

		modal.addClass('show');
		modalDiv.css('width', '100%');
		modalDiv.css('height', '100%');
		modalDiv.css('marginTop', '50px');

		this._name = name;
		this.forceUpdate();

		startRotation($('#refresh-img'));

	},

	render: function() {

		var name = this._name;

		return (
			<div>
				<div className='search-modalDiv' />
				<div id='searchModal' className='fancy modal search-modal'>
					<div>
						<i><img id='refresh-img' src={Constants.Images.DETAILS} /></i>
						<span>{name}，请稍候</span>
					</div>
				</div>
			</div>
		)
	},

	hide: function() {

		var modal = $('#searchModal');
		var modalDiv = $('.search-modalDiv');

		setTimeout(function() {

			modal.removeClass('show');
			modalDiv.css('width', '0px');
			modalDiv.css('height', '0px');

			clearInterval(rotationTimer);
			rotationTimer = null;
		}, 1000);
		
	}
});

module.exports = Modal;
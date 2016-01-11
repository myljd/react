
var React = require('react');

var STYLE_ANIMATION = 'webkitAnimation';

var Toast = React.createClass({

	_toastNode: null,
	_toastTextNode: null,

	componentDidMount: function() {
		this._toastTextNode = React.findDOMNode(this.refs.toastText);
		this._toastNode = React.findDOMNode(this.refs.toast);
		this._toastNode.addEventListener('webkitAnimationEnd', this._toastEnd);

	},

	show: function(text) {
		this._toastTextNode.innerHTML = text;
		this._toastNode.style['display'] = 'initial';
		this._toastNode.style[STYLE_ANIMATION] = 'toast 2s linear';
	},

	_toastEnd: function() {
		this._toastNode.style[STYLE_ANIMATION] = '';
		this._toastNode.style['display'] = 'none';
	},

	_onTouchMove: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	render: function() {

		var text = this.props.text;

		return (
			<div ref='toast' className='toast' onTouchMove={this._onTouchMove}>
				<span ref='toastText'></span>
			</div>
		);
	}
});

module.exports = Toast;
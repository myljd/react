
var React = require('react');
var Rotator = require('./Rotator.react');

var STYLE_ANIMATION = 'webkitAnimation';

/**
 * 提示框
 */
var Prompt = React.createClass({

	_promptNode: null,
	_promptTextNode: null,
	_rotatorNode: null,
	_isShown: false,

	componentDidMount: function() {
		this._promptTextNode = React.findDOMNode(this.refs.promptText);
		this._promptNode = React.findDOMNode(this.refs.prompt);
		this._promptNode.addEventListener('webkitAnimationEnd', this._promptEnd);
		this._rotatorNode = React.findDOMNode(this.refs.rotator);

	},

	_onTouchPrompt: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	show: function(text) {

		if (this._isShown) {
			return;
		}

		console.log('Prompt show');

		this._isShown = true;
		this._promptNode.style['display'] = 'initial';
		this._promptNode.style[STYLE_ANIMATION] = 'prompt 200s linear infinite';
		this._promptTextNode.innerHTML = text;
		this.refs.rotator.startRotate();
	},

	hide: function() {

		console.log('Prompt hide');
		this._promptNode.style['display'] = 'none';
		this._promptNode.style[STYLE_ANIMATION] = '';
		if (this.refs.rotator) {
			this.refs.rotator.stopRotate();
		}
		this._isShown = false;
	},

	render: function() {

		var text = this.props.text;

		return (
			<div ref='prompt' className='prompt' onTouchMove={this._onTouchPrompt}>
				<Rotator ref='rotator' />
				<span ref='promptText'></span>
			</div>
		);
	}
});

module.exports = Prompt;
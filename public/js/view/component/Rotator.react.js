
var React =require('react');

var STYLE_ANIMATION = 'webkitAnimation';

var Rotator = React.createClass({

	_rotateImage1Node: null,
	_rotateImage2Node: null,
	_rotatorNode: null,
	_isRotating: false,

	componentDidMount: function() {
		this._rotateImage1Node = React.findDOMNode(this.refs.rotateImage1);
		this._rotateImage2Node = React.findDOMNode(this.refs.rotateImage2);
		this._rotatorNode = React.findDOMNode(this.refs.rotator);
	},

	startRotate: function() {
		console.log('startRotate');

		if (this._isRotating) {
			return;
		}

		this._isRotating = true;
		this._rotatorNode.style['opacity'] = '1.0';
		this._rotateImage1Node.style[STYLE_ANIMATION] = 'rotate 1.5s linear infinite';
		this._rotateImage2Node.style[STYLE_ANIMATION] = 'rotate 1.5s linear infinite';
	},

	stopRotate: function() {
		console.log('stopRotate');
		this._rotatorNode.style['opacity'] = '0.0';
		this._rotateImage1Node.style[STYLE_ANIMATION] = '';
		this._rotateImage2Node.style[STYLE_ANIMATION] = '';
		this._isRotating = false;
	},

	render: function() {
		return (
			<div ref='rotator' className='rotator'>
				<div className='circle-container container1'>
					<div ref='rotateImage1' className='circle circle1' />
				</div>
				<div className='circle-container container2'>
					<div ref='rotateImage2' className='circle circle2' />
				</div>
				<div className='bg' />
			</div>
		)
	}

});

module.exports = Rotator;
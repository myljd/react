
var React = require('react');

var Router = require('react-router');
var Navigation = Router.Navigation;
var ViewUtil = require('../../utils/HowUIUtil');

var TYPE_BUTTON = 'button';

var ListItem = React.createClass({

	componentDidMount: function() {
		$('#list-item' + this.props.id).bind('tap', this._onTapItem);
		$('#list-item' + this.props.id).bind('touchstart', this._onTapStart);
		$('#list-item' + this.props.id).bind('touchend', this._onTapEnd);
		$('#list-item' + this.props.id).bind('touchcancel', this._onTapEnd);
	},

	render: function() {

		var className = 'list-item';
		if (this.props.selected) {
			className = 'list-item item-selected';
		}

		var itemComp = {};
		if (TYPE_BUTTON == this.props.type) {
			itemComp = (
				<input type='button' id={'list-item' + this.props.id} className={className} value={this.props.value} />
			);
		}
		else {
			return (
				<div id={'list-item' + this.props.id} className={className}>{this.props.children}</div>
			);
		}

		return (
			<div>
				{itemComp}
			</div>
		);
	},

	_onTapStart: function() {
		$('#list-item' + this.props.id).addClass('item-touching');
	},

	_onTapEnd: function() {
		$('#list-item' + this.props.id).removeClass('item-touching');
	},

	_onTapItem: function(e) {
		console.log('ListItem tapped');
		this.props.onTap(this.props.id);
	}

});

module.exports = ListItem;
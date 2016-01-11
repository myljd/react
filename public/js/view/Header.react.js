
var React = require('react');

var FormatUtil = require('../utils/FormatUtil');

var Header = React.createClass({

	render: function() {

		return (
			<div className='b-header'>
				{this.props.children}
			</div>
		);
	}
});

Header.Left = React.createClass({

	propTypes: {
		icon: React.PropTypes.string,
		onTap: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			icon: '',
		}
	},

	render: function() {

		var comp = {};
		if (!FormatUtil.isEmpty(this.props.icon)) {
			comp = (
				<img src={this.props.icon} />
			);
		}
		else {
			comp = this.props.children;
		}

		return (
			<div className='b-header-left'>
				{comp}
			</div>
		);
	}
});

Header.Right = React.createClass({

	propTypes: {
		icon: React.PropTypes.string,
		onTap: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			icon: '',
		}
	},

	render: function() {

		var comp = {};
		if (!FormatUtil.isEmpty(this.props.icon)) {
			comp = (
				<img src={this.props.icon} />
			);
		}
		else {
			comp = this.props.children;
		}

		return (
			<div className='b-header-right'>
				{comp}
			</div>
		);
	}
});

Header.Content = React.createClass({

	propTypes: {
		title: React.PropTypes.string,
		onTap: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			title: '',
		}
	},

	render: function() {

		var comp = {};
		if (!FormatUtil.isEmpty(this.props.title)) {
			comp = (
				<span>{this.props.title}</span>
			);
		}
		else {
			comp = this.props.children;
		}

		return (
			<div className='b-header-content'>
				{comp}
			</div>
		);
	}
});

module.exports = Header;
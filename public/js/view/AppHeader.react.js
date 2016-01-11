
var React = require('react');
var Router = require('react-router');

var State = Router.State;
var Navigation = Router.Navigation;

var Constants = require('../constants/AppConstants');

var ViewUtil = require('../utils/HowUIUtil');

var AppHeader = React.createClass({

	mixins: [State, Navigation],

	componentDidMount: function() {
		$('#backBtn').bind('tap', this._onNavBack);
		$('#linkBtn').bind('tap', this._onNavLink);
		$('#postBtn').bind('tap', this._onPost);
		$('#phoneBtn').bind('tap', this._onCall);

		$('.front-cover').bind('touchmove', this._onTouchHeader);
	},

	_onTouchHeader: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	render: function() {

		var backBtn = this.props.backBtn;
		var title = this.props.title;

		var path = this.getPathname();

		if (!title) {
			title = '';
		}
		else if (title != null && title.length > 8) {
			title = title.substring(0, 7) + '...';
		}

		var phoneComp = (
			<li className="grid-item right-title"></li>
		);
		if (this.props.phone) {
			phoneComp = (
				<li id='phoneBtn' className="grid-item right-title">
					<div id='phone'>
						<span>紧</span>
						<span>急</span>
					</div>
					<i className='phone'><img src={Constants.Images.TELEPHONE} /></i>
				</li>
			);
		}

		if (backBtn == null) {
			return (
				<section className='front-cover'>
			      	<ul className='grid three-item'>
			      		<li className="grid-item left-title"></li>
			      		<li className="grid-item cover-title leader-font">{title}</li>
			      		{phoneComp}
			      	</ul>
			    </section>
			);
		}
		else {

			var backBtnComp = (
				<li id='backBtn' className="grid-item left-title"><input type='button' style={{'backgroundImage': 'url(\'' + Constants.Images.BACK + '\')'}} /></li>
			);
			if (1 == Router.History.length) {
				backBtnComp = (
					<li className="grid-item left-title"></li>
				);
			}
				
			return (
				<section className='front-cover'>
			      	<ul className='grid three-item'>
			      		{backBtnComp}
			      		<li className="grid-item cover-title leader-font">{title}</li>
			      		{phoneComp}
			      	</ul>
			    </section>
			);
		}
		
	},

	_onCall: function() {
		window.location.href = 'tel://0519-85106668';
	},

	_onNavBack: function() {

		if (this.props.onNavBack) {
			this.props.onNavBack();
		}
		else {

			if (this.props.onBack) {
				this.props.onBack();
			}
			this.goBack();
		}
	},

	_onPost: function() {
		
		this.props.onPost();
	}

});

module.exports = AppHeader;
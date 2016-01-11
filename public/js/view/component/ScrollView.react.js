
var React = require('react');

var CubicBezier = require('../../utils/CubicBezier');
var Rotator = require('./Rotator.react');

var NOW = Date.now || function () { return new Date().getTime();};

var DIRECTION_VERTICAL = 0;
var DIRECTION_HORIZONTAL = 1;

var STYLE_TRANSITION_DURATION = 'webkitTransitionDuration';
var STYLE_TRANSITION_TIMING_FUNC = 'webkitTransitionTimingFunction';
var STYLE_TRANSFORM = 'webkitTransform';
var STYLE_ANIMATION = 'webkitAnimation';

var BOUNCE_TIME = 600;
var PULL_TO_SNAP_TIME = 200;

var ACCELERATION_CONSTANT = 0.0005;

var EASING_REGULAR = {
	style: CubicBezier(0.33, 0.66, 0.66, 1).toString(),
	fn: CubicBezier(0.33, 0.66, 0.66, 1)
};

var EASING_BOUNCE  = {
	style: CubicBezier(0.33, 0.33, 0.66, 0.81).toString,
	fn: CubicBezier(0.33, 0.33, 0.66, 0.81)
}

var MIN_THRESHOLD = 7;
var MIN_VELOCITY = 0.1;

var Loader = React.createClass({

	_loaderNode: null,

	getHeight: function() {
		return this._loaderNode.offsetHeight;
	},

	/**
	 * 执行刷新动画
	 */
	startAnimation: function() {
		this.refs.rotator.startRotate();
	},

	/**
	 * 停止刷新动画
	 */
	stopAnimation: function() {
		this.refs.rotator.stopRotate();
	},

	componentDidMount: function() {
		this._loaderNode = React.findDOMNode(this.refs.scrollLoader);
	},

	componentDidUpdate: function() {

	},

	render: function() {

		var hasMore = this.props.hasMore;

		if (hasMore) {
			return (
				<div ref='scrollLoader' className='scroll-loader'>
					<Rotator ref='rotator' />
					<span>上拉加载更多</span>
				</div>
			);
		}
		else {
			return (
				<div ref='scrollLoader' className='scroll-loader'>
					<span>没有更多信息</span>
				</div>
			);
		}
	},

});

var Refresh = React.createClass({

	_refreshNode: null,
	_refreshTextNode: null,

	getHeight: function() {
		return this._refreshNode.offsetHeight;
	},

	/**
	 * 执行刷新动画
	 */
	startAnimation: function() {
		this.refs.rotator.startRotate();
		this._refreshTextNode.innerHTML = '数据取得中';
	},

	/**
	 * 停止刷新动画
	 */
	stopAnimation: function() {
		this.refs.rotator.stopRotate();
		this._refreshTextNode.innerHTML = '';
	},

	componentDidMount: function() {
		this._refreshNode = React.findDOMNode(this.refs.scrollRefresh);
		this._refreshTextNode = React.findDOMNode(this.refs.refreshText);
	},

	render: function() {

		return (
			<div ref='scrollRefresh' className='scroll-refresh'>
				<Rotator ref='rotator' />
				<span ref='refreshText'></span>
			</div>
		);
	}

});


var ScrollView = React.createClass({

	_x: 0,
	_y: 0,
	_initiated: false,
	_moved: false,
	_distX: 0,
	_distY: 0,
	_startX: 0,
	_startY: 0,
	_pointX: 0,
	_pointY: 0,
	_startTime: 0,
	_lastPosition: 0,
	_velocity: 0,
	_scrollDirection: DIRECTION_VERTICAL,
	_transitionTime: 0,
	_isAnimating: false,
	_isScrolling: false,
	_isRefreshing: false,
	_isLoading: false,
	_hasScrollY: false,
	_maxScrollY: 0,
	_refreshHeight: 0,
	_loaderHeight: 0,
	_acceleration: ACCELERATION_CONSTANT,
	_wrapperHeight: 0,

	_scrollContentNode: null,
	_scrollViewNode: null,

	componentDidMount: function() {

		this._scrollViewNode = React.findDOMNode(this.refs.scrollView);
		this._scrollContentNode = React.findDOMNode(this.refs.scrollContent);
		this._scrollContentNode.addEventListener('webkitTransitionEnd', this._transitionEnd);

		// 计算尺寸
		this._calcSize();
		this._scrollTo(0, -this._refreshHeight);
	},

	componentDidUpdate: function() {

		console.debug('ScrollView componentDidUpdate');
		this._calcSize();
	},

	render: function() {

		var refreshComp = '';
		if (this.props.pullToRefresh) {
			refreshComp = (
				<Refresh ref='refresh'/>
			);
		}

		var loaderComp = '';
		if (this.props.pullToLoad) {
			loaderComp = (
				<Loader ref='loader' hasMore={this.props.hasMore}/>
			);
		}

		var inner = ''
		if (this.props.inner) {
			inner = ' inner';
		}

		return (
			<div ref='scrollView' className={'scroll-view' + inner}
				onTouchCancel={this._scrollEnd} onTouchEnd={this._scrollEnd} onTouchMove={this._scrollMove} onTouchStart={this._scrollStart} >
				{refreshComp}
				<div ref='scrollContent'className='scroll-content'>
					<div className='content'>
						{this.props.children}
					</div>
					{loaderComp}
				</div>
			</div>
		);
	},

	_scrollStart: function(e) {

		console.log('ScrollView _scrollStart');

		var point = e.nativeEvent.touches[0];

		this._initiated = true;
		this._moved = false;
		this._distX = 0;
		this._distY = 0;
		this._velocity = 0;
		// this._scrollDirection = DIRECTION_VERTICAL;

		this._setTransitionTime();
		this._isAnimating = false;

		// 如果当前正在滑动，则停止滑动
		if (this._isScrolling) {
			this._stopMomentum();
			this._isScrolling = false;
			e.preventDefault();
		}

		// 设定当前的位置信息
		this._startX = this._x;
		this._startY = this._y;
		this._pointX = point.pageX;
		this._pointY = point.pageY;
		this._startTime = NOW();
		this._lastPosition = this._startY;

		//TODO 触发开始滑动事件
	},

	_scrollMove: function(e) {

		e.preventDefault();

		// 如果一个元素接收到move事件并取消滑动
		if (e.cancelScrolling) {
			return;
		}

		var point = e.nativeEvent.touches[0];

		var deltaX = point.pageX - this._pointX;
		var deltaY = point.pageY - this._pointY;
		var timestamp = NOW();

		// 被检测都正在移动
		if (!this._moved && deltaY) {
			this._moved = true;
			this._translate(this._x, this._y);
		}

		this._pointX = point.pageX;
		this._pointY = point.pageY;
		this._distX = this._distX + deltaX;
		this._distY = this._distY + deltaY;
		var absDistX = Math.abs(this._distX);
		var absDistY = Math.abs(this._distY);
		var newX = this._x + deltaX;
		var newY = this._y + deltaY;

		// 如果小于阀值，不滑动
		if (MIN_THRESHOLD && absDistY < MIN_THRESHOLD) {
			return;
		}

		// 如果已经超过了滑动范围，降低滑动速度
		if (this._isOutOfScroll(newX, newY)) {
			newY = this._y + deltaY / 3;
			newX = this._x + deltaX / 3;
		}

		this._setNormalizedXY(newX, newY);

		this._translate(this._x, this._y);
		if (timestamp - this._startTime > 300) {
			this._startTime = timestamp;
			this._startX = this._x;
			this._startY = this._y;
		}
	},

	/**
	 * 停止刷新动作
	 */
	stopRefresh: function() {
		this.refs.refresh.stopAnimation();
		this._isRefreshing = false;
		this._resetPosition(BOUNCE_TIME);
	},

	/**
	 * 停止加载动作
	 */
	stopLoading: function() {
		this.refs.loader.stopAnimation();
		this._isLoading = false;
		this._resetPosition(BOUNCE_TIME);
	},

	/**
	 * 滑动到顶部
	 */
	scrollToTop: function() {
		this._scrollTo(0, -this._refreshHeight);
	},

	/**
	 * 执行加载动作
	 */
	_performLoading: function() {
		console.log('ScrollView _performLoading');
		this._isLoading = true;
		this.refs.loader.startAnimation();

		if (this.props.onStartLoading) {
			this.props.onStartLoading();
		}
	},

	/**
	 * 执行刷新动作
	 */
	_performRefresh: function() {
		console.log('ScrollView _performRefresh');
		this._isRefreshing = true;
		this.refs.refresh.startAnimation();

		if (this.props.onStartRefresh) {
			this.props.onStartRefresh();
		}
	},

	_scrollEnd: function() {

		console.log('ScrollView _scrollEnd');

		// 如果正在移动，直接返回
		if (!this._moved || !this._initiated) {
			this._initiated = true;
			return;
		}

		this._initiated = false;
		
		// 处理刷新
		if (this.props.pullToRefresh && !this._isRefreshing) {
			if (this._y > 0) {
				this._performRefresh();
			}
		}
		
		// 处理加载
		if (this.props.pullToLoad && !this._isLoading && this.props.hasMore) {
			if (this._y < this._maxScrollY) {
				this._performLoading();	
			}
		}

		// 如果需要重置位置，直接返回
		if (this._resetPosition(BOUNCE_TIME)) {
			return;
		}

		var duration = NOW() - this._startTime;
		var time = 0;
		var bounce = EASING_REGULAR;

		// 开始滑动！
		this._isScrolling = true;
		var momentum = this._getMomentum(this._y, this._startY, duration, this._maxScrollY, this._wrapperHeight);
		this._scrollTo(this._x, momentum.destination, momentum.time, momentum.bounce);
	},

	/**
	 * 判断是否已经超过滑动范围
	 */
	_isOutOfScroll: function(x, y) {
		// console.debug('_isOutOfScroll y=' + y + ' _maxScrollY=' + this._maxScrollY);
		return (y > 0 || y < this._maxScrollY)
	},

	_setNormalizedXY: function(x, y) {
		this._y = parseFloat(y);
		this._x = parseFloat(x);
	},

	/**
	 * 滑动到某个位置
	 */
	_scrollTo: function(x, y, time, easing) {
		easing || (easing = EASING_REGULAR);

		this._setTransitionEasing(easing.style);
		this._setTransitionTime(time);
		this._translate(x, y);

		// 如果没有设定时间，当前不是在滑动
		if (!time) {
			this._isScrolling = false;
			//TODO 设定事件，手势事件结束
		}
		else {
			//TODO 设定事件，开始滑动动画
		}
		
	},

	/**
	 * 停止动量滑动
	 */
	_stopMomentum: function() {

		var style = window.getComputedStyle(this._scrollContentNode, null);
		var matrix = style['webkitTransform'].split(')')[0].split(', ');
		var x = matrix[12] || matrix[4];
		var y = matrix[13] || matrix[5];

		this._translate(x, y);
	},

	/**
	 * 取得滑动的动量
	 */
	_getMomentum: function(current, start, duration, lowerMargin, wrapperSize) {

		// console.debug('_getMomentum current=' + current + ' start=' + start + ' duration=' + duration + ' lowerMargin=' + lowerMargin + ' wrapperSize=' + wrapperSize);

		var velocity = this._getVelocity(current, start, duration);
		var momentum = this._calcMomentum(velocity, current);
		console.debug('_getMomentum velocity = ' + velocity);
		console.debug(momentum);

		// 如果计算出来的目的地超出底部，重新计算
		if (momentum.destination < lowerMargin) {
			momentum = this._calcSnap(lowerMargin, wrapperSize, velocity, current);
			momentum.bounce = EASING_BOUNCE;
		}
		// 如果计算出来的目的地超出顶部，重新计算
		else if (momentum.destination > 0) {
			momentum = this._calcSnap(0, wrapperSize, velocity, current);
			momentum.bounce = EASING_BOUNCE;
		}

		return momentum;
	},

	/**
	 *
	 */
	_getVelocity: function(current, start, time) {
		

		var v = (current - start) / time;
		if (Math.abs(v) < MIN_VELOCITY) {
			v = 0;
		}
		this._velocity = v;
		return v;
	},

	/**
	 * 计算动量
	 */
	_calcMomentum: function(velocity, current) {

		// console.log('ScrollView _calcMomentum current = ' + current);

		var acceleration = this._acceleration;
		var time = Math.abs(velocity) / acceleration;
		var distance = velocity / 2 * time;

		// console.debug('velocity = ' + velocity);
		// console.debug('acceleration = ' + acceleration);
		// console.debug('distance = ' + distance);

		return {
			destination: current + distance,
			time: time
		};
	},

	/**
	 * 重新计算动量
	 */
	_calcSnap: function(start, end, velocity, current) {

		var destination = start + (end / 2) * (velocity / 8);
		return {
			destination: destination,
			time: Math.abs((destination - current) / velocity)
		};
	},

	/**
	 * 移动动画完成
	 */
	_transitionEnd: function(e) {

		console.log('ScrollView _transitionEnd');

		// 设定transition时间为0
		this._setTransitionTime();

		// 如果需要重置位置则重置，否则已经重置成功
		if (!this._resetPosition(BOUNCE_TIME)) {
			this._isScrolling = false;
			//TODO 在这里可以添加回调方法
			if (this.props.onScrollEnd) {
				this.props.onScrollEnd();
			}
		}
	},

	_calcSize: function () {

		// 如果有刷新
        if (this.props.pullToLoad) {
        	this._loaderHeight = this.refs.loader.getHeight();
        }
        
        // 如果有加载
        if (this.props.pullToRefresh) {
        	this._refreshHeight = this.refs.refresh.getHeight();
        }

        // Once all the sizes are accurate, performn the scroll size calculations
        this._wrapperHeight = this._scrollViewNode.clientHeight;
        this._wrapperWidth = this._scrollViewNode.clientWidth;
        if (this.props.inner) {
        	this._wrapperHeight = this._scrollViewNode.scrollHeight;
        	if (this._wrapperHeight > 240) {
        		this._wrapperHeight = 240;
        	}
        }
        
        this._scrollerWidth = this._scrollContentNode.offsetWidth;
        this._scrollerHeight = this._scrollContentNode.scrollHeight + this._loaderHeight;
        if (!this.props.inner) {
        	this._scrollerHeight += 100;
        }

        // console.log(this._scrollContentNode);
        // console.log(this._scrollContentNode.offsetHeight);
        // console.log(this._scrollContentNode.clientHeight);

        this._maxScrollX = this._wrapperWidth - this._scrollerWidth;
        this._maxScrollY = this._wrapperHeight - this._scrollerHeight;

        this._maxScrollX = this._maxScrollX > 0 ? 0 : this._maxScrollX;
        this._maxScrollY = this._maxScrollY > 0 ? 0 : this._maxScrollY;

        this._hasScrollX = this._maxScrollX < 0;
        this._hasScrollY = this._maxScrollY < 0;

        console.log(this._scrollContentNode.scrollHeight);
        console.log('_wrapperHeight = ' + this._wrapperHeight);
        console.log('_scrollerHeight = ' + this._scrollerHeight);
        console.log('_hasScrollY = ' + this._hasScrollY);
        console.log('_maxScrollY = ' + this._maxScrollY);
    },

    _getResetPositionRefresh: function() {

	   	return {
    		x: this._x,
    		y: 0,
    		time: PULL_TO_SNAP_TIME
    	};
    },

    _getResetPositionLoad: function() {

    	return {
    		x: this._x,
    		y: this._maxScrollY,
    		time: PULL_TO_SNAP_TIME
    	}
    },

	/**
	 * 重置位置
	 *   TRUE: 需要重置   FALSE: 不需要重置
	 */
	_resetPosition: function(time, forceReset) {

		console.log('ScrollView _resetPosition');

		time || (time = 0);

		var x = this._x;
		var y = this._y;
		var customPos;

		// 如果正在刷新
		if (this.props.pullToRefresh && this._isRefreshing && y > -this._refreshHeight) {
			customPos = this._getResetPositionRefresh();
		}
		else if (this.props.pullToLoad && this._isLoading && y < this._maxScrollY) {
			customPos = this._getResetPositionLoad();
		}

		// 如果有刷新或加载组件
		if (customPos) {
			y = customPos.y;
			time = customPos.time || time;
		}
		// 如果没有刷新或加载组件
		else {

			// 如果已经在上界以外
			if (!this._hasScrollY || this._y >= -this._refreshHeight) {
				console.debug('Range check over top. this._y = ' + this._y);
				y = -this._refreshHeight;
			}
			// 如果在下界以外
			else if (this._y < this._maxScrollY) {
				console.debug('Range check over bottom. this._y = ' + this._y + ' this._maxScrollY = ' + this._maxScrollY);
				y = this._maxScrollY;
			}
		}

		if (y === this._y) {
			return false;
		}

		// 滑动到指定位置
		// console.log('ScrollView _resetPosition scroll to y = ' + y + ' _y = ' + this._y + ' _maxScrollY = ' + this._maxScrollY);
		this._scrollTo(x, y, time, EASING_REGULAR);
		return true;
	},

	_translate: function(x, y) {

		console.log('ScrollView _translate y = ' + y);

		x = 0;
		this._scrollContentNode.style[STYLE_TRANSFORM] = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
		this._x = x;
		this._y = y;
	},

	_setTransitionEasing: function(easing) {
		this._scrollContentNode.style[STYLE_TRANSITION_TIMING_FUNC] = easing;
	},

	_setTransitionTime: function(time) {
		time || (time = 0);
		this._scrollContentNode.style[STYLE_TRANSITION_DURATION] = time + 'ms';
	}
});

module.exports = ScrollView;
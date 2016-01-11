var heightTop = 0;
var offsetheight = 0;
var scrollTop = 0

var EasyScroller = function(content, options) {
        this.content = content;
        this.container = content.parentNode;
        this.options = options || {};
        var that = this;
        this.scroller = new Scroller(function(left, top, zoom) {
            that.render(left, top, zoom)
        }, options);
        this.bindEvents();
        this.content.style[EasyScroller.vendorPrefix + 'TransformOrigin'] = "left top";
        this.reflow()
    };
EasyScroller.prototype.render = (function() {
    var docStyle = document.documentElement.style;
    var engine;
    if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
        engine = 'presto'
    } else if ('MozAppearance' in docStyle) {
        engine = 'gecko'
    } else if ('WebkitAppearance' in docStyle) {
        engine = 'webkit'
    } else if (typeof navigator.cpuClass === 'string') {
        engine = 'trident'
    }
    var vendorPrefix = EasyScroller.vendorPrefix = {
        trident: 'ms',
        gecko: 'Moz',
        webkit: 'Webkit',
        presto: 'O'
    }[engine];
    var helperElem = document.createElement("div");
    var undef;
    var perspectiveProperty = vendorPrefix + "Perspective";
    var transformProperty = vendorPrefix + "Transform";
    if (helperElem.style[perspectiveProperty] !== undef) {
        return function(left, top, zoom) {
            this.content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')'
        }
    } else if (helperElem.style[transformProperty] !== undef) {
        return function(left, top, zoom) {
            this.content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')'
        }
    } else {
        return function(left, top, zoom) {
            this.content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
            this.content.style.marginTop = top ? (-top / zoom) + 'px' : '';
            this.content.style.zoom = zoom || ''
        }
    }
})();
EasyScroller.prototype.scrollToTop = function() {
    this.scroller.scrollTo(0, 0, true);
};
EasyScroller.prototype.reflow = function() {

    this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);
    var rect = this.container.getBoundingClientRect();
    // console.log( this.content.offsetHeight)
    this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop)
};
EasyScroller.prototype.bindEvents = function() {
    var that = this;
    if ('ontouchstart' in window) {
        this.container.addEventListener("touchstart", function (e) {
            if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
                return
            }
            that.scroller.doTouchStart(e.touches, e.timeStamp);
            //if(that.content.offsetHeight != offsetheight){
                that.reflow()
                offsetheight = that.content.offsetHeight
            //}
            e.preventDefault()
        }, false);
        document.addEventListener("touchmove", function (e) {
            that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale)
            scrollTop = that.scroller.__scrollTop
        }, false);
        document.addEventListener("touchend", function (e) {
            that.scroller.doTouchEnd(e.timeStamp)
        }, false);
        document.addEventListener("touchcancel", function (e) {
            that.scroller.doTouchEnd(e.timeStamp)
        }, false)
    }
};
(function(global) {
    var time = Date.now ||
    function() {
        return +new Date()
    };
    var desiredFrames = 60;
    var millisecondsPerSecond = 1000;
    var running = {};
    var counter = 1;
    if (!global.core) {
        global.core = {
            effect: {}
        }
    } else if (!core.effect) {
        core.effect = {}
    }
    core.effect.Animate = {
        requestAnimationFrame: (function() {
            var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
            var isNative = !! requestFrame;
            if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
                isNative = false
            }
            if (isNative) {
                return function(callback, root) {
                    requestFrame(callback, root)
                }
            }
            var TARGET_FPS = 60;
            var requests = {};
            var requestCount = 0;
            var rafHandle = 1;
            var intervalHandle = null;
            var lastActive = +new Date();
            return function(callback, root) {
                var callbackHandle = rafHandle++;
                requests[callbackHandle] = callback;
                requestCount++;
                if (intervalHandle === null) {
                    intervalHandle = setInterval(function() {
                        var time = +new Date();
                        var currentRequests = requests;
                        requests = {};
                        requestCount = 0;
                        for (var key in currentRequests) {
                            if (currentRequests.hasOwnProperty(key)) {
                                currentRequests[key](time);
                                lastActive = time
                            }
                        }
                        if (time - lastActive > 2500) {
                            clearInterval(intervalHandle);
                            intervalHandle = null
                        }
                    }, 1000 / TARGET_FPS)
                }
                return callbackHandle
            }
        })(),
        stop: function(id) {
            var cleared = running[id] != null;
            if (cleared) {
                running[id] = null
            }
            return cleared
        },
        isRunning: function(id) {
            return running[id] != null
        },
        start: function(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
            var start = time();
            var lastFrame = start;
            var percent = 0;
            var dropCounter = 0;
            var id = counter++;
            if (!root) {
                root = document.body
            }
            if (id % 20 === 0) {
                var newRunning = {};
                for (var usedId in running) {
                    newRunning[usedId] = true
                }
                running = newRunning
            }
            var step = function(virtual) {
                    var render = virtual !== true;
                    var now = time();
                    if (!running[id] || (verifyCallback && !verifyCallback(id))) {
                        running[id] = null;
                        completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
                        return
                    }
                    if (render) {
                        var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
                        for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
                            step(true);
                            dropCounter++
                        }
                    }
                    if (duration) {
                        percent = (now - start) / duration;
                        if (percent > 1) {
                            percent = 1
                        }
                    }
                    var value = easingMethod ? easingMethod(percent) : percent;
                    if ((stepCallback(value, now, render) === false || percent === 1) && render) {
                        running[id] = null;
                        completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null)
                    } else if (render) {
                        lastFrame = now;
                        core.effect.Animate.requestAnimationFrame(step, root)
                    }
                };
            running[id] = true;
            core.effect.Animate.requestAnimationFrame(step, root);
            return id
        }
    }
})(this);
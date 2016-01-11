var $ = require('jquery');
var ProjectStore = require('../stores/ProjectStore');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var PostAction = require('../actions/PostAction');

var map = null;
var geolocation = null;
var geocoder = null;
//判断是安卓还是ios
var browser = {
        versions: function() {
            var u = navigator.userAgent,
                app = navigator.appVersion;
            return { //移动终端浏览器版本信息   
                trident: u.indexOf('Trident') > -1, //<a href="https://www.baidu.com/s?wd=IE%E5%86%85%E6%A0%B8&tn=44039180_cpr&fenlei=mv6quAkxTZn0IZRqIHckPjm4nH00T1dBPHuWrjbsuyc4PHD3nWnL0ZwV5Hcvrjm3rH6sPfKWUMw85HfYnjn4nH6sgvPsT6K1TL0qnfK1TL0z5HD0IgF_5y9YIZ0lQzqlpA-bmyt8mh7GuZR8mvqVQL7dugPYpyq8Q1mkP1n3n1fYnjRYPWcLnHfkn6" target="_blank" class="baidu-highlight">IE内核</a>  
                presto: u.indexOf('Presto') > -1, //opera内核  
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、<a href="https://www.baidu.com/s?wd=%E8%B0%B7%E6%AD%8C&tn=44039180_cpr&fenlei=mv6quAkxTZn0IZRqIHckPjm4nH00T1dBPHuWrjbsuyc4PHD3nWnL0ZwV5Hcvrjm3rH6sPfKWUMw85HfYnjn4nH6sgvPsT6K1TL0qnfK1TL0z5HD0IgF_5y9YIZ0lQzqlpA-bmyt8mh7GuZR8mvqVQL7dugPYpyq8Q1mkP1n3n1fYnjRYPWcLnHfkn6" target="_blank" class="baidu-highlight">谷歌</a>内核  
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核  
                mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端  
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端  
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者<a href="https://www.baidu.com/s?wd=uc%E6%B5%8F%E8%A7%88%E5%99%A8&tn=44039180_cpr&fenlei=mv6quAkxTZn0IZRqIHckPjm4nH00T1dBPHuWrjbsuyc4PHD3nWnL0ZwV5Hcvrjm3rH6sPfKWUMw85HfYnjn4nH6sgvPsT6K1TL0qnfK1TL0z5HD0IgF_5y9YIZ0lQzqlpA-bmyt8mh7GuZR8mvqVQL7dugPYpyq8Q1mkP1n3n1fYnjRYPWcLnHfkn6" target="_blank" class="baidu-highlight">uc浏览器</a>  
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器  
                iPad: u.indexOf('iPad') > -1, //是否iPad  
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部  
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
    //判断：
var and = browser.versions.android; //android

function init() {
    // 获得位置信息
    map = new AMap.Map('appMap', {});

    map.plugin('AMap.Geolocation', function() {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 15000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
        });
        map.addControl(geolocation);
        AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
        geolocation.getCurrentPosition();
    });

    map.plugin(["AMap.Geocoder"], function() {
        geocoder = new AMap.Geocoder({
            radius: 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息 
            // extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base" 
        });
        //返回地理编码结果 
        AMap.event.addListener(geocoder, "complete", geocoder_callBack);
        //逆地理编码 
        
    });
}
/*
 *解析定位结果
 */
function onComplete(data) {

    localStorage.lng_foot = data.position.lng;
    localStorage.lat_foot = data.position.lat;
    // alert('maplocationutil',data);
    if (data.isConverted == true && data.info == "SUCCESS") {
        if (and && data.accuracy <= 10) {
            localStorage.lng_foot = parseInt(parseFloat(data.position.lng) * 10000) / 10000;
            localStorage.lat_foot = parseInt(parseFloat(data.position.lat) * 10000) / 10000;
            geolocation.clearWatch();
            geocoder.getAddress(data.position);
        } else if (!and && data.accuracy <= 10) {
            localStorage.lng_foot = parseInt(parseFloat(data.position.lng) * 10000) / 10000;
            localStorage.lat_foot = parseInt(parseFloat(data.position.lat) * 10000) / 10000;
            geolocation.clearWatch();
            geocoder.getAddress(data.position);
        }
    };
};

/*
 *回调函数
 */
function geocoder_callBack(data) {
    localStorage.cityCode_foot = data.regeocode.addressComponent.citycode;
    localStorage.update_time = new Date().getTime();
    AppDispatcher.dispatch({
        type: ActionTypes.LOCATE_POSITION
    });    
}


//每2分半执行一次
var footIntervalTime = (1000 * (60 * 2 + 30));
// var footIntervalTime = (1000 * (6));
setInterval(footInterval, footIntervalTime); //1000为1秒钟

//足迹数据记录
function footInterval() {
    // localStorage.my_foot_data="120.001452,31.824978,1442914940503|120.001473,31.824965,1441924941503|120.003131,31.822066,1442934942503|120.004054,31.824181,1442944943503";

    //第一次进入app纪录起始时间
    if (localStorage.foot_start_time == null || localStorage.foot_start_time == '') {
        localStorage.foot_start_time = new Date().getTime();
    }

    //纪录结束时间和间隔时间
    localStorage.foot_end_time = new Date().getTime();

    //总时间相差1天上传服务器，间隔时间相差大于2分钟纪录一次足迹
    var dif_time = parseInt(localStorage.foot_end_time - localStorage.foot_start_time);
    if (dif_time > (3600*24 * 1000)) {
        PostAction.upFooterToServer();
    } else {
        if (geolocation != null) {
            geolocation.watchPosition();
        }
            
    }
}

//足迹上传服务器
function upFooterToServer() {
    footInterval();
    PostAction.upFooterToServer();
}

module.exports = {
    init: function() {
        init();
    },

    upFooterToServer: function() {
        upFooterToServer();
    },
}
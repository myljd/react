var $ = require('jquery');
var ProjectStore = require('../stores/ProjectStore');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var UrlBase64 = require('../utils/UrlBase64');
var Constants = require('../constants/AppConstants');
var ActionTypes = Constants.ActionTypes;

// var ActionTypes = require('../constants/AppConstants').ActionTypes;
var crypto = require('crypto');

var scale = null; //比例尺
var map = null; //地图
var geolocation = null; //定位
var inIndex = 0; //判定是否是导航首页 1:map_index,2:map_nav_result
var allProjectData = {};
var initFeature = null;
var geocoder = null;
var isMoveMap = 0;
var mapInterval;
var hzmFlag = 1;
var dnszArea = null;
var hzmArea = null;
localStorage.isInFeature = false;
/*
 *解析定位结果
 */
var isInKLW = 0;
var zhklgFlag = 0;
var showType = 'zhklg';
var groundImage = null;
var bounds = new AMap.Bounds(new AMap.LngLat(119.996426, 31.817034), new AMap.LngLat(120.012589, 31.828424));

var base64Interval;

var klyAreaBase64 = 'http://7xlyt3.com2.z0.glb.qiniucdn.com/klyAreaNew.png';
var klyAreaSmallBase64 = 'http://7xlyt3.com2.z0.glb.qiniucdn.com/klyAreaSmallNew.png';
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

/*
 ** 初始化地图
 */

// var url1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw4AAAXcCAMAAAAMY1rjAAADAFBMV…B1BF7SOsomYacXPlk0Lnp7dkn7dBzzMXFBnKVMtZXDJ8JXgZg4i/UTeVwAAAAASUVORK5CYII=';

function init() {

    map = new AMap.Map('map', {
        zooms: [3, 18],
        //传入2D视图，设置中心点和缩放级别
        view: new AMap.View2D({
            center: new AMap.LngLat(120.004342, 31.822543),
            zoom: 15
        })
    });
    resetLocalMaker();
    featureArr.length = 0;
    flagMarker.length = 0;
    // var s1 = new AMap.LngLat(120.003836,31.824077);
    // var s2 = new AMap.LngLat(120.004043,31.824077);
    // alert( s1.distance(s2) );

    //初始化小图
    if (inIndex != 6) {
        groundImage = new AMap.ImageLayer({
            map: map,
            bounds: bounds,
            url: klyAreaSmallBase64,
            opacity: 1,
            zIndex: 1,
            zooms: [3, 18]
        });
        // map.plugin(["AMap.Scale"], function() {
        //     scale = new AMap.Scale({
        //         offset: new AMap.Pixel(55, 60)
        //     });
        //     map.addControl(scale);
        // });
        AMap.event.addListener(map, "zoomchange", zoomChange); //查询成功时的回调函数
        // //地图移动后不再强制定位
        AMap.event.addListener(map, 'dragstart', function(event) {
            if (map != null) {
                $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
                isMoveMap = 0;
                // if (and) {

                // };
            };

        }); //返回定位信息
        hzmFlag = 1;
        initHZMArea(featuresHZM);
        initDnszArea(featuresDnsz);
        initZhklgArea(featuresZhklg);
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


    //地图点击空地后不选择项目
    if (inIndex == 1 || inIndex == 8) {
        AMap.event.addListener(map, 'click', function(event) {
            if (map != null) {
                $('#allType').css('display', 'none');
                $('.message_index_box').css("display", "none");
                if (inIndex == 8) {
                    $('.map_footer').css("display", "none");
                };
                $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>导航</a>");
                setAllOffset(60);
                if (clickName2 != null) {
                    $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
                };
            };

        }); //返回定位信息

    };

    // if (inIndex == 1) {
    //     showDrawType();
    // };
}

// function getBase64(){
//     console.log(12);
//     klyAreaBase64 = UrlBase64.klyAreaBase64();
//     initKLYArea();
//     clearInterval(base64Interval);
// }

var featuresHZM = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 118.766348,
        lat: 32.042091
    }, {
        lng: 118.766858,
        lat: 32.040995
    }, {
        lng: 118.767309,
        lat: 32.040845
    }, {
        lng: 118.768044,
        lat: 32.040672
    }, {
        lng: 118.768156,
        lat: 32.040695
    }, {
        lng: 118.768424,
        lat: 32.041904
    }, {
        lng: 118.768344,
        lat: 32.041968
    }, {
        lng: 118.768038,
        lat: 32.042032
    }, {
        lng: 118.768038,
        lat: 32.042191
    }, {
        lng: 118.767641,
        lat: 32.042254
    }, {
        lng: 118.767448,
        lat: 32.042268
    }, {
        lng: 118.767255,
        lat: 32.042614
    }, {
        lng: 118.767158,
        lat: 32.04265
    }, {
        lng: 118.766761,
        lat: 32.042541
    }, {
        lng: 118.766386,
        lat: 32.042345
    }, {
        lng: 118.766348,
        lat: 32.042091
    }]
}];

var featuresHZM = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 118.766348,
        lat: 32.042091
    }, {
        lng: 118.766858,
        lat: 32.040995
    }, {
        lng: 118.767309,
        lat: 32.040845
    }, {
        lng: 118.768044,
        lat: 32.040672
    }, {
        lng: 118.768156,
        lat: 32.040695
    }, {
        lng: 118.768424,
        lat: 32.041904
    }, {
        lng: 118.768344,
        lat: 32.041968
    }, {
        lng: 118.768038,
        lat: 32.042032
    }, {
        lng: 118.768038,
        lat: 32.042191
    }, {
        lng: 118.767641,
        lat: 32.042254
    }, {
        lng: 118.767448,
        lat: 32.042268
    }, {
        lng: 118.767255,
        lat: 32.042614
    }, {
        lng: 118.767158,
        lat: 32.04265
    }, {
        lng: 118.766761,
        lat: 32.042541
    }, {
        lng: 118.766386,
        lat: 32.042345
    }, {
        lng: 118.766348,
        lat: 32.042091
    }]
}];

var featuresZhklg = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙馆区域",
    desc: "中华恐龙馆区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.001312,
        lat: 31.824518
    }, {
        lng: 120.00142,
        lat: 31.824354
    }, {
        lng: 120.001361,
        lat: 31.824299
    }, {
        lng: 120.001323,
        lat: 31.824204
    }, {
        lng: 120.001312,
        lat: 31.82409
    }, {
        lng: 120.001334,
        lat: 31.823953
    }, {
        lng: 120.00142,
        lat: 31.823839
    }, {
        lng: 120.001581,
        lat: 31.823725
    }, {
        lng: 120.001742,
        lat: 31.823638
    }, {
        lng: 120.001951,
        lat: 31.823575
    }, {
        lng: 120.002053,
        lat: 31.823543
    }, {
        lng: 120.00201,
        lat: 31.823716
    }, {
        lng: 120.002085,
        lat: 31.823743
    }, {
        lng: 120.002171,
        lat: 31.823839
    }, {
        lng: 120.002348,
        lat: 31.823789
    }, {
        lng: 120.002348,
        lat: 31.823857
    }, {
        lng: 120.002407,
        lat: 31.823844
    }, {
        lng: 120.002407,
        lat: 31.824008
    }, {
        lng: 120.002369,
        lat: 31.824172
    }, {
        lng: 120.002241,
        lat: 31.824349
    }, {
        lng: 120.002058,
        lat: 31.824491
    }, {
        lng: 120.001854,
        lat: 31.824564
    }, {
        lng: 120.001709,
        lat: 31.824596
    }, {
        lng: 120.001506,
        lat: 31.824577
    }, {
        lng: 120.001372,
        lat: 31.824559
    }, {
        lng: 120.001307,
        lat: 31.824518
    }, {
        lng: 120.001307,
        lat: 31.824518
    }]
}];

var featuresDnsz = [{
    type: "Polygon",
    name: "迪诺水镇",
    desc: "中华恐龙园",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    center: {
        lng: 120.001224,
        lat: 31.824686,
        level: 17
    },
    lnglat: [{
        lng: 120.003405,
        lat: 31.817079
    }, {
        lng: 120.003383,
        lat: 31.819176
    }, {
        lng: 120.003512,
        lat: 31.820398
    }, {
        lng: 120.003726,
        lat: 31.821182
    }, {
        lng: 120.003662,
        lat: 31.821364
    }, {
        lng: 120.003748,
        lat: 31.821802
    }, {
        lng: 120.004199,
        lat: 31.822695
    }, {
        lng: 120.00495,
        lat: 31.82388
    }, {
        lng: 120.005915,
        lat: 31.82481
    }, {
        lng: 120.006237,
        lat: 31.824956
    }, {
        lng: 120.00701,
        lat: 31.824536
    }, {
        lng: 120.007825,
        lat: 31.823916
    }, {
        lng: 120.008726,
        lat: 31.823297
    }, {
        lng: 120.009606,
        lat: 31.822531
    }, {
        lng: 120.0104,
        lat: 31.821346
    }, {
        lng: 120.011215,
        lat: 31.820051
    }, {
        lng: 120.011795,
        lat: 31.818921
    }, {
        lng: 120.012202,
        lat: 31.817535
    }, {
        lng: 120.01231,
        lat: 31.817152
    }, {
        lng: 120.003405,
        lat: 31.817097
    }, {
        lng: 120.003405,
        lat: 31.817116
    }]
}];


function initDnszArea(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;

        for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
            path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
        }
        dnszArea = new AMap.Polygon({
            map: map,
            path: path,
            extData: data,
            zIndex: 1,
            strokeWeight: data.strokeWeight,
            strokeColor: data.strokeColor,
            strokeOpacity: data.strokeOpacity,
            fillColor: data.fillColor,
            fillOpacity: data.fillOpacity
        });
        // AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}

var zhklgArea = null;

function initZhklgArea(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;

        for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
            path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
        }
        zhklgArea = new AMap.Polygon({
            map: map,
            path: path,
            extData: data,
            zIndex: 1,
            strokeWeight: data.strokeWeight,
            strokeColor: data.strokeColor,
            strokeOpacity: data.strokeOpacity,
            fillColor: data.fillColor,
            fillOpacity: data.fillOpacity
        });
        // AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}

function initHZMArea(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;

        for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
            path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
        }
        hzmArea = new AMap.Polygon({
            map: map,
            path: path,
            extData: data,
            zIndex: 1,
            strokeWeight: data.strokeWeight,
            strokeColor: data.strokeColor,
            strokeOpacity: data.strokeOpacity,
            fillColor: data.fillColor,
            fillOpacity: data.fillOpacity
        });
        // AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}

function initKLYArea() {
    groundImage.setImageUrl(klyAreaBase64);

    groundImage.setMap(map);
    if (inIndex == 1) {
        AppDispatcher.dispatch({
            type: ActionTypes.LODING_HIDE
        });
    }
}

function initGeolocation() {
    //地图定位
    map.plugin('AMap.Geolocation', function() {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false, //显示定位按钮，默认：true
            buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: false, //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: false, //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        map.addControl(geolocation);
        AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
        AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
        geolocation.getCurrentPosition();
    });
}

function reInitGeolocation() {
    //地图定位
    localMaker = null;
    map.removeControl(geolocation);
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, //是否使用高精度定位，默认:true
        timeout: 10000, //超过10秒后停止定位，默认：无穷大
        maximumAge: 0, //定位结果缓存0毫秒，默认：0
        convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: false, //显示定位按钮，默认：true
        buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: false, //定位成功后在定位到的位置显示点标记，默认：true
        showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: false, //定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
    geolocation.getCurrentPosition();

}


function startMapInterval() {
    if (geolocation != null) {
        geolocation.watchPosition();
    }
    // if (and) {
    //     getPositionByTime();
    // } else {
    //     mapInterval = setInterval(getPositionByTime, 3 * 1000); //1000为1秒钟
    // }
}

function getPositionByTime() {
    if (geolocation != null) {
        if (and) {
            geolocation.watchPosition();
        } else {
            geolocation.getCurrentPosition();
        }
    };
}

var localMaker = null;

function resetLocalMaker() {
    localMaker = null;
}

function initMyLocation() {
    if (localMaker != null) {
        localMaker.setPosition(new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine));
    } else {
        localMaker = new AMap.Marker({
            map: map,
            position: new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine),
            offset: new AMap.Pixel(-12, -12),
            opacity: 1,
            icon: new AMap.Icon({
                //图标大小
                size: new AMap.Size(23, 23),
                //大图地址
                image: "public/images/loc.png",
                imageSize: new AMap.Size(23, 23),
                // imageOffset: new AMap.Pixel(10, 20)
            }),
            clickable: false,
        });
    }

}

function dealMyPosition(data) {
    if (data.isConverted == true && data.info == "SUCCESS") {
        // hzmArea

        var isInHZM = hzmArea.contains(new AMap.LngLat(data.position.lng, data.position.lat));
        if (isInHZM == true && hzmFlag == 1) {
            alert('友情提醒:您的GPS可能未开启,请确认开启GPS并重新定位');
            AppDispatcher.dispatch({
                type: ActionTypes.LODING_HIDE
            });
            hzmFlag = 0;
        }
        // $('#accuracy').empty();
        // $('#accuracy').html('精度:'+data.accuracy);
        if (and && data.accuracy <= 30) {
            // alert(data.accuracy);
            localStorage.lng_mine = parseInt(parseFloat(data.position.lng) * 10000) / 10000;
            localStorage.lat_mine = parseInt(parseFloat(data.position.lat) * 10000) / 10000;
            finishDeal(data);
        } else if (!and && data.accuracy <= 50) {
            // alert(1234567);
            localStorage.lng_mine = parseInt(parseFloat(data.position.lng) * 10000) / 10000;
            localStorage.lat_mine = parseInt(parseFloat(data.position.lat) * 10000) / 10000;
            finishDeal(data);
        }
        // localStorage.lng_mine = 120.003362;
        // localStorage.lat_mine = 31.821583;
        // alert(localStorage.lng_mine);
    };
}


function onComplete(data) {
    console.log(data)
        // alert(data.isConverted+'，精度：'+data.accuracy);
        //处理高德的定位数据，过滤最后两位小数，同时过滤未经过偏移的数据，增加gps提示
    dealMyPosition(data);
};

function finishDeal(data) {
    //自定义定位点展示
    initMyLocation();

    if (isMoveMap == 1) {
        // map.setZoom(18);
        $(".location_icon").css('background-image', 'url(public/images/after_location.svg)');
        map.setCenter(new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine));

    };
    //是否园内
    if (inIndex == 1 && initFeature != null) {
        localStorage.isInFeature = initFeature.contains(new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine));
        console.log(localStorage.isInFeature)
    };
    //是否已进入恐龙馆
    if (inIndex == 1 && zhklgArea != null) {
        var isInZhklg = zhklgArea.contains(new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine));
        if (isInZhklg && zhklgFlag == 0) {
            zhklgFlag = 1;
            alert('您已进入恐龙馆摇一摇体验区，请打开手机蓝牙进行微信摇一摇查看化石的详细介绍。')
        }
    };
    //无起始点使用定位坐标
    if (navMineFlag == 0) {
        // localStorage.lng_start = 120.004306;
        // localStorage.lat_start = 31.824486;
        localStorage.lng_start = localStorage.lng_mine;
        localStorage.lat_start = localStorage.lat_mine;
        if (localStorage.cityCode_mine != null) {
            localStorage.cityCode_start = localStorage.cityCode_mine;
        } else {
            localStorage.cityCode_start = '0519';
        }
        navMineFlag = 1;
    }
    //优化路线,园内到园外，园外到园内等
    // dealLine()
    
    geocoder.getAddress(data.position);
}

function reInitEnd(){
    console.log('reInitEnd',localStorage.lng_end, localStorage.lat_end)
    if (localStorage.lng_hold_end!=null) {
        localStorage.lng_end = localStorage.lng_hold_end;
        localStorage.lat_end = localStorage.lat_hold_end;
        localStorage.cityCode_end = localStorage.cityCode_hold_end;
        console.log('reInitEnd in ', localStorage.lng_end, localStorage.lat_end)
        if (localStorage.text_hold_end!=null) {
            localStorage.text_end = localStorage.text_hold_end;
        };
    }
}

function dealLine(){
    reInitEnd();
    console.log('reInitEnd out ', localStorage.lng_end, localStorage.lat_end)
    if (localStorage.lng_start != null ) {
        var startFlag = initFeature.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));

        if (startFlag == true || startFlag == 'true') {
            localStorage.is_start_in = 1;
            AppDispatcher.dispatch({
                type: ActionTypes.IS_START_IN
            });
        } else {
            localStorage.is_start_in = 0;
            AppDispatcher.dispatch({
                type: ActionTypes.IS_START_IN
            });
        }
    };

    //判断：断终点是否在园内
    if ((inIndex == 2 || inIndex == 4) && initFeature != null) {
        if (localStorage.lng_hold_end != null && localStorage.lng_start != null) {
            var endFlag = initFeature.contains(new AMap.LngLat(localStorage.lng_hold_end, localStorage.lat_hold_end));
            var startFlag = initFeature.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
            console.log('localStorage.navWaylocalStorage.navWaylocalStorage.navWay', localStorage.navWay)

            var dnszFlag = dnszArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
            console.log(localStorage.navWay, startFlag, endFlag, dnszFlag)
            if (startFlag == false && endFlag == true) {
                if (dnszFlag == true || dnszFlag == 'true') {
                    //起点园外 迪诺水镇区域，终点园内，导航到 中华恐龙园东大门
                    isInKLW = 3;
                } else {
                    //起点园外 非迪诺水镇区域，终点园内，导航到 迪诺水镇1号停车场
                    if (localStorage.navWay.indexOf("walk_nav") == -1) {
                        isInKLW = 1;
                    } else {
                        isInKLW = 4;
                    }
                }

            } else if (startFlag == true && endFlag == false) {
                //起点园内，终点园外，导航到 中华恐龙园东大门
                isInKLW = 2;
            } else {
                isInKLW = 0;
            }
            // console.log("是否园内:" + localStorage.isInFeature);
        };

        if (isInKLW == 1) {
            if (localStorage.text_hold_end != null && localStorage.text_hold_end != 'undefined') {
                localStorage.lng_end = "120.00218";
                localStorage.lat_end = "31.816845";
                localStorage.text_end = "迪诺水镇停车场1号入口";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从迪诺水镇进入恐龙园东大门，祝游玩愉快。");
            } else if (localStorage.text_hold_end == null || localStorage.text_hold_end == 'undefined') {
                localStorage.lng_end = "120.00218";
                localStorage.lat_end = "31.816845";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从迪诺水镇进入恐龙园东大门，祝游玩愉快。");
            }

        } else if (isInKLW == 2) {
            if (localStorage.text_hold_end != null && localStorage.text_hold_end != 'undefined' ) {
                localStorage.lng_end = "120.0037";
                localStorage.lat_end = "31.82305";
                localStorage.text_end = "中华恐龙园(东门)";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园外，我们将带您从恐龙园东大门离开，祝游玩愉快。");
            } else if (localStorage.text_hold_end == null || localStorage.text_hold_end == 'undefined') {
                localStorage.lng_end = "120.0037";
                localStorage.lat_end = "31.82305";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园外，我们将带您从恐龙园东大门离开，祝游玩愉快。");
            }
        } else if (isInKLW == 3) {
            if (localStorage.text_hold_end != null && localStorage.text_hold_end != 'undefined' ) {
                localStorage.lng_end = "120.0037";
                localStorage.lat_end = "31.82305";
                localStorage.text_end = "中华恐龙园(东门)";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从恐龙园东大门进入，祝游玩愉快。");
            } else if (localStorage.text_hold_end == null || localStorage.text_hold_end == 'undefined') {
                localStorage.lng_end = "120.0037";
                localStorage.lat_end = "31.82305";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从恐龙园东大门进入，祝游玩愉快。");
            }
        } else if (isInKLW == 4) {
            if (localStorage.text_hold_end != null && localStorage.text_hold_end != 'undefined') {
                localStorage.lng_end = "120.005599";
                localStorage.lat_end = "31.817111";
                localStorage.text_end = "中华恐龙园(东门)";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从迪诺水镇进入恐龙园东大门，祝游玩愉快。");
            } else if (localStorage.text_hold_end == null || localStorage.text_hold_end == 'undefined') {
                localStorage.lng_end = "120.005599";
                localStorage.lat_end = "31.817111";
                localStorage.cityCode_end = "0519";
                alert("温馨提示: 您的终点设置在了恐龙园内，我们将带您从迪诺水镇进入恐龙园东大门，祝游玩愉快。");
            }
        } 

    };

}

/*
 *回调函数
 */
var navFlag = 1;

function geocoder_callBack(data) {
    // console.log(data);
    localStorage.formattedAddress = data.regeocode.formattedAddress;
    localStorage.cityCode_mine = data.regeocode.addressComponent.citycode;
    localStorage.text_mine = "我的位置";

    console.log('isInKLW', isInKLW)
    //排除首页
    if (inIndex!=1) {
        

        if (localStorage.lng_end != null && localStorage.lng_start != null) {
            if (navFlag == 0) {
                if (localStorage.navWay.indexOf("bus_nav") != -1) {
                    bus_plan();
                }
                if (localStorage.navWay.indexOf("car_nav") != -1) {
                    driving_route();
                }
                if (localStorage.navWay.indexOf("walk_nav") != -1) {
                    // alert('asdfasdf')
                    walking_route();
                }
                navFlag = 1;
            }
        };
    };

    
}


var zoomFlag = 16;

function setZoomFlag(flag) {
    zoomFlag = flag;
}
/*
 ** 地图缩放监听
 */
function zoomChange() {
    isMoveMap = 0;
    //缩放地图按钮变化

    var zoomLevel = map.getZoom();
    var largestLevel = 18;

    if (zoomLevel == largestLevel) {
        $(".map_zoomin").css("background-image", 'url(public/images/largest.svg)');
    } else {
        var img = $(".map_zoomin").css("background-image");
        if (img != null && img.indexOf('larger.svg') == -1) {
            $(".map_zoomin").css("background-image", 'url(public/images/larger.svg)');
        };
    }
    //缩放地图按钮变化
    if (zoomLevel == 3) {
        $(".map_zoomout").css("background-image", 'url(public/images/smallest.svg)');
    } else {
        var img = $(".map_zoomout").css("background-image");
        if (img != null && img.indexOf('smaller.svg') == -1) {
            $(".map_zoomout").css("background-image", 'url(public/images/smaller.svg)');
        }
    }
    //首页各级别下的图形
    if (inIndex == 1) {

        $('.message_index_box').css("display", "none");
        $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>导航</a>");
        setAllOffset(60);
        $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');

        if (clickName2 != null) {
            $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
        };

        if (zoomLevel >= 16 && zoomFlag == 16) {
            zoomFlag = 15;
            AppDispatcher.dispatch({
                type: ActionTypes.LODING_SHOW
            });
            setTimeout(initKLYArea, 200);
        };
    };

    //首页各级别下的图形
    if (inIndex == 2 || inIndex == 0 || inIndex == 4) {

        if (zoomLevel >= 16 && zoomFlag == 16) {
            zoomFlag = 15;
            AppDispatcher.dispatch({
                type: ActionTypes.LODING_SHOW
            });
            setTimeout(initKLYArea, 200);
        };
    };

}

function reDrawByType() {

    for (var i = 0; i < featureArr.length; i++) {
        featureArr[i].hide();
    };
    // map.remove(featureArr);
    // featureArr.length = 0;
    $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
    showDrawType();
}

function showDrawType() {
    if (showType.indexOf('all') != -1) {
        drawProject(showType);
        drawOther();
        drawProjectOther();
        drawFood();
        drawShop();
    } else if (showType.indexOf('food') != -1) {
        drawFood();
    } else if (showType.indexOf('shop') != -1) {
        drawShop();
    } else if (showType.indexOf('other') != -1) {
        drawOther();
        drawProjectOther();
    } else {
        drawProject(showType);
    }
}
/*
 *设置是否在导航主页
 */
function setInIndex(isIn) {
    inIndex = isIn;
}

function setProjectData(projectData) {
    allProjectData = projectData.data;
}

var flagMarker = new Array();

/*
 *标识所有项目
 */
function drawProject(type) {
    var color = null;
    var allDistrict = new Array();
    var parent_name = null;
    var name = "all";
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 0) {
            allDistrict.push(allProjectData[i]);
        }
    }

    for (var i = 0; i < allProjectData.length; i++) {
        // console.log(allProjectData[1])


        if (allProjectData[i].category == 1) {
            parent_name = "中华恐龙馆";
            name = '中华恐龙馆';
            for (var j = 0; j < allDistrict.length; j++) {
                if (allProjectData[i].parent_id == allDistrict[j]._id) {
                    parent_name = allDistrict[j].name;
                }
            }
            if (type.indexOf('zhklg') != -1) {
                name = '中华恐龙馆';
            } else if (type.indexOf('xhklc') != -1) {
                name = '嘻哈恐龙城';
            } else if (type.indexOf('kksk') != -1) {
                name = '库克苏克';
            } else if (type.indexOf('lbl') != -1) {
                name = '鲁布拉';
            } else if (type.indexOf('mhyl') != -1) {
                name = '魔幻雨林';
            } else if (type.indexOf('mhzy') != -1) {
                name = '梦幻庄园';
            } else if (type.indexOf('dnsz') != -1) {
                name = '迪诺水镇';
            }

            if (parent_name.indexOf('中华恐龙馆') != -1) {
                color = 'zhklg';
            } else if (parent_name.indexOf('嘻哈恐龙城') != -1) {
                color = 'xhklc';
            } else if (parent_name.indexOf('库克苏克') != -1) {
                color = 'kksk';
            } else if (parent_name.indexOf('鲁布拉') != -1) {
                color = 'lbl';
            } else if (parent_name.indexOf('魔幻雨林') != -1) {
                color = 'mhyl';
            } else {
                color = 'xm';
            }

            if (name.indexOf(parent_name) != -1 || type.indexOf('all') != -1) {
                var markerIndex = flagMarker.indexOf(allProjectData[i]._id);
                if (markerIndex != -1) {
                    featureArr[markerIndex].show();
                } else {
                    var feature = [{
                        flag: 2,
                        type: "Marker",
                        name: allProjectData[i].name,
                        title: allProjectData[i].name + '_' + i,
                        projectId: allProjectData[i]._id,
                        desc: parent_name,
                        color: color,
                        opacity: 1,
                        icon: "cir",
                        offset: {
                            x: -23,
                            y: -35
                        },
                        lnglat: {
                            lng: allProjectData[i].location[0],
                            lat: allProjectData[i].location[1]
                        }
                    }];
                    loadFeatures(feature);
                    flagMarker.push(allProjectData[i]._id);
                }
            };
        }
    }
}

function drawOther() {
    var color = null;
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 4 ) {
            var markerIndex = flagMarker.indexOf(allProjectData[i]._id);
            if (markerIndex != -1) {
                featureArr[markerIndex].show();
            } else {
                color = allProjectData[i].category_type;
                var feature = [{
                    flag: 2,
                    type: "Marker",
                    name: allProjectData[i].name,
                    title: allProjectData[i].name + '_' + i,
                    projectId: allProjectData[i]._id,
                    desc: '公共设施/其他',
                    color: color,
                    opacity: 1,
                    icon: "cir",
                    offset: {
                        x: -23,
                        y: -35
                    },
                    lnglat: {
                        lng: allProjectData[i].location[0],
                        lat: allProjectData[i].location[1]
                    }
                }];
                loadFeatures(feature);
                flagMarker.push(allProjectData[i]._id);
            }
        }
    }
}

/*
 *标识所有美食
 */
function drawFood() {
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 2) {
            var markerIndex = flagMarker.indexOf(allProjectData[i]._id);
            if (markerIndex != -1) {
                featureArr[markerIndex].show();
            } else {
                color = allProjectData[i].category_type;
                var feature = [{
                    flag: 2,
                    type: "Marker",
                    name: allProjectData[i].name,
                    title: allProjectData[i].name + '_' + i,
                    projectId: allProjectData[i]._id,
                    desc: '美食',
                    color: 'ms',
                    opacity: 1,
                    icon: "cir",
                    offset: {
                        x: -23,
                        y: -35
                    },
                    lnglat: {
                        lng: allProjectData[i].location[0],
                        lat: allProjectData[i].location[1]
                    }
                }];
                loadFeatures(feature);
                flagMarker.push(allProjectData[i]._id);
            }
        }
    }
}

/*
 *标识所有美食
 */
function drawShop() {
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 3) {
            var markerIndex = flagMarker.indexOf(allProjectData[i]._id);
            if (markerIndex != -1) {
                featureArr[markerIndex].show();
            } else {
                color = allProjectData[i].category_type;
                var feature = [{
                    flag: 2,
                    type: "Marker",
                    name: allProjectData[i].name,
                    title: allProjectData[i].name + '_' + i,
                    projectId: allProjectData[i]._id,
                    desc: '商店',
                    color: 'sc',
                    opacity: 1,
                    icon: "cir",
                    offset: {
                        x: -23,
                        y: -35
                    },
                    lnglat: {
                        lng: allProjectData[i].location[0],
                        lat: allProjectData[i].location[1]
                    }
                }];
                loadFeatures(feature);
                flagMarker.push(allProjectData[i]._id);
            }
        }
    }
}

// 星聚汇影城  迪诺水镇  恐龙谷温泉
function drawProjectOther() {

    var color = null;
    // console.log("sa", allProjectData)
    for (var i = 0; i < allProjectData.length; i++) {
        // 
        if (allProjectData[i].name.indexOf('恐龙城大剧场') != -1 ||
            allProjectData[i].name.indexOf('香树湾花园酒店') != -1 ||
            allProjectData[i].name.indexOf('恐龙谷温泉') != -1) {
            var markerIndex = flagMarker.indexOf(allProjectData[i]._id);
            if (markerIndex != -1) {
                featureArr[markerIndex].show();
            } else {
                if (allProjectData[i].name.indexOf('恐龙城大剧场') != -1) {
                    // console.log("dyy", allProjectData[i]);
                    color = 'dyy';
                } else if (allProjectData[i].name.indexOf('香树湾花园酒店') != -1) {
                    // console.log("jd", allProjectData[i]);
                    color = 'jd';
                } else if (allProjectData[i].name.indexOf('恐龙谷温泉') != -1) {
                    // console.log("wq", allProjectData[i]);
                    color = 'wq';
                }

                var feature = [{
                    flag: 1,
                    type: "Marker",
                    name: allProjectData[i].name,
                    title: allProjectData[i].name + '_' + i,
                    projectId: allProjectData[i]._id,
                    desc: "中华恐龙园",
                    opacity: 1,
                    color: color,
                    icon: "cir",
                    offset: {
                        x: -23,
                        y: -35
                    },
                    lnglat: {
                        lng: allProjectData[i].location[0],
                        lat: allProjectData[i].location[1]
                    }
                }];
                loadFeatures(feature);
                flagMarker.push(allProjectData[i]._id);
            }
        }
    }

}

/*
 *解析定位错误信息
 */
function onError(data) {
    $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
    // alert("无法获取当前位置");
}
/*
 *设置定位和缩放图标位置
 */
function setAllOffset(offset) {
    // $(".map_zoom").css("bottom", offset + "px");
    // $(".map_locate").css("bottom", offset + "px");
    // if (scale!=null) {
    //     map.remove(scale);
    //     scale = new AMap.Scale({
    //         offset: new AMap.Pixel(55, offset)
    //     });
    // }else{
    //     scale = new AMap.Scale({
    //         offset: new AMap.Pixel(55, offset)
    //     });
    // }

    // map.addControl(scale);
}

/*
 *获取当前位置信息,第一次打开地图时自动定位,不把定位点移到视图中心,手动点击定位后将定位到的位置作为地图中心点
 */

function getMyPosition() {
    isMoveMap = 1;
    geolocation.getCurrentPosition();
};

/*
 *监控当前位置并获取当前位置信息
 */
function watchMyPosition() {  
    if (geolocation != null) {
        if (map != null) {
            geolocation.watchPosition();
        };
    }
}

/*
 *监控当前位置并获取当前位置信息
 */
function clearWatchMyPosition() {  
    if (geolocation != null) {
        geolocation.clearWatch();
    }
}

function destroyMap() {
    AMap.event.removeListener(map); //返回定位信息
    map.clearMap();
    map.destroy();
}

function mapIn() {
    if (map != null) {
        map.zoomIn();
    }
}

function mapOut() {
    if (map != null) {
        map.zoomOut();
    }
}

var featuresResult = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    center: {
        lng: 120.001224,
        lat: 31.824686,
        level: 17
    },
    lnglat: [{
        lng: 119.997568,
        lat: 31.823953
    }, {
        lng: 119.997869,
        lat: 31.824682
    }, {
        lng: 119.998255,
        lat: 31.825384
    }, {
        lng: 119.997793,
        lat: 31.825603
    }, {
        lng: 119.997493,
        lat: 31.82584
    }, {
        lng: 119.997568,
        lat: 31.826104
    }, {
        lng: 119.999145,
        lat: 31.828201
    }, {
        lng: 119.999263,
        lat: 31.828219
    }, {
        lng: 120.005186,
        lat: 31.825302
    }, {
        lng: 120.005668,
        lat: 31.824937
    }, {
        lng: 120.004156,
        lat: 31.822996
    }, {
        lng: 120.003555,
        lat: 31.821865
    }, {
        lng: 120.002965,
        lat: 31.821428
    }, {
        lng: 120.002568,
        lat: 31.821154
    }, {
        lng: 120.002278,
        lat: 31.821036
    }, {
        lng: 120.001591,
        lat: 31.820835
    }, {
        lng: 119.999875,
        lat: 31.82048
    }, {
        lng: 119.999285,
        lat: 31.820471
    }, {
        lng: 119.998287,
        lat: 31.822194
    }, {
        lng: 119.998051,
        lat: 31.82316
    }, {
        lng: 119.99759,
        lat: 31.823953
    }, {
        lng: 119.997579,
        lat: 31.823953
    }]
}];


var flag = 1;
var featureArr = new Array();

function loadFeatures(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;
        switch (data.type) {
            case "Marker":
                if (data.footNumber != null) {
                    feature = new AMap.Marker({
                        map: map,
                        position: new AMap.LngLat(data.lnglat.lng, data.lnglat.lat),
                        zIndex: 100,
                        extData: data,
                        opacity: data.opacity,
                        offset: new AMap.Pixel(data.offset.x, data.offset.y),
                        title: data.title,
                        // animation: "AMAP_ANIMATION_DROP",
                        content: '<div id=' + i + ' class="icon_' + data.color + ' map_footer_num">' + data.footNumber + '</div>'
                    });
                } else {
                    feature = new AMap.Marker({
                        map: map,
                        position: new AMap.LngLat(data.lnglat.lng, data.lnglat.lat),
                        zIndex: 100,
                        extData: data,
                        opacity: data.opacity,
                        offset: new AMap.Pixel(data.offset.x, data.offset.y),
                        title: data.title,
                        // animation: "AMAP_ANIMATION_DROP",
                        content: '<div id=' + i + ' class="icon_' + data.color + '"></div>'
                    });
                }

                // alert(data.title+',111,'+data.color+','+data.lnglat.lng);
                featureArr.push(feature);
                break;
            case "Polygon":
                for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
                    path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
                }
                feature = new AMap.Polygon({
                    map: map,
                    path: path,
                    extData: data,
                    zIndex: 1,
                    strokeWeight: data.strokeWeight,
                    strokeColor: data.strokeColor,
                    strokeOpacity: data.strokeOpacity,
                    fillColor: data.fillColor,
                    fillOpacity: data.fillOpacity
                });
                break;
            default:
                feature = null;
        }

        // if (flag == 2) {
        AMap.event.addListener(feature, "click", mapFeatureClick2);
        // }
    }
}


var clickName2 = null;
var clickColor2 = null;

function mapFeatureClick2(d) {

    // alert(d.target.Qd.extData.name);
    var extData = null;
    for (var i in d.target) {
        if (d.target[i].extData != null && d.target[i].extData.name != null) {
            // console.log(d.target[i].extData);
            extData = d.target[i].extData;
            // break;
        }
    };
    console.log(extData);

    $('.message_name').text(extData.name);
    $('.message_dis').text(extData.desc);
    if (extData.desc.indexOf('公共设施/其他') != -1) {
        $('.message_right').hide();
    } else {
        $('.message_right').show();
    }
    localStorage.lat_end = extData.lnglat.lat;
    localStorage.lng_end = extData.lnglat.lng;
    localStorage.cityCode_end = "0519";
    localStorage.text_end = extData.name;
    localStorage.chooseId = extData.projectId;
    localStorage.isProject = 1;
    //点击后变不透明
    color = extData.color;
    console.log(color, clickColor2, clickName2);
    if (clickName2 != null) {
        console.log($('div[title=' + clickName2 + ']').children("#0").css('background-image'))
        $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
    };
    clickName2 = extData.title;
    clickColor2 = color;
    console.log(color, clickColor2, clickName2);
    $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + color + '_red.svg)');
    // console.log("asdfasfdasdf", $('div[title=' + clickName2 + ']').children("#0").css('background-image'));

    setAllOffset("130");
    $('.message_index_box').css("display", "block");
    if (inIndex == 8) {
        $('.map_footer').css("display", "block");
    };
    $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>到这去</a>");
}


var resultStr; //结果拼接string 
var carPolyline; //驾车折线
var busPolyline; //公交折线
var walkPolyline; //步行折线
var extra_line1; //公交换乘步行折线1
var extra_line2; //公交换乘步行折线2
var end_xy; //目的地坐标;

var sicon;
var eicon;
var startmarker;
var endmarker;


// 31.822499 120.001345 31.823343 120.001275
// localStorage.lat_start = 31.822499;
// localStorage.lng_start = 120.001345;
// localStorage.lat_end = 31.823343;
// localStorage.lng_end = 120.001275;



/*---------------------------------------------驾车导航 START-----------------------------------------------------*/
//驾车导航 
function getTotalTime(time) {
    if (time <= 60) {
        return "1分钟";
    } else if (time > 60 && time <= 3659) {
        return parseInt(time / 60) + "分钟";
    } else {
        return parseInt(time / 3600) + "小时" + parseInt((time % 3600) / 60) + "分钟";
    }
}

function getTotalDistance(distance) {
    if (distance <= 1000) {
        return distance + "米";
    } else {
        return Math.round(distance * 1.0 / 100) / 10 + "公里";
    }
}


function driving_route() {
    dealLine();
    //起、终点 
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var MDrive;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    map.plugin(["AMap.Driving"], function() {
        var DrivingOption = {
            //驾车策略，包括 LEAST_TIME，LEAST_FEE, LEAST_DISTANCE,REAL_TRAFFIC 
            policy: AMap.DrivingPolicy.LEAST_TIME,
            extensions: "all"
        };
        MDrive = new AMap.Driving(DrivingOption); //构造驾车导航类  
        AMap.event.addListener(MDrive, "complete", driving_routeCallBack); //返回导航查询结果 
        //显示错误信息 
        AMap.event.addListener(MDrive, "error", function(e) {
            alert("没有对应驾车线路，请重设起始点");
            AppDispatcher.dispatch({
                type: ActionTypes.LOCATION_LOADING_HIDE,
                data: data
            });
        });
        MDrive.search(start_xy, end_xy); //根据起终点坐标规划驾车路线 
    });
}
//驾车导航结果展示 
function driving_routeCallBack(data) {
    // console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应驾车线路，请重设起始点");
        AppDispatcher.dispatch({
            type: ActionTypes.LOCATION_LOADING_HIDE,
            data: data
        });
        return false;
    }

    map.remove(featureArr);
    featureArr.length = 0;

    // map.clearMap();
    // reInitGeolocation();
    // initKLYArea();
    $("#bus_div").css("display", "none");
    $("#map_div").css("display", "block");
    if ($('.bus_nav i').css('background-image').indexOf('bus1.svg') == -1) {
        $('.bus_nav i').css('background-image', "url('public/images/bus1.svg')");
    };
    if ($('.car_nav i').css('background-image').indexOf('car2.svg') == -1) {
        $('.car_nav i').css('background-image', "url('public/images/car2.svg')");
    }
    if ($('.walk_nav i').css('background-image').indexOf('walk1.svg') == -1) {
        $('.walk_nav i').css('background-image', "url('public/images/walk1.svg')");
    }

    localStorage.nav_data = JSON.stringify(data);
    localStorage.nav_way = "car";
    // map.clearMap();
    var routeS = data.routes;
    if (routeS.length <= 0) {
        //document.getElementById("result").innerHTML = "未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。"; 
    } else {
        route_text = "";
        //时间
        var time = getTotalTime(routeS[0].time);
        //距离
        var distance = getTotalDistance(routeS[0].distance);
        steps = routeS[0].steps;
        //打车费
        var taxi_cost = data.taxi_cost;
        localStorage.taxi_cost = taxi_cost;
        $(".time_dis").empty();
        $(".time_dis").html("<span>约 " + time + "(" + distance + ")</span>");
        $("#navText").empty();
        drivingDrawLine();
    }

    AppDispatcher.dispatch({
        type: ActionTypes.LOCATION_LOADING_HIDE,
        data: data
    });
}
//绘制驾车导航路线 
function drivingDrawLine() {
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标

    //园外步行导航 从迪诺水镇门口到东大门
    // if (localStorage.lng_end == "120.005599") {
    //     end_xy = new AMap.LngLat(120.003866, 31.822704); //目的地坐标

    // };
    //起点、终点图标 
    sicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    featureArr.push(sicon);

    eicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
    featureArr.push(eicon);

    startmarker = null;
    endmarker = null;
    startmarker = new AMap.Marker({
        icon: sicon, //复杂图标 
        visible: true,
        position: start_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });
    featureArr.push(startmarker);

    endmarker = new AMap.Marker({
        icon: eicon, //复杂图标 
        visible: true,
        position: end_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });
    featureArr.push(endmarker);
    //消除其它导航线
        
    if (busPolyline != null) {      
        busPolyline.setMap(null);     
    } 
    if (walkPolyline != null) {      
        walkPolyline.setMap(null);     
    } 
    if (carPolyline != null) {      
        carPolyline.setMap(null);     
    }    
    if (extra_line1 != null) {      
        extra_line1.setMap(null);     
    } 
    if (extra_line2 != null) {     
        extra_line2.setMap(null);     
    }
    //起点到路线的起点 路线的终点到终点 绘制无道路部分 
    var extra_path1 = new Array();
    extra_path1.push(start_xy);
    extra_path1.push(steps[0].path[0]);
    extra_line1 = new AMap.Polyline({
        map: map,
        path: extra_path1,
        isOutline: true,
        outlineColor: "#ffffff",
        strokeColor: "#9400D3",
        strokeOpacity: 0.5,
        strokeWeight: 4
    });
    featureArr.push(extra_line1);

    var extra_path2 = new Array();
    var path_xy = steps[(steps.length - 1)].path;
    extra_path2.push(end_xy);
    extra_path2.push(path_xy[(path_xy.length - 1)]);
    extra_line2 = new AMap.Polyline({
        map: map,
        path: extra_path2,
        isOutline: true,
        outlineColor: "#ffffff",
        strokeColor: "#9400D3",
        strokeOpacity: 0.5,
        strokeWeight: 4
    });
    featureArr.push(extra_line2);

    var drawpath = new Array();
    for (var s = 0; s < steps.length; s++) {
        var plength = steps[s].path.length;
        for (var p = 0; p < plength; p++) {
            drawpath.push(steps[s].path[p]);
        }
    }
    carPolyline = new AMap.Polyline({
        map: map,
        path: drawpath,
        isOutline: true,
        outlineColor: "#ffffff",
        strokeColor: "#0000ff",
        strokeOpacity: 0.5,
        strokeWeight: 4
    });
    featureArr.push(carPolyline);

    map.setFitView(carPolyline);
}


/*---------------------------------------------驾车导航 END-----------------------------------------------------*/

/*---------------------------------------------公交导航 START-----------------------------------------------------*/
/*
 * 调用公交换乘服务
 * param Object trans 公交换乘服务实例
 */
function bus_route() {
    // dealLine();
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var trans;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    // console.log(localStorage.cityCode_start);
    // console.log(localStorage.cityCode_end);
    //加载公交换乘插件 
    map.plugin(["AMap.Transfer"], function() {
        transOptions = {
            city: localStorage.cityCode_start, //公交城市 
            cityd: localStorage.cityCode_end, //公交城市 
            policy: AMap.TransferPolicy.LEAST_TIME, //乘车策略 
            extensions: "all"
        };
        //构造公交换乘类 
        trans = new AMap.Transfer(transOptions);
        //返回导航查询结果           
        AMap.event.addListener(trans, "complete", busTransCallBack);
        //显示错误信息 
        AMap.event.addListener(trans, "error", function(e) {
            alert("没有对应公交线路，请重设起始点");
            AppDispatcher.dispatch({
                type: ActionTypes.LOCATION_LOADING_HIDE,
                data: data
            });
        });
        //根据起、终点坐标查询公交换乘路线 
        trans.search(start_xy, end_xy);
    });
}

function bus_plan() {
    
    dealLine();

    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var trans;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    console.log(localStorage.cityCode_start);
    console.log(localStorage.cityCode_end);
    //加载公交换乘插件 
    map.plugin(["AMap.Transfer"], function() {
        transOptions = {
            city: localStorage.cityCode_start, //公交城市 
            cityd: localStorage.cityCode_end, //公交城市 
            policy: AMap.TransferPolicy.LEAST_TIME //乘车策略 
        };
        
        //构造公交换乘类 
        trans = new AMap.Transfer(transOptions);
        
        
        // console.log(444);
        //根据起、终点坐标查询公交换乘路线 
        try{
            //返回导航查询结果           
            AMap.event.addListener(trans, "complete", busPlanCallBack);
            
            //显示错误信息 
            AMap.event.addListener(trans, "error", function(e) {
                alert("没有对应公交线路，请重设起始点");
                AppDispatcher.dispatch({
                    type: ActionTypes.LOCATION_LOADING_HIDE,
                    data: data
                });
            });
        
            trans.search(start_xy, end_xy);
        }catch (e) 
        { 
            console.log('1111111',e);
            alert(e.message);
        } 
        
         // console.log(555);
    });
}

function busPlanCallBack(data) {
    console.log(1111111111111);
    // console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应公交线路，请重设起始点");
        AppDispatcher.dispatch({
            type: ActionTypes.LOCATION_LOADING_HIDE,
            data: data
        });
        return false;
    }
    map.clearMap();
    reInitGeolocation();
    initKLYArea();
    $("#bus_div").css("display", "block");
    $("#map_div").css("display", "none");
    if ($('.bus_nav i').css('background-image').indexOf('bus2.svg') == -1) {
        $('.bus_nav i').css('background-image', "url('public/images/bus2.svg')");
    };
    if ($('.car_nav i').css('background-image').indexOf('car1.svg') == -1) {
        $('.car_nav i').css('background-image', "url('public/images/car1.svg')");
    }
    if ($('.walk_nav i').css('background-image').indexOf('walk1.svg') == -1) {
        $('.walk_nav i').css('background-image', "url('public/images/walk1.svg')");
    }

    localStorage.nav_data = JSON.stringify(data);
    localStorage.nav_way = "bus";

    AppDispatcher.dispatch({
        type: ActionTypes.LOCATION_BUS_PLAN,
        data: data
    });

    AppDispatcher.dispatch({
        type: ActionTypes.LOCATION_LOADING_HIDE,
        data: data
    });
}

/*
 * 公交换乘服务返回数据解析概况
 * param Object  btCount       换乘方案总数
 * param Array[] btPlans       换乘方案数组
 * param Object  btOrigin      换乘起点
 * param Object  btDestination 换乘终点
 * param Object  btTaxiCost    全程打的花费
 * param Object  btType        查询状态
 * param Array[] BusArr        公交路径数组
 * param Array[] WalkArr       步行路径数组
 * param Array[] onbus         公交换乘点（上车站）数组
 * param Object  naviInfo      换乘段导航信息
 */
function busTransCallBack(data) {
    console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应公交线路，请重设起始点");
        AppDispatcher.dispatch({
            type: ActionTypes.LOCATION_LOADING_HIDE,
            data: data
        });
        return false;
    }
    localStorage.nav_data = JSON.stringify(data);
    localStorage.nav_way = "bus";
    // map.clearMap();
    var btCount = data.count;
    var btPlans = data.plans;
    var btOrigin = data.origin;
    var btDestination = data.destination;
    var btTaxiCost = data.taxi_cost;
    var startName = ""; //可以使用地理编码解析起点和终点坐标 
    var endName = "";
    var BusArr = [];
    var WalkArr = [];
    var onbus = new Array();
    var onwalk = new Array();
    //结果输出用表格展现，输出表格头 
    $("#bus_div").empty();
    $("#bus_div").show();
    $("#map_div").hide();

    var resLine = "<div class='common_shadow navigation_buslist_content common_light'>";


    //遍历每种换乘方案 
    var i = localStorage.busStep;
    var btDistance = btPlans[i].distance;
    var btseg = btPlans[i].segments;

    var naviInfo = '';
    var lineName = '';
    var lineBusStop = 0;

    var lineWalkDis = getTotalDistance(btPlans[i].walking_distance);
    var lineTime = getTotalTime(btPlans[i].time);
    for (var j = 0; j < btseg.length; j++) {
        if (btseg[j].transit_mode == "WALK") {
            WalkArr.push(btseg[j].transit.path);
        } else if (btseg[j].transit_mode == "RAILWAY") {
            var railWay = new Array();
            railWay.push(btseg[j].transit.departure_stop.location);
            console.log("RAILWAY", btseg[j].transit.via_stops);
            for (var k = 0; k < btseg[j].transit.via_stops.length; k++) {
                console.log("RAILWAY22", btseg[j].transit.via_stops[k].location);
                railWay.push(btseg[j].transit.via_stops[k].location);
            };
            railWay.push(btseg[j].transit.arrival_stop.location);
            console.log("RAILWAY11", railWay);
            BusArr.push(railWay);
        } else {
            BusArr.push(btseg[j].transit.path);
        }
    }
    drawBuschangeLine(btOrigin, btDestination, BusArr, WalkArr);


    //取出需要加换乘、步行图标的位置，这里仅画出第一个换乘方案 
    var sinseg = btPlans[i].segments;
    for (var a in sinseg) {
        if (sinseg[a].transit_mode == "WALK") {
            onwalk.push(sinseg[a].transit.origin);
        } else if (sinseg[a].transit_mode == "BUS") {
            onbus.push(sinseg[a].transit.on_station.location);
        }
    }
    //addMarker(); 
    addMarkerBus(onbus);
    map.setFitView();
}
//距离，米换算为千米 
function Getdistance(len) {
    if (len <= 1000) {
        var s = len;
        return s + "米";
    } else {
        var s = Math.round(len / 1000);
        return "约" + s + "公里";
    }
}
//绘制路线，仅第一条 
function drawBuschangeLine(startPot, endPot, BusArr, WalkArr) {
    //自定义起点，终点图标 
    sicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    featureArr.push(sicon);
    eicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
    featureArr.push(eicon);

    //绘制起点，终点 
    startmarker = null;
    endmarker = null;
    startmarker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(startPot.lng, startPot.lat), //基点位置 
        icon: sicon, //复杂图标 
        offset: {
            x: -16,
            y: -34
        } //相对于基点的位置 
    });
    featureArr.push(startmarker);

    endmarker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(endPot.lng, endPot.lat), //基点位置 
        icon: eicon, //复杂图标 
        offset: {
            x: -16,
            y: -34
        } //相对于基点的位置 
    });
    featureArr.push(endmarker);
    //消除其它导航路线
        
    if (carPolyline != null) {         
        carPolyline.setMap(null);     
    }    
    if (walkPolyline != null) {         
        walkPolyline.setMap(null);     
    }    
    if (busPolyline != null) {         
        busPolyline.setMap(null);     
    }    
    if (extra_line1 != null) {         
        extra_line1.setMap(null);     
    }    
    if (extra_line2 != null) {         
        extra_line2.setMap(null);     
    }
    //绘制乘车的路线 
    for (var j in BusArr) {
        busPolyline = new AMap.Polyline({
            map: map,
            path: BusArr[j],
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#005cb5", //线颜色 
            strokeOpacity: 0.5, //线透明度 
            strokeWeight: 4 //线宽 
        });
        featureArr.push(busPolyline);
    }
    //绘制步行的路线 
    for (var i in WalkArr) {
        walkPolyline = new AMap.Polyline({
            map: map,
            path: WalkArr[i],
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#6EB034", //线颜色 
            strokeOpacity: 0.5, //线透明度 
            strokeWeight: 4 //线宽 
        });
        featureArr.push(walkPolyline);
    }

}

function addMarkerBus(busmar) {
    for (var i = 0; i < busmar.length; i++) {
        var busmarker = new AMap.Marker({
            icon: new AMap.Icon({
                image: "http://developer.amap.com/wp-content/uploads/2014/06/busroute.png",
                size: new AMap.Size(20, 20),
                imageOffset: new AMap.Pixel(-33, -3)
            }),
            position: busmar[i],
            offset: {
                x: -25,
                y: -25
            },
            map: map
        });
        featureArr.push(busmarker);
    }
}
/*---------------------------------------------公交导航 END-----------------------------------------------------*/
var featuresLbl = [{
    flag: 0,
    type: "Polygon",
    name: "鲁布拉错误区域",
    desc: "鲁布拉错误区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.004306,
        lat: 31.824486
    }, {
        lng: 120.004188,
        lat: 31.824413
    }, {
        lng: 120.004172,
        lat: 31.824231
    }, {
        lng: 120.00415,
        lat: 31.823948
    }, {
        lng: 120.004177,
        lat: 31.823834
    }, {
        lng: 120.004413,
        lat: 31.82378
    }, {
        lng: 120.004714,
        lat: 31.824126
    }, {
        lng: 120.004665,
        lat: 31.824281
    }, {
        lng: 120.004601,
        lat: 31.824436
    }, {
        lng: 120.0043,
        lat: 31.824486
    }, {
        lng: 120.004306,
        lat: 31.824486
    }]
}];


var featuresEastDoor = [{
    flag: 0,
    type: "Polygon",
    name: "东大门错误区域",
    desc: "东大门错误区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.00297,
        lat: 31.823205
    }, {
        lng: 120.002916,
        lat: 31.823237
    }, {
        lng: 120.002965,
        lat: 31.823388
    }, {
        lng: 120.003142,
        lat: 31.823474
    }, {
        lng: 120.003469,
        lat: 31.82347
    }, {
        lng: 120.003608,
        lat: 31.823347
    }, {
        lng: 120.003925,
        lat: 31.823219
    }, {
        lng: 120.004107,
        lat: 31.823
    }, {
        lng: 120.003839,
        lat: 31.822722
    }, {
        lng: 120.003802,
        lat: 31.822595
    }, {
        lng: 120.003608,
        lat: 31.822741
    }, {
        lng: 120.003474,
        lat: 31.822809
    }, {
        lng: 120.003405,
        lat: 31.822795
    }, {
        lng: 120.00333,
        lat: 31.822905
    }, {
        lng: 120.003201,
        lat: 31.82306
    }, {
        lng: 120.002959,
        lat: 31.823215
    }]
}];


var featuresCjqq = [{
    flag: 0,
    type: "Polygon",
    name: "超级秋千错误区域",
    desc: "超级秋千错误区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 119.999236,
        lat: 31.821159
    }, {
        lng: 119.999397,
        lat: 31.821131
    }, {
        lng: 119.99966,
        lat: 31.82084
    }, {
        lng: 119.999848,
        lat: 31.820739
    }, {
        lng: 120.000009,
        lat: 31.820689
    }, {
        lng: 119.999993,
        lat: 31.820575
    }, {
        lng: 119.999489,
        lat: 31.820566
    }, {
        lng: 119.999129,
        lat: 31.821036
    }, {
        lng: 119.999236,
        lat: 31.821159
    }]
}];

var featuresMhmk = [{
    flag: 0,
    type: "Polygon",
    name: "迷幻魔窟错误区域",
    desc: "迷幻魔窟错误区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.002439,
        lat: 31.821683
    }, {
        lng: 120.002525,
        lat: 31.821587
    }, {
        lng: 120.002852,
        lat: 31.821637
    }, {
        lng: 120.003308,
        lat: 31.821984
    }, {
        lng: 120.00326,
        lat: 31.822121
    }, {
        lng: 120.003142,
        lat: 31.822143
    }, {
        lng: 120.002466,
        lat: 31.821756
    }, {
        lng: 120.00245,
        lat: 31.821683
    }]
}];

var featuresGSLError = [{
    flag: 0,
    type: "Polygon",
    name: "导航到过山龙绕路区域",
    desc: "导航到过山龙绕路区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 119.999666,
        lat: 31.823684
    }, {
        lng: 119.999483,
        lat: 31.823584
    }, {
        lng: 119.999403,
        lat: 31.823534
    }, {
        lng: 119.998882,
        lat: 31.823629
    }, {
        lng: 119.998925,
        lat: 31.824226
    }, {
        lng: 119.99899,
        lat: 31.824427
    }, {
        lng: 119.999092,
        lat: 31.824582
    }, {
        lng: 119.999092,
        lat: 31.824719
    }, {
        lng: 119.998995,
        lat: 31.824915
    }, {
        lng: 119.998823,
        lat: 31.825006
    }, {
        lng: 119.999043,
        lat: 31.825498
    }, {
        lng: 119.999317,
        lat: 31.825826
    }, {
        lng: 119.999666,
        lat: 31.825949
    }, {
        lng: 119.999993,
        lat: 31.825968
    }, {
        lng: 120.000497,
        lat: 31.825612
    }, {
        lng: 120.000529,
        lat: 31.825102
    }, {
        lng: 120.000481,
        lat: 31.824951
    }, {
        lng: 120.000406,
        lat: 31.824837
    }, {
        lng: 120.000095,
        lat: 31.824837
    }, {
        lng: 119.999778,
        lat: 31.824792
    }, {
        lng: 119.999655,
        lat: 31.8246
    }, {
        lng: 119.999542,
        lat: 31.824263
    }, {
        lng: 119.999483,
        lat: 31.82398
    }, {
        lng: 119.999532,
        lat: 31.82383
    }, {
        lng: 119.999666,
        lat: 31.823684
    }]
}];



var featuresDnszError1 = [{
    flag: 0,
    type: "Polygon",
    name: "迪诺水镇下方过滤区域",
    desc: "迪诺水镇下方过滤区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.003523,
        lat: 31.819905
    }, {
        lng: 120.005636,
        lat: 31.819942
    }, {
        lng: 120.005593,
        lat: 31.817198
    }, {
        lng: 120.003415,
        lat: 31.817134
    }, {
        lng: 120.003297,
        lat: 31.817189
    }, {
        lng: 120.003319,
        lat: 31.819632
    }, {
        lng: 120.003362,
        lat: 31.819869
    }, {
        lng: 120.003555,
        lat: 31.819914
    }, {
        lng: 120.003566,
        lat: 31.819896
    }]
}];

var featuresDnszError2 = [{
    flag: 0,
    type: "Polygon",
    name: "迪诺水镇中间过滤区域",
    desc: "迪诺水镇中间过滤区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.003555,
        lat: 31.821218
    }, {
        lng: 120.004048,
        lat: 31.821182
    }, {
        lng: 120.004102,
        lat: 31.821163
    }, {
        lng: 120.004091,
        lat: 31.820917
    }, {
        lng: 120.004156,
        lat: 31.82079
    }, {
        lng: 120.004209,
        lat: 31.820717
    }, {
        lng: 120.004413,
        lat: 31.820698
    }, {
        lng: 120.004756,
        lat: 31.82068
    }, {
        lng: 120.005014,
        lat: 31.820762
    }, {
        lng: 120.005196,
        lat: 31.820799
    }, {
        lng: 120.005583,
        lat: 31.820717
    }, {
        lng: 120.005668,
        lat: 31.820698
    }, {
        lng: 120.005658,
        lat: 31.819933
    }, {
        lng: 120.00348,
        lat: 31.819887
    }, {
        lng: 120.003018,
        lat: 31.819933
    }, {
        lng: 120.003319,
        lat: 31.820963
    }, {
        lng: 120.003576,
        lat: 31.821227
    }]
}];

var featuresDnszError3 = [{
    flag: 0,
    type: "Polygon",
    name: "迪诺水镇上方过滤区域",
    desc: "迪诺水镇上方过滤区域",
    strokeWeight: 1,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.1,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    lnglat: [{
        lng: 120.00385,
        lat: 31.8212
    }, {
        lng: 120.003667,
        lat: 31.8212
    }, {
        lng: 120.003635,
        lat: 31.821327
    }, {
        lng: 120.003662,
        lat: 31.821437
    }, {
        lng: 120.003743,
        lat: 31.821523
    }, {
        lng: 120.00392,
        lat: 31.821669
    }, {
        lng: 120.004016,
        lat: 31.821806
    }, {
        lng: 120.004161,
        lat: 31.82187
    }, {
        lng: 120.004515,
        lat: 31.821884
    }, {
        lng: 120.004697,
        lat: 31.821833
    }, {
        lng: 120.004842,
        lat: 31.821806
    }, {
        lng: 120.004901,
        lat: 31.821792
    }, {
        lng: 120.004982,
        lat: 31.821519
    }, {
        lng: 120.005062,
        lat: 31.821451
    }, {
        lng: 120.005121,
        lat: 31.82125
    }, {
        lng: 120.005094,
        lat: 31.820794
    }, {
        lng: 120.00481,
        lat: 31.820689
    }, {
        lng: 120.004188,
        lat: 31.820708
    }, {
        lng: 120.004054,
        lat: 31.820913
    }, {
        lng: 120.004113,
        lat: 31.821173
    }, {
        lng: 120.003839,
        lat: 31.821195
    }]
}];


var errorArea = null;
/*---------------------------------------------步行导航 START-----------------------------------------------------*/
function initErrorArea(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;

        for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
            path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
        }
        errorArea = new AMap.Polygon({
            map: map,
            path: path,
            extData: data,
            zIndex: 1,
            strokeWeight: data.strokeWeight,
            strokeColor: data.strokeColor,
            strokeOpacity: data.strokeOpacity,
            fillColor: data.fillColor,
            fillOpacity: data.fillOpacity
        });
        // AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}

function reFilter() {
    localStorage.lng_filter_start = localStorage.lng_start;
    localStorage.lat_filter_start = localStorage.lat_start;

    localStorage.lng_filter_end = localStorage.lng_end;
    localStorage.lat_filter_end = localStorage.lat_end;
}

function filterEnd() {
    localStorage.removeItem("lng_filter_end");
    localStorage.removeItem("lat_filter_end");

    localStorage.removeItem("lng_filter_start");
    localStorage.removeItem("lat_filter_start");
    var count = 0;
    //判断是否在鲁布拉错误区域
    initErrorArea(featuresLbl);
    var errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag1', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 120.00385;
        localStorage.lat_filter_end = 31.824017;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag2', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 120.00385;
        localStorage.lat_filter_start = 31.824017;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在东大门错误区域
    initErrorArea(featuresEastDoor);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag3', errorFlag);
    if (errorFlag == true && isInKLW != 3) {
        localStorage.lng_filter_end = 120.002857;
        localStorage.lat_filter_end = 31.823383;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag4', errorFlag);
    if (errorFlag == true && isInKLW != 3) {
        localStorage.lng_filter_start = 120.002857;
        localStorage.lat_filter_start = 31.823383;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //导航到过山龙区域绕路现象优化
    initErrorArea(featuresGSLError);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag5', errorFlag);
    if (errorFlag == true && localStorage.text_start == '过山龙') {
        localStorage.lng_filter_end = 119.999585;
        localStorage.lat_filter_end = 31.823588;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag6', errorFlag);
    if (errorFlag == true && localStorage.text_end == '过山龙') {
        localStorage.lng_filter_start = 119.999585;
        localStorage.lat_filter_start = 31.823588;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在超级秋千错误区域
    initErrorArea(featuresCjqq);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag7', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 119.999676;
        localStorage.lat_filter_end = 31.820853;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag8', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 119.999676;
        localStorage.lat_filter_start = 31.820853;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在超级秋千错误区域
    initErrorArea(featuresMhmk);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag9', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 120.002562;
        localStorage.lat_filter_end = 31.822184;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag10', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 120.002562;
        localStorage.lat_filter_start = 31.822184;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在迪诺水镇下方错误区域
    initErrorArea(featuresDnszError1);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag11', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 120.005636;
        localStorage.lat_filter_end = 31.819951;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag12', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 120.005636;
        localStorage.lat_filter_start = 31.819951;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在迪诺水镇中间错误区域
    initErrorArea(featuresDnszError2);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag13', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 120.005352;
        localStorage.lat_filter_end = 31.820771;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag14', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 120.005352;
        localStorage.lat_filter_start = 31.820771;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

    //判断是否在迪诺水镇上方错误区域
    initErrorArea(featuresDnszError3);
    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
    console.log('errorFlag15', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_end = 120.004874;
        localStorage.lat_filter_end = 31.821815;
        count++;
    };

    errorFlag = errorArea.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
    console.log('errorFlag16', errorFlag);
    if (errorFlag == true) {
        localStorage.lng_filter_start = 120.004874;
        localStorage.lat_filter_start = 31.821815;
        count++;
    };

    if (count == 2) {
        reFilter(count);
        return;
    };
    count = 0;

}
//步行导航
function walking_route() {
    dealLine();
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;
    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;

    //修正错误区域导航
    filterEnd();
    console.log('111', localStorage.lng_filter_start);
    if (localStorage.lng_filter_start != null && localStorage.lng_filter_start != 'undefined') {
        lng_start = localStorage.lng_filter_start;
        lat_start = localStorage.lat_filter_start;
    }

    if (localStorage.lng_filter_end != null && localStorage.lng_filter_end != 'undefined') {
        lat_end = localStorage.lat_filter_end;
        lng_end = localStorage.lng_filter_end;
    }
    //起、终点
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    var MWalk;
    map.plugin(["AMap.Walking"], function() {
        MWalk = new AMap.Walking({
            extensions: "all"
        }); //构造路线导航类 
        AMap.event.addListener(MWalk, "complete", walk_routeCallBack); //返回导航查询结果

        //显示错误信息 
        AMap.event.addListener(MWalk, "error", function(e) {
            alert("没有对应步行或骑行线路，请重设起始点");
            AppDispatcher.dispatch({
                type: ActionTypes.LOCATION_LOADING_HIDE,
                data: data
            });
        });

        MWalk.search(start_xy, end_xy); //根据起终点坐标规划步行路线
    });
}
//导航结果展示
function walk_routeCallBack(data) {
    console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应步行或骑行线路，请重设起始点");
        AppDispatcher.dispatch({
            type: ActionTypes.LOCATION_LOADING_HIDE,
            data: data
        });
        return false;
    }
    if (inIndex != 4) {
        map.remove(featureArr);
        featureArr.length = 0;
        // reInitGeolocation();
        // initKLYArea();
    };
    $("#bus_div").css("display", "none");
    $("#map_div").css("display", "block");
    if ($('.bus_nav i') != null && $('.bus_nav i').css('background-image') != null) {
        if ($('.bus_nav i').css('background-image').indexOf('bus1.svg') == -1 && $('.bus_nav i').css('background-image').indexOf('bus_gray.svg') == -1) {
            $('.bus_nav i').css('background-image', "url('public/images/bus1.svg')");
        };
    };
    if ($('.car_nav i') != null && $('.car_nav i').css('background-image') != null) {
        if ($('.car_nav i').css('background-image').indexOf('car1.svg') == -1 && $('.car_nav i').css('background-image').indexOf('car_gray.svg') == -1) {
            $('.car_nav i').css('background-image', "url('public/images/car1.svg')");
        }
    }
    if ($('.walk_nav i') != null && $('.walk_nav i').css('background-image') != null) {
        if ($('.walk_nav i').css('background-image').indexOf('walk2.svg') == -1) {
            $('.walk_nav i').css('background-image', "url('public/images/walk2.svg')");
        }
    }

    localStorage.nav_data = JSON.stringify(data);
    localStorage.nav_way = "walk";
    // map.clearMap();
    var routeS = data.routes;
    if (routeS.length <= 0) {} else {
        route_text = "";
        //时间
        var time = getTotalTime(routeS[0].time);
        //距离
        var distance = getTotalDistance(routeS[0].distance);
        steps = routeS[0].steps;
        $(".time_dis").empty();
        $(".time_dis").html("<span>约 " + time + "(" + distance + ")</span>");
        walkingDrawLine();
        walkingDrawSeg(0);
    }

    AppDispatcher.dispatch({
        type: ActionTypes.LOCATION_LOADING_HIDE,
        data: data
    });

}
//绘制步行导航路线
function walkingDrawLine() {
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标

    //园外步行导航 从迪诺水镇门口到东大门
    if (localStorage.lng_end == "120.005599") {
        end_xy = new AMap.LngLat(120.003866, 31.822704); //目的地坐标

    };

    //起点、终点图标
    var sicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    featureArr.push(sicon);
    var eicon = new AMap.Icon({
        image: "public/images/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
    featureArr.push(eicon);
    startmarker = null;
    endmarker = null;
    startmarker = new AMap.Marker({
        icon: sicon, //复杂图标
        visible: true,
        position: start_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });
    featureArr.push(startmarker);

    endmarker = new AMap.Marker({
        icon: eicon, //复杂图标
        visible: true,
        position: end_xy,
        map: map,
        offset: {
            x: -16,
            y: -40
        }
    });
    featureArr.push(endmarker);

    //消除其它导航线
        
    if (carPolyline != null) {      
        carPolyline.setMap(null);     
    }    
    if (busPolyline != null) {      
        busPolyline.setMap(null);     
    } 
    if (walkPolyline != null) {      
        walkPolyline.setMap(null);     
    }    
    if (extra_line1 != null) {      
        extra_line1.setMap(null);     
    } 
    if (extra_line2 != null) {     
        extra_line2.setMap(null);     
    }

    //起点到路线的起点 路线的终点到终点 绘制无道路部分
    // alert(111);
    var extra_path1 = new Array();
    extra_path1.push(start_xy);
    extra_path1.push(steps[0].path[0]);
    if (and) {
        extra_line1 = new AMap.Polyline({
            map: map,
            path: extra_path1,
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#9400D3",
            strokeOpacity: 0.5,
            strokeWeight: 4
        });

    } else {
        extra_line1 = new AMap.Polyline({
            map: map,
            path: extra_path1,
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#9400D3",
            strokeOpacity: 0.5,
            strokeWeight: 4,
            strokeStyle: "dashed",
            strokeDasharray: [10, 5]
        });
    }
    featureArr.push(extra_line1);
    var extra_path2 = new Array();
    var path_xy = steps[(steps.length - 1)].path;
    //园外步行导航 从迪诺水镇门口到东大门
    extra_path2.push(end_xy);
    if (localStorage.lng_end == "120.005599") {
        extra_path2.push(new AMap.LngLat(120.005636, 31.822057));
    };
    extra_path2.push(path_xy[(path_xy.length - 1)]);

    if (and) {
        extra_line2 = new AMap.Polyline({
            map: map,
            path: extra_path2,
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#9400D3",
            strokeOpacity: 0.5,
            strokeWeight: 4
                // strokeStyle: "dashed"
                // strokeDasharray: [10, 5]
        });
    } else {
        extra_line2 = new AMap.Polyline({
            map: map,
            path: extra_path2,
            isOutline: true,
            outlineColor: "#ffffff",
            strokeColor: "#9400D3",
            strokeOpacity: 0.5,
            strokeWeight: 4,
            strokeStyle: "dashed",
            strokeDasharray: [10, 5]
        });
    }
    featureArr.push(extra_line2);
    var drawpath = new Array();
    for (var s = 0; s < steps.length; s++) {
        var plength = steps[s].path.length;
        for (var p = 0; p < plength; p++) {
            drawpath.push(steps[s].path[p]);
        }
    }
    walkPolyline = new AMap.Polyline({
        map: map,
        path: drawpath,
        strokeWeight: 4,
        strokeColor: "#0000ff",
        strokeOpacity: 0.5,
    });

    // initFeature = new AMap.Polygon({
    //         map: map,
    //         path: path,
    //         extData: data,
    //         zIndex: 1,
    //         strokeWeight: data.strokeWeight,
    //         strokeColor: data.strokeColor,
    //         strokeOpacity: data.strokeOpacity,
    //         fillColor: data.fillColor,
    //         fillOpacity: data.fillOpacity
    //     });

    featureArr.push(walkPolyline);
    map.setFitView(walkPolyline);
}
//绘制步行导航路段
function walkingDrawSeg(num) {    
    var drawpath1 = new Array();    
    drawpath1 = steps[num].path;
    /*if(walkStepPolyline != null) {
            walkStepPolyline.setMap(null);
        }*/
        

    walkStepPolyline = new AMap.Polyline({            
        map: map,
                path: drawpath1,
                strokeColor: "#FF3030",
        strokeOpacity: 0.5,
                strokeWeight: 4,
    });  
    featureArr.push(walkStepPolyline);   
    // map.setFitView(walkStepPolyline);
}
/*---------------------------------------------步行导航 END-------------------------------------------------------*/


function driving_detail() {
    var data = JSON.parse(localStorage.nav_data);
    var nav_way = localStorage.nav_way;
    console.log(data);
    if (data == null) {
        //document.getElementById("result").innerHTML = "未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。"; 
    } else if (nav_way == "bus") {
        //遍历每种换乘方案 
        var i = localStorage.busStep;
        console.log(i);
        var btCount = data.count;
        var btPlans = data.plans;
        var btOrigin = data.origin;
        var btDestination = data.destination;
        var btTaxiCost = data.taxi_cost;
        var startName = ""; //可以使用地理编码解析起点和终点坐标 
        var endName = "";
        var BusArr = [];
        var WalkArr = [];
        var onbus = new Array();
        var onwalk = new Array();
        var btContent = new Array(); //结果表格数组 
        $("#detail_header").empty();
        $("#detail_header").css("height", "90px");
        $(".navigation_carmap_footer").css("padding-top", "0");

        $(".navigation_carmap_footer").css("padding-top", "0");
        $(".new_blueButton").css("display", "block");

        var resLine = "<div  style='top:0px'>";
        var route_text = "";
        // alert(step)
        //遍历每种换乘方案 

        console.log(btPlans[i]);
        var btDistance = btPlans[i].distance;
        var btseg = btPlans[i].segments;

        var naviInfo = '';
        var lineName = '';
        var lineBusStop = 0;

        var lineWalkDis = getTotalDistance(btPlans[i].walking_distance);
        var lineTime = getTotalTime(btPlans[i].time);
        for (var j = 0; j < btseg.length; j++) {
            route_text += "<div class='path'><div class='walkmiddle'></div><div class='title_middle split'>" + btseg[j].instruction + "</div></div>";

            if (btseg[j].transit_mode == "WALK") {
                if (i === 0) {
                    WalkArr.push(btseg[j].transit.path);
                }
            } else {
                if (btseg[j].transit.via_num != null) {
                    lineBusStop += btseg[j].transit.via_num;
                }
                if (lineName == '') {
                    if (btseg[j].transit_mode == "BUS") {
                        lineName = btseg[j].transit.lines[0].name.split("(")[0];
                    } else if (btseg[j].transit_mode == "RAILWAY") {
                        lineName = btseg[j].transit.trip;
                    } else if (btseg[j].transit_mode == "SUBWAY") {
                        lineName = btseg[j].transit.lines[0].name.split("号线")[0] + "号线";
                    }
                } else {
                    if (btseg[j].transit_mode == "BUS") {
                        lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
                    } else if (btseg[j].transit_mode == "RAILWAY") {
                        lineName += "→" + btseg[j].transit.trip;
                    } else if (btseg[j].transit_mode == "SUBWAY") {
                        lineName += "→" + btseg[j].transit.lines[0].name.split("号线")[0] + "号线";
                    }
                    // lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
                }

            }
        }
        resLine += "<div class='common_light navigation_buslist_content_item ' style='border-bottom:0;padding-bottom: 0' ><div class=''><div class='navigation_buslist_content_content clearfix' style='padding-right:18%'><h4 > " + lineName + " </h4> </div><div class='navigation_buslist_content_desc_content clearfix text-overflow' style='position: absolute;top:56px'><span class='bus-eta-status-1'>畅通</span><span class='bus-info-divide'> | </span> <span>约" + lineTime + "</span><span class='bus-info-divide'> | </span> <span>" + lineBusStop + "站</span><span class='bus-info-divide'> | </span> <span>步行" + lineWalkDis + "</span> </div></div></div>";

        resLine += "</div>";
        $("#detail_header").html(resLine);

        //输出行车路线指示 
        route_text = "<div class='path'><div class='walkstart'></div><div class='title' > 起始位置 </div></div>" + route_text + "<div class='path'><div class='walkend'></div><div class='title split'> 到达 目的地</div></div>";

        $("#detail_main").empty();
        $("#detail_main").html(route_text);


    } else {
        $("#detail_header").css("height", "70px");
        $(".time_dis").css("padding-top", "0px");
        $(".new_blueButton").css("display", "none");
        $(".navigation_carmap_footer").css("padding-top", "8px");
        var routeS = data.routes;
        var route_text = "";
        for (var v = 0; v < routeS.length; v++) {
            //驾车步骤数 
            steps = routeS[v].steps
            var route_count = steps.length;
            //行车距离（米） 
            var distance = routeS[v].distance;
            //拼接输出html 
            for (var i = 0; i < steps.length; i++) {
                route_text += "<div class='path'><div class='walkmiddle'></div><div class='title_middle split'>" + steps[i].instruction + "</div></div>";
            }
        }
        //输出行车路线指示 
        route_text = "<div class='path'><div class='walkstart'></div><div class='title' > 起始位置 </div></div>" + route_text + "<div class='path'><div class='walkend'></div><div class='title split'> 到达 目的地</div></div>";
        $("#detail_main").empty();
        $("#detail_main").html(route_text);
        //时间
        var time = getTotalTime(routeS[0].time);
        //距离
        var distance = getTotalDistance(routeS[0].distance);
        $(".time_dis").empty();
        $(".time_dis").html("<span>约 " + time + "(" + distance + ")</span>");
    }
}


function filterArray(receiveArray) {
    var arrResult = new Array(); //定义一个返回结果数组.
    for (var i = 0; i < receiveArray.length; ++i) {
        if (check(arrResult, receiveArray[i]) == -1) {
            //在这里做i元素与所有判断相同与否
            arrResult.push(receiveArray[i]);　
            //　添加该元素到新数组。如果if内判断为false（即已添加过），
            //则不添加。
        }
    }
    return arrResult;
}

function check(receiveArray, checkItem) {
    var index = -1; //　函数返回值用于布尔判断
    for (var i = 0; i < receiveArray.length; ++i) {
        if (receiveArray[i] == checkItem) {
            index = i;
            break;
        }
    }
    return index;
}
var marker = null;

function drawFooter(index, footerData) {
    if (marker != null) {
        marker.stopMove();
    };

    map.remove(featureArr);
    featureArr.length = 0;


    var areaList = new Array();
    var nameList = new Array();
    var lineArray = new Array();
    var drawData = new Array();

    for (var i = 0; i < footerData.length; i++) {
        areaList.push(footerData[i].parent_id);
        flag = 0;
        if (nameList != null && nameList.length != 0) {
            for (var j = 0; j < nameList.length; j++) {
                if (footerData[i].project_name.toString() == nameList[j].toString()) {
                    flag = 1;
                    break;
                }
            }
        }
        if (flag == 0) {
            nameList.push(footerData[i].project_name);
            drawData.push(footerData[i]);
            lineArray.push(new AMap.LngLat(footerData[i].lng, footerData[i].lat));
        }
    }

    drawFooterMarker(drawData);

    areaList = filterArray(areaList);
    nameList = filterArray(nameList);
    console.log(nameList)
    $("#foot_count").html("<img  class='pic_size' src='public/images/foot_mine.svg' />" + nameList.length + "景点 &nbsp; " + areaList.length + "片区");
    // map.clearMap();
    // initKLYArea();
    marker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(120.000717, 31.822704),
        offset: new AMap.Pixel(-12, -12),
        opacity: 1,
        icon: new AMap.Icon({
            //图标大小
            size: new AMap.Size(23, 23),
            //大图地址
            image: "public/images/loc.png",
            imageSize: new AMap.Size(23, 23),
            // imageOffset: new AMap.Pixel(10, 20)
        }),
        clickable: false,
        autoRotation: true
    });

    featureArr.push(marker);
    //绘制轨迹
    var polyline = new AMap.Polyline({
        map: map,
        path: lineArray,
        strokeColor: "#00A", //线颜色
        strokeOpacity: 0.5, //线透明度
        strokeWeight: 0.001, //线宽
        strokeStyle: "solid" //线样式
    });
    featureArr.push(polyline);
    map.setFitView(polyline);
    marker.moveAlong(lineArray, 100);

}

function drawFooterMarker(footerData) {
    var color = null;
    var allDistrict = new Array();
    var parent_name = null;
    var name = "all";
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 0) {
            allDistrict.push(allProjectData[i]);
        }
    }
    console.log(allDistrict);
    for (var i = 0; i < footerData.length; i++) {
        parent_name = "中华恐龙馆";
        name = '中华恐龙馆';
        for (var j = 0; j < allDistrict.length; j++) {
            if (footerData[i].parent_id == allDistrict[j]._id) {
                parent_name = allDistrict[j].name;
            }
        }

        if (parent_name.indexOf('中华恐龙馆') != -1) {
            color = 'zhklg';
        } else if (parent_name.indexOf('嘻哈恐龙城') != -1) {
            color = 'xhklc';
        } else if (parent_name.indexOf('库克苏克') != -1) {
            color = 'kksk';
        } else if (parent_name.indexOf('鲁布拉') != -1) {
            color = 'lbl';
        } else if (parent_name.indexOf('魔幻雨林') != -1) {
            color = 'mhyl';
        } else {
            color = 'xm';
        }
        var feature = [{
            flag: 2,
            type: "Marker",
            name: footerData[i].project_name,
            title: footerData[i].project_name + '_' + i,
            footNumber: i + 1,
            projectId: footerData[i]._id,
            desc: parent_name,
            color: 'klyBlank',
            opacity: 1,
            icon: "cir",
            offset: {
                x: -20,
                y: -33
            },
            lnglat: {
                lng: footerData[i].lng,
                lat: footerData[i].lat
            }
        }];
        loadFeatures(feature);
    }
}


function initArea(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;

        for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
            path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
        }
        initFeature = new AMap.Polygon({
            map: map,
            path: path,
            extData: data,
            zIndex: 1,
            strokeWeight: data.strokeWeight,
            strokeColor: data.strokeColor,
            strokeOpacity: data.strokeOpacity,
            fillColor: data.fillColor,
            fillOpacity: data.fillOpacity
        });
        // AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}


function areaDbClick(d) {
    console.log(d);
    map.zoomIn(d.target.Qd.extData.center.level);
    map.setCenter(new AMap.LngLat(d.target.Qd.extData.center.lng, d.target.Qd.extData.center.lat));
}

function setNavFlag(flag) {
    navFlag = flag;
    if (geolocation != null) {
        geolocation.getCurrentPosition();
    };
}

function showRoute() {
    if (lat_start == null || lat_start == NaN) {
        map.clearMap();
        initKLYArea();
        loadFeatures(feature_walk1);
        loadFeatures(feature_walk2);
        loadFeatures(feature_walk3);
    } 
    else {
        map.clearMap();
        initKLYArea();
        walking_route(); 
        if (route == 1) {
            loadFeatures(feature_walk2);
            loadFeatures(feature_walk3);
        } else if (route == 2) {
            loadFeatures(feature_walk1);
            loadFeatures(feature_walk3);
        } else {
            loadFeatures(feature_walk1);
            loadFeatures(feature_walk2);
        }    
    }
}
var lngLat = null;
var walkRouteFlag = 0;

function initWalkRoute() {
    map.remove(featureArr);
    featureArr.length = 0;
    // reInitGeolocation();
    // initKLYArea();
    console.log('lngLat', lngLat);
    console.log('walkRouteFlag', walkRouteFlag);
    for (var i = 0; i < lngLat.length; i++) {
        if (i == walkRouteFlag) {
            localStorage.lng_end = lngLat[i].lng;
            localStorage.lat_end = lngLat[i].lat;
            localStorage.cityCode_end = "0519";
            // setNavFlag(0)
            localStorage.lng_start = localStorage.lng_mine;
            localStorage.lat_start = localStorage.lat_mine;
            localStorage.cityCode_start = localStorage.cityCode_mine;
            walking_route();
        } else {
            var feature = new AMap.Marker({
                map: map,
                position: new AMap.LngLat(lngLat[i].lng, lngLat[i].lat),
                zIndex: 3,
                extData: i,
                offset: {
                    x: -23,
                    y: -35
                },
                animation: "AMAP_ANIMATION_DROP",
                content: '<div id=' + i + ' class="icon_ms"></div>'
            });
            featureArr.push(feature);
            AMap.event.addListener(feature, "click", mapFeatureClick3);
        }
    };
}

function mapFeatureClick3(d) {
    var extData = null;

    for (var i in d.target) {
        console.log('d.target[i].extData', d.target[i].extData)
        if (d.target[i].extData != null) {
            console.log('d.target[i].extData', d.target[i].extData)
                // console.log(d.target[i].extData);
            extData = d.target[i].extData;
            break;
        }
    };

    walkRouteFlag = extData;
    initWalkRoute();
}

function setShowType(type) {
    showType = type;
}

var navMineFlag = 1;

function setNavMineFlag(flag) {
    navMineFlag = flag;
}

function changeTime(val) {
    clearInterval(mapInterval);
    mapInterval = setInterval(getPositionByTime, parseInt(val) * 1000); //1000为1秒钟

}
var openSS = 0;

function openSSS(val) {
    openSS = val;

}

function isInKlyArea(lng, lat) {
    var endFlag = initFeature.contains(new AMap.LngLat(lng, lat));
    console.log('endFlag', endFlag);
    if (endFlag == true || endFlag == 'true') {
        return true;
    } else {
        return false;
    }
}
module.exports = {
    init: function() {
        init();
    },

    initAreaResult: function() {
        initArea(featuresResult);
    },

    initWalkRoute: function(lngLatArray) {
        lngLat = lngLatArray;
        initWalkRoute();
    },
    initArea: function() {
        initArea(features00);
    },
    setInIndex: function(isIn) {
        setInIndex(isIn);
    },

    mapIn: function() {
        mapIn();
    },

    mapOut: function() {
        mapOut();
    },

    setAllOffset: function(offset) {
        setAllOffset(offset);
    },

    getMyPosition: function() {
        getMyPosition();
    },

    watchMyPosition: function() {
        watchMyPosition();
    },
    clearWatchMyPosition: function() {
        clearWatchMyPosition();
    },
    destroyMap: function() {
        map.remove(featureArr);
        featureArr.length = 0;
        flagMarker.length = 0;
        if (marker != null) {
            marker.stopMove();
        };
        destroyMap();
    },
    bus_route: function() {
        bus_route();
    },

    bus_plan: function() {
        bus_plan();
    },

    driving_route: function() {

        driving_route();
    },

    walking_route: function() {
        walking_route();
    },
    driving_detail: function() {
        driving_detail();
    },
    drawFooter: function(index, footData) {
        drawFooter(index, footData);
    },
    getTotalDistance: function(dis) {
        return getTotalDistance(dis);
    },
    getTotalTime: function(time) {
        return getTotalTime(time);
    },

    setProjectData: function(data) {
        return setProjectData(data);
    },
    initGeolocation: function() {
        return initGeolocation();
    },
    addMouseMoveListner: function() {
        return addMouseMoveListner();
    },
    setNavFlag: function(flag) {
        return setNavFlag(flag);
    },
    clearMyInterval: function(flag) {

        clearWatchMyPosition();


    },
    startMapInterval: function() {
        return startMapInterval();
    },
    getWxLocation: function() {
        return getWxLocation();
    },
    setZoomFlag: function(flag) {
        return setZoomFlag(flag);
    },
    setShowType: function(type) {
        return setShowType(type);
    },
    reDrawByType: function() {
        return reDrawByType();
    },
    changeTime: function(val) {
        return changeTime(val);
    },
    openSSS: function(val) {
        return openSSS(val);
    },
    isInKlyArea: function(lng, lat) {
        return isInKlyArea(lng, lat);
    },
    resetLocalMaker: function() {
        return resetLocalMaker();
    },
    setNavMineFlag: function(flag) {
        return setNavMineFlag(flag);
    },
}
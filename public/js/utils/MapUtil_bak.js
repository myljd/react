var $ = require('jquery');
var ProjectStore = require('../stores/ProjectStore');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;


var scale = null; //比例尺
var map = null; //地图
var geolocation = null; //定位
var inIndex = 0; //判定是否是导航首页 1:map_index,2:map_nav_result
var allProjectData = {};
var initFeature = null;
var geocoder = null;
var isMoveMap = 0;
var mapInterval;
localStorage.isInFeature = false;
/*
 ** 初始化地图
 */
function init() {
    map = new AMap.Map('map', {
        resizeEnable: true,
        //rotateEnable: true,
        //dragEnable: true,
        //zoomEnable: true,
        //设置可缩放的级别
        //zooms: [3,18],
        //传入2D视图，设置中心点和缩放级别
        view: new AMap.View2D({
            center: new AMap.LngLat(120.003362, 31.821583),
            zoom: 14
        })
    });
    map.plugin(["AMap.Scale"], function() {
        scale = new AMap.Scale({
            offset: new AMap.Pixel(55, 60)
        });
        map.addControl(scale);
    });
    AMap.event.addListener(map, "zoomchange", zoomChange); //查询成功时的回调函数
    // //地图移动后不再强制定位
    AMap.event.addListener(map, 'dragstart', function(event) {
        if (map != null) {
            $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
            isMoveMap = 0;
        };

    }); //返回定位信息
    //地图点击空地后不选择项目
    AMap.event.addListener(map, 'click', function(event) {
        if (map != null) {
            $('.message_index_box').css("display", "none");
            $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>导航</a>");
            setAllOffset(60);
            if (clickName != null) {
                $('div[title=' + clickName + ']').css('opacity', '0.5');
            };
            if (clickName2 != null) {
                $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
            };
        };

    }); //返回定位信息
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
            showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
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
     map.removeControl(geolocation);
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false, //显示定位按钮，默认：true
            buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
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
    mapInterval = setInterval(getPositionByTime, 5 * 1000); //1000为1秒钟
}

function getPositionByTime() {
    if (geolocation != null) {
        geolocation.getCurrentPosition();
    };
}
/*
 ** 地图缩放监听
 */
function zoomChange() {
    isMoveMap = 0;
    //缩放地图按钮变化
    $('.message_index_box').css("display", "none");
    $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>导航</a>");
    setAllOffset(60);
    if (clickName != null) {
        $('div[title=' + clickName + ']').css('opacity', '0.5');
    };
    if (clickName2 != null) {
        $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
    };
    var zoomLevel = map.getZoom();
    if (zoomLevel == 19) {
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
         if (zoomLevel <= 14) {
            map.clearMap();
            reInitGeolocation();
            $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
            initArea(features00);
        };
        if (zoomLevel == 15) {
            map.clearMap();
            reInitGeolocation();
            $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
            initArea(features0);
            loadFeatures(features01);
            drawProjectOther();
        };
        if (zoomLevel == 16) {
            map.clearMap();
            reInitGeolocation();
            $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
            loadFeatures(features1);
            loadFeatures(features01);
            drawProjectOther();
        };
        if (zoomLevel >= 17) {
            map.clearMap();
            reInitGeolocation();
            $(".location_icon").css('background-image', 'url(public/images/before_location.svg)');
            drawProject();
            drawProjectOther();
        };
    };
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

/*
 *标识所有项目
 */
function drawProject() {
    var color = null;
    var allDistrict = new Array();
    var parent_name = null;
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].category == 0) {
            allDistrict.push(allProjectData[i]);
        }
    }

    for (var i = 0; i < allProjectData.length; i++) {
        // console.log(allProjectData[1])
        if (allProjectData[i].category == 1) {
            parent_name = "鲁布拉";
            for (var j = 0; j < allDistrict.length; j++) {
                if (allProjectData[i].parent_id == allDistrict[j]._id) {
                    parent_name = allDistrict[j].name;
                }
            }
            color = 'xhklc';
            if (parent_name.indexOf('鲁布拉') != -1) {
                color = 'lbl';
            } else if (parent_name.indexOf('库克苏克') != -1) {
                color = 'kksk';
            } else if (parent_name.indexOf('梦幻庄园') != -1) {
                color = 'mhzy';
            } else if (parent_name.indexOf('中华恐龙馆') != -1) {
                color = 'zhklg';
            } else if (parent_name.indexOf('魔幻雨林') != -1) {
                color = 'mhyl';
            } else if (parent_name.indexOf('嘻哈恐龙城') != -1) {
                color = 'xhklc';
            } else if (parent_name.indexOf('迪诺水镇') != -1) {
                color = 'dnsz';
            }
            var feature = [{
                flag: 2,
                type: "Marker",
                name: allProjectData[i].name,
                projectId: allProjectData[i]._id,
                desc: parent_name,
                color: color,
                opacity: 0.5,
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
        }
        // else if(allProjectData[i].category == 2){
        //     parent_name="美食"
        //     color = 'meishi';
        // } else if(allProjectData[i].category == 3){
        //     parent_name="购物"
        //     color = 'shangpin';
        // } else if(allProjectData[i].category == 4){
        //     parent_name="公共设施"
        //     color = 'gonggong';
        // }



    }

}

// 星聚汇影城  迪诺水镇  恐龙谷温泉
function drawProjectOther() {

    var color = null;
    console.log("sa", allProjectData)
    for (var i = 0; i < allProjectData.length; i++) {
        // 
        if (allProjectData[i].name.indexOf('恐龙城大剧场') != -1 ||
            allProjectData[i].name.indexOf('香树湾花园酒店') != -1 ||
            allProjectData[i].name.indexOf('恐龙谷温泉') != -1) {
            if (allProjectData[i].name.indexOf('恐龙城大剧场') != -1) {
                console.log("dyy", allProjectData[i]);
                color = 'dyy';
            } else if (allProjectData[i].name.indexOf('香树湾花园酒店') != -1) {
                console.log("xswjd", allProjectData[i]);
                color = 'xswjd';
            } else if (allProjectData[i].name.indexOf('恐龙谷温泉') != -1) {
                console.log("klgwq", allProjectData[i]);
                color = 'klgwq';
            }

            var feature = [{
                flag: 1,
                type: "Marker",
                name: allProjectData[i].name,
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
        }
    }

}
/*
 *解析定位结果
 */
var isInKLW = 0;
function onComplete(data) {
    console.log("isMoveMap", isMoveMap);
    if (isMoveMap == 1) {
        // map.setZoom(18);
        $(".location_icon").css('background-image', 'url(public/images/after_location.svg)');
        map.setCenter(new AMap.LngLat(data.position.lng, data.position.lat));
    };
    if (inIndex == 1 ) {
        localStorage.isInFeature = initFeature.contains(new AMap.LngLat(data.position.lng, data.position.lat));
        console.log("是否园内:" + localStorage.isInFeature);
    };
    //判断终点是否在园内
    if (inIndex == 2 ) {
        var endFlag = initFeature.contains(new AMap.LngLat(localStorage.lng_end, localStorage.lat_end));
        var startFlag = initFeature.contains(new AMap.LngLat(localStorage.lng_start, localStorage.lat_start));
        console.log("startFlag",startFlag);
         console.log("endFlag",endFlag);
        if (startFlag==false && endFlag==true) {
            isInKLW = 1;
        }else{
            isInKLW = 0;
        }
        console.log("是否园内:" + localStorage.isInFeature);
    };

    localStorage.lng_mine = data.position.lng;
    localStorage.lat_mine = data.position.lat;
    //导航页面不需要定位数据
    // if (inIndex != 2) {

        //加载地理编码插件 
        map.plugin(["AMap.Geocoder"], function() {
            geocoder = new AMap.Geocoder({
                radius: 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息 
                // extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base" 
            });
            //返回地理编码结果 
            AMap.event.addListener(geocoder, "complete", geocoder_callBack);
            //逆地理编码 
        });
        geocoder.getAddress(data.position);
    // }
};
/*
 *回调函数
 */
var navFlag = 1;

function geocoder_callBack(data) {
    localStorage.cityCode_mine = data.regeocode.addressComponent.citycode;
    localStorage.text_mine = "我的位置";
    if (navFlag == 0) {
        if (isInKLW==1) {
            localStorage.lng_end = "120.0037";
            localStorage.lat_end = "31.82305";
            localStorage.text_end = "中华恐龙园(东门)";
            localStorage.cityCode_end = "0519";
            alert("友情提醒: 您的终点设置在了恐龙园内，我们将带您从迪诺水镇进入恐龙园东大门，祝游玩愉快。");
        }
        if (localStorage.navWay == "bus_nav") {
            bus_plan();
        }
        if (localStorage.navWay == "car_nav") {
            driving_route();
        }
        if (localStorage.navWay == "walk_nav") {
            walking_route();
        }
   
        navFlag = 1;
    };
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
    $(".map_zoom").css("bottom", offset + "px");
    $(".map_locate").css("bottom", offset + "px");
    scale.hide();
    scale = new AMap.Scale({
        offset: new AMap.Pixel(55, offset)
    });
    map.addControl(scale);
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

var features01 = [{
    type: "Polygon",
    name: "迪诺水镇",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.8,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0.2, //填充透明度
    center: {
        lng: 120.001224,
        lat: 31.824686,
        level: 17
    },
    lnglat: [{
        lng: 120.003973,
        lat: 31.820926
    }, {
        lng: 120.004263,
        lat: 31.820543
    }, {
        lng: 120.006516,
        lat: 31.820215
    }, {
        lng: 120.00717,
        lat: 31.820379
    }, {
        lng: 120.007793,
        lat: 31.822266
    }, {
        lng: 120.006398,
        lat: 31.823397
    }, {
        lng: 120.004928,
        lat: 31.823196
    }, {
        lng: 120.003984,
        lat: 31.821337
    }, {
        lng: 120.003984,
        lat: 31.820908
    }, {
        lng: 120.004005,
        lat: 31.82089
    }]
}];

var features00 = [{
    type: "Polygon",
    name: "中华恐龙园总区域",
    desc: "中华恐龙园总区域",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.8,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0.2, //填充透明度
    center: {
        lng: 120.003362, 
        lat: 31.821583,
        level: 15
    },
    
    lnglat: [{
        lng: 119.996774,
        lat: 31.825102
    }, {
        lng: 119.999113,
        lat: 31.828128
    }, {
        lng: 119.999349,
        lat: 31.828164
    }, {
        lng: 120.004992,
        lat: 31.825411
    }, {
        lng: 120.007117,
        lat: 31.823971
    }, {
        lng: 120.008619,
        lat: 31.822567
    }, {
        lng: 120.010378,
        lat: 31.820069
    }, {
        lng: 120.011773,
        lat: 31.818155
    }, {
        lng: 120.011451,
        lat: 31.817225
    }, {
        lng: 120.004971,
        lat: 31.81728
    }, {
        lng: 120.003405,
        lat: 31.817316
    }, {
        lng: 120.003254,
        lat: 31.81759
    }, {
        lng: 120.00334,
        lat: 31.819067
    }, {
        lng: 120.003405,
        lat: 31.820124
    }, {
        lng: 120.003469,
        lat: 31.820908
    }, {
        lng: 120.003211,
        lat: 31.821036
    }, {
        lng: 120.002782,
        lat: 31.821018
    }, {
        lng: 120.002074,
        lat: 31.820781
    }, {
        lng: 119.999714,
        lat: 31.820361
    }, {
        lng: 119.999242,
        lat: 31.820434
    }, {
        lng: 119.998384,
        lat: 31.82182
    }, {
        lng: 119.998083,
        lat: 31.822786
    }, {
        lng: 119.997718,
        lat: 31.823679
    }, {
        lng: 119.99671,
        lat: 31.824883
    }, {
        lng: 119.996774,
        lat: 31.82512
    }]
}];


var features0 = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.8,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0.2, //填充透明度
    center: {
        lng: 120.001224,
        lat: 31.824686,
        level: 17
    },
    lnglat: [{
        lng: 119.99745,
        lat: 31.824117
    }, {
        lng: 120.000325,
        lat: 31.8277
    }, {
        lng: 120.005207,
        lat: 31.825247
    }, {
        lng: 120.005701,
        lat: 31.824828
    }, {
        lng: 120.004928,
        lat: 31.824153
    }, {
        lng: 120.004199,
        lat: 31.823205
    }, {
        lng: 120.003705,
        lat: 31.822075
    }, {
        lng: 120.002804,
        lat: 31.821255
    }, {
        lng: 120.001924,
        lat: 31.820853
    }, {
        lng: 120.000572,
        lat: 31.820598
    }, {
        lng: 119.999564,
        lat: 31.820434
    }, {
        lng: 119.999285,
        lat: 31.820434
    }, {
        lng: 119.998384,
        lat: 31.821966
    }, {
        lng: 119.998062,
        lat: 31.823096
    }, {
        lng: 119.997697,
        lat: 31.823789
    }, {
        lng: 119.99745,
        lat: 31.824117
    }]
}];

var featuresResult = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园",
    strokeWeight: 0,
    strokeColor: "#19A4EB",
    strokeOpacity: 0,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0, //填充透明度
    center: {
        lng: 120.001224,
        lat: 31.824686,
        level: 17
    },
    lnglat: [{
        lng: 119.99745,
        lat: 31.824117
    }, {
        lng: 120.000325,
        lat: 31.8277
    }, {
        lng: 120.005207,
        lat: 31.825247
    }, {
        lng: 120.005701,
        lat: 31.824828
    }, {
        lng: 120.004928,
        lat: 31.824153
    }, {
        lng: 120.004199,
        lat: 31.823205
    }, {
        lng: 120.003705,
        lat: 31.822075
    }, {
        lng: 120.002804,
        lat: 31.821255
    }, {
        lng: 120.001924,
        lat: 31.820853
    }, {
        lng: 120.000572,
        lat: 31.820598
    }, {
        lng: 119.999564,
        lat: 31.820434
    }, {
        lng: 119.999285,
        lat: 31.820434
    }, {
        lng: 119.998384,
        lat: 31.821966
    }, {
        lng: 119.998062,
        lat: 31.823096
    }, {
        lng: 119.997697,
        lat: 31.823789
    }, {
        lng: 119.99745,
        lat: 31.824117
    }]
}];

var features1 = [{
    type: "Polygon",
    name: "鲁布拉",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#8a5728",
    fillOpacity: 0.4,
    center: {
        lng: 120.003802,
        lat: 31.824719,
        level: 18
    },
    lnglat: [{
        lng: 120.003158,
        lat: 31.826319
    }, {
        lng: 120.004531,
        lat: 31.825621
    }, {
        lng: 120.0051,
        lat: 31.825325
    }, {
        lng: 120.00576,
        lat: 31.82486
    }, {
        lng: 120.005695,
        lat: 31.824778
    }, {
        lng: 120.005336,
        lat: 31.824518
    }, {
        lng: 120.004826,
        lat: 31.824021
    }, {
        lng: 120.004284,
        lat: 31.823224
    }, {
        lng: 120.004086,
        lat: 31.823442
    }, {
        lng: 120.003163,
        lat: 31.823465
    }, {
        lng: 120.002541,
        lat: 31.823684
    }, {
        lng: 120.002675,
        lat: 31.823857
    }, {
        lng: 120.002739,
        lat: 31.824076
    }, {
        lng: 120.002761,
        lat: 31.824185
    }, {
        lng: 120.002745,
        lat: 31.824331
    }, {
        lng: 120.002664,
        lat: 31.824527
    }, {
        lng: 120.002573,
        lat: 31.82465
    }, {
        lng: 120.002471,
        lat: 31.82476
    }, {
        lng: 120.002224,
        lat: 31.82491
    }, {
        lng: 120.003152,
        lat: 31.826319
    }]
}, {
    type: "Polygon",
    name: "库克苏克",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#91268e",
    fillOpacity: 0.4,
    center: {
        lng: 120.002809,
        lat: 31.822782,
        level: 18
    },
    lnglat: [{
        lng: 120.004274,
        lat: 31.823219
    }, {
        lng: 120.004081,
        lat: 31.823438
    }, {
        lng: 120.003147,
        lat: 31.823456
    }, {
        lng: 120.002519,
        lat: 31.823679
    }, {
        lng: 120.002316,
        lat: 31.82347
    }, {
        lng: 120.002074,
        lat: 31.823297
    }, {
        lng: 120.001908,
        lat: 31.823196
    }, {
        lng: 120.001806,
        lat: 31.823164
    }, {
        lng: 120.001602,
        lat: 31.823105
    }, {
        lng: 120.001398,
        lat: 31.823082
    }, {
        lng: 120.001264,
        lat: 31.823082
    }, {
        lng: 120.001044,
        lat: 31.823101
    }, {
        lng: 120.00084,
        lat: 31.822895
    }, {
        lng: 120.000728,
        lat: 31.822736
    }, {
        lng: 120.00084,
        lat: 31.822221
    }, {
        lng: 120.001194,
        lat: 31.822162
    }, {
        lng: 120.001404,
        lat: 31.822075
    }, {
        lng: 120.001431,
        lat: 31.822002
    }, {
        lng: 120.001431,
        lat: 31.821756
    }, {
        lng: 120.001602,
        lat: 31.821405
    }, {
        lng: 120.001661,
        lat: 31.820867
    }, {
        lng: 120.002149,
        lat: 31.820999
    }, {
        lng: 120.002605,
        lat: 31.821191
    }, {
        lng: 120.003024,
        lat: 31.821501
    }, {
        lng: 120.003147,
        lat: 31.821574
    }, {
        lng: 120.003335,
        lat: 31.821619
    }, {
        lng: 120.003646,
        lat: 31.821806
    }, {
        lng: 120.003855,
        lat: 31.822216
    }, {
        lng: 120.003882,
        lat: 31.822362
    }, {
        lng: 120.004274,
        lat: 31.823215
    }]
}, {
    type: "Polygon",
    name: "嘻哈恐龙城",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#0070b4",
    fillOpacity: 0.4,
    center: {
        lng: 120.000197,
        lat: 31.821537,
        level: 18
    },
    lnglat: [{
        lng: 120.00165,
        lat: 31.820872
    }, {
        lng: 120.001656,
        lat: 31.820958
    }, {
        lng: 120.001618,
        lat: 31.82125
    }, {
        lng: 120.001608,
        lat: 31.8214
    }, {
        lng: 120.001436,
        lat: 31.821738
    }, {
        lng: 120.001431,
        lat: 31.821979
    }, {
        lng: 120.001409,
        lat: 31.822066
    }, {
        lng: 120.001184,
        lat: 31.822162
    }, {
        lng: 120.00083,
        lat: 31.822221
    }, {
        lng: 120.000733,
        lat: 31.822713
    }, {
        lng: 120.000749,
        lat: 31.822777
    }, {
        lng: 120.000835,
        lat: 31.8229
    }, {
        lng: 120.000014,
        lat: 31.822686
    }, {
        lng: 119.999692,
        lat: 31.822617
    }, {
        lng: 119.999392,
        lat: 31.822627
    }, {
        lng: 119.998351,
        lat: 31.822362
    }, {
        lng: 119.998453,
        lat: 31.82202
    }, {
        lng: 119.998818,
        lat: 31.821378
    }, {
        lng: 119.999135,
        lat: 31.820817
    }, {
        lng: 119.99929,
        lat: 31.820548
    }, {
        lng: 119.999328,
        lat: 31.820507
    }, {
        lng: 119.999714,
        lat: 31.820489
    }, {
        lng: 119.999923,
        lat: 31.820502
    }, {
        lng: 120.001661,
        lat: 31.820872
    }, {
        lng: 120.00165,
        lat: 31.820894
    }]
}, {
    type: "Polygon",
    name: "魔幻雨林",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#fc8d23",
    fillOpacity: 0.4,
    center: {
        lng: 119.99922,
        lat: 31.823625,
        level: 18
    },
    lnglat: [{
        lng: 120.000717,
        lat: 31.822882
    }, {
        lng: 120.000706,
        lat: 31.823
    }, {
        lng: 120.000653,
        lat: 31.823101
    }, {
        lng: 120.000604,
        lat: 31.823174
    }, {
        lng: 120.000449,
        lat: 31.823297
    }, {
        lng: 120.000352,
        lat: 31.823397
    }, {
        lng: 120.00024,
        lat: 31.82342
    }, {
        lng: 120.000191,
        lat: 31.823433
    }, {
        lng: 120.000175,
        lat: 31.82352
    }, {
        lng: 120.000175,
        lat: 31.823538
    }, {
        lng: 120.000095,
        lat: 31.823529
    }, {
        lng: 120.000052,
        lat: 31.823602
    }, {
        lng: 119.999928,
        lat: 31.82367
    }, {
        lng: 119.999794,
        lat: 31.823689
    }, {
        lng: 119.999607,
        lat: 31.823707
    }, {
        lng: 119.999569,
        lat: 31.82373
    }, {
        lng: 119.999521,
        lat: 31.823848
    }, {
        lng: 119.999424,
        lat: 31.823903
    }, {
        lng: 119.999424,
        lat: 31.82403
    }, {
        lng: 119.999553,
        lat: 31.824213
    }, {
        lng: 119.999633,
        lat: 31.824495
    }, {
        lng: 119.999644,
        lat: 31.824691
    }, {
        lng: 119.999639,
        lat: 31.82471
    }, {
        lng: 119.999532,
        lat: 31.824682
    }, {
        lng: 119.999435,
        lat: 31.82465
    }, {
        lng: 119.998764,
        lat: 31.824969
    }, {
        lng: 119.998453,
        lat: 31.824819
    }, {
        lng: 119.998298,
        lat: 31.824691
    }, {
        lng: 119.998255,
        lat: 31.824646
    }, {
        lng: 119.998142,
        lat: 31.824637
    }, {
        lng: 119.997874,
        lat: 31.82471
    }, {
        lng: 119.997869,
        lat: 31.82465
    }, {
        lng: 119.997906,
        lat: 31.824596
    }, {
        lng: 119.997933,
        lat: 31.824509
    }, {
        lng: 119.998072,
        lat: 31.824404
    }, {
        lng: 119.998217,
        lat: 31.824308
    }, {
        lng: 119.998271,
        lat: 31.824249
    }, {
        lng: 119.998298,
        lat: 31.824099
    }, {
        lng: 119.998255,
        lat: 31.823916
    }, {
        lng: 119.998137,
        lat: 31.823702
    }, {
        lng: 119.998164,
        lat: 31.823493
    }, {
        lng: 119.998062,
        lat: 31.823424
    }, {
        lng: 119.99804,
        lat: 31.823392
    }, {
        lng: 119.998351,
        lat: 31.822362
    }, {
        lng: 119.999392,
        lat: 31.822631
    }, {
        lng: 119.999692,
        lat: 31.822617
    }, {
        lng: 120.000004,
        lat: 31.822681
    }, {
        lng: 120.000722,
        lat: 31.822859
    }, {
        lng: 120.000722,
        lat: 31.822886
    }]
}, {
    type: "Polygon",
    name: "中华恐龙馆",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#00a74a",
    fillOpacity: 0.4,
    center: {
        lng: 120.001817,
        lat: 31.824135,
        level: 18
    },
    lnglat: [{
        lng: 120.001146,
        lat: 31.825225
    }, {
        lng: 120.001801,
        lat: 31.825156
    }, {
        lng: 120.001854,
        lat: 31.825138
    }, {
        lng: 120.002224,
        lat: 31.824915
    }, {
        lng: 120.002477,
        lat: 31.824755
    }, {
        lng: 120.0026,
        lat: 31.824614
    }, {
        lng: 120.00267,
        lat: 31.824509
    }, {
        lng: 120.002739,
        lat: 31.824331
    }, {
        lng: 120.002761,
        lat: 31.824153
    }, {
        lng: 120.002702,
        lat: 31.823957
    }, {
        lng: 120.00268,
        lat: 31.823875
    }, {
        lng: 120.002536,
        lat: 31.823684
    }, {
        lng: 120.0023,
        lat: 31.823465
    }, {
        lng: 120.001994,
        lat: 31.823246
    }, {
        lng: 120.001854,
        lat: 31.823178
    }, {
        lng: 120.001597,
        lat: 31.823105
    }, {
        lng: 120.001307,
        lat: 31.823078
    }, {
        lng: 120.001028,
        lat: 31.823101
    }, {
        lng: 120.000867,
        lat: 31.823155
    }, {
        lng: 120.00069,
        lat: 31.823319
    }, {
        lng: 120.000519,
        lat: 31.823607
    }, {
        lng: 120.000706,
        lat: 31.823689
    }, {
        lng: 120.00091,
        lat: 31.823875
    }, {
        lng: 120.000985,
        lat: 31.824012
    }, {
        lng: 120.001001,
        lat: 31.82424
    }, {
        lng: 120.00098,
        lat: 31.824723
    }, {
        lng: 120.000991,
        lat: 31.824769
    }, {
        lng: 120.001055,
        lat: 31.824874
    }, {
        lng: 120.001098,
        lat: 31.825097
    }, {
        lng: 120.001098,
        lat: 31.825229
    }, {
        lng: 120.001152,
        lat: 31.82522
    }]
}, {
    type: "Polygon",
    name: "梦幻庄园",
    desc: "中华恐龙园",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.2,
    fillColor: "#e90b96",
    fillOpacity: 0.4,
    center: {
        lng: 119.999886,
        lat: 31.825393,
        level: 18
    },
    lnglat: [{
        lng: 119.999655,
        lat: 31.824696
    }, {
        lng: 119.999993,
        lat: 31.824678
    }, {
        lng: 120.000229,
        lat: 31.824586
    }, {
        lng: 120.000384,
        lat: 31.824632
    }, {
        lng: 120.000706,
        lat: 31.824846
    }, {
        lng: 120.000851,
        lat: 31.825001
    }, {
        lng: 120.000894,
        lat: 31.825097
    }, {
        lng: 120.000916,
        lat: 31.825197
    }, {
        lng: 120.000964,
        lat: 31.825284
    }, {
        lng: 120.000567,
        lat: 31.825421
    }, {
        lng: 120.000556,
        lat: 31.825548
    }, {
        lng: 120.000492,
        lat: 31.825708
    }, {
        lng: 120.000331,
        lat: 31.825854
    }, {
        lng: 120.000159,
        lat: 31.825949
    }, {
        lng: 120.0001,
        lat: 31.825972
    }, {
        lng: 119.999794,
        lat: 31.825999
    }, {
        lng: 119.99958,
        lat: 31.825972
    }, {
        lng: 119.999365,
        lat: 31.825886
    }, {
        lng: 119.999102,
        lat: 31.825781
    }, {
        lng: 119.998995,
        lat: 31.825535
    }, {
        lng: 119.998861,
        lat: 31.825193
    }, {
        lng: 119.998754,
        lat: 31.824965
    }, {
        lng: 119.999161,
        lat: 31.824778
    }, {
        lng: 119.999419,
        lat: 31.82465
    }, {
        lng: 119.99966,
        lat: 31.824696
    }]
}];

var feature_walk1 = [{
    flag: 1,
    type: "Marker",
    name: "取货点A",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.967957,
        lat: 31.81748
    }
}];
var feature_walk2 = [{
    flag: 2,
    type: "Marker",
    name: "取货点B",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.968928,
        lat: 31.817503
    }
}];

var feature_walk3 = [{
    flag: 3,
    type: "Marker",
    name: "取货点C",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.968536,
        lat: 31.816988
    }
}];


var flag = 1;

function loadFeatures(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;
        switch (data.type) {
            case "Marker":
                feature = new AMap.Marker({
                    map: map,
                    position: new AMap.LngLat(data.lnglat.lng, data.lnglat.lat),
                    zIndex: 3,
                    extData: data,
                    opacity: data.opacity,
                    offset: new AMap.Pixel(data.offset.x, data.offset.y),
                    title: data.name,
                    animation: "AMAP_ANIMATION_DROP",
                    content: '<div id=' + i + ' class="icon_' + data.color + '"></div>'
                });
                console.log(feature);
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
                AMap.event.addListener(feature, "dblclick", areaDbClick);
                AMap.event.addListener(feature, "click", areaClick);
                break;
            default:
                feature = null;
        }

        if (flag == 2) {
            AMap.event.addListener(feature, "click", mapFeatureClick);
        }
        if (flag == 1) {
            AMap.event.addListener(feature, "click", mapFeatureClick2);
        }
    }
}

var clickName = null;

function areaClick(d) {
    console.log(d);
    $('.message_name').text(d.target.Rd.extData.name);
    $('.message_dis').text(d.target.Rd.extData.desc);
    localStorage.lat_end = '';
    localStorage.lng_end = '';
    localStorage.cityCode_end = "0519";
    localStorage.text_end = '';
    for (var i = 0; i < allProjectData.length; i++) {
        if (allProjectData[i].name.indexOf(d.target.Rd.extData.name) != -1 && allProjectData[i].category == 0) {
            localStorage.chooseId = allProjectData[i]._id;
            localStorage.isProject = 0;
        }
    }
    if (clickName2 != null) {
        $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
    };
    setAllOffset("130");
    $('.message_index_box').css("display", "block");
    $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>导航</a>");
}

var clickName2 = null;
var clickColor2 = null;

function mapFeatureClick2(d) {
    console.log(d);
    $('.message_name').text(d.target.Rd.extData.name);
    $('.message_dis').text(d.target.Rd.extData.desc);
    localStorage.lat_end = d.target.Rd.extData.lnglat.lat;
    localStorage.lng_end = d.target.Rd.extData.lnglat.lng;
    localStorage.cityCode_end = "0519";
    localStorage.text_end = d.target.Rd.extData.name;
    localStorage.chooseId = d.target.Rd.extData.projectId;
    localStorage.isProject = 1;
    //点击后变不透明
    if (d.target.Rd.extData.name.indexOf('恐龙城大剧场') != -1) {
        color = 'dyy';
    } else if (d.target.Rd.extData.name.indexOf('香树湾花园酒店') != -1) {
        color = 'xswjd';
    } else if (d.target.Rd.extData.name.indexOf('恐龙谷温泉') != -1) {
        color = 'wq';
    }

    if (clickName2 != null) {
        $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
    };
    clickName2 = d.target.Rd.extData.name;
    clickColor2 = color;

    $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + color + '_red.svg)');
    console.log("asdfasfdasdf", $('div[title=' + clickName2 + ']').children("#0").css('background-image'));
    
    setAllOffset("130");
    $('.message_index_box').css("display", "block");
    $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>到这去</a>");
}

function mapFeatureClick(d) {
    console.log(d);
    $('.message_name').text(d.target.Rd.extData.name);
    $('.message_dis').text(d.target.Rd.extData.desc);
    localStorage.lat_end = d.target.Rd.extData.lnglat.lat;
    localStorage.lng_end = d.target.Rd.extData.lnglat.lng;
    localStorage.cityCode_end = "0519";
    localStorage.text_end = d.target.Rd.extData.name;
    localStorage.chooseId = d.target.Rd.extData.projectId;
    localStorage.isProject = 1;
    //点击后变不透明
    if (clickName2 != null) {
        $('div[title=' + clickName2 + ']').children("#0").css('background-image', 'url(public/images/' + clickColor2 + '_blue.svg)');
    };
    if (clickName != null) {
        $('div[title=' + clickName + ']').css('opacity', '0.5');
    };
    clickName = d.target.Rd.extData.name;
    $('div[title=' + d.target.Rd.extData.name + ']').css('opacity', '1');


    console.log("aaa", $('div[title=' + d.target.Rd.extData.name + ']').html());
    setAllOffset("130");
    $('.message_index_box').css("display", "block");
    $('#nav').html("<a><img id='nav_i' src='public/images/nav.svg'/>到这去</a>");
}




var windowsArr = new Array();
var localMaker = new Array();
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
        });
        MDrive.search(start_xy, end_xy); //根据起终点坐标规划驾车路线 
    });
}
//驾车导航结果展示 
function driving_routeCallBack(data) {
    console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应驾车线路，请重设起始点");
        return false;
    }
    map.clearMap();
    reInitGeolocation();
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
}
//绘制驾车导航路线 
function drivingDrawLine() {
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    //起点、终点图标 
    sicon = new AMap.Icon({
        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    eicon = new AMap.Icon({
        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
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
        strokeColor: "#9400D3",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeStyle: "dashed",
        strokeDasharray: [10, 5]
    });

    var extra_path2 = new Array();
    var path_xy = steps[(steps.length - 1)].path;
    extra_path2.push(end_xy);
    extra_path2.push(path_xy[(path_xy.length - 1)]);
    extra_line2 = new AMap.Polyline({
        map: map,
        path: extra_path2,
        strokeColor: "#9400D3",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeStyle: "dashed",
        strokeDasharray: [10, 5]
    });

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
        strokeColor: "#9400D3",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeDasharray: [10, 5]
    });
    map.setFitView();
}


/*---------------------------------------------驾车导航 END-----------------------------------------------------*/

/*---------------------------------------------公交导航 START-----------------------------------------------------*/
/*
 * 调用公交换乘服务
 * param Object trans 公交换乘服务实例
 */
function bus_route() {
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
        });
        //根据起、终点坐标查询公交换乘路线 
        trans.search(start_xy, end_xy);
    });
}

function bus_plan() {
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
        //返回导航查询结果           
        AMap.event.addListener(trans, "complete", busPlanCallBack);
        //显示错误信息 
        AMap.event.addListener(trans, "error", function(e) {
            alert("没有对应公交线路，请重设起始点");
        });
        //根据起、终点坐标查询公交换乘路线 
        trans.search(start_xy, end_xy);
    });
}

function busPlanCallBack(data) {
    console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应公交线路，请重设起始点");
        return false;
    }
    map.clearMap();
    reInitGeolocation();
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
        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    eicon = new AMap.Icon({
        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });

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


    endmarker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(endPot.lng, endPot.lat), //基点位置 
        icon: eicon, //复杂图标 
        offset: {
            x: -16,
            y: -34
        } //相对于基点的位置 
    });

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
            strokeColor: "#005cb5", //线颜色 
            strokeOpacity: 0.8, //线透明度 
            strokeWeight: 3 //线宽 
        });
    }
    //绘制步行的路线 
    for (var i in WalkArr) {
        walkPolyline = new AMap.Polyline({
            map: map,
            path: WalkArr[i],
            strokeColor: "#6EB034", //线颜色 
            strokeOpacity: 0.6, //线透明度 
            strokeWeight: 3 //线宽 
        });
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
    }
}
/*---------------------------------------------公交导航 END-----------------------------------------------------*/

/*---------------------------------------------步行导航 START-----------------------------------------------------*/

//步行导航
function walking_route() {
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
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
        });

        MWalk.search(start_xy, end_xy); //根据起终点坐标规划步行路线
    });
}
//导航结果展示
function walk_routeCallBack(data) {
    console.log(data);
    if (data.info == 'NO_DATA') {
        alert("没有对应步行或骑行线路，请重设起始点");
        return false;
    }
    if (inIndex != 4) {
        map.clearMap();
        reInitGeolocation();
    };
    $("#bus_div").css("display", "none");
    $("#map_div").css("display", "block");
    if ($('.bus_nav i').css('background-image').indexOf('bus1.svg') == -1) {
        $('.bus_nav i').css('background-image', "url('public/images/bus1.svg')");
    };
    if ($('.car_nav i').css('background-image').indexOf('car1.svg') == -1) {
        $('.car_nav i').css('background-image', "url('public/images/car1.svg')");
    }
    if ($('.walk_nav i').css('background-image').indexOf('walk2.svg') == -1) {
        $('.walk_nav i').css('background-image', "url('public/images/walk2.svg')");
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
}
//绘制步行导航路线
function walkingDrawLine() {
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;
    var start_xy = new AMap.LngLat(lng_start, lat_start);
    end_xy = new AMap.LngLat(lng_end, lat_end); //目的地坐标
    //起点、终点图标
    var sicon = new AMap.Icon({
        image: "http://api.amap.com/Public/images/js/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -180)
    });
    var eicon = new AMap.Icon({
        image: "http://api.amap.com/Public/images/js/poi.png",
        size: new AMap.Size(44, 44),
        imageOffset: new AMap.Pixel(-334, -134)
    });
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
    var extra_path1 = new Array();
    extra_path1.push(start_xy);
    extra_path1.push(steps[0].path[0]);
    extra_line1 = new AMap.Polyline({
        map: map,
        path: extra_path1,
        strokeColor: "#9400D3",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeStyle: "dashed",
        strokeDasharray: [10, 5]
    });

    var extra_path2 = new Array();
    var path_xy = steps[(steps.length - 1)].path;
    extra_path2.push(end_xy);
    extra_path2.push(path_xy[(path_xy.length - 1)]);
    extra_line2 = new AMap.Polyline({
        map: map,
        path: extra_path2,
        strokeColor: "#9400D3",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeStyle: "dashed",
        strokeDasharray: [10, 5]
    });

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
        strokeColor: "#009245",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        strokeDasharray: [10, 5]
    });
    map.setFitView();
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
                    strokeOpacity: 0.9,
                    strokeWeight: 3,
                    strokeDasharray: [10, 5]   
    });     
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
var marker;

function drawFooter(index, footerData) {
    var areaList = new Array();
    var nameList = new Array();
    var lineArray = new Array();
    for (var i = 0; i < footerData.length; i++) {
        // console.log(footerData[i])
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
            lineArray.push(new AMap.LngLat(footerData[i].lng, footerData[i].lat));
        }
    }

    areaList = filterArray(areaList);
    nameList = filterArray(nameList);

    $("#foot_count").html("<img  class='pic_size' src='public/images/foot_mine.svg' />" + nameList.length + "景点 &nbsp; " + areaList.length + "片区");
    map.clearMap();
    marker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(120.000717, 31.822704),
        icon: "http://code.mapabc.com/images/car_03.png", //marker图标，直接传递地址url
        offset: new AMap.Pixel(-10, -15),
        autoRotation: true
    });
    //绘制轨迹
    var polyline = new AMap.Polyline({
        map: map,
        path: lineArray,
        strokeColor: "#00A", //线颜色
        strokeOpacity: 0.8, //线透明度
        strokeWeight: 2, //线宽
        strokeStyle: "solid" //线样式
    });
    map.setFitView();
    marker.moveAlong(lineArray, 100);

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
        AMap.event.addListener(initFeature, "dblclick", areaDbClick);
    }
}


function areaDbClick(d) {
    console.log(d);
    map.zoomIn(d.target.Rd.extData.center.level);
    map.setCenter(new AMap.LngLat(d.target.Rd.extData.center.lng, d.target.Rd.extData.center.lat));
}

function setNavFlag(flag) {
    navFlag = flag;
}

function showRoute() {
    if (lat_start == null || lat_start == NaN) {
        map.clearMap();
        loadFeatures(feature_walk1);
        loadFeatures(feature_walk2);
        loadFeatures(feature_walk3);
    } 
    else {
        map.clearMap();
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
    map.clearMap();
    for (var i = 0; i < lngLat.length; i++) {
        if (i == walkRouteFlag) {
            localStorage.lng_end = lngLat[i].lng;
            localStorage.lat_end = lngLat[i].lat;
            localStorage.cityCode_end = "0519";
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
                content: '<div id=' + i + ' class="icon_lbl"></div>'
            });
            AMap.event.addListener(feature, "click", mapFeatureClick3);
        }
    };
}

function mapFeatureClick3(d) {
    walkRouteFlag = d.target.Rd.extData;
    initWalkRoute();
}

module.exports = {
    init: function() {
        init();
    },

    initAreaResult: function() {
        // features0.strokeWeight=0;
        // features0.fillOpacity=0;
        initArea(featuresResult);
    },

    initWalkRoute: function(lngLatArray) {
        lngLat = lngLatArray;
        initWalkRoute();
    },
    initArea: function() {
        initArea(features00);
        // loadFeatures(features01);
        // drawProjectOther();
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
        return clearInterval(mapInterval);
    },
    startMapInterval: function() {
        return startMapInterval();
    },
}
var scale = null;
//加载比例尺插件

var map = new AMap.Map('map', {
    resizeEnable: true,
    //rotateEnable: true,
    //dragEnable: true,
    //zoomEnable: true,
    //设置可缩放的级别
    //zooms: [3,18],
    //传入2D视图，设置中心点和缩放级别
    view: new AMap.View2D({
        center: new AMap.LngLat(120.001224, 31.824686),
        zoom: 15
    })
});
var inIndex=0;
map.plugin(["AMap.Scale"], function() {
    scale = new AMap.Scale({
        offset: new AMap.Pixel(55, 60)
    });
    map.addControl(scale);
});
AMap.event.addListener(map, "zoomchange", zoomChange); //查询成功时的回调函数

function zoomChange() {
    //缩放地图按钮变化
    var zoomLevel = map.getZoom();
    if (zoomLevel==19) {
        $(".map_zoomin").css("background-image",'url(/../images/largest.svg)');
    }else{
        var img = $(".map_zoomin").css("background-image");
        if (img!=null && img.indexOf('larger.svg')==-1) {
            $(".map_zoomin").css("background-image",'url(/../images/larger.svg)');
        };
    }
    //缩放地图按钮变化
    if (zoomLevel==3) {
        $(".map_zoomout").css("background-image",'url(/../images/smallest.svg)');
    }else{
        var img = $(".map_zoomout").css("background-image");
        if (img!=null && img.indexOf('smaller.svg')==-1) {
            $(".map_zoomout").css("background-image",'url(/../images/smaller.svg)');
        }
    }
    if (inIndex == 1) {
        if (zoomLevel == 15) {
            map.clearMap();
            loadFeatures(features0);
        };
        if (zoomLevel == 16) {
            map.clearMap();
            loadFeatures(features1);
        };
        if (zoomLevel == 17) {
            map.clearMap();
            drawProject();
        };
    };
}


//地图定位
var geolocation = null;
map.plugin('AMap.Geolocation', function() {
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, //是否使用高精度定位，默认:true
        timeout: 10000, //超过10秒后停止定位，默认：无穷大
        maximumAge: 0, //定位结果缓存0毫秒，默认：0
        convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: false, //显示定位按钮，默认：true
        buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(15, 80), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: false, //定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
});

//解析定位错误信息
function onError(data) {
    $(".location_icon").css('background-image', 'url(/../images/before_location.svg)');
    alert("无法获取当前位置");
}


/*
 *解析定位结果
 */
function onComplete(data) {
    completeOnHtml(data);
}

var flag = 0;

function setAllOffset(offset){
    $(".map_zoom").css("bottom",offset+"px");
    $(".map_locate").css("bottom",offset+"px");
    if (scale!=null) {
        scale.hide();
    };
    
    scale = new AMap.Scale({
            offset: new AMap.Pixel(55, offset)
        });
    map.addControl(scale);
}


//获取当前位置信息
function getMyPosition() {
    if (flag == 1) {
        map.removeControl(geolocation);
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false, //显示定位按钮，默认：true
            showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        map.addControl(geolocation);
        AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
        AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
        geolocation.getCurrentPosition();
    }else{
        geolocation.getCurrentPosition();
    }
    flag=1;
};

/*
 *监控当前位置并获取当前位置信息
 */
function watchMyPosition() {  
    geolocation.watchPosition();
}



function mapIn() {
    map.zoomIn();
}

function mapOut() {
    map.zoomOut();
}
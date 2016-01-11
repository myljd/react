var Constants = require('../constants/AppConstants');
var React = require('react');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var MapUtil = require('../utils/MapUtil');

//输入提示
function autoSearchStart() {
    localStorage.removeItem("lat_start");
    localStorage.removeItem("lng_start");
    localStorage.removeItem("cityCode_start");
    localStorage.removeItem("text_start");
    
    var keywords = document.getElementById("key_start").value;
    var auto;
    //加载输入提示插件
    AMap.service(["AMap.Autocomplete"], function() {
        var autoOptions = {
            city: "常州市", //城市，默认全国
        };
        auto = new AMap.Autocomplete(autoOptions);
        //查询成功时返回查询结果
        if (keywords.length > 0) {
            auto.search(keywords, function(status, result) {
                document.getElementById("result_end").style.display = "none";
                 autostart_CallBack(result);
            });
        } else {
            document.getElementById("result_start").style.display = "none";
        }
    });
}

//输出输入提示结果的回调函数
function autostart_CallBack(data) {
    document.getElementById("result_start").curSelect = -1;
    document.getElementById("result_start").style.display = "block";

    console.log(data);
    AppDispatcher.dispatch({
        type: ActionTypes.QUERY_NAV_START,
        data: data
    }); 
            
}

//从输入提示框中选择关键字并查询
function selectResultStart(event) {

    var index  = event.currentTarget.id.split("_")[1];
    if (index < 0) {
        return;
    }
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.getElementById("key_start").onpropertychange = null;
        document.getElementById("key_start").onfocus = focus_callback_start;
    }
    //截取输入提示的关键字部分
    var text = $("#span_" + index).text();
    document.getElementById("key_start").value = text;
    document.getElementById("result_start").style.display = "none";
    localStorage.lat_start = $("#lat_"+ index ).val();
    localStorage.lng_start = $("#lng_"+ index ).val();
    localStorage.cityCode_start = $("#cityCode_"+ index ).val();
    localStorage.text_start = text;

    console.log(localStorage.lat_start,localStorage.lng_start,localStorage.cityCode_start,localStorage.text_start);

    var is_start_in = MapUtil.isInKlyArea(localStorage.lng_start,localStorage.lat_start);

    localStorage.is_start_in = is_start_in;

    console.log(localStorage.is_start_in)
    AppDispatcher.dispatch({
        type: ActionTypes.IS_START_IN
    }); 
    

}


//定位选择输入提示关键字
function focus_callback_start() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.getElementById("key_start").onpropertychange = autoSearchStart;
    }
}

function keydownStart(event) {
    var key = (event || window.event).keyCode;
    var result = document.getElementById("result_start")
    var cur = result.curSelect;
    if (key === 40) { //down
        if (cur + 1 < result.childNodes.length) {
            if (result.childNodes[cur]) {
                result.childNodes[cur].style.background = '';
            }
            result.curSelect = cur + 1;
            result.childNodes[cur + 1].style.background = '#CAE1FF';
            document.getElementById("key_start").value = result.tipArr[cur + 1].name;
        }
    } else if (key === 38) { //up
        if (cur - 1 >= 0) {
            if (result.childNodes[cur]) {
                result.childNodes[cur].style.background = '';
            }
            result.curSelect = cur - 1;
            result.childNodes[cur - 1].style.background = '#CAE1FF';
            document.getElementById("key_start").value = result.tipArr[cur - 1].name;
        }
    } else if (key === 13) {
        var res = document.getElementById("result_start");
        if (res && res['curSelect'] !== -1) {
            selectResultStart(document.getElementById("result_start").curSelect);
        }
    } else {
        autoSearchStart();
    }
}

module.exports = {
    keydownStart: function(event) {
        keydownStart(event);
    },

    selectResultStart:function(event) {
        selectResultStart(event);
    },

}
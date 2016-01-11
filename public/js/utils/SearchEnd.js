var Constants = require('../constants/AppConstants');
var React = require('react');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;

//输入提示
function autoSearchEnd() {
    localStorage.removeItem("lat_end");
    localStorage.removeItem("lng_end");
    localStorage.removeItem("cityCode_end");
    localStorage.removeItem("text_end");
    var keywords = document.getElementById("key_end").value;
    var auto;
    //加载输入提示插件
    AMap.service(["AMap.Autocomplete"], function() {
        var autoOptions = {
            city: "常州市" //城市，默认全国
        };
        auto = new AMap.Autocomplete(autoOptions);
        //查询成功时返回查询结果
        if (keywords.length > 0) {
            auto.search(keywords, function(status, result) {
                document.getElementById("result_start").style.display = "none";
                 auto_CallBack(result);
            });
        } else {
            document.getElementById("result_end").style.display = "none";
        }
    });
}

//输出输入提示结果的回调函数
function auto_CallBack(data) {
    document.getElementById("result_end").curSelect = -1;
    document.getElementById("result_end").style.display = "block";

    
    AppDispatcher.dispatch({
        type: ActionTypes.QUERY_NAV_END,
        data: data
    }); 
            
}

//从输入提示框中选择关键字并查询
function selectResultEnd(event) {

    var index  = event.currentTarget.id.split("_")[1];
    if (index < 0) {
        return;
    }
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.getElementById("key_end").onpropertychange = null;
        document.getElementById("key_end").onfocus = focus_callback_end;
    }
    //截取输入提示的关键字部分
    var text = $("#spanEnd_" + index).text();
    document.getElementById("key_end").value = text;
    document.getElementById("result_end").style.display = "none";
    localStorage.lat_end = $("#latEnd_"+ index ).val();
    localStorage.lng_end = $("#lngEnd_"+ index ).val();
    localStorage.cityCode_end = $("#cityCodeEnd_"+ index ).val();
    localStorage.text_end = text;

    console.log(localStorage.lat_end,localStorage.lng_end,localStorage.cityCode_end,localStorage.text_end);
    if ($("#key_start").val()==null || $("#key_start").val()=='') {
        // alert("请输入起点");
    }else{
        // AppDispatcher.dispatch({
        //     type: ActionTypes.JUMP_TO_NAV_RESULT
        // });
    }

}


//定位选择输入提示关键字
function focus_callback_end() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.getElementById("key_end").onpropertychange = autoSearchEnd;
    }
}

function keydownEnd(event) {
    var key = (event || window.event).keyCode;
    var result = document.getElementById("result_end")
    var cur = result.curSelect;
    if (key === 40) { //down
        if (cur + 1 < result.childNodes.length) {
            if (result.childNodes[cur]) {
                result.childNodes[cur].style.background = '';
            }
            result.curSelect = cur + 1;
            result.childNodes[cur + 1].style.background = '#CAE1FF';
            document.getElementById("key_end").value = result.tipArr[cur + 1].name;
        }
    } else if (key === 38) { //up
        if (cur - 1 >= 0) {
            if (result.childNodes[cur]) {
                result.childNodes[cur].style.background = '';
            }
            result.curSelect = cur - 1;
            result.childNodes[cur - 1].style.background = '#CAE1FF';
            document.getElementById("key_end").value = result.tipArr[cur - 1].name;
        }
    } else if (key === 13) {
        var res = document.getElementById("result_end");
        if (res && res['curSelect'] !== -1) {
            selectResultEnd(document.getElementById("result_end").curSelect);
        }
    } else {
        autoSearchEnd();
    }
}

module.exports = {
    keydownEnd: function(event) {
        keydownEnd(event);
    },

    selectResultEnd:function(event) {
        selectResultEnd(event);
    },

}
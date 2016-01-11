document.getElementById("key_start").onkeyup = keydownStart;
//输入提示
function autoSearchStart() {
    var keywords = document.getElementById("key_start").value;
    var auto;
    //加载输入提示插件
    AMap.service(["AMap.Autocomplete"], function() {
        var autoOptions = {
            city: "" //城市，默认全国
        };
        auto = new AMap.Autocomplete(autoOptions);
        //查询成功时返回查询结果
        if (keywords.length > 0) {
            auto.search(keywords, function(status, result) {
                autostart_CallBack(result);
            });
        } else {
            document.getElementById("result_start").style.display = "none";
        }
    });
}

//输出输入提示结果的回调函数
function autostart_CallBack(data) {
    // var resultStr = "";
    // var tipArr = data.tips;
    // if (tipArr && tipArr.length > 0) {
    //     for (var i = 0; i < tipArr.length && i < 6; i++) {
    //         resultStr += "<div id='divid" + (i + 1) + "' onmouseover='openMarkerTipByStartId(" + (i + 1) + ",this)' onclick='selectResultStart(" + i + ")' onmouseout='onmouseout_StartMarkerStyle(" + (i + 1) + ",this)' style=\"font-size: 13px;cursor:pointer;padding:5px 5px 5px 5px;\"" + "data=" + tipArr[i].adcode + ">" + tipArr[i].name + "<span style='color:#C1C1C1;'>" + tipArr[i].district + "</span></div><input id='lat_" + (i + 1) + "' type='hidden' value='" + tipArr[i].location.lat + "'><input id='lng_" + (i + 1) + "' type='hidden' value='" + tipArr[i].location.lng + "'>";
    //     }
    // } else {
    //     resultStr = " π__π 亲,人家找不到结果!<br />要不试试：<br />1.请确保所有字词拼写正确<br />2.尝试不同的关键字<br />3.尝试更宽泛的关键字";
    // }


    var resultStr = "<div class='input_line'></div>";
    var tipArr = data.tips;

    resultStr += "<ul class='history_item shadow' data-type='0' data-addr-type='saddr'>";
    if (tipArr && tipArr.length > 0) {
        
        for (var i = 0; i < tipArr.length && i < 6; i++) {
            resultStr += "<li id='divid" + (i + 1) + "' onmouseover='openMarkerTipByStartId(" + (i + 1) + ",this)' onclick='selectResultStart(" +
             i + ")' onmouseout='onmouseout_StartMarkerStyle(" + (i + 1) + 
             ",this)' class=' text-overflow' " + 
            "data=" + tipArr[i].adcode + "><span id='span_" + (i + 1) + "' class='poi-name'>" + tipArr[i].name + "</span><span class='search_history_item_district'>" + tipArr[i].district + "</span></li><input id='lat_" + (i + 1) + "' type='hidden' value='" + tipArr[i].location.lat + "'><input id='lng_" + (i + 1) + "' type='hidden' value='" + tipArr[i].location.lng + "'>";
        }
        
    } else {
        resultStr += "<li  class=' text-overflow' ><span class='poi-name'>未找到结果,请尝试不同的关键字</span></li>";
    }
    resultStr += "</ul>";

    document.getElementById("result_start").curSelect = -1;
    document.getElementById("result_start").tipArr = tipArr;
    document.getElementById("result_start").innerHTML = resultStr;
    document.getElementById("result_start").style.display = "block";
}

//输入提示框鼠标滑过时的样式
function openMarkerTipByStartId(pointid, thiss) { //根据id打开搜索结果点tip 
    thiss.style.background = '#CAE1FF';
}

//输入提示框鼠标移出时的样式
function onmouseout_StartMarkerStyle(pointid, thiss) { //鼠标移开后点样式恢复 
    thiss.style.background = "";
}

//从输入提示框中选择关键字并查询
function selectResultStart(index) {
    if (index < 0) {
        return;
    }
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.getElementById("key_start").onpropertychange = null;
        document.getElementById("key_start").onfocus = focus_callback_start;
    }
    //截取输入提示的关键字部分
    var text = $("#span_" + (index + 1)).text();
    
    var cityCode = document.getElementById("divid" + (index + 1)).getAttribute('data');
    document.getElementById("key_start").value = text;
    document.getElementById("result_start").style.display = "none";
    localStorage.lat_start = $("#lat_"+ (index + 1)).val();
    localStorage.lng_start = $("#lng_"+ (index + 1)).val();
    localStorage.cityCode_start = cityCode;
    localStorage.text_start = text;
    if ($("#key_end").val()==null || $("#key_end").val()=='') {
        alert("请输入终点");
    }else{
        saveNavRecord();        
    }

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

//每次加载js纪录足迹数据
footInterval();

//每5分半执行一次
var footIntervalTime = 1000*(60*5+30);
setInterval("footInterval()",footIntervalTime);//1000为1秒钟

//足迹数据记录
function footInterval(){
    // localStorage.my_foot_data="120.001452,31.824978,1442914940503|120.001473,31.824965,1441924941503|120.003131,31.822066,1442934942503|120.004054,31.824181,1442944943503";
    
    //第一次进入app纪录起始时间
    if (localStorage.foot_start_time == null || localStorage.foot_start_time == '') {
        localStorage.foot_start_time = new Date().getTime();
    }

    //纪录结束时间和间隔时间
    localStorage.foot_end_time = new Date().getTime();
    localStorage.foot_apart_time = new Date().getTime();

    //总时间相差1天上传服务器，间隔时间相差5分钟纪录一次足迹
    var dif_time = parseInt(localStorage.foot_end_time - localStorage.foot_start_time);
    if (dif_time > 3600 * 24) {
        upFooterToServer();
    } else {
        if (localStorage.foot_apart_hold_time == null) {
            localStorage.my_foot_data = localStorage.lng_mine + ',' + localStorage.lat_mine + ',' + localStorage.foot_apart_time;
            localStorage.foot_apart_hold_time = localStorage.foot_apart_time;
        } else {
            var dif_apart_time = parseInt(localStorage.foot_apart_time - localStorage.foot_apart_hold_time);
            if (dif_apart_time > 5 * 60) {
                localStorage.my_foot_data += "|" + localStorage.lng_mine + ',' + localStorage.lat_mine + ',' + localStorage.foot_apart_time;
                localStorage.foot_apart_hold_time = localStorage.foot_apart_time;
            }
        }
    }
}

//足迹上传服务器
function upFooterToServer() {
    console.log(localStorage.my_foot_data);
    $.ajax({
        type: 'post',
        url: '/map/upFooterToServer',
        data:{foot_data: localStorage.my_foot_data,
            id:1},
        async:false,
        success: function(result) {
            if (result.success) {
                emptyData();
            };
        }
    })  
}
// emptyData();
//清空数据
function emptyData() {
    localStorage.removeItem("foot_start_time");
    localStorage.removeItem("foot_end_time");
    localStorage.removeItem("foot_apart_time");
    localStorage.removeItem("foot_apart_hold_time");
    localStorage.removeItem("my_foot_data");
}





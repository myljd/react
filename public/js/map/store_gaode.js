

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
    
    var lat_start = localStorage.lat_start;
    var lng_start = localStorage.lng_start;

    var lat_end = localStorage.lat_end;
    var lng_end = localStorage.lng_end;

    /*---------------------------------------------驾车导航 START-----------------------------------------------------*/
    //驾车导航 
    function getTotalTime(time) {
        if (time <= 60) {
            return "1分钟";
        } else if (time > 60 && time <= 3600) {
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
        if(data.info == 'NO_DATA'){
            alert("没有对应驾车线路，请重设起始点");
            return false;
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
            AMap.event.addListener(trans, "complete", busTransCallBack);
            //显示错误信息 
            AMap.event.addListener(trans, "error", function(e) {
                alert("没有对应公交线路，请重设起始点");
            });
            //根据起、终点坐标查询公交换乘路线 
            trans.search(start_xy, end_xy);
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
        if(data.info == 'NO_DATA'){
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
        for (var i = 0; i < btPlans.length; i++) {
            var btDistance = btPlans[i].distance;
            var btseg = btPlans[i].segments;
            
            var naviInfo = '';
            var lineName='';
            var lineBusStop=0;

            var lineWalkDis = getTotalDistance(btPlans[i].walking_distance);
            var lineTime = getTotalTime(btPlans[i].time);
            for (var j = 0; j < btseg.length; j++) {
                // naviInfo += btseg[j].instruction + "<br/>";

                if (btseg[j].transit_mode == "WALK") {
                    if (i === 0) {
                        WalkArr.push(btseg[j].transit.path);
                    }
                } else {
                    if (btseg[j].transit.via_num !=null) {
                        lineBusStop+=btseg[j].transit.via_num;
                    }
                    
                    if ( lineName == '') {
                        lineName += btseg[j].transit.lines[0].name.split("(")[0];
                    }else{
                        lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
                    }
                   
                    if (i === 0) {
                        BusArr.push(btseg[j].transit.path);
                    }
                }
            }
            drawBuschangeLine(btOrigin, btDestination, BusArr, WalkArr);
            resLine += "<div class='common_light navigation_buslist_content_item ' onclick='goBusDetail("+i+")'><div class=''><div class='navigation_buslist_content_content clearfix'><h3> "+lineName+" </h3> </div><div class='navigation_buslist_content_desc_content clearfix text-overflow'><span class='bus-eta-status-1'>畅通</span><span class='bus-info-divide'> | </span> <span>约"+lineTime+"</span><span class='bus-info-divide'> | </span> <span>"+lineBusStop+"站</span><span class='bus-info-divide'> | </span> <span>步行"+lineWalkDis+"</span> </div></div></div>";
            
            //结果输出用表格展现，输出表格内容 
            // resLine = "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" + "<tr><td width=\"150\" class=\"change_blue\">" + lineName + "</td><td width=\"300\" class=\"change_blue\" >" + Getdistance(btDistance) + "</td></tr>" + "<tr><td width=\"150\" class=\"change_blue\" ></td><td width=\"300\"><img src=\"http://webapi.amap.com/images/start.gif\" /> <b>起点</b> " + startName + "</td></tr>" + "<tr><td width=\"150\" class=\"change_blue\"></td><td width=\"300\" class=\"change_blue\">" + naviInfo + "</td></tr>" + "<tr><td width=\"150\" class=\"change_blue\" ></td><td width=\"300\"><img src=\"http://webapi.amap.com/images/end.gif\" /> <b>终点</b> " + endName + "</td></tr>";
        }
        resLine += "</div>";
        $("#bus_div").html(resLine);
        //写到result这个div 
        //时间
        var time = getTotalTime(btPlans[0].time);
        //距离
        var distance = getTotalDistance(btPlans[0].distance);
        $(".time_dis").empty();
        $(".time_dis").html("<span>约 " + time + "(" + distance + ")</span>");
        $(".taxi_cost").empty();
        $(".taxi_cost").html("<span>  打车约<span class='red'>" + localStorage.taxi_cost + "</span>元 </span>");

        //取出需要加换乘、步行图标的位置，这里仅画出第一个换乘方案 
        var sinseg = btPlans[0].segments;
        for (var a in sinseg) {
            if (sinseg[a].transit_mode == "WALK") {
                onwalk.push(sinseg[a].transit.origin);
            } else {
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
        if(data.info == 'NO_DATA'){
            alert("没有对应步行或骑行线路，请重设起始点");
            return false;
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
            strokeColor: "#99CC00",
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
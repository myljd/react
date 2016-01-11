   /*---------------------------------------------驾车导航 START-----------------------------------------------------*/
   // var locurl = location.href.split("=");
   // var data = locurl[1];
   // console.log(data);
   //驾车导航结果展示 

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

   function driving_detail() {
       var data = JSON.parse(localStorage.nav_data);
       var nav_way = localStorage.nav_way;
       console.log(data);
       if (data == null) {
           //document.getElementById("result").innerHTML = "未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。"; 
       } else if (nav_way == "bus") {
           //遍历每种换乘方案 
           var i = localStorage.busStep;
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
           $("#detail_header").css("height", "70px");
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
                route_text += "<div class='path'><div class='walkmiddle'></div><div class='title_middle split'>" + btseg[i].instruction + "</div></div>";



               if (btseg[j].transit_mode == "WALK") {
                   if (i === 0) {
                       WalkArr.push(btseg[j].transit.path);
                   }
               } else {
                   if (btseg[j].transit.via_num != null) {
                       lineBusStop += btseg[j].transit.via_num;
                   }

                   if (lineName == '') {
                       lineName += btseg[j].transit.lines[0].name.split("(")[0];
                   } else {
                       lineName += "→" + btseg[j].transit.lines[0].name.split("(")[0];
                   }

                   if (i === 0) {
                       BusArr.push(btseg[j].transit.path);
                   }
               }
           }
           resLine += "<div class='common_light navigation_buslist_content_item ' style='border-bottom:0' ><div class=''><div class='navigation_buslist_content_content clearfix' ><h3> " + lineName + " </h3> </div><div class='navigation_buslist_content_desc_content clearfix text-overflow' style='margin-top:15px'><span class='bus-eta-status-1'>畅通</span><span class='bus-info-divide'> | </span> <span>约" + lineTime + "</span><span class='bus-info-divide'> | </span> <span>" + lineBusStop + "站</span><span class='bus-info-divide'> | </span> <span>步行" + lineWalkDis + "</span> </div></div></div><div class='new_blueButton floatr' onclick='showBusRoute()'>地图</div>";

           resLine += "</div>";
           $("#detail_header").html(resLine);

           //输出行车路线指示 
           route_text = "<div class='path'><div class='walkstart'></div><div class='title' > 起始位置 </div></div>" + route_text + "<div class='path'><div class='walkend'></div><div class='title split'> 到达 目的地</div></div>";
           $("#detail_main").empty();
           $("#detail_main").html(route_text);


       } else {
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
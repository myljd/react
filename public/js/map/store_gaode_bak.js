    var mapObj,geolocation;//地图对象,定位对象
	var btContent = new Array(); //结果表格数组 
	var windowsArr = new Array();
	var localMaker = new Array();
	var resultStr;//结果拼接string 
    var carPolyline;//驾车折线
    var busPolyline;//公交折线
    var walkPolyline;//步行折线
	var extra_line1;//公交换乘步行折线1
	var extra_line2;//公交换乘步行折线2
    var end_xy; //目的地坐标;
    
    var sicon;
    var eicon;
    var startmarker;
    var endmarker;
    
    //初始化地图对象，加载地图
    function mapInit(){
        mapObj = new AMap.Map("iCenter",{
            center:new AMap.LngLat(gaode_x,gaode_y), //地图中心点
		    level:15 //地图显示的缩放级别
	    });
		//地图中添加地图操作浏览器定位插件
    mapObj.plugin('AMap.Geolocation', function () {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false,        //显示定位按钮，默认：true
            buttonPosition: 'RB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(20, 30),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        mapObj.addControl(geolocation);
        AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
        //AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
    });
	    //在地图中添加ToolBar插件
	    /*mapObj.plugin(["AMap.ToolBar"],function(){     
	        toolBar = new AMap.ToolBar();
	        mapObj.addControl(toolBar);    
	    });*/
	    addMarker();
    }
    
       function addMarker(){
        //自定义点标记内容
        var markerContent = document.createElement("div");
        markerContent.className="textCenter";
        //点标记中的图标
        var markerImg= document.createElement("img");
        markerImg.className="markerlnglat";
        markerImg.src= brandLogo  ;
        markerContent.appendChild(markerImg);
        var markerSpan = document.createElement("div");
        markerSpan.className = "apt";
		markerSpan.innerHTML = '<a href="'+storeUrl+'"><div class="shop-popup-detail"><p><span class="title">'+storeName+'</span><br><span>距离'+storeDistance+'　　评级：'+storeRate+'</span></p></div></a>';
		markerContent.appendChild(markerSpan);
        marker = new AMap.Marker({
            map:mapObj,
            position:new AMap.LngLat(gaode_x,gaode_y), //基点位置
		    offset:new AMap.Pixel(-18,-36), //相对于基点的偏移位置
		            draggable : false,  //是否可拖动
		            content:markerContent   //自定义点标记覆盖物内容
		    });
		    marker.setMap(mapObj);  //在地图上添加点
		    AMap.event.addListener(marker,'click',function(e){
		    });
    }
    
    /*---------------------------------------------高德API浏览器定位START-----------------------------------------------------*/
	/*
	 *获取当前位置信息
	 */
	function getCurrentPosition () {
	  geolocation.getCurrentPosition();
	};
	/*
	 *监控当前位置并获取当前位置信息
	 */
	function watchPosition () {
	  geolocation.watchPosition();
	}
	/*
	 *解析定位结果
	 */
	function onComplete (data) {
		$("#Longitude").val(data.position.getLng());
	    $("#Latitude").val(data.position.getLat());
	}
	/*
	* AJAX获取用户坐标
	*/
	function getLocationByWeixin(){ 
		var latlong = ''
	    $.ajax({
	    	async: false,
	        type:"GET",
	        url: "/Ajax/getLocation/",
	        timeout: 5000,
	        error: function() {
	        },
	        success: function(data) {
		        latlong = data;
	        }
	    });
		return latlong;
	}
	
	/*
	 *解析定位错误信息
	 */
	function onError (data) {
	    var str = '<p>定位失败</p>';
	    str += '<p>错误信息：'
	    switch(data.info) {
	        case 'PERMISSION_DENIED':
	            str += '浏览器阻止了定位操作';
	            break;
	        case 'POSITION_UNAVAILBLE':
	            str += '无法获得当前位置';
	            break;
	        case 'TIMEOUT':
	            str += '定位超时';
	            break;
	        default:
	            str += '未知错误';
	            break;
	    }
	    str += '</p>';
	    result.innerHTML = str;
	}
    
    /*---------------------------------------------高德API浏览器定位 END-----------------------------------------------------*/
    

    /*---------------------------------------------驾车导航 START-----------------------------------------------------*/
	//驾车导航 
	function driving_route() {
		//起、终点 
	    var MDrive; 
	    var start_xy = new AMap.LngLat($("#Longitude").val(),$("#Latitude").val());
	        end_xy = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
	    mapObj.plugin(["AMap.Driving"], function() { 
	        var DrivingOption = { 
	            //驾车策略，包括 LEAST_TIME，LEAST_FEE, LEAST_DISTANCE,REAL_TRAFFIC 
	            policy: AMap.DrivingPolicy.LEAST_TIME  
	        };         
	        MDrive = new AMap.Driving(DrivingOption); //构造驾车导航类  
	        AMap.event.addListener(MDrive, "complete", driving_routeCallBack); //返回导航查询结果 
	        MDrive.search(start_xy,end_xy); //根据起终点坐标规划驾车路线 
	    }); 
	} 
	//驾车导航结果展示 
	function driving_routeCallBack(data) { 
	    console.log(data); 
	    mapObj.clearMap();
	    var routeS = data.routes; 
	    if (routeS.length <= 0) { 
	        //document.getElementById("result").innerHTML = "未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。"; 
	    }  
	    else{  
	        route_text=""; 
	        for(var v =0; v< routeS.length;v++){ 
	            //驾车步骤数 
	            steps = routeS[v].steps 
	            var route_count = steps.length; 
	            //行车距离（米） 
	            var distance = routeS[v].distance; 
				//拼接输出html 
	            for(var i=0 ;i< steps.length;i++){ 
	                route_text += "<tr><td align=\"left\" onMouseover=\"driveDrawFoldline('" + i + "')\">" + i +"." +steps[i].instruction  + "</td></tr>"; 
	            }
	        }
		    //输出行车路线指示 
	        route_text = "<table cellspacing=\"5px\"><tr><td><img src=\"http://code.mapabc.com/images/start.gif\" />  当前位置</td></tr>" + route_text + "<tr><td><img src=\"http://code.mapabc.com/images/end.gif\" />"  +storeName+"</td></tr></table>"; 
	        
	        $(".message-box").show();
	        $(".walk-message-box").hide();
	        $(".down-arrow .icon2").removeClass('icon2').addClass('icon');
	        $(".down-arrow .car-icon").removeClass('icon').addClass('icon2');
	        document.getElementById("navText").innerHTML = route_text; 
	        $("#totalStep").val(route_count);
	        $("#totalStepTxt").html(route_count);
	        $("#iCenter").css("height","65%");
			$('.footer-icon .icon').hide();
    		$('.oc-icon').removeClass('close').addClass('open');
	        //addMarker();
	        drivingDrawLine(); 
	    }     
	} 
	//绘制驾车导航路线 
	function drivingDrawLine() {
		var start_xy = new AMap.LngLat($("#Longitude").val(),$("#Latitude").val());
			  end_xy = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
	    //起点、终点图标 
	     sicon = new AMap.Icon({ 
	        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png", 
	        size:new AMap.Size(44,44), 
	        imageOffset: new AMap.Pixel(-334, -180) 
	    }); 
	     eicon = new AMap.Icon({ 
	        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png", 
	        size:new AMap.Size(44,44), 
	        imageOffset: new AMap.Pixel(-334, -134) 
	    }); 
	    
	    startmarker = new AMap.Marker({ 
	        icon : sicon, //复杂图标 
	        visible : true,  
	        position : start_xy, 
	        map:mapObj, 
	        offset : { 
	            x : -16, 
	            y : -40 
	        } 
	    }); 
    
	    endmarker = new AMap.Marker({ 
	        icon : eicon, //复杂图标 
	        visible : true,  
	        position : end_xy, 
	        map:mapObj, 
	        offset : { 
	            x : -16, 
	            y : -40 
	        } 
	    });
	     
	    //消除其它导航线
    if(busPolyline != null){ 
       busPolyline.setMap(null); 
    }
	   if(walkPolyline != null){ 
       walkPolyline.setMap(null); 
    }
	   if(carPolyline != null){ 
       carPolyline.setMap(null); 
    }
    if(extra_line1 != null){ 
       extra_line1.setMap(null); 
    }
	   if(extra_line2 != null){
       extra_line2.setMap(null); 
    }
	    //起点到路线的起点 路线的终点到终点 绘制无道路部分 
	    var extra_path1 = new Array(); 
	    extra_path1.push(start_xy); 
	    extra_path1.push(steps[0].path[0]); 
	    extra_line1 = new AMap.Polyline({ 
	        map: mapObj, 
	        path: extra_path1, 
	        strokeColor: "#9400D3", 
	        strokeOpacity: 0.7, 
	        strokeWeight: 4, 
	        strokeStyle: "dashed", 
	        strokeDasharray: [10, 5] 
	    }); 
	   
	    var extra_path2 = new Array(); 
	    var path_xy = steps[(steps.length-1)].path; 
	    extra_path2.push(end_xy); 
	    extra_path2.push(path_xy[(path_xy.length-1)]); 
	    extra_line2 = new AMap.Polyline({ 
	        map: mapObj, 
	        path: extra_path2, 
	        strokeColor: "#9400D3", 
	        strokeOpacity: 0.7, 
	        strokeWeight: 4, 
	        strokeStyle: "dashed", 
	        strokeDasharray: [10, 5] 
	    }); 
	       
	  var drawpath = new Array();
		for(var s=0; s<steps.length; s++) {
		    var plength = steps[s].path.length;
		    for (var p=0; p<plength; p++) {
		        drawpath.push(steps[s].path[p]);
		    }
		}
		carPolyline = new AMap.Polyline({
			map: mapObj,
			path: drawpath,
			strokeColor: "#9400D3",
			strokeOpacity: 0.7,
			strokeWeight: 4,
			strokeDasharray: [10, 5]
		});
		mapObj.setFitView(); 
	} 
	
	
	/*---------------------------------------------驾车导航 END-----------------------------------------------------*/
	
	/*---------------------------------------------公交导航 START-----------------------------------------------------*/
	/*
	 * 调用公交换乘服务
	 * param Object trans 公交换乘服务实例
	 */ 
	function bus_route() { 
	    var trans; 
		var start_xy = new AMap.LngLat($("#Longitude").val(),$("#Latitude").val());
			  end_xy = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
	    //加载公交换乘插件 
	    mapObj.plugin(["AMap.Transfer"], function() {       
	        transOptions = { 
	            city : cityName,                   //公交城市 
	            policy: AMap.TransferPolicy.LEAST_TIME //乘车策略 
	        }; 
	        //构造公交换乘类 
	        trans = new AMap.Transfer (transOptions); 
	        //返回导航查询结果           
	        AMap.event.addListener(trans, "complete", busTransCallBack); 
	        //显示错误信息 
	        AMap.event.addListener(trans, "error", function(e) {alert(e.info);}); 
	        //根据起、终点坐标查询公交换乘路线 
	        trans.search(start_xy,end_xy);
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
		mapObj.clearMap(); 
	    var btCount       = data.count;  
	    var btPlans       = data.plans;  
	    var btOrigin      = data.origin; 
	    var btDestination = data.destination; 
	    var btTaxiCost    = data.taxi_cost; 
	    var startName     = ""; //可以使用地理编码解析起点和终点坐标 
	    var endName       = "";  
	    var BusArr        = []; 
	    var WalkArr       = []; 
	    var onbus         = new Array(); 
	    var onwalk        = new Array(); 
	    //结果输出用表格展现，输出表格头 
    	var resTableHeader = "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr><td width=\"150\" style=\" border-left:1px solid #fff; background:#e1e1e1;\">　乘车方案</td><td width=\"300\" style=\" border-left:1px solid #fff; background:#e1e1e1;\">　导航信息</td></tr>";    
	    //遍历每种换乘方案 
	    for (var i = 0; i < btPlans.length; i++) { 
	        var btDistance  = btPlans[i].distance; 
	        var btseg       = btPlans[i].segments; 
	        var lineNameArr = new Array(); 
	        var resLine     = ""; 
	        var naviInfo    = ''; 
	        var lineName; 
	        for(var j = 0; j < btseg.length; j++) { 
	            naviInfo += btseg[j].instruction + "<br/>"; 
	            if(btseg[j].transit_mode =="WALK") { 
	                if(i===0) { 
	                    WalkArr.push(btseg[j].transit.path); 
	                } 
	            } 
	            else { 
	                lineName = btseg[j].transit.lines[0].name; 
	                lineNameArr.push(lineName); 
	                if(i===0) { 
	                    BusArr.push(btseg[j].transit.path); 
	                } 
	            }            
	        } 
	        drawBuschangeLine(btOrigin,btDestination,BusArr,WalkArr); 
			//结果输出用表格展现，输出表格内容 
	        resLine = "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" 
	        + "<tr><td width=\"150\" class=\"change_blue\">"+ lineName +"</td><td width=\"300\" class=\"change_blue\" >" 
	        + Getdistance(btDistance) + "</td></tr>" + "<tr><td width=\"150\" class=\"change_blue\" ></td><td width=\"300\"><img src=\"http://webapi.amap.com/images/start.gif\" /> <b>起点</b> " + startName + "</td></tr>" + "<tr><td width=\"150\" class=\"change_blue\"></td><td width=\"300\" class=\"change_blue\">"+ naviInfo +"</td></tr>"+ "<tr><td width=\"150\" class=\"change_blue\" ></td><td width=\"300\"><img src=\"http://webapi.amap.com/images/end.gif\" /> <b>终点</b> " + endName + "</td></tr>"; 
	        btContent.push(resLine); 
	     }
		resultStr = btContent.join(""); 
     	//写到result这个div 
     	$(".walk-message-box").hide();
        $(".message-box").show();
        $(".down-arrow .icon2").removeClass('icon2').addClass('icon');
        $(".down-arrow .subway-icon").removeClass('icon').addClass('icon2');
        document.getElementById("navText").innerHTML = resultStr; 
        $("#iCenter").css("height","65%");
        $('.footer-icon .icon').hide();
    	$('.oc-icon').removeClass('close').addClass('open');
	    //取出需要加换乘、步行图标的位置，这里仅画出第一个换乘方案 
	    var sinseg = btPlans[0].segments; 
	    for(var a in sinseg) { 
	        if(sinseg[a].transit_mode =="WALK") { 
	            onwalk.push(sinseg[a].transit.origin); 
	        } 
	        else { 
	            onbus.push(sinseg[a].transit.on_station.location); 
	        } 
	    } 
	    //addMarker(); 
	    addMarkerBus(onbus); 
	    mapObj.setFitView();     
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
		function drawBuschangeLine(startPot,endPot,BusArr,WalkArr) { 
		    //自定义起点，终点图标 
		     sicon = new AMap.Icon({   
		        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",   
		        size: new AMap.Size(44,44),   
		        imageOffset: new AMap.Pixel(-334, -180)   
		    });  
		     eicon = new AMap.Icon({   
		        image: "http://developer.amap.com/wp-content/uploads/2014/06/poi.png",   
		        size: new AMap.Size(44,44),   
		        imageOffset: new AMap.Pixel(-334, -134)   
		    });  
		    
		    //绘制起点，终点 
		    
		    startmarker = new AMap.Marker({ 
		        map:mapObj, 
		        position:new AMap.LngLat(startPot.lng,startPot.lat), //基点位置 
		        icon:sicon, //复杂图标 
		        offset:{x:-16,y:-34} //相对于基点的位置 
		    }); 
		    
		    
		    endmarker = new AMap.Marker({ 
		        map:mapObj, 
		        position:new AMap.LngLat(endPot.lng,endPot.lat), //基点位置 
		        icon:eicon, //复杂图标 
		        offset:{x:-16,y:-34} //相对于基点的位置 
		    }); 
		    
		    //消除其它导航路线
	    if(carPolyline != null){ 
	        carPolyline.setMap(null); 
	    }
	    if(walkPolyline != null){ 
	        walkPolyline.setMap(null); 
	    }
	    if(busPolyline != null){ 
	        busPolyline.setMap(null); 
	    }
	    if(extra_line1 != null){ 
	        extra_line1.setMap(null); 
	    }
	    if(extra_line2 != null){ 
	        extra_line2.setMap(null); 
	    }
		    //绘制乘车的路线 
		    for(var j in BusArr) { 
		        busPolyline = new AMap.Polyline({ 
		            map:mapObj, 
		            path:BusArr[j], 
		            strokeColor:"#005cb5",//线颜色 
		            strokeOpacity:0.8,//线透明度 
		            strokeWeight:6//线宽 
		        }); 
		    } 
		    //绘制步行的路线 
		    for (var i in WalkArr) { 
		        walkPolyline = new AMap.Polyline({ 
		            map:mapObj, 
		            path:WalkArr[i], 
		            strokeColor : "#6EB034", //线颜色 
		            strokeOpacity : 0.6, //线透明度 
		            strokeWeight : 6//线宽 
		        }); 
		    } 
		       
		} 
		function addMarkerBus(busmar) { 
		    for (var i = 0; i < busmar.length; i++) { 
		        var busmarker = new AMap.Marker({ 
		            icon : new AMap.Icon({ 
		                image: "http://developer.amap.com/wp-content/uploads/2014/06/busroute.png", 
		                size: new AMap.Size(20, 20), 
		                imageOffset: new AMap.Pixel(-33, -3) 
		            }), 
		            position : busmar[i], 
		            offset : { 
		                x : -25, 
		                y : -25 
		            }, 
		            map:mapObj 
		        }); 
		    } 
		}
        /*---------------------------------------------公交导航 END-----------------------------------------------------*/
        	
		/*---------------------------------------------步行导航 START-----------------------------------------------------*/

		//步行导航
		function walking_route() {
			//起、终点
			var start_xy = new AMap.LngLat($("#Longitude").val(),$("#Latitude").val());
			      end_xy = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
		    var MWalk;
		    mapObj.plugin(["AMap.Walking"], function() {        
		        MWalk = new AMap.Walking(); //构造路线导航类 
		        AMap.event.addListener(MWalk, "complete", walk_routeCallBack); //返回导航查询结果
		        MWalk.search(start_xy, end_xy); //根据起终点坐标规划步行路线
		    });
		}
		//导航结果展示
		function walk_routeCallBack(data) {
			mapObj.clearMap();
		    var routeS = data.routes;
		        if (routeS.length <= 0) {
		        } 
		        else { 
		            route_text="";
		            var step_text="";
		            for(var v =0; v< routeS.length;v++){
		                //步行导航路段数
		                steps = routeS[v].steps;
		                var route_count = steps.length;
		                //步行距离（米）
		                var distance = routeS[v].distance;
             //拼接输出html 
             for(var i=0 ;i< steps.length;i++) {
               route_text += "<tr><td align=\"left\" onMouseover=\"walkingDrawSeg('" + i + "')\">" + i +"." +steps[i].instruction  + "</td></tr>"; 
							step_text += "<input type=\"hidden\" id=\"walkStep" + i +"\" value='" + steps[i].instruction + "'/>";
             }
		            }
		            
           //输出步行路线指示
           route_text = "<table cellspacing=\"5 px\" ><tr><td><img src=\"http://code.mapabc.com/images/start.gif\" />  当前位置</td></tr>" + route_text + "<tr><td><img src=\"http://code.mapabc.com/images/end.gif\" />  "+storeName+"</td></tr></table>";
           route_text2 = steps[0].instruction;
					$(".message-box").hide();
			        $(".walk-message-box").show();
			        $(".down-arrow .icon2").removeClass('icon2').addClass('icon');
			        $(".down-arrow .walk-icon").removeClass('icon').addClass('icon2');
			        $("#navText").html(step_text);
			        $("#walkNavText").html(route_text2);
			        $("#curStepTxt").html('1');
			        $("#totalStepTxt").html(route_count);
			        $("#curStep").val(0);
			        $("#totalStep").val(route_count);
			        
			        $("#iCenter").css("height","65%");
			        $('.footer-icon .icon').hide();
			        $('#oc-icon').hide();
    				//$('.oc-icon').removeClass('close').addClass('open');
			        //addMarker();
		            walkingDrawLine();
		            walkingDrawSeg(0);
		        }
		    }
		//绘制步行导航路线
		function walkingDrawLine() {
			var start_xy = new AMap.LngLat($("#Longitude").val(),$("#Latitude").val());
			  end_xy = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
		    //起点、终点图标
		    var sicon = new AMap.Icon({
		        image: "http://api.amap.com/Public/images/js/poi.png",
		        size:new AMap.Size(44,44),
		        imageOffset: new AMap.Pixel(-334, -180)
		    });
            var eicon = new AMap.Icon({
                image: "http://api.amap.com/Public/images/js/poi.png",
                size:new AMap.Size(44,44),
                imageOffset: new AMap.Pixel(-334, -134)
            });
		    
	       startmarker = new AMap.Marker({
		        icon : sicon, //复杂图标
		        visible : true, 
		        position : start_xy,
		        map:mapObj,
		        offset : {
		            x : -16,
		            y : -40
		        }
	    	});
		
        
            endmarker = new AMap.Marker({
                icon : eicon, //复杂图标
                visible : true,
                position : end_xy,
                map:mapObj,
                offset : {
                    x : -16,
                    y : -40
                }
            });
            
			
		    //消除其它导航线
	    if(carPolyline != null){ 
	       carPolyline.setMap(null); 
	    }
	    if(busPolyline != null){ 
	       busPolyline.setMap(null); 
	    }
		   if(walkPolyline != null){ 
	       walkPolyline.setMap(null); 
	    }
	    if(extra_line1 != null){ 
	       extra_line1.setMap(null); 
	    }
		   if(extra_line2 != null){
	       extra_line2.setMap(null); 
	    }
			
		    //起点到路线的起点 路线的终点到终点 绘制无道路部分
		    var extra_path1 = new Array();
		    extra_path1.push(start_xy);
		    extra_path1.push(steps[0].path[0]);
		    extra_line1 = new AMap.Polyline({
		        map: mapObj,
		        path: extra_path1,
		        strokeColor: "#9400D3",
		        strokeOpacity: 0.7,
		        strokeWeight: 4,
		        strokeStyle: "dashed",
		        strokeDasharray: [10, 5]
		    });
		 
		    var extra_path2 = new Array();
		    var path_xy = steps[(steps.length-1)].path;
		    extra_path2.push(end_xy);
		    extra_path2.push(path_xy[(path_xy.length-1)]);
		    extra_line2 = new AMap.Polyline({
		        map: mapObj,
		        path: extra_path2,
		        strokeColor: "#9400D3",
		        strokeOpacity: 0.7,
		        strokeWeight: 4,
		        strokeStyle: "dashed",
		        strokeDasharray: [10, 5]
		    });
		 
		    var drawpath = new Array(); 
		    for(var s=0; s<steps.length; s++) {
		        var plength = steps[s].path.length;
		        for (var p=0; p<plength; p++) {
		            drawpath.push(steps[s].path[p]);
		        }
		    }
		    walkPolyline = new AMap.Polyline({
		        map: mapObj,
		        path: drawpath,
		        strokeColor: "#99CC00",
		        strokeOpacity: 0.7,
		        strokeWeight: 4,
		        strokeDasharray: [10, 5]
		    });
		    mapObj.setFitView();
		}  
		//绘制步行导航路段
		function walkingDrawSeg(num) {
	    var drawpath1 = new Array();
	    drawpath1 = steps[num].path;
			/*if(walkStepPolyline != null) {
	        walkStepPolyline.setMap(null);
	    }*/
	    walkStepPolyline = new AMap.Polyline({
	            map: mapObj,
	            path: drawpath1,
	            strokeColor: "#FF3030",
	            strokeOpacity: 0.9,
	            strokeWeight: 4,
	            strokeDasharray: [10, 5]
	    });
	 
	    mapObj.setFitView(walkStepPolyline);
		}
    /*---------------------------------------------步行导航 END-------------------------------------------------------*/
    	
    	
	/*---------------------------------------------周边搜索 START-----------------------------------------------------*/    	
	
		//周边检索函数     
	    //地点查询函数
	    function placeSearch(placeType) {
	        var MSearch;
	        var cpoint = new AMap.LngLat(gaode_x,gaode_y); //目的地坐标
	        //加载服务插件，实例化地点查询类 
	        mapObj.plugin(["AMap.PlaceSearch"], function() {
	            MSearch = new AMap.PlaceSearch({
	                city: cityName
	            });
	            //查询成功时的回调函数
	            AMap.event.addListener(MSearch, "complete", placeSearch_CallBack);
	            //周边搜索
	            MSearch.searchNearBy(placeType, cpoint, 500);
	        });
	    }
	    //查询结果的marker和infowindow
	    function placeAddmarker(i, d) {
	        var lngX = d.location.getLng();
	        var latY = d.location.getLat();
	        var markerOption = {
	            map:mapObj,
	            icon:"http://webapi.amap.com/images/" + (i + 1) + ".png",
	            position:new AMap.LngLat(lngX, latY)
	        };
	        var mar = new AMap.Marker(markerOption);
	        localMaker.push(new AMap.LngLat(lngX, latY));
	     
	        var infoWindow = new AMap.InfoWindow({
	            content:"<h3><font color=\"#00a6ac\">  " + (i + 1) + "." + d.name + "</h3></font>" + TipContents(d.type, d.address, d.tel),
	            size:new AMap.Size(220, 0),
	            autoMove:true,
	            offset:{x:0, y:-30}
	        });
	        windowsArr.push(infoWindow);
	       
	        var aa = function (e) {infoWindow.open(mapObj, mar.getPosition());};
	        AMap.event.addListener(mar, "click", aa);
	    }
	    //回调函数
	    function placeSearch_CallBack(data) {
			mapObj.clearMap();
	        var resultStr = "";
	        var poiArr = data.poiList.pois;
	        var resultCount = data.poiList.pois.length;

		    windowsArr = new Array();
		    localMaker = new Array();

	        for (var i = 0; i < data.poiList.pois.length; i++) {
	            placeAddmarker(i, poiArr[i]);
	        }
	        addMarker();
	        mapObj.setFitView();
	    }
	    function TipContents(type, address, tel) {  //信息窗体内容
	        if (type == "" || type == "undefined" || type == null || type == " undefined" || typeof type == "undefined") {
	            type = "暂无";
	        }
	        if (address == "" || address == "undefined" || address == null || address == " undefined" || typeof address == "undefined") {
	            address = "暂无";
	        }
	        if (tel == "" || tel == "undefined" || tel == null || tel == " undefined" || typeof address == "tel") {
	            tel = "暂无";
	        }
	        var str = "  地址：" + address + "<br />  电话：" + tel + " <br />  类型：" + type;
	        return str;
	    }
	    //根据数组id打开搜索结果点tip
	    function openMarkerTipById1(pointid, thiss) { 
	        thiss.style.background = '#CAE1FF';
	        windowsArr[pointid].open(mapObj, localMaker[pointid]);
	    }
	    //鼠标移开后点样式恢复
	    function onmouseout_MarkerStyle(pointid, thiss) {
	        thiss.style.background = "";
	    }

	
	
	/*---------------------------------------------周边搜索 END-------------------------------------------------------*/    	
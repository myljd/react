/**
 * 格式编辑处理
 * 
 * Version: 1.0
 * 
 * Create: Kevin.Lai
 * Date: 2015/8/7
 */

var Constants = require('../constants/AppConstants');

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var PI = Math.PI;
var EARTH_RADIUS = 6378137.0;

function getRad(d){
    return d*PI/180.0;
}

function isEmpty(obj) {

	if (obj == null || obj == '') {
		return true;
	}

	if (typeof(obj) == 'string') {
		return false;
	}
		

	for (var key in obj) {
		return false;
	}
	return true;
}

function getDistanceRange(lng1, lat1, lng2, lat2) {
	var radLat1 = getRad(lat1); 
	var radLat2 = getRad(lat2);

	var a = radLat1 - radLat2;
	var b = getRad(lng1) - getRad(lng2);

	var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + 
	    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2))); 
	s = s*EARTH_RADIUS;
	s = Math.round(s*10000)/10000.0;
    s = parseInt(s);

    return s;
}

module.exports = {

	/**
	 * 解析美食商店数据
	 */
	parseFoodString: function(foodDatas, uLocation) {

		console.log('FormatUtil parseFoodString');

		// {"data":[
		// 	{"ctpic":"http://ws.cnkly.com/SmartGuide/YCtPic/2015-09-29/IMG_20150929_101712.jpg",
		// 	 "ctid":"12",
		// 	 "ctpname":"伊多汉堡屋",
		// 	 "cttype":"西式餐厅",
		// 	 "ctqy":"东部",
		// 	 "ctSell":"快餐",
		// 	 "ctlocation":"120.004054|31.824213",
		// 	 "url":"http://dpins.breadtech.cn/#/map_nav_walk_result?lng_1=120.004054&lat_1=31.824213&back_url='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3610d458218f003&redirect_uri=http://ws.cnkly.com/ssg/canyin/ctinfo?ctid=12&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect'"},
		// 	{"ctpic":"http://ws.cnkly.com/SmartGuide/YCtPic/2015-09-29/5146511.jpg",
		// 	 "ctid":"14",
		// 	 "ctpname":"罗浮欢乐餐厅",
		// 	 "cttype":"西式餐厅",
		// 	 "ctqy":"西部",
		// 	 "ctSell":"西餐",
		// 	 "ctlocation":"120.00267|31.822631",
		// 	 "url":"http://dpins.breadtech.cn/#/map_nav_walk_result?lng_1=120.00267&lat_1=31.822631&back_url='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3610d458218f003&redirect_uri=http://ws.cnkly.com/ssg/canyin/ctinfo?ctid=14&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect'"}
		// ]}

		// var projects = [];
		// var project1 = new Object();
		// project1._id = 'food12';
		// project1.category = Constants.Category.FOOD;
		// project1.name = '伊多汉堡屋';

		// project1.location = ['120.004054', '31.824213'];
		// project1.location.distance = '距离获取中';
		// if (!isEmpty(uLocation)) {
		// 	project1.location.distance = getDistanceRange(uLocation.lng, uLocation.lat, project1.location[0], project1.location[1]);
		// }

		// project1.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3610d458218f003&redirect_uri=http://ws.cnkly.com/ssg/canyin/ctinfo?ctid=12&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
		// project1.thumbnail = "http://ws.cnkly.com/SmartGuide/YCtPic/2015-09-29/IMG_20150929_101712.jpg";
		// project1.queue = {
		// 	monitored: 0
		// }
		// projects.push(project1);

		// var project2 = new Object();
		// project2._id = 'food14';
		// project2.category = Constants.Category.FOOD;
		// project2.name = '罗浮欢乐餐厅';

		// project2.location = ['120.00267', '31.822631'];
		// project2.location.distance = '距离获取中';
		// if (!isEmpty(uLocation)) {
		// 	project2.location.distance = getDistanceRange(uLocation.lng, uLocation.lat, project2.location[0], project2.location[1]);
		// }

		// project2.url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd3610d458218f003&redirect_uri=http://ws.cnkly.com/ssg/canyin/ctinfo?ctid=14&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
		// project2.thumbnail = "http://ws.cnkly.com/SmartGuide/YCtPic/2015-09-29/5146511.jpg";
		// project2.queue = {
		// 	monitored: 0
		// }
		// projects.push(project2);

		var projects = [];
		for (var key in foodDatas) {

			var food = foodDatas[key];
			var project = new Object();

			project._id = 'food' + food.ctid;
			project.category = Constants.Category.FOOD;
			project.name = food.ctpname;
			project.location = food.ctlocation.split('|');
			project.location.distance = '距离获取中';
			if (!isEmpty(uLocation)) {
				project.location.distance = getDistanceRange(uLocation.lng, uLocation.lat, project.location[0], project.location[1]);
			}
			
			var url = food.url;
			var index = url.indexOf('https://open.weixin');
			url = url.substr(index);
			console.log('url = ' + url);
			project.url = url;

			project.thumbnail = food.ctpic;
			project.queue = {
				monitored: 0
			}

			projects.push(project);
		}

		console.log(projects);
		return projects;
	},

	getTitle: function(url, query) {

		if (!url) {
			return '';
		}

		switch (url) {

		case Constants.Url.FAVORITE:
			return '我的收藏';
		case Constants.Url.NEARBY:
			return '我的附近';
		case Constants.Url.PLAN:
			return '游玩攻略';
		case Constants.Url.DISTRICT:

			if (project) {
				return project.name;
			}
			else {
				return '区域详情';
			}

		default:
			return '智慧导游';
		}
	},

	getDistanceRange: function(lng1, lat1, lng2, lat2) {

		return getDistanceRange(lng1, lat1, lng2, lat2);
	},

	getDistanceTitle: function(distance) {

		if (!distance) {
			return '距离获取中';
		}

	    if (distance < 50) {
	    	return '50米以内';
	    }
	    else if (distance < 100) {
	    	return '100米以内';
	    }
	    else if (distance < 200) {
	    	return '200米以内';
	    }
	    else if (distance < 500) {
	    	return '500米以内';
	    }
	    else if (distance < 1000) {
	    	return '1公里以内';
	    }
	    else if (distance < 3000) {
	    	return '3公里以内';
	    }
	    else {
	    	return '5公里以外';
	    }
	},

	/**
	 * 取得格式化时间字符串
	 */
	getFormatQueueTime: function(minutes) {

		var hour = Math.floor(minutes / 60);
		var minute = minutes % 60;

		if (hour == 0) {
			return minute + '分钟';
		}
		else {
			return hour + '小时' + minute + '分钟';
		}
	
	},

	/**
	 * 取得日期时间
	 */
	getFormatDateTime: function(milseconds) {

		console.log(milseconds);

		var d = new Date();
		if (milseconds) {
			d.setTime(milseconds);	
		}
		return d.Format('yyyy-MM-dd hh:mm:ss');
	},

	/**
	 * 判断是否为空
	 */
	isEmpty: function(obj) {
		return isEmpty(obj);
	}
}
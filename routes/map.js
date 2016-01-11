var mongo = require('mongodb');
var db = require('../configs/DAO');
var moment = require('moment');
var search_record = db.get('search_record');
var project_keyword = db.get('project_keyword');
var nav_keyword = db.get('nav_keyword');
var footer = db.get('footer');
var project = db.get('project');

var result = {
    'code': '',
    'action': '',
    'success': '',
    'message': '',
    'data': ''
};



//根据id获取项目详情
exports.getProjectInfo = function(req, res) {
    console.log(req.body.id);
    project.findOne({_id:parseInt(req.body.id)}, function(e, project) {
        if (project) {
            // console.log(project);
            result.code = 200;
            result.action = 'getProjectInfo';
            result.success = true;
            result.message = '根据id获取项目详情';
            result.data = project;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

//获取所有项目数据
exports.getAllProject = function(req, res) {
    project.find({}, function(e, project) {
        if (project) {
            result.code = 200;
            result.action = 'getAllProject';
            result.success = true;
            result.message = '获取所有项目数据';
            result.data = project;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

//获取搜索关键字
exports.getSearchKeyword = function(req, res) {
    project_keyword.find({}, {}, function(e, keyword) {
        if (keyword) {
            result.code = 200;
            result.action = 'getSearchKeyword';
            result.success = true;
            result.message = '获取搜索关键字';
            result.data = keyword;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.getSearchRecord = function(req, res) {
    search_record.find({}, {}, function(e, record) {
        if (record) {
            result.code = 200;
            result.action = 'getSearchRecord';
            result.success = true;
            result.message = '查询所有菜品活动信息';
            result.data = record;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.deleteSearchRecord = function(req, res) {
    console.log("deleteSearchRecord",parseInt(req.body.id));
    search_record.remove({
        user_id: parseInt(req.body.id)
    }, function(e, record) {
        if (record) {
            result.code = 200;
            result.action = 'deleteSearchRecord';
            result.success = true;
            result.message = '查询所有菜品活动信息';
            result.data = record;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.saveSearchRecord = function(req, res) {
    console.log("saveSearchRecord",parseInt(req.body.id));
    var now = moment();
    var nowTime = now.format('YYYY-MM-DD HH:mm:ss');
    search_record.insert({
        user_id: parseInt(req.body.id),
        text: req.body.text,
        city_code: req.body.cityCode,
        update_time: nowTime
    }, function(e, record) {
        if (record) {
            result.code = 200;
            result.action = 'saveSearchRecord';
            result.success = true;
            result.message = '保存搜索纪录';
            result.data = record;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.getAllNavRecord = function(req, res) {
    console.log("getAllNavRecord11",req.query.id);
    nav_keyword.find({user_id: req.query.id},{sort: {
            update_time: -1
        }}, function(e, record) {
        if (record) {
            result.code = 200;
            result.action = 'getAllNavRecord';
            result.success = true;
            result.message = '查询所有导航纪录';
            result.data = record;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.deleteNavRecord = function(req, res) {
    console.log(111);
    nav_keyword.remove({
        user_id: req.body.id
    }, function(e, record) {

            result.code = 200;
            result.action = 'deleteNavRecord';
            result.success = true;
            result.message = '删除导航纪录';
            result.data = record;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        
    });
};

exports.saveNavRecord = function(req, res) {
    var now = moment();
    var nowTime = now.format('YYYY-MM-DD HH:mm:ss');
    nav_keyword.remove({
            user_id: req.body.id,
            text_start: req.body.text_start,
            text_end: req.body.text_end
        }, function(e, record) {
            nav_keyword.insert({
                user_id: req.body.id,
                text_start: req.body.text_start,
                lng_start: req.body.lng_start,
                lat_start: req.body.lat_start,
                cityCode_start: req.body.cityCode_start,
                text_end: req.body.text_end,
                lng_end: req.body.lng_end,
                lat_end: req.body.lat_end,
                cityCode_end: req.body.cityCode_end,
                update_time: nowTime
            }, function(e, record) {
                if (record) {
                    result.code = 200;
                    result.action = 'saveNavRecord';
                    result.success = true;
                    result.message = '保存导航纪录';
                    result.data = record;
                    res.header("Access-Control-Allow-Origin", "*");
                    res.jsonp(result);
                    result.data = null;
                }
            });
        });
        
};


exports.getFooterById = function(req, res) {
    console.log("getFooterById",req.query.id);
    footer.find({user_id: req.query.id}, {
        sort: {
            update_time: -1
        }
    }, function(e, foot) {
        if (foot) {
            result.code = 200;
            result.action = 'getFooterById';
            result.success = true;
            result.message = '查询所有足迹信息';
            result.data = foot;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

exports.upFooterToServer = function(req, res) {
    var footList = req.body.foot_data.split("|");
    var lngList = new Array();
    var latList = new Array();
    var timeList = new Array();
    console.log(footList);
    for (var i = 0; i < footList.length; i++) {
        var list = footList[i].split(",");
        lngList.push(list[0]);
        latList.push(list[1]);
        timeList.push(list[2]);
    };
    
    project.find({
        category: '1'
    }, function(e, project) {
        if (project) {
            // console.log(project);
            // for (var i = 0; i < timeList.length; i++) {
            //     footer.insert({user_id:req.body.id,update_time: timeList[i], project_list: [new mongo.DBRef("project", project[i]._id)]});
            // };
            var projectHold = project;
            var upFooter = new Array();
            for (var i = 0; i < lngList.length; i++) {
                for (var j = 0; j < projectHold.length; j++) {
                    
                        var dis = getGreatCircleDistance(latList[i], lngList[i], projectHold[j].location[1], projectHold[j].location[0]);
                        console.log("i:j:", i, j, dis, latList[i], lngList[i], projectHold[j].location[1], projectHold[j].location[0]);
                        if (dis <= projectHold[j].radius) {
                            console.log("insert:", req.body.id,projectHold[j].name, projectHold[j].parent_id);
                            
                            footer.insert({
                                user_id: req.body.id,
                                update_time: timeList[i],
                                lng: projectHold[j].location[0],
                                lat: projectHold[j].location[1],
                                project_name: projectHold[j].name,
                                parent_id: projectHold[j].parent_id
                            });
                            projectHold.splice(j, 1);
                            break;
                        }
                }
            }

            result.code = 200;
            result.action = 'upFooterToServer';
            result.success = true;
            result.message = '足迹上传服务器';
            result.data = project;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
    });
};

var EARTH_RADIUS = 6378137.0; //单位M
var PI = Math.PI;

function getRad(d) {
    return d * PI / 180.0;
}

function getGreatCircleDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);

    var a = radLat1 - radLat2;
    var b = getRad(lng1) - getRad(lng2);

    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000.0;

    return s;
}
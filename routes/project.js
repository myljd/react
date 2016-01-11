/**
 * 项目相关查询处理
 * 
 * Version: 1.0
 * 
 * Created: Kevin.Lai
 * Date: 2015/8/13
 */

var co = require('co');
var thunkify = require('thunkify');

var db = require('../configs/DAO');
var projectCollection = db.get('project');
var newCollection = db.get('news');
var userComment = db.get('user_comment');
var projectKeywordCollection = db.get('project_keyword');


var CATEGORY_FACILITY = 1;
var CATEGORY_DISTRICT = 0;
var PROJECT_UNPUBLISHED = "0";
var PROJECT_PUBLISHED = "1";

var PI = Math.PI;
var EARTH_RADIUS = 6378137.0;

var result = {
    'code': '',
    'action': '',
    'success': '',
    'message': '',
    'data': ''
};

function queryNearbyProjectGroupFn(lng, lat, callback) {

    projectCollection.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(lng),
                            parseFloat(lat)
                        ]
                    }
                }
            },
            published: PROJECT_PUBLISHED,
        },
        function(err, projects) {
            callback(null, projects);
        }
    );
}
var queryNearbyProjectGroup = thunkify(queryNearbyProjectGroupFn);

function queryNearbyProjectGroupByCategoryFn(lng, lat, category, callback) {

    projectCollection.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(lng),
                            parseFloat(lat)
                        ]
                    }
                }
            },
            category: category,
            published: PROJECT_PUBLISHED,
        },
        function(err, projects) {
            callback(null, projects);
        }
    );
}
var queryNearbyProjectGroupByCategory = thunkify(queryNearbyProjectGroupByCategoryFn);

function queryProjectGroupByCategoryFn(category, callback) {

    projectCollection.find({
            category: category,
            published: PROJECT_PUBLISHED,
        },
        function(err, projects) {
            callback(null, projects);
        }
    );
}
var queryProjectGroupByCategory = thunkify(queryProjectGroupByCategoryFn);

/**
 * 查询最近的项目名称
 */
exports.getNearestProjectName = function(req, res) {

    co(function*() {

        try {

            console.log('getNearbyProjectLocationGroup start');

            var lng = req.body.lng;
            var lat = req.body.lat;
            console.log(lng);
            console.log(lat);

            // 有定位信息，按距离远近查询所有项目
            if (lng && lat) {

                var projects = yield queryNearbyProjectGroup(lng, lat);

                var name = '';
                if (projects.length > 0) {
                    name = projects[0].name;
                }

                result.code = 200;
                result.action = 'getNearestProjectName';
                result.success = true;
                result.message = '查询我的就近项目名称';
                result.data = name;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            } else {
                result.code = 200;
                result.action = 'getNearestProjectName';
                result.success = false;
                result.message = '查询我的就近项目参数错误';
                result.data = null;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
            }

        } catch (err) {
            console.log(err);
        }
    });
}

/**
 * 查询我的附近项目列表
 */
exports.getNearbyProjectLocationGroup = function(req, res) {

    co(function*() {

        try {

            console.log('getNearbyProjectLocationGroup start');

            var lng = req.body.lng;
            var lat = req.body.lat;
            console.log(lng);
            console.log(lat);

            // 有定位信息，按距离远近查询所有项目
            if (lng && lat) {

                var projects = yield queryNearbyProjectGroup(lng, lat);

                // var data = new Array();
                // for (var key in projects) {

                //     var project = projects[key];
                //     data[key] =
                //         {
                //             _id: project._id,
                //             location: project.location,
                //         };
                // }

                result.code = 200;
                result.action = 'getNearbyProjectLocationGroup';
                result.success = true;
                result.message = '查询我的附近项目列表';
                result.data = projects;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            } else {
                result.code = 200;
                result.action = 'getNearbyProjectLocationGroup';
                result.success = false;
                result.message = '查询我的附近项目列表参数错误';
                result.data = null;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
            }

        } catch (err) {
            console.log(err);
        }
    });
}

/**
 * 提交项目详细信息
 */
exports.postProjectDetail = function(req, res) {
    console.log('method start');
    var project = req.body;
    console.log(project);

    project._id = parseInt(project._id)
    projectCollection.insert([project], function(e, r) {

        // console.log(r)
        if (e == null) {
            result.code = 200;
            result.action = 'postProjectDetail';
            result.success = true;
            result.message = '项目详细信息提交成功';
            res.json(result);
            result.data = null;
        } else {
            console.log(e)
        }
    });
}

/**
 *  发布项目
 */
exports.postUpdateProjectDetail = function(req, res) {
    console.log('method start');
    var _id = req.body._id;
    // console.log(_id);
    // var project =req.body;
    console.log(req.body);
    projectCollection.update({
            '_id': parseInt(_id)
        }, {
            $set: {
                'published': '1'
            }
        },
        function(e, projects) {
            if (e == null) {
                result.code = 200;
                result.action = 'postUpdateProjectDetail';
                result.success = true;
                result.message = '发布成功';
                result.data = projects;
                res.json(result);
                result.data = null;
            } else {
                console.log(e);
            }
        }
    )
}

/**
 *  修改区域
 */
exports.UpdateAreaDetail = function(req, res) {
    console.log('method start');
    var _id = req.body._id;
    // console.log(_id);
    var project = req.body;
    // console.log(req.body);
    projectCollection.update({
            '_id': parseInt(_id)
        }, {
            $set: {
                'category': req.body.category,
                'name': req.body.name,
                'published': req.body.published,
                'detail': req.body.detail,
                'location': req.body.location,
                'resources': req.body.resources
            }
        },
        function(e, projects) {

            if (e == null) {
                result.code = 200;
                result.action = 'UpdateAreaDetail';
                result.success = true;
                result.message = '保存成功';
                result.data = projects;
                res.json(result);
                result.data = null;
            } else {
                console.log(e);
            }
        }
    )
}


/**
 *  修改项目
 */
exports.UpdateProjectDetail = function(req, res) {
    console.log('method start');
    var _id = req.body._id;
    // console.log(_id);    
    projectCollection.update({
            '_id': parseInt(_id)
        }, {
            $set: {
                'parent_id': req.body.parent_id,
                'category': req.body.category,
                'name': req.body.name,
                'published': req.body.published,
                'thumbnail': req.body.thumbnail,
                'status': req.body.status,
                'detail': req.body.detail,
                'type': req.body.type,
                'queue': req.body.queue,
                'location': req.body.location,
                'resources': req.body.resources,
                'opening': req.body.opening,
                'radius': req.body.radius
            }
        },
        function(e, projects) {

            if (e == null) {
                result.code = 200;
                result.action = 'UpdateProjectDetail';
                result.success = true;
                result.message = '保存成功';
                result.data = projects;
                res.json(result);
                result.data = null;
            } else {
                console.log(e);
            }
        }
    )
}


exports.getProjectKeywordGroup = function(req, res) {

    projectKeywordCollection.find({},
        function(err, projects) {

            if (!err) {
                result.code = 200;
                result.action = 'getProjectKeywordGroup';
                result.success = true;
                result.message = '查询项目关键字列表';
                result.data = projects;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            } else {
                console.log(err);
            }
        }
    )
}

/**
 * 取得项目定义列表
 */
exports.getProjectDefGroup = function(req, res) {

    projectCollection.find({
            published: PROJECT_PUBLISHED
        }, {
            name: 1,
            category: 1,
        },
        function(err, projects) {
            if (!err) {
                result.code = 200;
                result.action = 'getProjectDefGroup';
                result.success = true;
                result.message = '查询项目定义列表';
                result.data = projects;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            } else {
                console.log(err);
            }
        }
    )
}

/**
 * 取得项目列表
 * 
 */
exports.getProjectGroup = function(req, res) {

    co(function*() {

        try {

            var projectId = req.body.project_id;
            var category = req.body.category;
            var lng = req.body.lng;
            var lat = req.body.lat;
            var tmp_arr = new Array();

            console.log('Project getProjectGroup');
            console.log(category);
            console.log('lng = ' + lng + ' lat = ' + lat);

            // 存在经纬度，按远近排序
            var projects = {};
            if (lng && lat) {
                projects = yield queryNearbyProjectGroupByCategory(lng, lat, category);
                console.log('lng....lat....projects', projects);
                for (var i = 0; i < projects.length; i++) {
                    // console.log( projects[i].resources.length-1)
                    if (projects[i].resources != null) {
                        for (var j = 0; j < projects[i].resources.length - 1; j++) {
                            for (var n = projects[i].resources.length - 1; n > 0; n--) {

                                if (parseInt(projects[i].resources[n].weight) < parseInt(projects[i].resources[n - 1].weight)) {
                                    tmp_arr = projects[i].resources[n - 1];
                                    projects[i].resources[n - 1] = projects[i].resources[n];
                                    projects[i].resources[n] = tmp_arr;

                                }
                            }
                        }
                    } else {
                        // console.log('err branch')
                    }
                }
            }
            // 取不到位置，默认排序
            else {
                projects = yield queryProjectGroupByCategory(category);
                // console.log(projects[projects.length-1].resources)
                for (var i = 0; i < projects.length; i++) {
                    // console.log( projects[i].resources.length-1)
                    if (projects[i].resources != null) {
                        for (var j = 0; j < projects[i].resources.length - 1; j++) {
                            for (var n = projects[i].resources.length - 1; n > 0; n--) {

                                if (parseInt(projects[i].resources[n].weight) < parseInt(projects[i].resources[n - 1].weight)) {
                                    tmp_arr = projects[i].resources[n - 1];
                                    projects[i].resources[n - 1] = projects[i].resources[n];
                                    projects[i].resources[n] = tmp_arr;

                                }
                            }
                        }
                    } else {
                        // console.log('err')
                    }


                }
                // console.log(projects[projects.length - 1].resources);
            }

            result.code = 200;
            result.action = 'getProjectGroup';
            result.success = true;
            result.message = '查询区域信息列表';
            result.data = projects;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;

        } catch (err) {
            console.log(err);
        }
    });
}

/**
 * 取得项目详细信息
 *
 */
exports.getProjectDetail = function(req, res) {
    // console.log(parseInt(req.body._id));
    var id = req.body._id;
    var tmp_arr = new Array();
    projectCollection.find({
            '_id': parseInt(id)
        },
        function(e, areaDetail) {
            if (areaDetail[0].resources != null) {
                for (var i = 0; i < areaDetail[0].resources.length - 1; i++) {
                    if (areaDetail[0].resources[i].weight > areaDetail[0].resources[i + 1].weight) {
                        tmp_arr = areaDetail[0].resources[i];
                        areaDetail[0].resources[i] = areaDetail[0].resources[i + 1];
                        areaDetail[0].resources[i + 1] = tmp_arr;
                    }
                }
            } else {
                // console.log('err getProjectDetail')
            }


            if (e == null) {
                // console.log(areaDetail[0].resources)
                result.code = 200;
                result.action = 'getProjectDetail';
                result.success = true;
                result.message = '查找区域成功';
                result.data = areaDetail[0];
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            } else {
                console.log(e);
            }
        }
    )

}
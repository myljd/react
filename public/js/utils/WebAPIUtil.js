/**
 * WebService接口调用处理
 * 
 * Version: 1.0
 * 
 * Create: Kevin.Lai
 * Date: 2015/8/7
 */

var $ = require('jQuery');
var AppDispatcher = require('../dispatcher/AppDispatcher');

var Constants = require('../constants/AppConstants');
var ActionTypes = Constants.ActionTypes;

var ProjectStore = require('../stores/ProjectStore');

// var Url = "http://dpins.breadtech.cn/";
var Url = "http://115.28.55.44:8001/";   // 实际环境地址
var INTERNAL_URL = Constants.Url.INTERNAL_URL;
// var Url = 'http://10.0.0.155:8001/';


module.exports = {

    /**
     * 执行ping动作
     */
    execPing: function() {

        var url = INTERNAL_URL

        $.ajax({
            url: url + '/app/getPing',
            type: 'GET',
            datatype: 'jsonp',
            timeout: 10000,
            success: function(result) {
                console.log(result);
                AppDispatcher.dispatch({
                    type: ActionTypes.INTERNAL_PING,
                    data: true
                });
            },
            error: function(e, text) {
                AppDispatcher.dispatch({
                    type: ActionTypes.INTERNAL_PING,
                    data: false
                });
            }
        });
        

        // setInterval(function() {

        //     var url = INTERNAL_URL

        //     $.ajax({
        //         url: url + '/app/getPing',
        //         type: 'GET',
        //         datatype: 'jsonp',
        //         timeout: 10000,
        //         success: function(result) {
        //             console.log(result);
        //             AppDispatcher.dispatch({
        //                 type: ActionTypes.INTERNAL_PING,
        //                 data: true
        //             });
        //         },
        //         error: function(e, text) {
        //             AppDispatcher.dispatch({
        //                 type: ActionTypes.INTERNAL_PING,
        //                 data: false
        //             });
        //         }
        //     });
        // }, 15000);
    },

    /**
     * 查询信息列表
     */
    queryNewsGroup: function() {

        $.ajax({
            type: 'get',
            url: Url + 'admin/getNoticeGroup',
            datatype: 'jsonp',
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_NEWS,
                    data: result.data
                });
            }
        })
    },

    /**
     * 获取所有项目信息
     */
    getAllProject: function() {
        // console.log('111');
        $.ajax({
            type: 'get',
            url: Url + 'map/getAllProject',
            datatype: 'jsonp',
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_ALL_PROJECT,
                    data: result
                });
            }
        })
    },
    /**
     * 上传足迹数据
     */
    upFooterToServer: function(id) {
        
        // localStorage.lng_foot = 120.004043;
        // localStorage.lat_foot = 31.824077;
        // localStorage.update_time = new Date().getTime();
        
        // if (localStorage.my_foot_data==null ) {
        //     localStorage.my_foot_data = localStorage.lng_foot + ',' + localStorage.lat_foot + ',' + localStorage.update_time;
        // } else {
        //     localStorage.my_foot_data += "|" + localStorage.lng_foot + ',' + localStorage.lat_foot + ',' + localStorage.update_time;
        // }
        console.log('id',id);
        // console.log(localStorage.my_foot_data);

        if (localStorage.my_foot_data != null && localStorage.my_foot_data != '') {
            $.ajax({
                type: 'post',
                url: Url + 'map/upFooterToServer',
                data: {
                    foot_data: localStorage.my_foot_data,
                    id: id
                },
                async: false,
                datatype: 'jsonp',
                success: function(result) {
                    if (result.success) {
                        localStorage.removeItem("foot_start_time");
                        localStorage.removeItem("foot_end_time");
                        localStorage.removeItem("foot_apart_time");
                        localStorage.removeItem("foot_apart_hold_time");
                        localStorage.removeItem("my_foot_data");
                    };
                }
            })
        }
    },

    /**
     * 根据用户open_id获取足迹
     */
    getSignature: function() {
        $.ajax({
            url: Url + 'wx/getSignature',
            type: 'post',
            dataType: 'json',
            data: {
                url: location.href.split('#')[0]
            }
        }).done(function(resp) {
            var r = resp;
            wx.config({
                appId: r.appid,
                // debug: true,
                timestamp: r.timestamp,
                nonceStr: r.nonceStr,
                signature: r.signature,
                jsApiList: [
                    'getLocation'
                ]
            });

            // 调用微信API
            wx.ready(function() {
                wx.getLocation({
		            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
		            success: function (res) {
		                localStorage.lat_mine = res.latitude; // 纬度，浮点数，范围为90 ~ -90
		                localStorage.lng_mine = res.longitude; // 经度，浮点数，范围为180 ~ -180。
		                AppDispatcher.dispatch({
	                        type: ActionTypes.POST_GET_WX
	                    });
		            },
		        });
            });

        });
    },

    /**
     * 根据用户open_id获取足迹
     */
    queryFootbById: function(id) {
        // console.log('111');
        $.ajax({
                type: 'get',
                url: Url + 'map/getFooterById',
                datatype: 'jsonp',
                data: {
                    id: id
                },
                success: function(result) {
                    // console.log('queryFootbById');
                    // console.log(result);
                    AppDispatcher.dispatch({
                        type: ActionTypes.QUERY_MAP_FOOT,
                        data: result
                    });
                }
            })
            // console.log('WebUtil queryFootbById');
    },

    /**
     * 获取支付宝用户信息
     */
    getAlipayUserInfo: function(code,appId) {
        // console.log('111');
        $.ajax({
                type: 'post',
                url: Url + 'alipay/getAlipayUserInfo',
                datatype: 'jsonp',
                data: {
                    code: code,
                    appId: appId
                },
                success: function(result) {
                    console.log('getAlipayUserInfo result',result);
                    if (result.data!=null) {
                        $.ajax({
                            type: 'post',
                            datatype: 'jsonp',
                            url: Url + 'app/getUser',
                            data: {
                                openid: result.data.user_id,
                                thumbnail: result.data.avatar,
                                name: result.data.user_id
                            },
                            success: function(result) {
                                console.log('WebUtil getAlipayUserInfo success');
                                console.log(result);
                                AppDispatcher.dispatch({
                                    type: ActionTypes.QUERY_USER,
                                    data: result.data
                                });
                            }
                        })
                    };

                    // this.queryUser(user);
                }
            })
    },

    /**
     * 获取用户导航纪录
     */
    getAllNavRecord: function(userId) {
        $.ajax({
            type: 'get',
            datatype: 'jsonp',
            url: Url + 'map/getAllNavRecord',
            data: {
                id: userId
            },
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_ALL_NAV_RECORD,
                    data: result
                });
            }
        })
    },

    /**
     * 保存用户导航纪录
     */
    saveNavRecord: function(userId) {
        var text_start = localStorage.text_start;
        if (localStorage.text_start=='我的位置') {
            text_start = localStorage.formattedAddress ;
        };
        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'map/saveNavRecord',
            data: {
                id: userId,
                text_start: text_start,
                lng_start: localStorage.lng_start,
                lat_start: localStorage.lat_start,
                cityCode_start: localStorage.cityCode_start,
                text_end: localStorage.text_end,
                lng_end: localStorage.lng_end,
                lat_end: localStorage.lat_end,
                cityCode_end: localStorage.cityCode_end
            },
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.SAVE_NAV_RECORD
                });
            }
        })
    },

    /**
     * 删除用户导航纪录
     */
    deleteNavRecord: function(id) {
        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'map/deleteNavRecord',
            data: {
                id: id
            },
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.DELETE_NAV_RECORD
                });
            }
        })
    },
    /**
     * 收藏项目
     */
    postFavoriteProject: function(userId, projectId) {

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'app/postFavorite',
            data: {
                userId: userId,
                projectId: projectId
            },
            success: function(result) {

                // console.log('postFavorite');
                // console.log(result);

                AppDispatcher.dispatch({
                    type: ActionTypes.POST_FAVORITE,
                    data: result
                });
            }
        });
    },

    /**
     * 发表评论
     */
    postComment: function(userId, projectId, content, rating) {

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'admin/postComment',
            data: {
                userId: userId,
                projectId: projectId,
                comment: content,
                rating: rating,
                type: '0'
            },
            success: function(result) {

                // console.log('postComment');
                // console.log(result);

                AppDispatcher.dispatch({
                    type: ActionTypes.POST_COMMENT,
                    data: result
                });
            }
        });
    },

    /**
     * 取得项目评论列表
     */
    queryCommentGroup: function(projectId) {

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'admin/getCommentGroup',
            data: {
                projectId: projectId
            },
            success: function(result) {


                // console.log(result.data);

                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_COMMENT_GROUP,
                    data: result.data,
                    projectId: projectId
                });
            }
        });
    },

    /**
     * 取得项目项目评论简要信息（评论数，第一条评论）
     */
    queryCommentBrief: function(projectId) {

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'app/getCommentBrief',
            data: {
                projectId: projectId
            },
            success: function(result) {

                console.debug(result.data);

                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_COMMENT_BRIEF,
                    data: result.data,
                    projectId: projectId
                });
            }
        });
    },

    /**
     * 取得项目详情（异步）
     * {基本、详情内容}
     */
    queryProjectDetailContent: function(projectId) {

        var projectData = {
            "id": projectId,
            "parent_id": "10",
            "category": "1",
            "name": "设施1",
            "published": "true",
            "thumbnail": "http://xxx",
            "rating": "4",
            "status": "0",
            "detail": {
                "content": "project content"
            }
        };

        setTimeout(function() {
            AppDispatcher.dispatch({
                type: ActionTypes.QUERY_PROJECT_DETAIL_CONTENT,
                data: projectData
            });
        }, 500);
    },

    /**
     * 取得项目搜索关键字列表
     */
    queryProjectKeywords: function() {

        $.ajax({
            type: 'get',
            datatype: 'jsonp',
            url: Url + 'app/getProjectKeywordGroup',
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_PROJECT_KEYWORDS,
                    data: result.data
                });
            }
        })

        console.log('WebUtil queryProjectKeywords');
    },

    /**
     * 取得项目定义列表
     */
    queryProjectDefGroup: function() {

        $.ajax({
            type: 'get',
            datatype: 'jsonp',
            url: Url + 'app/getProjectDefGroup',
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_PROJECT_DEF_GROUP,
                    data: result.data
                });
            }
        })

        console.log('WebUtil queryProjectDefGroup');
    },

    /**
     * 取得项目详情（异步）
     * {基本、多媒体、排队、评论、子项目}
     */
    queryProjectDetail: function(projectId) {

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'admin/getProjectDetail',
            data: {
                _id: projectId
            },
            success: function(result) {

                console.log('WebAPIUtil queryProjectDetail called');
                console.log('projectId = ' + projectId);
                console.log(result.data);

                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_PROJECT_DETAIL,
                    data: result.data
                });
            }
        })

    },

    /**
     * 取得项目排队信息
     * {基本、排队}
     */
    queryProjectQueue: function(projectId) {

        $.ajax({
            type: 'post',
            datatype: 'json',
            url: Url + '/v1/searchAllPeopleOfSchool',
            data: {
                _id: projectId
            },
            success: function(result) {
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_PROJECT_QUEUE,
                    data: result.data
                });
            }
        })
    },

    /**
     * 取得项目基本信息列表（设定type时，取得所有区域/游乐设施/公共设施的项目列表）
     * {基本}
     */
    queryProjectGroup: function(category, location) {

        console.info('WebAPIUtil queryProjectGroup category = ' + category);

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'admin/getProjectGroup',
            data: {
                category: category,
                lng: location.lng,
                lat: location.lat
            },

            success: function(result) {

                var actionType = ActionTypes.QUERY_PROJECT_GROUP_FACILITY;
                if (Constants.Category.DISTRICT == category) {
                    actionType = ActionTypes.QUERY_PROJECT_GROUP_DISTRICT;
                } else if (Constants.Category.PUBLIC == category) {
                    actionType = ActionTypes.QUERY_PROJECT_GROUP_PUBLIC;
                } else if (Constants.Category.FOOD == category) {
                    actionType = ActionTypes.QUERY_PROJECT_GROUP_FOOD;
                } else if (Constants.Category.BRANCH == category) {
                    actionType = ActionTypes.QUERY_PROJECT_GROUP_BRANCH;
                }

                console.info('WebAPIUtil queryProjectGroup actionType = ' + actionType);
                console.info(result.data);
                AppDispatcher.dispatch({
                    type: actionType,
                    data: result.data
                });
            }
        })
    },

    /**
     * 取得我的附近项目地理信息列表
     */
    queryNearbyProjectLocationGroup: function(lng, lat) {

        console.log('WebAPIUtil queryNearbyProjectLocationGroup start');

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'app/getNearbyProjectLocationGroup',
            data: {
                lng: lng,
                lat: lat
            },

            success: function(result) {

                console.log(result);
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_NEARBY_PROJECT_LOCATION_GROUP,
                    data: result.data
                });
            }
        })

        console.log('WebUtil queryNearbyProjectGroup');
    },

    /**
     * 取得我的收藏项目信息列表
     * {基本、排队}
     */
    queryFavoriteProjectGroup: function(userId) {

        console.debug('WebUtil queryFavoriteProjectGroup success');

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'app/getFavoriteProjectGroup',
            data: {
                userId: userId
            },

            success: function(result) {

                console.debug(result);
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_FAVORITE_PROJECT_GROUP,
                    data: result.data
                });
            }
        })
    },

    /**
     * 取得用户信息
     *   若不存在则插入
     */
    queryUser: function(user) {

        console.debug('WebAPIUtil queryUser');

        $.ajax({
            type: 'post',
            datatype: 'jsonp',
            url: Url + 'app/getUser',
            data: {
                openid: user.openid,
                thumbnail: user.thumbnail,
                name: user.name
            },

            success: function(result) {

                console.log('WebUtil queryUser success');
                console.log(result);
                AppDispatcher.dispatch({
                    type: ActionTypes.QUERY_USER,
                    data: result.data
                });
            }
        })
    }
}
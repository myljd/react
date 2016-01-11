var db = require('../configs/DAO');

var co = require('co');
var thunkify = require('thunkify');

var userCollection = db.get('user');
var userFavoriteCollection = db.get('user_favorite');

var result = {
	'code': '',
	'action': '',
	'success': '',
	'message': '',
	'data': ''
};

function queryFavoriteFn(userId, projectId, callback) {

    userFavoriteCollection.findOne(
        {
            user_id: userCollection.id(userId),
            project_id: parseInt(projectId)
        },
        function(err, favorite) {
            callback(null, favorite);
        }
    );
}
var queryFavorite = thunkify(queryFavoriteFn);

function insertFavoriteFn(userId, projectId, callback) {

    userFavoriteCollection.insert(
        {
            user_id: userCollection.id(userId),
            project_id: parseInt(projectId),
            insert_time: (new Date()).getTime(),
        },
        function(err, favorite) {
            callback(null, favorite);
        }
    );
}
var insertFavorite = thunkify(insertFavoriteFn);

function removeFavoriteFn(userId, projectId, callback) {

    userFavoriteCollection.remove(
        {
            user_id: userCollection.id(userId),
            project_id: parseInt(projectId)
        },
        function(err, favorite) {
            callback(null, favorite);
        }
    );
}
var removeFavorite = thunkify(removeFavoriteFn);


function queryFavoriteProjectGroupFn(userId, callback) {

    userFavoriteCollection.find(
        {
            user_id: userCollection.id(userId)
        },
        {
            sort: {
                insert_time: -1
            }
        },
        function(err, favorite) {
            callback(null, favorite);
        }
    );
}
var queryFavoriteProjectGroup = thunkify(queryFavoriteProjectGroupFn);

function queryUserFn(openid, callback) {

    userCollection.findOne(
        {
            'openid': openid
        },
        function(err, user) {
            callback(null, user);
        }
    );
}
var queryUser = thunkify(queryUserFn);


exports.postFavorite = function(req, res) {

    co(function*() {

        try {
            console.log('Users postFavorite params:');
            console.log(req.body);

            var userId = req.body.userId;
            var projectId = req.body.projectId;

            var favorite = yield queryFavorite(userId, projectId);

            console.log('Users postFavorite favorite:');
            console.log(favorite);

            // 如果不存在，则插入
            var message = '';
            if (!favorite) {
                console.log('Users postFavorite start to insert favorite');
                favorite = yield insertFavorite(userId, projectId);
                message = '收藏项目成功';
            }
            // 如果已存在，则删除
            else {
                console.log('Users postFavorite start to remove favorite')
                favorite = yield removeFavorite(userId, projectId);
                message = '取消收藏项目成功';
            }

            result.code = 200;
            result.action = 'postFavorite';
            result.success = true;
            result.message = message;
            result.data = favorite;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;

        }
        catch(err) {
            console.log(err);
        }
    });
};

exports.getPing = function(req, res) {

    result.code = 200;
    result.action = 'getPing';
    result.success = true;
    result.message = '内部网络PING成功';
    res.header("Access-Control-Allow-Origin", "*");
    res.jsonp(result);
};

/**
 * 取得用户的收藏列表
 */
exports.getFavoriteProjectGroup = function(req, res) {

    co(function*() {

        try {
            console.log('Users getFavoriteProjectGroup params:');
            console.log(req.body);

            var userId = req.body.userId;
            var favoriteProjectGroup = yield queryFavoriteProjectGroup(userId);

            console.log('Users getFavoriteProjectGroup result:');
            console.log(favoriteProjectGroup);

            result.code = 200;
            result.action = 'getFavoriteProjectGroup';
            result.success = true;
            result.message = '查找收藏项目成功';
            result.data = favoriteProjectGroup;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
        catch (err) {
            console.log(err);
        }
    });
};

/**
 * 取得用户信息
 */
exports.getUser = function(req, res) {

    co(function*() {

        try {
            console.log('Users getUser params:');
            console.log(req.body);

            var userDetail = req.body;
            var openid = req.body.openid;
            var user = yield queryUser(openid);

            console.log('Users getUser result:');
            console.log(user);

            // 查找成功，直接返回
            if (user) {
                result.code = 200;
                result.action = 'getUser';
                result.success = true;
                result.message = '查找用户成功';
                result.data = user;
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            }
            // 查找为空，直接插入
            else {
                userCollection.insert(
                    [userDetail],
                    function(err, user) {
                        result.code = 200;
                        result.action = 'getUser';
                        result.success = true;
                        result.message = '插入用户成功';
                        result.data = user;
                        res.header("Access-Control-Allow-Origin", "*");
                        res.jsonp(result);
                        result.data = null;
                    }
                )
            }

        }
        catch(err) {
            console.log(err);
        }
    });
};

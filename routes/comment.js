var co = require('co');
var thunkify = require('thunkify');

var db = require('../configs/DAO');
var projectCollection = db.get('project');
var userCommentCollection = db.get('user_comment');
var userCollection = db.get('user');
var userRatingCollection = db.get('user_rating');
var commentFilterCollection = db.get('filtering');

var users = require('./users');

var result = {
    'code': '',
    'action': '',
    'success': '',
    'message': '',
    'data': ''
};

var POST_UPDATE = '1';
var POST_INSERT = '0';
var POST_REMOVE = '2';

var COMMENT_NORMAL = '0';
var COMMENT_WARNING = '1';
var COMMENT_DELETE = '2';

function getUserCommentCountFn(projectId, callback) {

    userCommentCollection.count(
        {
            project_id: projectId,
            status: COMMENT_NORMAL,
        },
        function(err, cnt) {
            callback(null, cnt);
        }
    );
}
var getUserCommentCount = thunkify(getUserCommentCountFn);

function getFirstCommentFn(projectId, callback) {

    userCommentCollection.findOne(
        {
            project_id: projectId,
            status: COMMENT_NORMAL,
        },
        {
            sort: {
               insert_time: -1
            }
        },
        function(err, comment) {
            callback(null, comment);
        }
    );
}
var getFirstComment = thunkify(getFirstCommentFn);

function queryUserFn(userId, callback) {

    userCollection.findOne(
        {
            '_id': userCollection.id(userId),
            status: COMMENT_NORMAL,
        },
        function(err, user) {
            callback(null, user);
        }
    );
}
var queryUser = thunkify(queryUserFn);


/**
 * 取得某项目的评论简报信息
 */
exports.getCommentBrief = function(req, res) {

    co(function*() {

        try {

            console.log('Comment getCommentBrief params:');
            console.log(req.body);

            var projectId = req.body.projectId;

            // 取得某项目的评论数
            var commentCnt = yield getUserCommentCount(projectId);
            console.log('Comment getCommentBrief comment count = ' + commentCnt);

            // 评论数不为0，取得第一条评论
            var comment = {};
            if (commentCnt > 0) {

                comment = yield getFirstComment(projectId);
                var user = yield queryUser(comment.user_id);
                comment.user = user;

                console.log('Comment getCommentBrief comment:');
                console.log(comment);
                console.log('Comment getCommentBrief user:');
                console.log(user);
            }

            var data = {};
            data.count = commentCnt;
            data.comment = comment;

            result.code = 200;
            result.success = true;
            result.message = "成功读取评论简报"
            result.action = 'getCommentBrief';
            result.data= data;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;

        }
        catch(err) {
            console.log(err);
        }
    });
}


function queryCommentListFn(projectId, callback) {

    userCommentCollection.find(
        {
            project_id: projectId,
            status: COMMENT_NORMAL
        },
        {
            sort: {
               insert_time: -1
            }
        },
        function(err, comments) {
            callback(null, comments);
        }
    );
}
var queryCommentList = thunkify(queryCommentListFn);


//读取评论列表
exports.getCommentGroup = function (req,res){

    co(function*() {

        try {

            console.log('Comment getCommentGroup params:');
            console.log(req.body);

            var projectId = req.body.projectId;
            var comments = yield queryCommentList(projectId);
            console.log(comments);

            for (var i = 0; i < comments.length; i++) {

                var comment = comments[i];
                var user = yield queryUser(comment.user_id);
                comment.user = user;
            }

            console.log('Comment getCommentGroup result:');
            console.log(comments);

            result.code = 200;
            result.success = true;
            result.message = "成功读取评论列表"
            result.action = 'getCommentGroup';
            result.data= comments;
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        }
        catch (err) {
            console.log(err);
        }
    });

}

function queryUserFn(userId, callback) {

    userCollection.findOne(
        {
            '_id': userId
        },
        function(err, user) {
            callback(null, user);
        }
    );
}
var queryUser = thunkify(queryUserFn);

function updateCommentStatusFn(commentId, status, callback) {

    userCommentCollection.update(
        {
            '_id': userCommentCollection.id(commentId)
        }, 
        {
            $set: {                
                'status': status,               
            }
        },
        function(err, comment) {
            callback(err, comment);
        }
    );
}
var updateCommentStatus = thunkify(updateCommentStatusFn);

function insertCommentFn(comment, callback) {

    userCommentCollection.insert(
        [comment],
        function(err, comment) {
            callback(err, comment);
        }
    );
}
var insertComment = thunkify(insertCommentFn);


function insertRatingFn(userId, projectId, rating, callback) {

    userRatingCollection.insert(
        {
            user_id: userCollection.id(userId),
            project_id: projectId,
            rating: rating
        },
        function(err, rating) {
            callback(err, rating);
        }
    );
}
var insertRating = thunkify(insertRatingFn);

function queryRatingFn(userId, projectId, callback) {

    userRatingCollection.findOne(
        {
            user_id: userCollection.id(userId),
            project_id: projectId
        },
        function(err, rating) {
            callback(err, rating);
        }
    );
}
var queryRating = thunkify(queryRatingFn);

function updateRatingFn(userId, projectId, rating, callback) {

    console.log('updateRatingFn userId = ' + userId + ' projectId = ' + projectId);

    userRatingCollection.update(
        {
            user_id: userCollection.id(userId),
            project_id: projectId
        },
        {
            $set:{
                 rating: rating
            }
        },
        function(err, rating) {
            callback(err, rating);
        }
    );
}
var updateRating = thunkify(updateRatingFn);

function queryRatingListFn(projectId, callback) {

    userRatingCollection.find(
        {
            project_id: projectId
        },
        function(err, rating) {
            callback(err, rating);
        }
    );
}
var queryRatingList = thunkify(queryRatingListFn);

function updateProjectRatingFn(rating, projectId, callback) {

    projectCollection.update(
        {
            _id: parseInt(projectId)
        }, 
        {
            $set: {
                rating: rating
            }
        },
        function(err, rating) {
            callback(err, rating);
        }
    );
}
var updateProjectRating = thunkify(updateProjectRatingFn);

function filterCommentFn(content, callback) {

    commentFilterCollection.find(
        {
            text: {
                $regex: content
            }
        },
        function(err, filterList) {

            if (filterList.length == 0) {
                callback(err, false);
            }
            else {
                callback(err, true);
            }
        }
    );
}
var filterComment = thunkify(filterCommentFn);


/**
 * 添加评论
 */
exports.postComment = function(req, res) {

    co(function*() {

        try {

            console.log('Comment postComment params:');
            console.log(req.body);

            var commentId = req.body._id;
            var type = req.body.type;
            var content = req.body.comment;
            var projectId = req.body.projectId;
            var userId = req.body.userId;
            var rating = req.body.rating;
            var status = req.body.status;

            var comment = {
                user_id: userCollection.id(userId),
                project_id: projectId,
                content: content,
                insert_time: (new Date()).getTime()
            }

            console.log(comment);

            // 更新评论内容
            if (type == POST_UPDATE) {

                var comments = yield updateCommentStatus(commentId, status);
                result.code = 200;
                result.action = 'postComment';
                result.success = true;
                result.message = '更新评论状态成功';
                result.data = comments;
                res.json(result);
                result.data = null;
            }
            // 插入评论
            else if (type == POST_INSERT) {

                // 评论内容不为空，插入评论
                if (content != null && content!= '' ) {

                    // 是否包含过滤词
                    comment.status = COMMENT_NORMAL;
                    var isFiltered = yield filterComment(content);
                    if (isFiltered) {
                        comment.status = COMMENT_WARNING;
                    }

                    var comment1 = yield insertComment(comment);
                }

                // 存在评分则更新，否则插入
                var ratingRecord = yield queryRating(userId, projectId);
                console.log('Comment postComment rating:');
                if (ratingRecord) {
                    console.log('Comment postComment start to update rating');
                    ratingRecord = yield updateRating(userId, projectId, rating);
                }
                else {
                    console.log('Comment postComment start to insert rating');
                    ratingRecord = yield insertRating(userId, projectId, rating);
                }
                console.log(ratingRecord);

                // 重新计算项目的平均评分
                var ratingList = yield queryRatingList(projectId);
                var sum = 0;
                for (var i = 0; i < ratingList.length; i++) {
                    sum = sum + parseInt(ratingList[i].rating);
                }
                var averageRating = parseInt(sum / ratingList.length);
                console.log('Comment postComment averageRating : ' + averageRating);
                var project = yield updateProjectRating(averageRating, projectId);

                // 返回
                result.code = 200;
                result.action = 'postComment';
                result.success = true;
                result.message = '用户评论提交成功';
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
                result.data = null;
            }
        }
        catch(err) {
            console.log(err);
        }
    });
}

//删除评论 id
exports.DeleteuserCommentCollectionStatus = function (req,res){
    var _id = req.body._id;
    userCommentCollection
    .remove({
        '_id': parseInt(_id)
    },{safe:true},function(err,allnews){
        // console.log(allnews);
        if(allnews){
            result.code = 200;
            result.success = true;
            result.message = "成功删除此评论"
            result.action = 'DeleteuserCommentCollectionStatus';
            result.data= allnews;
            res.json(result);
        }else{
            result.code = 404;
            result.success = false;
            result.message = "删除此评论失败"
            result.action = 'DeleteuserCommentCollectionStutas';
            result.data= allnews;
            res.json(result);
        }   
    })
}
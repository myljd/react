var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var ejs = require('ejs');
// var routes = require('./routes/index');
// var users = require('./routes/users');
var map = require('./routes/map');
var wx = require('./routes/wx');
var app = express();

var project = require('./routes/project');
var news = require('./routes/news');
var comment = require('./routes/comment');
var user = require('./routes/users');
var alipay = require('./routes/alipay');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

app.get ('/map_index',function(req,res){
    res.render('map_index');
});

app.get ('/map_nav',function(req,res){
    res.render('map_nav');
});

app.get ('/mmap',function(req,res){
    res.render('mmap');
});

app.get ('/map_search',function(req,res){
    res.render('map_search');
});

app.get ('/map_nav_result',function(req,res){
    res.render('map_nav_result');
});

app.get ('/map_nav_result_detail',function(req,res){
    res.render('map_nav_result_detail');
});

app.get ('/map_footer',function(req,res){
    res.render('map_footer');
});
app.get ('/map_nav_walk_result',function(req,res){
    res.render('map_nav_walk_result');
});
app.get ('/map_nav_bus_result',function(req,res){
    res.render('map_nav_bus_result');
});

app.post('/wx/getSignature', wx.getSignature);//获取签名

app.get('/map/getSearchRecord', map.getSearchRecord);//获取搜索历史
app.get('/map/getSearchKeyword', map.getSearchKeyword);//获取搜索关键字
app.post('/map/saveSearchRecord', map.saveSearchRecord);//保存搜索记录
app.post('/map/deleteSearchRecord', map.deleteSearchRecord);//删除搜索记录

app.get('/map/getAllNavRecord', map.getAllNavRecord);//获取导航纪录
app.post('/map/saveNavRecord', map.saveNavRecord);//保存导航纪录
app.post('/map/deleteNavRecord', map.deleteNavRecord);//删除导航纪录


app.get('/map/getFooterById', map.getFooterById);//根据id获取足迹数据
app.post('/map/upFooterToServer', map.upFooterToServer);//足迹上传服务器

app.post('/map/getProjectInfo', map.getProjectInfo);//根据id获取项目数据
app.get('/map/getAllProject', map.getAllProject);//获取所有项目数据
// app.post('/projectGroup', project.getProjectGroup);


app.post('/admin/postNoticeDetail', news.postNoticeDetail); //新建信息
app.get('/admin/getNoticeGroup', news.getNoticeGroup); //读取消息列表
app.post('/admin/allSearchMessages', news.allSearchMessages); //按照日期搜索消息
app.post('/admin/getProjectGroup', project.getProjectGroup); //读取区域列表 排队监测
app.post('/admin/getProjectDetail', project.getProjectDetail);
app.post('/admin/getCommentGroup', comment.getCommentGroup); //读取评论列表
app.get('/app/getProjectDefGroup', project.getProjectDefGroup); // 读取项目定义列表
app.get('/app/getProjectKeywordGroup', project.getProjectKeywordGroup); // 读取项目关键字列表
app.post('/app/getCommentBrief', comment.getCommentBrief); // 读取项目评价简报
app.post('/admin/postComment', comment.postComment); //更新评论状态  id
app.post('/app/getFavoriteProjectGroup', user.getFavoriteProjectGroup); // 取得我的收藏列表
app.post('/app/postFavorite', user.postFavorite); // 提交我的收藏
app.post('/app/getNearbyProjectLocationGroup', project.getNearbyProjectLocationGroup); // 读取我的附近地理位置列表
app.post('/app/getNearestProjectName', project.getNearestProjectName); // 读取我的就近项目名称
app.post('/app/getUser', user.getUser); // 提交我的收藏
app.get('/app/getPing', user.getPing); // 测试PING结果

app.post('/alipay/getAlipayUserInfo', alipay.getAlipayUserInfo); // 测试PING结果


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var http = require('http').Server(app);
http.listen(8001, function(){
  console.log('dpins listening on *:8001');
});

// module.exports = app;

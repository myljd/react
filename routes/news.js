var db = require('../configs/DAO');
var projectCollection = db.get('project');
var newCollection = db.get('news');

var CATEGORY_FACILITY = 0;
var CATEGORY_DISTRICT = 1;

var result = {
	'code': '',
	'action': '',
	'success': '',
	'message': '',
	'data': ''
};



// 新建消息
exports.postNoticeDetail = function (req ,res ){
	console.log('method start');
	var news = req.body;
	// console.log(req.body);
	newCollection.insert([news], function(e,r) {
		 
		 // console.log(r)
		if(e==null){
			result.code = 200;
			result.action = 'postNoticeDetail';
			result.success = true;
			result.message = '成功新建消息！';
			result.data=r;
			res.json(result);
			result.data = null;
		}else{
			console.log(e)
		}
		
	});

}


//读取消息列表
exports.getNoticeGroup = function (req,res){

	newCollection.find(
		{

		},
		{
			
		},
		function(err,allnews){
			// console.log(allnews);
			if(allnews){
				result.code = 200;
				result.success = true;
				result.message = "成功读取消息列表"
				result.action = 'getNoticeGroup';
				result.data= allnews;
				res.header("Access-Control-Allow-Origin", "*");
				res.jsonp(result);
			}else{
				result.code = 404;
				result.success = false;
				result.message = "读取消息列表失败"
				result.action = 'getNoticeGroup';
				result.data= allnews;
				res.header("Access-Control-Allow-Origin", "*");
				res.jsonp(result);
			}
		}
	)
}

//更新消息
exports.UpdateProjectDetail = function (req,res){


}

//消息搜索
exports.allSearchMessages =  function (req ,res){
	// console.log(req.body.title);
	newCollection
		.find({
			'title':
			{
				$regex:req.body.title,
			},
			'insert_time':
			{
				$gte:req.body.start_time,
				$lte:req.body.end_time
			}			
		},
			function(e,allnews){
				// console.log(e);
				// console.log(allnews);
				if(e==null){
					result.code = 200;
					result.action = 'allSearchMessages';
					result.success = true;
					result.message = '成功搜索消息列表';
					result.data=allnews;
					res.json(result);
					result.data = null;
				}else{
					console.log(e)
				}
			}			
		)		
}

//消息id自增
exports.applyNewNewsIdForChoosen = function (req,res){

	newCollection
	.find()
	.success(function(newsBelong){

		var new_id;
		var amountLevel = newsBelong.length.toString().length;
		// console.log(amountLevel);
		switch(amountLevel)
		{
			case 1:
				new_id = '00'+ (newsBelong.length+1);
				break;

			case 2:
				new_id = '0'+ (newsBelong.length+1);
				break;

			case 3:
				new_id = newsBelong.length+1;
				break;
		}
		// console.log(project_id);
		result.success = true;
		result.new_id=new_id;
		result.data= newsBelong;
		res.json(result);
		
	})
}
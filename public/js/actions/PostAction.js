
/**
 * 数据提交Action
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/27
 * 
 */

var WebAPIUtil = require('../utils/WebAPIUtil');

var UserStore = require('../stores/UserStore');

/**
 * 提交处理
 */
var PostAction = {

	postComment: function(projectId, comment, rating) {

		console.debug('PostAction postComment');
		console.debug(UserStore.getUser());

		var userId = UserStore.getUser()._id;
		WebAPIUtil.postComment(userId, projectId, comment, rating);
	},

	postFavoriteProject: function(projectId, favorite) {

		console.debug('PostAction postFavoriteProject');
		console.debug(UserStore.getUser());

		var userId = UserStore.getUser()._id;
		if (userId) {
			WebAPIUtil.postFavoriteProject(userId, projectId);
		}

	},

	deleteNavRecord: function() {

		var userId = UserStore.getUser()._id;
		WebAPIUtil.deleteNavRecord(userId);
	},

	saveNavRecord:function() {
		console.log("saveNavRecord",UserStore.getUser());
		var userId = UserStore.getUser()._id;
		WebAPIUtil.saveNavRecord(userId);
	},

	upFooterToServer:function() {

		var userId = UserStore.getUser()._id;
		WebAPIUtil.upFooterToServer(userId);
	},

	getSignature:function() {
		WebAPIUtil.getSignature();
	}
	
}

module.exports = PostAction;
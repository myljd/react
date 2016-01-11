
/**
 * 评论组件
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/8/25
 * 
 */

var React = require('react');

var Constants = require('../constants/AppConstants');
var FormatUtil = require('../utils/FormatUtil');

/**
 * 评论组件
 */
var CommentItem = React.createClass({

	render: function() {

		var comment = this.props.comment;

		var name = '';
		if (!FormatUtil.isEmpty(comment) && !FormatUtil.isEmpty(comment.user)) {
			name = comment.user.name;
		}
		
		var content = '';
		if (!FormatUtil.isEmpty(comment)) {
			content = comment.content;
		}

		var insertTime = '';
		if (!FormatUtil.isEmpty(comment)) {
			insertTime = FormatUtil.getFormatDateTime(comment.insert_time);
		}

		var imgSrc = Constants.Images.HEAD;
		if (!FormatUtil.isEmpty(comment) && !FormatUtil.isEmpty(comment.user)) {
			imgSrc = comment.user.thumbnail;
		}
		
		return (
			<div className='comment-item'>
				<div className='head'>
					<img src={imgSrc} />
					{name}
				</div>
				<div className='content'>
					<div>{content}</div>
				</div>
				<div className='date'>
					<span>{insertTime}</span>
				</div>
			</div>
		)
		
	},
});

module.exports = CommentItem;
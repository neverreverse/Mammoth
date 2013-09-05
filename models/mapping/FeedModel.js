var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var UsersModel = require("./UsersModel");

var feed_schema = new Schema({
	author:UsersModel,
	author_name:{type:String},
	author_image:{type:String},
	meta_data:{type:Schema.ObjectId},
	content:{type:String},
	template:{type:Number},
	event_type:{type:Number},
    create_at:{ type:Date, default:Date.now }
});

var user_feed_schema = new Schema({
	user_id:{type:Schema.ObjectId},
	last_update:{type:Date, default:Date.now},
	feeds:[feed_schema]
});

mongoose.model('Feed',feed_schema);
mongoose.model('UserFeed', user_feed_schema);

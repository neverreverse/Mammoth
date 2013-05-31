var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var feed_schema = new Schema({
	author_id:{type:Schema.ObjectId},
	meta_data:{type:String},
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

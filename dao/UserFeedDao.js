var UserFeedModel = require("../models").UserFeed;
var FeedModel = require("../models").Feed;



var UserFeedDAO = function () {

};

module.exports = UserFeedDAO;

UserFeedDAO.prototype.dispatchMelody = function(user,melody,callback){
	console.log("start to dispatch feed to user's fans");
	console.log(user);
	console.log(melody);
	if(!user) return;
	if(!melody) return;
	process.nextTick(function(user,melody,callback){

		var feed = {author_id:user._id, meta_data: melody.description, content: user.name+ " upload a new melody"};
		for( var i = 0; i < user.fans.length; i++){
			//console.log(user.fans.[i]);
			user_feed_id = user.fans.[i];

			UserFeedModel.findOne({user_id: user_feed_id}, function(err, data){
				if(data){


				}else{

				}	
			});

			if(callback!=null){
				callback("feed finish");
			}
		}

	});
}

UserFeedDAO.prototype.addFeed = function(user_feed,feed){
	
	
}
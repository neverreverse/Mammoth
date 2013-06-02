var UserFeedModel = require("../models").UserFeed;
var FeedModel = require("../models").Feed;
var DaoBase = require('./DaoBase');
var util = require("util");

var UserFeedDAO = function (userFeed) {
    this.userFeed = userFeed || {};
    DaoBase.call(this, this.userFeed);
};

util.inherits(UserFeedDAO, DaoBase);

UserFeedDAO.prototype.dispatchMelody = function(user,melody,callback){
	console.log("start to dispatch feed to user's fans");

	if(!user) return;
	if(!melody) return;
	console.log(user);
	console.log(melody);

	//process.nextTick(function(user,melody,callback){

		var feed = {author_id:user._id, meta_data: melody.description, content: user.name+ " upload a new melody"};
		for( var i = 0; i < user.fans.length; i++){
			//console.log(user.fans.[i]);
			user_feed_id = user.fans[i];

			UserFeedModel.findOne({user_id: user_feed_id}, function(err, data){
				if(!data){
					consle.log("Can not find user's feed");
				}

				data.feeds.push(feed);
				UserFeedModel.update({_id:data._id}, {feeds: data.feeds}, function(err, _data){
					if(err) console.log(err);
				});


			});
		}

	//});
}

UserFeedDAO.prototype.createUserFeed = function(user,callback){

	var userFeed = new UserFeedModel({user_id:user._id});
	userFeed.save(function(err, data){
		callback(err,data);
	});
}
UserFeedDAO.prototype.getUserFeed = function(user_id,callback){

	 this.model.findOne({user_id:user_id}, function(error, model){
        if(error) return callback(error,null);
        return callback(null,model);
    });
}
module.exports = UserFeedDAO;
var UserFeedModel = require("../models").UserFeed;

var UserFeedDAO = function () {

};

module.exports = UserFeedDAO;

UserFeedDAO.prototype.dispatchMelody = function(user,melody,callback){
	if(!user) return;
	if(!melody) return;

	console.log(user);

	if(user.fans)


}
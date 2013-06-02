/**
 * Created with JetBrains WebStorm.
 * User: c-sailor.zhang
 * Date: 1/23/13
 * Time: 2:31 PM
 * To change this template use File | Settings | File Templates.
 */
var DaoBase = require('./DaoBase');
var UsersModel = require('./../models').Users;


var util = require("util");

var UsersDAO = function (user) {
    this.user = user || {};
    DaoBase.call(this, this.user);
};
util.inherits(UsersDAO, DaoBase);

UsersDAO.prototype.findByName = function(user, callback){
	
	if(!user){
		callback({err:"error parameter."});
	}

	UsersModel.findOne({name:user.name}, function (err, user) {
		callback(err, user);
    });
}

/*
UsersDAO.prototype.save = function (callback) {
    var usersEntity = new UsersModel(this.user);
    usersEntity.save(function (err, data) {
        if (err){
            console.log(err);
        }
        callback(err, data);
    });
};
*/
/*
UsersDAO.prototype.list = function(callback){
    var query = this.user.find();
    query.exec(function(err,_data){
        if(err){
        	console.log(err);	
        }
        callback(err,_data);
    }); 

}
*/
module.exports = UsersDAO;

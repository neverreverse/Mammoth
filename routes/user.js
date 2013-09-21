/*
 * GET users listing.
 */
var mongoose = require('mongoose');

var UsersModel = require("./../models").Users;
var UsersDAO = require("../dao/UserDAO");
var path = require('path');
var userDao = new UsersDAO(UsersModel);

var UserFeedDao = require("../dao/UserFeedDao");
var UserFeedModel = require("./../models").UserFeed;

var userFeedDao = new UserFeedDao(UserFeedModel);

var logger = require('../libs/winston');



exports.list = function (req, res) {
    userDao.getAll(function(err,_data){
        if(err)
        {
            logger.error("Failed to get user list, message: "+ err);
            return res.json({state:1,message:"获取用户列表失败"});
        }
        return res.json(_data);
    })
};

exports.getUser = function(req, res) {
    var userId = req.params['id'];

    logger.info("Get user by ID: "+ userId);
    try{
        var _userId = mongoose.Types.ObjectId(userId);
    }catch(e){
        logger.error("Invalid user id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});
    };

    userDao.getById(_userId, function(err,user){
        if (err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"查询用户出错"});
        }
        if (!user) {
            logger.error("Get user failed, message: "+ err);
            return res.json({state:1,message:"用户不存在"});
        }
        return res.json(user);
    });
}

exports.create = function (req, res) {
    console.log(req.body);
    if(  req.body.email == undefined || isEmail(req.body.email) == false){
        logger.error("Invalid Email address, message: "+ req.body.email);
        return res.json({state:1,message:"请输入正确的邮箱地址"});
    }

    if(  req.body.password == undefined || req.body.password.length < 6){
        logger.error("Password must larger than 6, message: "+ req.body.password);
        return res.json({state:1,message:"密码必须大于6位"});

    }
    var createUser = new UsersModel(req.body);

    userDao.findByEmail(createUser, function(err, user){
        if (err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"查询用户出错"});
        }

        if (user) {
            logger.error("Duplicated username: "+ err);
            return res.json({state:1,message:"用户已存在"});
        }

        userDao.create(createUser, function(err, user){
            if (err) {
                logger.error("Failed to create user: "+ err);
                return res.json({state:1,message:"用户创建失败"});
            }

            userFeedDao.createUserFeed(user, function(err, data){
                if(err){
                    logger.error("Failed to create user feed: "+ err);
                    return res.json({state:1,message:"用户创建失败"});
            }

                req.session["user"] = user;
                res.json({state:0,message:"用户注册成功"});

            });
        });

    }) ;  
};

exports.follow = function(req, res){
    //authentication check
    var user = req.session["user"];
    if(!user){
        return res.json({state:1,message:"请先登录"});
    }

    var user_id = req.params['followerid'];
    var follow_id = req.params['followeeid'];

    if(user_id == follow_id){
        return res.json({state:1,message:"不能关注自己"});
    }   

    try{
        var _follow_id = mongoose.Types.ObjectId(follow_id);
    }catch(e){
        logger.error("Invalid follow id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});    
    };

    try{
        var _user_id = mongoose.Types.ObjectId(user_id);
    }catch(e){
        logger.error("Invalid user id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});    
    };

    //get the followee
    userDao.getById(_follow_id,function(err,_followee){
        if(err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"查询用户出错"});
        }
        var fans = _followee.fans;

        if(fans.contains(_user_id)){
            logger.error("The user already in fan list");
            return res.json({state:1,message:"不能重复关注"});
        }
        //get the user
        userDao.getById(_user_id, function(err,_follower){
            if(err){
                logger.error("Query user failed, message: "+ err);
                return res.json({state:1,message:"查询用户出错"});
            }
            var follows = _follower.follows;
            if(follows.contains(follow_id)){
                logger.error("The user already in list");
                return res.json({state:1,message:"不能重复关注"});
            }

            //update the follower
            userDao.update({_id: _user_id },{$push:{follows:_follow_id}} , function(err,_data){
                if(err){
                    logger.error("Update user failed, message: "+ err);
                    return res.json({state:1,message:"添加关注失败"});
                }

                //update the followee
                userDao.update({_id: _follow_id },{$push:{fans:_user_id}} , function(err,_data){
                    if(err){
                        logger.error("Update user failed, message: "+ err);
                        return res.json({state:1,message:"添加关注失败"});
                    }
                    return res.json({state:0,message:"关注成功"});
                });

            });
        });
    });
};


exports.discardFollow = function(req, res){
    
    //authentication check
    var user = req.session["user"];
    if(!user){
        return res.json({state:1,message:"请先登录"});
    }

    var follower_id = req.params['followerid'];
    var followee_id = req.params['followeeid'];

    if(follower_id == followee_id){
        return res.json({state:1,message:"不能关注自己"});
    }   

    try{
        var _followee_id = mongoose.Types.ObjectId(followee_id);
    }catch(e){
        logger.error("Invalid follow id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});       
    };

    try{
        var _follower_id = mongoose.Types.ObjectId(follower_id);
    }catch(e){
        logger.error("Invalid follow id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});        
    };

    //get the followee
    userDao.getById(_followee_id,function(err,_followee){
        if(err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"查询用户出错"});
        }
        var fans = _followee.fans;
        if(!fans.contains(follower_id)){
            logger.error("Not in the fans list, message: "+ follower_id);
            return res.json({state:1, message: "没有关注此人"});
        }

        //get the user
        userDao.getById(_follower_id, function(err,_follower){
            if(err){
                logger.error("Query user failed, message: "+ err);
                return res.json({state:1,message:"查询用户出错"});
            }

            var follows = _follower.follows;
            if(!follows.contains(followee_id)){
                logger.error("Not in the follows list, message: "+ follower_id);
                return res.json({state:1, message: "没有关注此人"});
            }

            //update the follower
            userDao.update({_id: _follower_id },{$pop:{follows:_followee_id}} , function(err,_data){
                if(err){
                    logger.error("Query user failed, message: "+ err);
                    return res.json({state:1,message:"查询用户出错"});
                }

                //update the followee
                userDao.update({_id: followee_id },{$pop:{fans:_follower_id}} , function(err,_data){
                    if(err){
                        logger.error("Failed to discard follow, message: "+ err);
                        return res.json({state:1, message:"取消关注失败"});
                    }
                    return res.json({state:0,message:"取消关注成功"});
                });

            });
        });
    });

}
exports.followList = function(req, res){

    var follower_id = req.params['followerid'];

    try{
        var _follow_id = mongoose.Types.ObjectId(follower_id);
    }catch(e){
        logger.error("Invalid follow id, message: "+ e);
        return res.json({state:1,message:"非法用户ID"});      
    };
    
    userDao.getById(follower_id,function(err,_user){
        if(err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"查询用户出错"});
        }
        return res.json({follows:_user.follows});
    });
};

exports.getFeeds = function(req, res){
    var user_id = req.params['id'];
    userFeedDao.getUserFeed(user_id, function(err, data){
        if(err){
            logger.error("Query userfeed failed, message: "+ err);
            return res.json({state:1,message:"查询动态失败"});
        }
        return res.json(data);
    });

}

exports.login = function (req, res) {
    console.log(req.body);
    UsersModel.findOne({email:req.body.email}, function (err, user) {
        if(err){
            logger.error("Query user failed, message: "+ err);
            return res.json({state:1,message:"登录失败"});
        }
        if (!user) {
            logger.error("User does not exist ");
            return res.json({state:1,message:"用户不存在"});
        }
        if (!user.authenticate(req.body.password)){
            logger.error("Incorrect password");
            return res.json({state:1,message:"用户名或者密码错误"});
        }

        var token = randomString(16);
        req.session["user"] = user;
        req.session["token"] = token;
        res.json({state:0,message:"登录成功", user: user, token: token});
    });
};

exports.logout = function (req, res) {
    req.session["user"] = null;
    req.session["token"] = null;
    res.json({state:0});
    //var html = path.normalize(__dirname + '/../views/index.html');
    //res.sendfile(html);
};

randomString = function(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    
    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }
    
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
isEmail = function (str){
       //var reg = /^([a-zA-Z0-9_-\.])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
       var reg = /([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
       return reg.test(str);
}
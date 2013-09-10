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

exports.list = function (req, res) {
    userDao.getAll(function(err,_data){
        if(err){
            return res.json({err:err});
        }
        return res.json(_data);
    })
};

exports.getUser = function(req, res) {
    var userId = req.params['id'];
    console.log("Get USER by ID:"+userId);

    try{
        var _userId = mongoose.Types.ObjectId(userId);
    }catch(e){
        return res.json({err:'invalid user id'});        
    };

    userDao.getById(_userId, function(err,user){
    if (err)
        return res.json({err:err});
        if (!user) {
            return res.json({err:'user does not exists'});
        }
        return res.json(user);
    });
}

exports.create = function (req, res) {
    console.log(req.body);
    if(  req.body.email == undefined || isEmail(req.body.email) == false){

        return res.json({state:1,err:"Input a correct Email address!"});
    }

    if(  req.body.password == undefined || req.body.password.length < 6){
        return res.json({state:1,err:"Password must be larger than 6!"});

    }
    var createUser = new UsersModel(req.body);

    userDao.findByEmail(createUser, function(err, user){
        if (err)
            return res.json({state:1,err:err});

        if (user) {
            return res.json({state:1,err:"User already exists"});
        }

        userDao.create(createUser, function(err, user){
            if (err) {
                return res.json({state:1,err:err});
            }

            userFeedDao.createUserFeed(user, function(err, data){
                if(err){
                    return res.json({state:1,err:err});
                }

                req.session["user"] = user;
                res.json({state:0});

            });
        });

    }) ;  
};

exports.follow = function(req, res){
    //authentication check
    var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }

    var user_id = req.params['followerid'];
    var follow_id = req.params['followeeid'];

    if(user_id == follow_id){
        return res.json({state:1,err:"Can not follow oneself"});
    }   

    try{
        var _follow_id = mongoose.Types.ObjectId(follow_id);
    }catch(e){
        return res.json({state:1,err:'invalid follow id'});        
    };

    try{
        var _user_id = mongoose.Types.ObjectId(user_id);
    }catch(e){
        return res.json({state:1,err:'invalid user id'});        
    };

    //get the followee
    userDao.getById(_follow_id,function(err,_followee){
        if(err)
            return res.json({state:1, err:err});
        var fans = _followee.fans;
        if(fans.contains(_user_id)){
            return res.json({state:1, err: "Already exists in fans list"});
        }
        //get the user
        userDao.getById(_user_id, function(err,_follower){
            if(err)
                return res.json({state:1, err:err});
            var follows = _follower.follows;
            if(follows.contains(follow_id)){
                return res.json({state:1, err:"Already exists in follow list"});
            }

            //update the follower
            userDao.update({_id: _user_id },{$push:{follows:_follow_id}} , function(err,_data){
                if(err){
                    return res.json({state:1, err:err});
                }

                //update the followee
                userDao.update({_id: _follow_id },{$push:{fans:_user_id}} , function(err,_data){
                    if(err){
                        return res.json({state:1, err:err});
                    }
                    return res.json({state:0});
                });

            });
        });
    });
};


exports.discardFollow = function(req, res){
    
    //authentication check
    var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }

    var follower_id = req.params['followerid'];
    var followee_id = req.params['followeeid'];

    if(follower_id == followee_id){
        return res.json({state:1,err:"Can not follow oneself"});
    }   

    try{
        var _followee_id = mongoose.Types.ObjectId(followee_id);
    }catch(e){
        return res.json({state:1,err:'invalid follow id'});        
    };

    try{
        var _follower_id = mongoose.Types.ObjectId(follower_id);
    }catch(e){
        return res.json({state:1,err:'invalid follower id'});        
    };

    //get the followee
    userDao.getById(_followee_id,function(err,_followee){
        if(err)
            return res.json({state:1, err:err});
        var fans = _followee.fans;
        if(!fans.contains(follower_id)){
            return res.json({state:1, err: "Not exist in fans list:" + _follower_id});
        }
        //get the user
        userDao.getById(_follower_id, function(err,_follower){
            if(err)
                return res.json({state:1, err:err});
            var follows = _follower.follows;
            if(!follows.contains(followee_id)){
                return res.json({state:1, err:"Not exists in follow list" + followee_id});
            }

            //update the follower
            userDao.update({_id: _follower_id },{$pop:{follows:_followee_id}} , function(err,_data){
                if(err){
                    return res.json({state:1, err:err});
                }

                //update the followee
                userDao.update({_id: followee_id },{$pop:{fans:_follower_id}} , function(err,_data){
                    if(err){
                        return res.json({state:1, err:err});
                    }
                    return res.json({state:0});
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
        return res.json({state:1,err:'invalid follow id'});        
    };
    
    userDao.getById(follower_id,function(err,_user){
        if(err){
            return res.json({state:1,err:err});
        }
        return res.json({follows:_user.follows});
    });
};

exports.getFeeds = function(req, res){
    var user_id = req.params['id'];
    userFeedDao.getUserFeed(user_id, function(err, data){
        if(err){
            return res.json({state:1, err:err});
        }

        return res.json(data);
    });

}

exports.login = function (req, res) {
    console.log(req.body);
    UsersModel.findOne({email:req.body.email}, function (err, user) {
        if (err)
            return res.json({state:1,err:err});
        if (!user) {
            return res.json({state:1,err:'User does not exist'});
        }
        if (!user.authenticate(req.body.password))
            return res.json({state:1,err:'invalid password'});
        var token = randomString(16);
        req.session["user"] = user;
        req.session["token"] = token;
        res.json({state:0, user: user, token: token});
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
       var reg = /^([a-zA-Z0-9_-.])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
       return reg.test(str);
}
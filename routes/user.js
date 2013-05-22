/*
 * GET users listing.
 */
var mongoose = require('mongoose');

var UsersModel = require("./../models").Users;
var path = require('path');

exports.list = function (req, res) {
    var query = UsersModel.find();
    query.exec(function(err,_data){
        console.log(_data);
        if(err){
            return res.json({state:1, err:err});
        }

        return res.json(_data);
    }); 
};

exports.getUser = function(req, res) {
    var userId = req.params['id'];
    console.log("Get USER by ID:"+userId);
    try{
        var _userId = mongoose.Types.ObjectId(userId);

    }catch(e){
        return res.json({err:'invalid user id'});        
    };

    UsersModel.findOne({_id:_userId},function(err,user){
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
    var createUser = new UsersModel(req.body);
    UsersModel.findOne({name:req.body.name}, function (err, user) {
        if (err)
            return res.json({err:err});
        if (user) {
            return res.json({err:"User already exists"});
        }
        createUser.save(function (err, user) {
            if (err) {
                return res.json({err:err});
            }
            req.session["user"] = user;
            res.json();
        });
    });

};
exports.follow = function(req, res){
    var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }

    var follow_id = req.params['id'];
    if(user._id == follow_id){
        return res.json({state:1,err:"Can not follow oneself"});
    }   

    try{
        var _follow_id = mongoose.Types.ObjectId(follow_id);

    }catch(e){
        return res.json({state:1,err:'invalid follow id'});        
    };

    UsersModel.findOne({_id: _follow_id}, function(err, _user){
        if(err)
            return res.json({state:1, err:err});
        var fans = _user.fans;
        if(fans.contains(user._id)){
            return res.json({state:1, err: "Already exists in fans list"});
        }

        UsersModel.findOne({_id: mongoose.Types.ObjectId(user._id)},function(err,__user){
            if(err)
                return res.json({state:1, err:err});
            
            var follows = __user.follows;
            if(follows.contains(follow_id)){
                return res.json({state:1, err:"Already exists in follow list"});
            }

            UsersModel.update({_id: mongoose.Types.ObjectId(user._id)},{$push:{follows:_follow_id}} , function(err,_data){
                if(err){
                    return res.json({state:1, err:err});
                }
                UsersModel.update({_id: _follow_id},{$push:{fans:mongoose.Types.ObjectId(user._id)}} , function(err,__data){
                    if(err){
                        return res.json({state:1, err:err});
                    }
                    return res.json({state:0});
                });
                
            });
        });
    });
    //return res.json({state:1,err:"Unexpected error"});
};
exports.discardFollow = function(req, res){
    var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }

    var follow_id = req.params['id'];
    try{
        var _follow_id = mongoose.Types.ObjectId(follow_id);

    }catch(e){
        return res.json({state:1,err:'invalid follow id'});        
    };

    UsersModel.findOne({_id: _follow_id}, function(err, _user){
        if(err)
            return res.json({state:1, err:err});

        var fans = _user.fans;
        if(!fans.contains(user._id)){
            return res.json({state:1, err: "Not exist in fans list"});
        }

        UsersModel.findOne({_id: mongoose.Types.ObjectId(user._id)},function(err,__user){
            if(err)
                return res.json({state:1, err:err});
            
            var follows = __user.follows;
            if(!follows.contains(follow_id)){
                return res.json({state:1, err:"Not exist in follow list"});
            }

            UsersModel.update({_id: mongoose.Types.ObjectId(user._id)},{$pop:{follows:_follow_id}} , function(err,_data){
                if(err){
                    return res.json({state:1, err:err});
                }
                UsersModel.update({_id: _follow_id},{$pop:{fans:mongoose.Types.ObjectId(user._id)}} , function(err,__data){
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
    var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }
    UsersModel.findOne({_id: mongoose.Types.ObjectId(user._id)},function(err,_user){
        if(err){
            return res.json({state:1,err:"Error user"});
        }
        return res.json({follows:_user.follows});
    });
};

exports.login = function (req, res) {
    UsersModel.findOne({name:req.body.name}, function (err, user) {
        if (err)
            return res.json({err:err});
        if (!user) {
            return res.json({err:'User does not exist'});
        }
        if (!user.authenticate(req.body.password))
            return res.json({err:'invalid password'});
        req.session["user"] = user;
        res.json(user);
    });
};

exports.logout = function (req, res) {
    req.session["user"] = null;
    var html = path.normalize(__dirname + '/../views/index.html');
    res.sendfile(html);
};

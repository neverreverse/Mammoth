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
exports.addFriend = function(req, res){
    var user = req.session["user"];
    if(!user){
        return res.json({state:1,err:"Need login"});
    }

    var friend_id = req.params['id'];
    if(user._id == friend_id){
        return res.json({state:1,err:"Can not add oneself as friend"});
    }   

    try{
        var _friend_id = mongoose.Types.ObjectId(friend_id);

    }catch(e){
        return res.json({err:'invalid friend id'});        
    };

    UsersModel.findOne({_id: _friend_id}, function(err, _user){
        if(err)
            return res.json({state:1, err:err});

        UsersModel.update({_id: mongoose.Types.ObjectId(user._id)},{$push:{friends:_friend_id}} , function(err,_data){
            if(err){
                return res.json({state:1, err:err});
            }

            console.log(_data);
            return res.json({state:0});
        });

    });

    return res.json({state:1,err:"Unexpected error"});
}

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

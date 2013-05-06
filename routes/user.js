/*
 * GET users listing.
 */
var mongoose = require('mongoose');

var UsersModel = require("./../models").Users;
var path = require('path');

exports.list = function (req, res) {
    res.send("respond with a resource");
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
            return res.json({err:"用户名已经存在"});
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

exports.login = function (req, res) {
    UsersModel.findOne({name:req.body.name}, function (err, user) {
        if (err)
            return res.json({err:err});
        if (!user) {
            return res.json({err:'用户名不存在'});
        }
        if (!user.authenticate(req.body.password))
            return res.json({err:'密码错误'});
        req.session["user"] = user;
        res.json(user);
    });
};

exports.logout = function (req, res) {
    req.session["user"] = null;
    var html = path.normalize(__dirname + '/../views/index.html');
    res.sendfile(html);
};

var MelodyDao = require("../dao/MelodyDao"),
    Melody = require("../models");

var fs = require('fs');
var utils = require("../libs/util");
exports.getMelody= function (req, res) {
};

exports.getMelodyCollection=function(req,res){

};

exports.putMelody=function(req,res){

};

exports.putComment=function(req, res){

};

exports.putTrack=function(req, res){
	console.log(req.files);
	var tmp_path = req.files.track.path;
	var track_id = utils.guid();
	var target_path = __dirname+'/Tracks/' + track_id;
	console.log("Copy to target_path: "+ target_path);
	fs.renameSync(tmp_path, target_path);
	/*
	fs.rename(tmp_path, target_path, function(err) {
    	if (err) {
    		console.log(err);
    		res.json({state:1,err:err});
    	}

		fs.unlink(tmp_path, function() {
			if (err) {
	    		console.log(err);
	    		res.json({state:1,err:err});
			}
			res.json({state:0, guid:track_id});
		});
	});
	*/
};
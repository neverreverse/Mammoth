var MelodyDao = require("../dao/MelodyDao");
var Melody = require("../models").Melody;
 
var TrackDao = require("../dao/TrackDao");
var TrackModel = require("../models").Track;

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

	var tmp_path = req.files.track.path;
	var file_ext = req.body.ext;
	var track_id = utils.guid();
	var target_path = './Tracks/' + track_id;

	console.log("Copy to target_path: "+ target_path);
	fs.readFile(tmp_path, function (err, data) {
		if(err){
	    		console.log(err);
	    		return res.json({state:1,err:err});
	    }
  		fs.writeFile(target_path, data, function (err) {
  			if(err){
	    		console.log(err);
	    		return res.json({state:1,err:err});
			}
			fs.unlink(tmp_path); // ignore callback
			var track = new TrackModel({track_location:target_path,ext:file_ext});
			track.save(function(err, user){
			    if (err) {
                	return res.json({err:err});
            	}
			});
			return res.json({state:0, guid:track._id});
  		});
	});
};
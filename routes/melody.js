var MelodyDao = require("../dao/MelodyDao");
var MelodyModel = require("../models").Melody;
 
var TrackDao = require("../dao/TrackDao");
var TrackModel = require("../models").Track;

var mongoose = require('mongoose');

var fs = require('fs');
var utils = require("../libs/util");
exports.getMelody= function (req, res) {
};

exports.getMelodyCollection=function(req,res){

};

exports.putMelody=function(req,res){
	//console.log(req.body);
	var track_id = req.body.track_id;
	var track = new TrackModel();

	var melody = req.body;
	melody.track = new Array();
	TrackModel.findOne({_id: mongoose.Types.ObjectId(track_id)}, function(err,_track){
		if(err){
			return res.json({state:1,err:err});
		}
		melody.track.push( _track);
		var new_melody = new MelodyModel(melody);
		new_melody.save(function(err,data){
			if(err){
				return res.json({state:1,err:err});
			}
			console.log(data);
			return res.json({state:0});
		});

	});

};

exports.putComment=function(req, res){
	var comment = req.body;
	var melody_id =req.body.melody_id;
	console.log({ _id: mongoose.Types.ObjectId(melody_id)});
	
	MelodyModel.findOne({ _id: mongoose.Types.ObjectId(melody_id)}, function(err, _melody){
		if(err){
			return res.json({state:1,err:err});
		}
		_melody.comment.push(comment);
		//MelodyModel.update(_melody);

	})
	return res.json({state:1,err:"Can not find the melody"});
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
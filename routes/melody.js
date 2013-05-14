var MelodyDao = require("../dao/MelodyDao");
var MelodyModel = require("../models").Melody;
 
var TrackDao = require("../dao/TrackDao");
var TrackModel = require("../models").Track;

var mongoose = require('mongoose');

var fs = require('fs');
var utils = require("../libs/util");

exports.getMelodyCollection=function(req,res){

};
exports.getMelodyList = function(req, res){
	var query = MelodyModel.find();
	query.exec(function(err,_data){
		console.log(_data);
		if(err){
			return res.json({state:1, err:err});
		}

		return res.json(_data);
	});	
}
exports.getMelody= function (req, res) {
	var melody_id = req.params['id'];
	console.log("Get Melody by ID:"+ melody_id);
	
	try{
        var _melody_id = mongoose.Types.ObjectId(melody_id);

    }catch(e){
        return res.json({err:'invalid melody  id'});        
    };
    
    MelodyModel.findOne({_id:_melody_id},function(err,_melody){
    if (err)
        return res.json({err:err});
    if (!_melody) {
        return res.json({err:'Melody does not exists'});
    }
        return res.json(_melody);
    });

};

exports.putMelody=function(req,res){
	var track_id = req.body.track_id;
	var track = new TrackModel();

	var melody = req.body;
	melody.track = new Array();
	TrackModel.findOne({_id: mongoose.Types.ObjectId(track_id)}, function(err,_track){
		if(err){
			return res.json({state:1,err:err});
		}
		if(_track==null){
			return res.json({state:1,err:"Can not find the track"});
		}
		melody.track.push( _track);

		var new_melody = new MelodyModel(melody);
		new_melody.save(function(err,data){
			if(err){
				return res.json({state:1,err:err});
			}
			console.log(data);
			return res.json({state:0,guid:data._id});
		});
	});
};

exports.putComment=function(req, res){
	var comment = req.body;
	var melody_id =req.body.melody_id;
	//console.log({ _id: mongoose.Types.ObjectId(melody_id)});
	
	MelodyModel.findOne({ _id: mongoose.Types.ObjectId(melody_id)}, function(err, _melody){
		if(err){
			return res.json({state:1,err:err});
		}

		if(_melody==null){
			return res.json({state:1,err:"Can not find the melody"});
		}

		if(_melody.comment==undefined){
			_melody.comment = new Array();
		}

		_melody.comment.push(comment);

		console.log(_melody);
		MelodyModel.update({ _id: mongoose.Types.ObjectId(melody_id)}, {comment:_melody.comment},function(err, _data){
			if(err){
				return res.json({state:1,err:err});
			}
			return res.json({state:0});
		});

	})
	return res.json({state:1,err:"unexpected error"});
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

exports.getTrackList=function(req,res){

	var query = TrackModel.find();
	query.exec(function(err,_data){
		console.log(_data);
		if(err){
			return res.json({state:1, err:err});
		}

		return res.json(_data);
	});	
}

exports.getTrack = function(req,res){

	var track_id = req.params['id'];
	console.log("Get Track by ID:"+ track_id);
	
	try{
        var _track_id = mongoose.Types.ObjectId(track_id);
    }catch(e){
        return res.json({err:'invalid Track id'});        
    };
    
    TrackModel.findOne({_id:_track_id},function(err,_track){
    if (err)
        return res.json({state:1, err:err});
    if (!_track) {
        return res.json({state:1, err:'Melody does not exists'});
    }
        filename = "temp."+_track.ext;
		return res.download(_track.track_location,filename);
    });
}
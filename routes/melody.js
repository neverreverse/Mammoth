var MelodyDao = require("../dao/MelodyDao");
var MelodyModel = require("../models").Melody;
 
var TrackDao = require("../dao/TrackDao");
var TrackModel = require("../models").Track;


var UsersModel = require("./../models").Users;
var UsersDAO = require("../dao/UserDAO");

var UserFeedDao = require("../dao/UserFeedDao");


var mongoose = require('mongoose');

var step = require('step');

var fs = require('fs');
var utils = require("../libs/util");

var trackDao = new TrackDao(TrackModel);
var melodyDao = new MelodyDao(MelodyModel);

var userDao = new UsersDAO(UsersModel);

exports.getMelodyCollection=function(req,res){

};
exports.getMelodyList = function(req, res){
	console.log("Get melody list.");
	melodyDao.getAll(function(err,_data){
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
        return res.json({state:1,err:'invalid melody  id'});        
    };

    melodyDao.getById(_melody_id,function(err,_melody){
	    if (err)
	        return res.json({err:err});
	    if (!_melody) {
	        return res.json({state:1,err:'Melody does not exists'});
	    }
        return res.json(_melody);
    });
};
exports.getUserMeldoy=function(req, res){
	var user_id = req.params['id'];
	console.log("Get Melody by user ID:"+ user_id);

	userDao.getById(user_id, function(err, _user){
		if(err){
			return res.json({state:1, err:"fail to get the user"});
		}
		if(!_user){
			return res.json({state:1, err:"no such user"});
		}

		return res.json({state:0, melodies: _user.melodies });
	});

};
exports.putMelody=function(req,res){
	var user = req.session["user"];
    if(!user){
        return res.json({state:2,err:"Need login"});
    }

	var track_id = req.body.track_id;
	var author_id = req.body.author_id;

	var trackDao = new TrackDao(TrackModel);
	var melody = req.body;

	melody.track = new Array();

	userDao.getById(author_id, function(err, _user){
		if(err){
			return res.json({state:1, err:"fail to get the user"});
		}
		if(!_user){
			return res.json({state:1, err:"no such user"});
		}
		trackDao.getById(track_id,function(err,_track){
			if(err){
				return res.json({state:1,err:err});
			}
			if(_track==null){
				return res.json({state:1,err:"Can not find the track"});
			}
			melody.track.push( _track);
			melodyDao.create(melody, function(err, data){
				if(err){
					return res.json({state:1,err:err});
				}
				//save to user entity.
				_user.melodies.push(data.id);
				userDao.update({_id: _user._id },{$push:{melodies:data._id}} , function(err,_data){
                    if(err){
                        return res.json({state:1, err:err});
                    }
                });

				//send to feed system.
				var userFeedDao = new UserFeedDao();
				userFeedDao.dispatchMelody(_user, data, null);


				return res.json({state:0,melody:data});
			});
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
	//return res.json({state:1,err:"unexpected error"});
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

			trackDao.create({track_location:target_path,ext:file_ext},function(err, track){
			    if (err) {
                	return res.json({state:1,err:err});
            	}
				return res.json({state:0, guid:track._id});

			});
  		});
	});
};

exports.getTrackList=function(req,res){
	trackDao.getAll(function(err,_data){
		if(err){
			return res.json({state:1, err:err});
		}

		return res.json(_data);

	})

}

exports.getTrack = function(req,res){

	var track_id = req.params['id'];
	console.log("Get Track by ID:"+ track_id);
	
	try{
        var _track_id = mongoose.Types.ObjectId(track_id);
    }catch(e){
        return res.json({err:'invalid Track id'});        
    };
    
    trackDao.getById(_track_id, function(err,_track){
	    if (err)
	        return res.json({state:1, err:err});
	    if (!_track) {
	        return res.json({state:1, err:'Melody does not exists'});
	    }
        filename = "temp."+_track.ext;
		return res.download(_track.track_location,filename);

    });

}
var UsersModel = require("./UsersModel");

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var track_schema = new Schema({
    track_location:{ type:String},
    create_at:{ type:Date, default:Date.now },
});

var comment_schema = new Schema({
    comment:{type:String},
    author:UsersModel,
    author_name:{type:String},
    author_portrait:{type:String},    
    author_id:{type:Schema.ObjectId},
    melody_id:{type:Schema.ObjectId},
    create_at:{ type:Date, default:Date.now },
});

var melody_schema = new Schema({
    track: {type:String},
    description:{type:String},
    author:UsersModel,
    author_name:{type:String},
    author_portrait:{type:String},    
    author_id:{ type:Schema.ObjectId},
    play_style:{type:Schema.ObjectId},
    reply_count:{ type:Number, default:0 },
    label:[String],
    visit_count:{ type:Number, default:0 },
    collect_count:{ type:Number, default:0 },
    create_at:{ type:Date, default:Date.now },
    update_at:{ type:Date, default:Date.now },
    last_reply:{ type:Schema.ObjectId },
    last_reply_at:{ type:Date, default:Date.now },
    comment:[comment_schema]
});



mongoose.model('Track', track_schema);

mongoose.model('Melody', melody_schema);

mongoose.model('Comment', comment_schema);
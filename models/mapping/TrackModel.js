var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    track_location:{ type:String},
    ref:{type:Number, default:0},
    ext:{type:String},
    author_id:{ type:Schema.ObjectId },
    create_at:{ type:Date, default:Date.now },
});

mongoose.model('Track', schema);
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    track: {type:Schema.ObjectId},
    author_id:{ type:Schema.ObjectId},
    play_style:{type:Schema.ObjectId},
    reply_count:{ type:Number, default:0 },
    visit_count:{ type:Number, default:0 },
    collect_count:{ type:Number, default:0 },
    create_at:{ type:Date, default:Date.now },
    update_at:{ type:Date, default:Date.now },
    last_reply:{ type:Schema.ObjectId },
    last_reply_at:{ type:Date, default:Date.now }
});

mongoose.model('Melody', schema);
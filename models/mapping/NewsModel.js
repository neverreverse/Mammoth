var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

    var news_schema = new Schema({
    comment:{type:String},
    author_id:{ type:Schema.ObjectId },
    create_at:{ type:Date, default:Date.now },
});


mongoose.model('News', news_schema);

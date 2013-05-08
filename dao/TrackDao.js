var DaoBase = require('./DaoBase'),
    models = require('./../models'),
    Track = models.Track;

var TrackDao = new DaoBase(Track);

module.exports = TrackDao;
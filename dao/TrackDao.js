var DaoBase = require('./DaoBase');
var models = require('./../models');
var Track = models.Track;

var util = require("util");

var TrackDao = function (Track) {
    this.Track = Track || {};
    DaoBase.call(this, this.Track);
};
util.inherits(TrackDao, DaoBase);

module.exports = TrackDao;
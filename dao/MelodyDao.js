var DaoBase = require('./DaoBase');
var models = require('./../models');
var Melody = models.Melody;

var util = require("util");

var MelodyDao = function (melody) {
    this.melody = melody || {};
    DaoBase.call(this, this.melody);
};

util.inherits(MelodyDao, DaoBase);

module.exports = MelodyDao;
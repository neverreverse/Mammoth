var DaoBase = require('./DaoBase'),
    models = require('./../models'),
    Melody = models.Melody;

var MelodyDao = new DaoBase(Melody);

module.exports = MelodyDao;
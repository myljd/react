var mongo = require('mongodb');
var monk = require('monk');
var db = monk('dplins:bread2012@42.121.113.179:27017/dplins');

module.exports = db;

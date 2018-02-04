const dataPool = require('../util/dataPool');
const Promise = require('promise');

exports.getById = function (table, id) {
    return new Promise(function (resolve, reject) {
        try {
            let results = dataPool.query('select * from ' + table + ' where id=?', [id]);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAll = function (table) {
    return new Promise(function (resolve, reject) {
        try {
            let results = dataPool.query('select * from ' + table);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

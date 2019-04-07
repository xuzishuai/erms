const dataPool = require('../util/dataPool');
const Promise = require('promise');

exports.getById = function (table, id) {
    return new Promise(async function (resolve, reject) {
        try {
            let results = await dataPool.query('select * from ' + table + ' where id=?', [id]);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAll = function (table, order_by) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from ' + table;
            if (order_by && order_by != null) {
                sql += ' order by ' + order_by;
            }
            let results = await dataPool.query(sql);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

exports.deleteById = function (table, id) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('delete from ' + table + ' where id=?', [id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.isRoleExist = function (id, name) {
    return new Promise(async function (resolve, reject) {
        try {
            let role = {};
            if (id && id != '') {
                role = await dataPool.query('select * from role where name=? and id<>?', [name, id]);
            } else {
                role = await dataPool.query('select * from role where name=?', [name]);
            }
            resolve(role);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveRole = function (name, menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('insert into role values (?, ?, ?)', [uuid.v1(), name, menu_ids]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateRole = function (id, name, menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update role set name=?, menu_ids=? where id=?', [name, menu_ids, id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.login = function (user_no, password) {
    return new Promise(async function (resolve, reject) {
        try {
            let user = await dataPool.query('select * from user where user_no=? and password=? limit 1', [user_no, password]);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAllUser = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let user = await dataPool.query('select * from user where id<>"1cbb1360-d57d-11e7-9634-4d058774421e"');
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.isUserExist = function (id, user_no) {
    return new Promise(async function (resolve, reject) {
        try {
            let user = {};
            if (id && id != '') {
                user = await dataPool.query('select * from user where user_no=? and id<>?', [user_no, id]);
            } else {
                user = await dataPool.query('select * from user where user_no=?', [user_no]);
            }
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveUser = function (user_no, name, password, role_id, is_adviser) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('insert into user values (?, ?, ?, ?, ?, ?)', [uuid.v1(), user_no, name, password, role_id, is_adviser]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateUser = function (id, user_no, name, password, role_id, is_adviser) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update user set user_no=?, name=?, password=?, role_id=?, is_adviser=? where id=?', [user_no, name, password, role_id, is_adviser, id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAllAdviser = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let user = await dataPool.query('select * from user where is_adviser=1');
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};
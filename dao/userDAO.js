const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.login = function (user_no, password) {
    return new Promise(function (resolve, reject) {
        try {
            let user = dataPool.query('select * from user where user_no=? and password=? limit 1', [user_no, password]);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAllUser = function () {
    return new Promise(function (resolve, reject) {
        try {
            let user = dataPool.query('select * from user where id<>"1cbb1360-d57d-11e7-9634-4d058774421e"');
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getUserByUserNo = function (user_no) {
    return new Promise(function (resolve, reject) {
        try {
            let user = dataPool.query('select * from user where user_no=?', [user_no]);
            resolve(user);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveUser = function (user_no, name, password, role_id) {
    return new Promise(function (resolve, reject) {
        try {
            dataPool.query('insert into user values (?, ?, ?, ?, ?)', [uuid.v1(), user_no, name, password, role_id]);
        } catch (error) {
            reject(error);
        }
    })
};
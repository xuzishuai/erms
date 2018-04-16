const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.isContractExist = function (user_no) {
    return new Promise(async function (resolve, reject) {
        try {
            let contract = await dataPool.query('select * from contract where contract_no=?', [user_no]);
            resolve(contract);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveContract = function (contract) {
    return new Promise(async function (resolve, reject) {
        try {
            let sqls = ['insert into contract(id, student_id, contract_no) values (?, ?, ?)'];
            let params = [[]];
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
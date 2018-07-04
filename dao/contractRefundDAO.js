const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');
const baseDAO = require('../dao/baseDAO');

exports.getContractRefundByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from contract_refund where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and contract_id in (select id from contract where student_id=?)';
                    params[params.length] = condition.student_id;
                }
                if (condition.contract_no && condition.contract_no != '') {
                    sql += ' and contract_id in (select id from contract where contract_no like ?)';
                    params[params.length] = '%' + condition.contract_no + '%';
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and contract_id in (select id from contract where grade_id=?)';
                    params[params.length] = condition.grade_id;
                }
                if (condition.signer_id && condition.signer_id !== '') {
                    sql += ' and contract_id in (select id from contract where signer_id=?)';
                    params[params.length] = condition.signer_id;
                }
                if (condition.start_date && condition.start_date != '') {
                    sql += ' and refund_date>=?';
                    params[params.length] = condition.start_date;
                }
                if (condition.end_date && condition.end_date != '') {
                    sql += ' and refund_date<=?';
                    params[params.length] = condition.end_date;
                }
            }
            sql += ' order by refund_date';
            let contractRefunds = await dataPool.query(sql, params);
            resolve(contractRefunds);
        } catch (error) {
            reject(error);
        }
    })
};
const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');
const baseDAO = require('../dao/baseDAO');

exports.getContractChargeByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from contract_charge where 1=1';
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
                if (condition.mode_id && condition.mode_id != '') {
                    sql += ' and mode_id=?';
                    params[params.length] = condition.mode_id;
                }
                if (condition.signer_id && condition.signer_id !== '') {
                    sql += ' and contract_id in (select id from contract where signer_id=?)';
                    params[params.length] = condition.signer_id;
                }
                if (condition.type_id && condition.type_id != '') {
                    sql += ' and type_id=?';
                    params[params.length] = condition.type_id;
                }
                if (condition.start_date && condition.start_date != '') {
                    sql += ' and charge_date>=?';
                    params[params.length] = condition.start_date;
                }
                if (condition.end_date && condition.end_date != '') {
                    sql += ' and charge_date<=?';
                    params[params.length] = condition.end_date;
                }
            }
            sql += ' order by update_at';
            let contractCharges = await dataPool.query(sql, params);
            resolve(contractCharges);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveContractCharge = function (contractCharge) {
    return new Promise(async function (resolve, reject) {
        try {
            let sqls = [], params = [];
            let now = new Date();
            if (contractCharge.type_id == '03') {//如果是尾款，则加到合同的"已付款"里面，否则不改变合同
                let contract = await baseDAO.getById('contract', contractCharge.contract_id);
                contract = contract[0];
                contract.prepay = parseFloat(contract.prepay) + parseFloat(contractCharge.money);
                contract.left_money = parseFloat(contract.total_money) - parseFloat(contract.prepay);
                sqls[sqls.length] = 'update contract set prepay=?, left_money=?, update_at=? where id=?';
                params[params.length] = [contract.prepay, contract.left_money, now, contract.id];
            }
            sqls[sqls.length] = 'insert into contract_charge(id, contract_id, charge_date, type_id, mode_id, pos_no, money, operator_id, create_at, update_at)' +
                ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            params[params.length] = [uuid.v1(), contractCharge.contract_id, contractCharge.charge_date, contractCharge.type_id, contractCharge.mode_id,
                contractCharge.pos_no, contractCharge.money, contractCharge.operator_id, now, now];
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateContractCharge = function (contractCharge) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update contract_charge set charge_date=?, type_id=?, mode_id=?, pos_no=?, update_at=? where id=?',
                [contractCharge.charge_date, contractCharge.type_id, contractCharge.mode_id, contractCharge.pos_no, new Date(), contractCharge.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.deleteContractCharge = function (id) {
    return new Promise(async function (resolve, reject) {
        try {
            let sqls = [], params = [];
            let contractCharge = await baseDAO.getById('contract_charge', id);
            contractCharge = contractCharge[0];
            let contract = await baseDAO.getById('contract', contractCharge.contract_id);
            contract = contract[0];
            contract.prepay = parseFloat(contract.prepay) - parseFloat(contractCharge.money);
            contract.left_money = parseFloat(contract.total_money) - parseFloat(contract.prepay);

            sqls[sqls.length] = 'update contract set prepay=?, left_money=?, update_at=? where id=?';
            params[params.length] = [contract.prepay, contract.left_money, new Date(), contract.id];

            sqls[sqls.length] = 'delete from contract_charge where id=?';
            params[params.length] = [id];
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
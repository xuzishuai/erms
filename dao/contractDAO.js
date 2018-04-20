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
            let contractId = uuid.v1();
            let now = new Date();
            let sqls = ['insert into contract(id, student_id, contract_no, attribute_id, contract_type_id, grade_id, total_money, prepay, left_money, ' +
                'total_lesson_period, start_date, is_recommend, recommend_type, recommender_id, signer_id, possibility_id, status_id, create_at, update_at, note)' +
                ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'];
            let params = [[contractId, contract.student_id, contract.contract_no, contract.attribute_id, contract.contract_type_id, contract.grade_id,
                contract.total_money, contract.prepay, contract.left_money, contract.total_lesson_period, contract.start_date, contract.is_recommend,
                contract.recommend_type, contract.recommender_id, contract.signer_id, contract.possibility_id, '01', now, now, contract.note]];
            let contractDetail = contract.contractDetail;
            for (let i = 0; i < contractDetail.length; i++) {
                sqls[sqls.length] = 'insert into contract_detail(id, contract_id, subject_id, grade_id, lesson_period, finished_lesson, type_id, price, ' +
                    'status_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params[params.length] = [uuid.v1(), contractId, contractDetail[i].subject_id, contract.grade_id, contractDetail[i].lesson_period, '01',
                    contractDetail[i].type_id, contractDetail[i].price, '01', now, now];
            }
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getContractByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from contract where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and student_id=?';
                    params[params.length] = condition.student_id;
                }
                if (condition.contract_no && condition.contract_no != '') {
                    sql += ' and contract_no like ?';
                    params[params.length] = '%' + condition.contract_no + '%';
                }
                if (condition.attribute_id && condition.attribute_id != '') {
                    sql += ' and attribute_id=?';
                    params[params.length] = condition.attribute_id;
                }
                if (condition.contract_type_id && condition.contract_type_id !== '') {
                    sql += ' and contract_type_id=?';
                    params[params.length] = condition.contract_type_id;
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and grade_id=?';
                    params[params.length] = condition.grade_id;
                }
                if (condition.start_date_from && condition.start_date_from != '') {
                    sql += ' and start_date>=?';
                    params[params.length] = condition.start_date_from;
                }
                if (condition.start_date_to && condition.start_date_to != '') {
                    sql += ' and start_date<=?';
                    params[params.length] = condition.start_date_to;
                }
                if (condition.signer_id && condition.signer_id != '') {
                    sql += ' and signer_id=?';
                    params[params.length] = condition.signer_id;
                }
                if (condition.status_id && condition.status_id.length > 0) {
                    sql += ' and status_id in (?)';
                    params[params.length] = condition.status_id;
                }
            }
            sql += ' order by update_at';
            let contracts = await dataPool.query(sql, params);
            resolve(contracts);
        } catch (error) {
            reject(error);
        }
    })
};
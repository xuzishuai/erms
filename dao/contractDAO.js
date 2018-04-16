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
            let sqls = ['insert into contract(id, student_id, contract_no, attribute, contract_type, grade_id, total_money, prepay, left_money, ' +
                'total_lesson_period, start_date, is_recommend, recommend_type, recommender_id, signer_id, possibility, status, create_at, update_at, note)' +
                ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'];
            let params = [[contractId, contract.student_id, contract.contract_no, contract.attribute, contract.contract_type, contract.grade_id,
                contract.total_money, contract.prepay, contract.left_money, contract.total_lesson_period, contract.start_date, contract.is_recommend,
                contract.recommend_type, contract.recommender_id, contract.signer_id, contract.possibility, 0, now, now, contract.note]];
            let contractDetail = contract.contractDetail;
            for (let i = 0; i < contractDetail.length; i++) {
                sqls[sqls.length] = 'insert into contract_detail(id, contract_id, subject_id, grade_id, lesson_period, finished_lesson, type, price, ' +
                    'status, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params[params.length] = [uuid.v1(), contractId, contractDetail[i].subject_id, contract.grade_id, contractDetail[i].lesson_period, 0,
                    contractDetail[i].type, contractDetail[i].price, 0, now, now];
            }
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
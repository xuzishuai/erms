const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');
const baseDAO = require('../dao/baseDAO');

exports.isContractNoExist = function (contract_no, id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contract = [];
            if (!id || id == '')
                contract = await dataPool.query('select * from contract where contract_no=?', [contract_no]);
            else
                contract = await dataPool.query('select * from contract where contract_no=? and id<>?', [contract_no, id]);
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
                params[params.length] = [uuid.v1(), contractId, contractDetail[i].subject_id, contract.grade_id, contractDetail[i].lesson_period, 0,
                    contractDetail[i].type_id, contractDetail[i].price, '01', now, now];
            }
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getContractByCondition = function (table, condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from ' + table + ' where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and student_id=?';
                    params[params.length] = condition.student_id;
                }
                if (condition.headmaster_id && condition.headmaster_id != '') {
                    sql += ' and student_id in (select id from student where status_id="03" and headmaster_id=?)';
                    params[params.length] = condition.headmaster_id;
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

exports.getContractChargesByContractId = function (contract_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contractCharges = await dataPool.query('select * from contract_charge where contract_id=?', [contract_id]);
            resolve(contractCharges);
        } catch (error) {
            reject(error);
        }
    })
};

function getDetailsByContractId (contract_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contractDetails = await dataPool.query('select * from contract_detail where contract_id=?', [contract_id]);
            resolve(contractDetails);
        } catch (error) {
            reject(error);
        }
    })
}

exports.getDetailsByContractId = getDetailsByContractId;

function getDetailTempsByContractId (contract_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contractDetails = await dataPool.query('select * from contract_detail_temp where contract_id=?', [contract_id]);
            resolve(contractDetails);
        } catch (error) {
            reject(error);
        }
    })
}

exports.getDetailTempsByContractId = getDetailTempsByContractId;

exports.saveContractTemp = function (contractTemp) {
    return new Promise(async function (resolve, reject) {
        try {
            let sqls = ['insert into contract_temp(id, student_id, contract_no, attribute_id, contract_type_id, grade_id, total_money, prepay, left_money, ' +
                'total_lesson_period, start_date, is_recommend, recommend_type, recommender_id, signer_id, possibility_id, status_id, create_at, update_at, note)' +
                ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                'update contract set status_id=? where id=?'];
            let params = [[contractTemp.id, contractTemp.student_id, contractTemp.contract_no, contractTemp.attribute_id, contractTemp.contract_type_id, contractTemp.grade_id,
                contractTemp.total_money, contractTemp.prepay, contractTemp.left_money, contractTemp.total_lesson_period, contractTemp.start_date, contractTemp.is_recommend,
                contractTemp.recommend_type, contractTemp.recommender_id, contractTemp.signer_id, contractTemp.possibility_id, '04', contractTemp.create_at, new Date(), contractTemp.note],
                ['04', contractTemp.id]];
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveContractDetailTemp = function (contractDetailTemp, contract_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contract = await baseDAO.getById('contract', contract_id);
            let contractTemp = contract[0];
            let total_money = 0, total_lesson_period = 0;
            let now = new Date();
            let sqls = ['update contract set status_id=? where id=?'];
            let params = [['05', contractTemp.id]];
            for (let i = 0; i < contractDetailTemp.length; i++) {
                sqls[sqls.length] = 'insert into contract_detail_temp(id, contract_id, subject_id, grade_id, lesson_period, finished_lesson, type_id, price, status_id, create_at, update_at)' +
                    ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                let isOld = contractDetailTemp[i].id && contractDetailTemp[i].id != '';
                params[params.length] = [isOld?contractDetailTemp[i].id:uuid.v1(), contractTemp.id, contractDetailTemp[i].subject_id, contractTemp.grade_id, contractDetailTemp[i].lesson_period,
                    isOld?contractDetailTemp[i].finished_lesson:0, contractDetailTemp[i].type_id, contractDetailTemp[i].price, contractDetailTemp[i].status_id, now, now];
                total_money += parseFloat(contractDetailTemp[i].price);
                total_lesson_period += parseInt(contractDetailTemp[i].lesson_period);
            }
            contractTemp.total_money = total_money;
            contractTemp.total_lesson_period = total_lesson_period;
            contractTemp.left_money = total_money - contractTemp.prepay;
            sqls[sqls.length] = 'insert into contract_temp(id, student_id, contract_no, attribute_id, contract_type_id, grade_id, total_money, prepay, left_money, ' +
                'total_lesson_period, start_date, is_recommend, recommend_type, recommender_id, signer_id, possibility_id, status_id, create_at, update_at, note)' +
                ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            params[params.length] = [contractTemp.id, contractTemp.student_id, contractTemp.contract_no, contractTemp.attribute_id, contractTemp.contract_type_id, contractTemp.grade_id,
                contractTemp.total_money, contractTemp.prepay, contractTemp.left_money, contractTemp.total_lesson_period, contractTemp.start_date, contractTemp.is_recommend,
                contractTemp.recommend_type, contractTemp.recommender_id, contractTemp.signer_id, contractTemp.possibility_id, '05', contractTemp.create_at, now, contractTemp.note];
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.auditContract = function (id, audit_status) {
    return new Promise(async function (resolve, reject) {
        try {
            let contract = await baseDAO.getById('contract', id);
            contract = contract[0];
            let student  = await baseDAO.getById('student', contract.student_id);
            student = student[0];
            let details = await getDetailsByContractId(contract.id);
            let now = new Date();
            let detailLogs = [];
            if (contract.status_id == '01') {//合同待确认的审核
                if (audit_status == '1') {//审核通过
                    contract.status_id = '02';
                    student.status_id = '03';
                    student.update_at = now;
                    for (let i = 0; i < details.length; i++) {//更新合同明细状态
                        details[i].status_id = '02';
                    }
                    detailLogs = details;//写入明细日志
                } else {//审核不通过
                    contract.status_id = '03';
                }
                contract.update_at = now;
            } else if (contract.status_id == '04') {//合同修改的审核
                if (audit_status == '1') {//审核通过
                    let contractTemp = await baseDAO.getById('contract_temp', contract.id);
                    contract = contractTemp[0];
                    student.status_id = '03';
                    contract.update_at = now;
                    if (details[0].status_id == '01') {//如果此时合同明细还待确认
                        for (let i = 0; i < details.length; i++) {//更新合同明细状态
                            details[i].status_id = '02';
                        }
                        detailLogs = details;
                    }
                }
                if (details[0].status_id == '01') {//如果此时合同明细还待确认，合同变成已驳回
                    contract.status_id = '03';
                } else {
                    contract.status_id = '02';//变回执行中
                }
            } else if (contract.status_id = '05') {//合同变更的审核
                if (audit_status == '1') {//审核通过
                    let contractTemp = await baseDAO.getById('contract_temp', contract.id);
                    contract = contractTemp[0];
                    student.status_id = '03';
                    contract.update_at = now;
                    details = await getDetailTempsByContractId(contract.id);
                    for (let i = 0; i < details.length; i++) {//更新合同明细状态
                        details[i].status_id = '02';
                    }
                    detailLogs = details;
                }
                if (details[0].status_id == '01') {//如果此时合同明细还待确认，合同变成已驳回
                    contract.status_id = '03';
                } else {
                    contract.status_id = '02';//变回执行中
                }
            }
            let sqls = ['update contract set student_id=?, contract_no=?, attribute_id=?, contract_type_id=?, grade_id=?, total_money=?, ' +
                'prepay=?, left_money=?, total_lesson_period=?, start_date=?, is_recommend=?, recommend_type=?, recommender_id=?, signer_id=?, possibility_id=?, ' +
                'status_id=?, create_at=?, update_at=?, note=? where id=?',
                'update student set status_id=?, update_at=? where id=?',
                'delete from contract_temp where id=?',
                'delete from contract_detail where contract_id=?',
                'delete from contract_detail_temp where contract_id=?'];
            let params = [[contract.student_id, contract.contract_no, contract.attribute_id, contract.contract_type_id, contract.grade_id, contract.total_money, contract.prepay,
                contract.left_money, contract.total_lesson_period, contract.start_date, contract.is_recommend, contract.recommend_type, contract.recommender_id,
                contract.signer_id, contract.possibility_id, contract.status_id, contract.create_at, contract.update_at, contract.note, contract.id],
                [student.status_id, student.update_at, student.id],
                [contract.id],
                [contract.id],
                [contract.id]];
            for (let i = 0; i < details.length; i++) {
                sqls[sqls.length] = 'insert into contract_detail(id, contract_id, subject_id, grade_id, lesson_period, finished_lesson, type_id, price, ' +
                    'status_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params[params.length] = [details[i].id, details[i].contract_id, details[i].subject_id, details[i].grade_id, details[i].lesson_period, details[i].finished_lesson,
                    details[i].type_id, details[i].price, details[i].status_id, details[i].create_at, now];
            }
            for (let i = 0; i < detailLogs.length; i++) {
                sqls[sqls.length] = 'insert into contract_detail_log(id, contract_id, subject_id, grade_id, lesson_period, finished_lesson, type_id, price, status_id, update_at)' +
                    'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params[params.length] = [uuid.v1(), detailLogs[i].contract_id, detailLogs[i].subject_id, detailLogs[i].grade_id, detailLogs[i].lesson_period, detailLogs[i].finished_lesson,
                    detailLogs[i].type_id, detailLogs[i].price, detailLogs[i].status_id, now];
            }
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getDetailLogsByContractId = function (contract_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let contractDetailLogs = await dataPool.query('select * from contract_detail_log where contract_id=? order by update_at desc', [contract_id]);
            resolve(contractDetailLogs);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSingedContractCount = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let count = await dataPool.query("select count(*) count from contract where status_id='02'");
            resolve(count);
        } catch (error) {
            reject(error);
        }
    })
};
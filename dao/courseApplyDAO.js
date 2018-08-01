const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getCourseApplyByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from course_apply where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and contract_id in (select id from contract where status_id="02" and student_id=?)';
                    params[params.length] = condition.student_id;
                }
                if (condition.contract_no && condition.contract_no != '') {
                    sql += ' and contract_id in (select id from contract where contract_no like ?)';
                    params[params.length] = '%' + condition.contract_no + '%';
                }
                if (condition.status_id && condition.status_id != '') {
                    sql += ' and status_id=?';
                    params[params.length] = condition.status_id;
                }
                if (condition.operator_id && condition.operator_id != '') {
                    sql += ' and operator_id=?';
                    params[params.length] = condition.operator_id;
                }
                if (condition.headmaster_id && condition.headmaster_id != '') {
                    sql += ' and contract_id in (select id from contract where status_id="02" and student_id in (select id from student where status_id="03" and headmaster_id=?))';
                    params[params.length] = condition.headmaster_id;
                }
            }
            let courseApplies = await dataPool.query(sql, params);
            resolve(courseApplies);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveCourseApply = function (courseApply) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into course_apply(id, contract_id, status_id, name, path, operator_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), courseApply.contract_id, '01', courseApply.name, courseApply.path, courseApply.operator_id, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateCourseApply = function (courseApply) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update course_apply set status_id=?, name=?, path=?, update_at=? where id=?',
                [courseApply.status_id, courseApply.name, courseApply.path, new Date(), courseApply.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
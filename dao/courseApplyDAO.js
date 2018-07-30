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

//todo:编辑申请，删除以前的申请文件，替换为新的文件
exports.updateCourseApply = function (courseApply) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update course_apply set mode_id=?, visit_date=?, target=?, type_id=?, content=?, suggestion=?, operator=?, update_at=? where id=?',
                [courseApply.mode_id, courseApply.visit_date, courseApply.target, courseApply.type_id, courseApply.content, courseApply.suggestion, courseApply.operator, new Date(), courseApply.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
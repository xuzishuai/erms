const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getTeacherByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from teacher where 1=1';
            let params = [];
            if (condition) {
                if (condition.name && condition.name != '') {
                    sql += ' and name like ?';
                    params[params.length] = '%' + condition.name + '%';
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and grade_ids like ?';
                    params[params.length] = '%#' + condition.grade_id + '#%';
                }
                if (condition.sbuject_id && condition.sbuject_id != '') {
                    sql += ' and sbuject_id=?';
                    params[params.length] = condition.sbuject_id;
                }
                if (condition.contact && condition.contact != '') {
                    sql += ' and contact like ?';
                    params[params.length] = '%' + condition.contact + '%';
                }
                if (condition.is_part_time && condition.is_part_time != '') {
                    sql += ' and is_part_time=?';
                    params[params.length] = condition.is_part_time;
                }
                if (condition.status && condition.status != '') {
                    sql += ' and status=?';
                    params[params.length] = condition.status;
                }
            }
            let teachers = await dataPool.query(sql, params);
            resolve(teachers);
        } catch (error) {
            reject(error);
        }
    })
};
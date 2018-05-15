const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getRevisitRecordByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from revisit_record where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and student_id=?';
                    params[params.length] = condition.student_id;
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and student_id in (select id from student where status_id="03" and grade_id=?)';
                    params[params.length] = condition.grade_id;
                }
                if (condition.visit_start_date && condition.visit_start_date != '') {
                    sql += ' and visit_date>=?';
                    params[params.length] = condition.visit_start_date;
                }
                if (condition.visit_end_date && condition.visit_end_date != '') {
                    sql += ' and visit_date<=?';
                    params[params.length] = condition.visit_end_date;
                }
                if (condition.type_id && condition.type_id != '') {
                    sql += ' and type_id=?';
                    params[params.length] = condition.type_id;
                }
                if (condition.mode_id && condition.mode_id != '') {
                    sql += ' and mode_id=?';
                    params[params.length] = condition.mode_id;
                }
                if (condition.operator && condition.operator != '') {
                    sql += ' and operator like ?';
                    params[params.length] = '%' + condition.operator + '%';
                }
            }
            let revisitRecords = await dataPool.query(sql, params);
            resolve(revisitRecords);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveRevisitRecord = function (revisitRecord) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into revisit_record(id, student_id, mode_id, visit_date, target, type_id, content, suggestion, operator, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), revisitRecord.student_id, revisitRecord.mode_id, revisitRecord.visit_date, revisitRecord.target, revisitRecord.type_id, revisitRecord.content, revisitRecord.suggestion, revisitRecord.operator, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateRevisitRecord = function (revisitRecord) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update revisit_record set mode_id=?, visit_date=?, target=?, type_id=?, content=?, suggestion=?, operator=?, update_at=? where id=?',
                [revisitRecord.mode_id, revisitRecord.visit_date, revisitRecord.target, revisitRecord.type_id, revisitRecord.content, revisitRecord.suggestion, revisitRecord.operator, new Date(), revisitRecord.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
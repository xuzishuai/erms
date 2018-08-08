const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getCourseScheduleByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from course_schedule where 1=1';
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
                if (condition.sbuject_id && condition.sbuject_id != '') {
                    sql += ' and sbuject_id=?';
                    params[params.length] = condition.sbuject_id;
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and grade_id=?';
                    params[params.length] = condition.grade_id;
                }
                if (condition.teacher_id && condition.teacher_id != '') {
                    sql += ' and teacher_id=?';
                    params[params.length] = condition.teacher_id;
                }
                if (condition.lesson_date && condition.lesson_date != '') {
                    sql += ' and lesson_date=?';
                    params[params.length] = condition.lesson_date;
                }
                if (condition.lesson_period_id && condition.lesson_period_id != '') {
                    sql += ' and lesson_period_id=?';
                    params[params.length] = condition.lesson_period_id;
                }
                if (condition.class_room_id && condition.class_room_id != '') {
                    sql += ' and class_room_id=?';
                    params[params.length] = condition.class_room_id;
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
            let courseSchedules = await dataPool.query(sql, params);
            resolve(courseSchedules);
        } catch (error) {
            reject(error);
        }
    })
};
/*

exports.saveCourseSchedule = function (courseSchedule) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into course_schedule(id, contract_id, status_id, name, path, operator_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), courseSchedule.contract_id, '01', courseSchedule.name, courseSchedule.path, courseSchedule.operator_id, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateCourseSchedule = function (courseSchedule) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update course_schedule set status_id=?, name=?, path=?, update_at=? where id=?',
                [courseSchedule.status_id, courseSchedule.name, courseSchedule.path, new Date(), courseSchedule.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};*/

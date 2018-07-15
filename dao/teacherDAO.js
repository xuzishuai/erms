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

exports.saveTeacher = function (teacher) {
    return new Promise(async function (resolve, reject) {
        try {
            let teacherId = uuid.v1();
            let now = new Date();
            let sqls = ['insert into teacher(id, name, gender, contact, grade_ids, subject_id, is_part_time, status, create_at, update_at)' +
            ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'];
            let params = [[teacherId, teacher.name, teacher.gender, teacher.contact, teacher.grade_ids, teacher.subject_id, teacher.is_part_time, teacher.status, now, now]];
            let teacherFreeTime = teacher.teacherFreeTime;
            for (let i = 0; i < teacherFreeTime.length; i++) {
                sqls[sqls.length] = 'insert into teacher_free_time(id, teacher_id, free_date, lesson_period_ids) values (?, ?, ?, ?)';
                params[params.length] = [uuid.v1(), teacherId, teacherFreeTime[i].free_date, teacherFreeTime[i].lesson_period_ids];
            }
            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getFreeTimeByTeacherId = function (teacher_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let teacherFreeTimes = await dataPool.query('select * from teacher_free_time where teacher_id=?', [teacher_id]);
            resolve(teacherFreeTimes);
        } catch (error) {
            reject(error);
        }
    })
};
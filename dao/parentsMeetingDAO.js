const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getParentsMeetingByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from parents_meeting where 1=1';
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
                if (condition.create_start_date && condition.create_start_date != '') {
                    sql += ' and create_at>=?';
                    params[params.length] = condition.create_start_date;
                }
                if (condition.create_end_date && condition.create_end_date != '') {
                    sql += ' and create_at<=?';
                    params[params.length] = condition.create_end_date + ' 23:59:59';
                }
                if (condition.adviser_id && condition.adviser_id != '') {
                    sql += ' and student_id in (select id from student where status_id="03" and adviser_id=?)';
                    params[params.length] = condition.adviser_id;
                }
                if (condition.headmaster_id && condition.headmaster_id != '') {
                    sql += ' and student_id in (select id from student where status_id="03" and headmaster_id=?)';
                    params[params.length] = condition.headmaster_id;
                }
                if (condition.start_date && condition.start_date != '') {
                    sql += ' and start_time>=? and start_time<=?';
                    params[params.length] = condition.start_date;
                    params[params.length] = condition.start_date + ' 23:59:59';
                }
                if (condition.operator && condition.operator != '') {
                    sql += ' and operator like ?';
                    params[params.length] = '%' + condition.operator + '%';
                }
            }
            let parentsMeetings = await dataPool.query(sql, params);
            resolve(parentsMeetings);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveParentsMeeting = function (parentsMeeting) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into parents_meeting(id, student_id, start_time, attendee, situation, suggestion, solution, operator, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), parentsMeeting.student_id, parentsMeeting.start_time, parentsMeeting.attendee, parentsMeeting.situation, parentsMeeting.suggestion, parentsMeeting.solution, parentsMeeting.operator, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateParentsMeeting = function (parentsMeeting) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update parents_meeting set start_time=?, attendee=?, situation=?, suggestion=?, solution=?, operator=?, update_at=? where id=?',
                [parentsMeeting.start_time, parentsMeeting.attendee, parentsMeeting.situation, parentsMeeting.suggestion, parentsMeeting.solution, parentsMeeting.operator, new Date(), parentsMeeting.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
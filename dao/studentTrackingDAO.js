const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getStudentTrackingBySId = function (student_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let studentTrackings = await dataPool.query('select * from student_tracking where student_id=?', [student_id]);
            resolve(studentTrackings);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveStudentTracking = function (studentTracking) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into student_tracking(id, student_id, track_date, channel_id, content, result, possibility_id, next_track_date, tracker_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), studentTracking.student_id, studentTracking.track_date, studentTracking.channel_id, studentTracking.content, studentTracking.result, studentTracking.possibility_id, studentTracking.next_track_date,
                    studentTracking.tracker_id, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateStudentTracking = function (studentTracking) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update student_tracking set track_date=?, channel_id=?, result=?, possibility_id=?, next_track_date=?, content=?, update_at=? where id=?',
                [studentTracking.track_date, studentTracking.channel_id, studentTracking.result, studentTracking.possibility_id, studentTracking.next_track_date, studentTracking.content, new Date(), studentTracking.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
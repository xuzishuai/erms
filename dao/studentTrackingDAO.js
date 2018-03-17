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

exports.saveStudentTracking = function (student_id, channel, result, possibility, next_track_date, content, tracker_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let track_date = new Date();
            await dataPool.query('insert into student_tracking values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [uuid.v1(), student_id, track_date, channel, content, result, possibility, next_track_date, tracker_id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateStudentTracking = function (id, channel, result, possibility, next_track_date, content) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update student_tracking set channel=?, result=?, possibility=?, next_track_date=?, content=? where id=?', [channel, result, possibility, next_track_date, content, id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
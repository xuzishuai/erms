const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getVisitRecordBySId = function (student_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let visitRecords = await dataPool.query('select * from visit_record where student_id=?', [student_id]);
            resolve(visitRecords);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveVisitRecord = function (visitRecord) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into visit_record(id, student_id, arrive_time, leave_time, possibility, content, receptionist_id, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), visitRecord.student_id, visitRecord.arrive_time, visitRecord.leave_time, visitRecord.possibility, visitRecord.content, visitRecord.receptionist_id, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateVisitRecord = function (visitRecord) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update visit_record set arrive_time=?, leave_time=?, possibility=?, content=?, update_at=? where id=?',
                [visitRecord.arrive_time, visitRecord.leave_time, visitRecord.possibility, visitRecord.content, new Date(), visitRecord.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
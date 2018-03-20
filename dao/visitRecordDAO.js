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

exports.saveVisitRecord = function (student_id, arrive_time, leave_time, possibility, content, receptionist_id) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('insert into visit_record values (?, ?, ?, ?, ?, ?, ?)', [uuid.v1(), student_id, arrive_time, leave_time, possibility, content, receptionist_id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateVisitRecord = function (id, arrive_time, leave_time, possibility, content) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update visit_record set arrive_time=?, leave_time=?, possibility=?, content=? where id=?', [arrive_time, leave_time, possibility, content, id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
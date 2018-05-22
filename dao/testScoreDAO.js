const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getTestScoreByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from test_score where 1=1';
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
                if (condition.type_id && condition.type_id != '') {
                    sql += ' and type_id=?';
                    params[params.length] = condition.type_id;
                }
                if (condition.score && condition.score != '') {
                    sql += ' and score=?';
                    params[params.length] = condition.score;
                }
                if (condition.test_start_date && condition.test_start_date != '') {
                    sql += ' and test_date>=?';
                    params[params.length] = condition.test_start_date;
                }
                if (condition.test_end_date && condition.test_end_date != '') {
                    sql += ' and test_date<=?';
                    params[params.length] = condition.test_end_date;
                }
            }
            let testScores = await dataPool.query(sql, params);
            resolve(testScores);
        } catch (error) {
            reject(error);
        }
    })
};

/*
exports.saveTestScore = function (testScore) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into test_score(id, student_id, start_time, attendee, situation, suggestion, solution, operator, create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), testScore.student_id, testScore.start_time, testScore.attendee, testScore.situation, testScore.suggestion, testScore.solution, testScore.operator, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateTestScore = function (testScore) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update test_score set start_time=?, attendee=?, situation=?, suggestion=?, solution=?, operator=?, update_at=? where id=?',
                [testScore.start_time, testScore.attendee, testScore.situation, testScore.suggestion, testScore.solution, testScore.operator, new Date(), testScore.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};*/

const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.isLessonPeriodExist = function (id, name) {
    return new Promise(async function (resolve, reject) {
        try {
            let lessonPeriod = {};
            if (id && id != '') {
                lessonPeriod = await dataPool.query('select * from lesson_period where name=? and id<>?', [name, id]);
            } else {
                lessonPeriod = await dataPool.query('select * from lesson_period where name=?', [name]);
            }
            resolve(lessonPeriod);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveLessonPeriod = function (lessonPeriod) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('insert into lesson_period(id, name, start_time, end_time) values (?, ?, ?, ?)',
                [uuid.v1(), lessonPeriod.name, lessonPeriod.start_time, lessonPeriod.end_time]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateLessonPeriod = function (lessonPeriod) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update lesson_period set name=?, start_time=?, end_time=? where id=?',
                [lessonPeriod.name, lessonPeriod.start_time, lessonPeriod.end_time, lessonPeriod.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
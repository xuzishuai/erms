const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.getClassRoomByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from class_room where 1=1';
            let params = [];
            if (condition) {
                if (condition.name && condition.name != '') {
                    sql += ' and name like ?';
                    params[params.length] = '%' + condition.name + '%';
                }
                if (condition.status_id && condition.status_id != '') {
                    sql += ' and status_id=?';
                    params[params.length] = condition.status_id;
                }
            }
            sql += ' order by update_at';
            let classRooms = await dataPool.query(sql, params);
            resolve(classRooms);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveClassRoom = function (classRoom) {
    return new Promise(async function (resolve, reject) {
        try {
            let now = new Date();
            await dataPool.query('insert into class_room(id, name, status_id, create_at, update_at) values (?, ?, ?, ?, ?)',
                [uuid.v1(), classRoom.name, classRoom.status_id, now, now]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.updateClassRoom = function (classRoom) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update class_room set status_id=?, update_at=? where id=?',
                [classRoom.status_id, new Date(), classRoom.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.saveStudent = function (name, gender, grade_id, contact, appointment_time, source_id, how_know_id, note) {
    return new Promise(async function (resolve, reject) {
        try {
            let create_at = new Date();
            let year = create_at.getFullYear(); //获取完整的年份(4位,1970-????)
            let month = create_at.getMonth()+1; //获取当前月份(0-11,0代表1月)
            if (month < 10)
                month = '0' + month;
            let day = create_at.getDate(); //获取当前日(1-31)
            if (day < 10)
                day = '0' + day;
            let todayNewStudents = await dataPool.query('select * from student where student_no like ?', [year.toString() + month.toString() + day.toString() + '%']);
            let num = todayNewStudents.length + 1;
            if (num < 10)
                num = '000' + num;
            else if (num < 100)
                num = '00' + num;
            else if (num < 1000)
                num = '0' + num;
            await dataPool.query('insert into student values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), year.toString() + month.toString() + day.toString() + num, name, gender, grade_id, contact, appointment_time, null, source_id, how_know_id, 0, create_at, note, null]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};

exports.getStudentByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from student where 1=1';
            let params = [];
            if (condition) {
                if (condition.status != null) {
                    sql += ' and status=?';
                    params[params.length] = condition.status;
                }

            }
            let students = await dataPool.query(sql, params);
            resolve(students);
        } catch (error) {
            reject(error);
        }
    })
};
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
            await dataPool.query('insert into student values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), year.toString() + month.toString() + day.toString() + num, name, gender, grade_id, contact, appointment_time, null, source_id, how_know_id, 0, create_at, note, null, 0]);
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
                if (condition.name && condition.name != '') {
                    sql += ' and name like ?';
                    params[params.length] = '%' + condition.name + '%';
                }
                if (condition.contact && condition.contact != '') {
                    sql += ' and contact like ?';
                    params[params.length] = '%' + condition.contact + '%';
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and grade_id=?';
                    params[params.length] = condition.grade_id;
                }
                if (condition.status != null && condition.status !== '') {
                    sql += ' and status=?';
                    params[params.length] = condition.status;
                }
                if (condition.appointment_start_time && condition.appointment_start_time != '') {
                    sql += ' and appointment_time>=?';
                    params[params.length] = condition.appointment_start_time;
                }
                if (condition.appointment_end_time && condition.appointment_end_time != '') {
                    sql += ' and appointment_time<=?';
                    params[params.length] = condition.appointment_end_time;
                }
                if (condition.adviser_id && condition.adviser_id != '') {
                    sql += ' and adviser_id=?';
                    params[params.length] = condition.adviser_id;
                }
                if (condition.source_id && condition.source_id != '') {
                    sql += ' and source_id=?';
                    params[params.length] = condition.source_id;
                }
                if (condition.audit_status != null && condition.audit_status !== '') {
                    sql += ' and audit_status=?';
                    params[params.length] = condition.audit_status;
                }
            }
            let students = await dataPool.query(sql, params);
            resolve(students);
        } catch (error) {
            reject(error);
        }
    })
};

exports.doUpdateStudent = function (student) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('update student set name=?, gender=?, grade_id=?, contact=?, appointment_time=?, ' +
                'adviser_id=?, source_id=?, how_know_id=?, status=?, note=?, arrive_time=?, audit_status=? where id=?',
                [student.name, student.gender, student.grade_id, student.contact, student.appointment_time, student.adviser_id, student.source_id
                    , student.how_know_id, student.status, student.note, new Date(), student.audit_status, student.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');

exports.saveStudent = function (student) {
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
            await dataPool.query('insert into student(id, student_no, name, gender, grade_id, contact, appointment_time, source_id, how_know_id, status_id, note, audit_status_id,' +
                ' create_at, update_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuid.v1(), year.toString() + month.toString() + day.toString() + num, student.name, student.gender, student.grade_id, student.contact, student.appointment_time,
                    student.source_id, student.how_know_id, '01', student.note, '01', create_at, create_at]);
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
                if (condition.student_no && condition.student_no != '') {
                    sql += ' and student_no like ?';
                    params[params.length] = '%' + condition.student_no + '%';
                }
                if (condition.school && condition.school != '') {
                    sql += ' and school like ?';
                    params[params.length] = '%' + condition.school + '%';
                }
                if (condition.contact && condition.contact != '') {
                    sql += ' and contact like ?';
                    params[params.length] = '%' + condition.contact + '%';
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and grade_id=?';
                    params[params.length] = condition.grade_id;
                }
                if (condition.warning_id && condition.warning_id != '') {
                    sql += ' and warning_id=?';
                    params[params.length] = condition.warning_id;
                }
                if (condition.status_id && condition.status_id != '') {
                    sql += ' and status_id=?';
                    params[params.length] = condition.status_id;
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
                if (condition.headmaster_id && condition.headmaster_id != '') {
                    sql += ' and headmaster_id=?';
                    params[params.length] = condition.headmaster_id;
                }
                if (condition.source_id && condition.source_id != '') {
                    sql += ' and source_id=?';
                    params[params.length] = condition.source_id;
                }
                if (condition.audit_status_id && condition.audit_status_id != '') {
                    sql += ' and audit_status_id=?';
                    params[params.length] = condition.audit_status_id;
                }
                if (condition.has_headmaster && condition.has_headmaster !='') {
                    if (condition.has_headmaster == 'has') {
                        sql += ' and headmaster_id is not null';
                    } else if (condition.has_headmaster == 'hasnt') {
                        sql += ' and headmaster_id is null';
                    }
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
            await dataPool.query('update student set name=?, gender=?, grade_id=?, school=?, birthday=?, contact=?, email=?, parent_name=?, relationship=?, appointment_time=?, ' +
                'adviser_id=?, headmaster_id=?, source_id=?, how_know_id=?, status_id=?, home_address=?, note=?, arrive_time=?, audit_status_id=?, warning_id=?, warning_reason=?,' +
                'subject_ids=?, possibility_id=?, contact2=?, update_at=? where id=?',
                [student.name, student.gender, student.grade_id, student.school, student.birthday, student.contact, student.email, student.parent_name, student.relationship,
                    student.appointment_time, student.adviser_id, student.headmaster_id, student.source_id, student.how_know_id, student.status_id, student.home_address,
                    student.note, student.arrive_time, student.audit_status_id, student.warning_id, student.warning_reason, student.subject_ids, student.possibility_id,
                    student.contact2, new Date(), student.id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};
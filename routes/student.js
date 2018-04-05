const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const studentDAO = require('../dao/studentDAO');
const visitRecordDAO = require('../dao/visitRecordDAO');
const studentTrackingDAO = require('../dao/studentTrackingDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');

router.get('/new_student', async function (req, res) {
    try {
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        let howKnows = await baseDAO.getAll('how_know');
        res.render('student/new_student', {
            grades: grades,
            sources: sources,
            howKnows: howKnows
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_student', async function (req, res) {
    try {
        await studentDAO.saveStudent(req.body.name, req.body.gender, req.body.grade_id, req.body.contact, req.body.appointment_time,
            req.body.source_id, (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null,
            (req.body.note&&req.body.note!='')?req.body.note:null);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/arrive_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status = req.query.status!=null?req.query.status:0;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/arrive_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_student_arrive', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        student = student[0];
        student.id = req.query.id;
        student.status = 1;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/arrive_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});


router.get('/assign_adviser_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status = req.query.status;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/assign_adviser_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/assign_adviser', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/assign_adviser', {
            student: student[0],
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_assign_adviser', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.body.id);
        student = student[0];
        student.id = req.body.id;
        student.adviser_id = req.body.adviser_id;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/assign_adviser_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audit_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.audit_status = req.query.audit_status!=null?req.query.audit_status:0;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/audit_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_audit_student', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        student = student[0];
        student.id = req.query.id;
        student.audit_status = req.query.audit_status;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/audit_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});


router.get('/follow_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        condition.audit_status = 1;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/follow_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});


router.get('/student_tracking_list', async function (req, res) {
    try {
        let studentId = req.query.student_id;
        let student = await baseDAO.getById('student', studentId);
        student = student[0];
        let studentTrackings = await studentTrackingDAO.getStudentTrackingBySId(studentId);
        let trackers = await baseDAO.getAll('user');
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        res.render('student/student_tracking_list', {
            student: student,
            studentTrackings: studentTrackings,
            trackerMap: commonUtil.toMap(trackers),
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_student_tracking', async function (req, res) {
    try {
        res.render('student/new_student_tracking', {student_id: req.query.student_id});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_student_tracking', async function (req, res) {
    try {
        let studentId = req.body.student_id;
        await studentTrackingDAO.saveStudentTracking(studentId, req.body.channel, req.body.result, req.body.possibility,
            (req.body.next_track_date && req.body.next_track_date != '') ? req.body.next_track_date : null, req.body.content, req.session.user[0].id);
        res.redirect('/student/student_tracking_list?student_id=' + studentId);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_student_tracking', async function (req, res) {
    try {
        let studentTracking = await baseDAO.getById('student_tracking', req.query.id);
        res.render('student/edit_student_tracking', {
            studentTracking: studentTracking[0],
            student_id: req.query.student_id,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_student_tracking', async function (req, res) {
    try {
        let studentId = req.body.student_id;
        await studentTrackingDAO.updateStudentTracking(req.body.id, req.body.channel, req.body.result, req.body.possibility, (req.body.next_track_date && req.body.next_track_date != '')?req.body.next_track_date:null, req.body.content);
        res.redirect('/student/student_tracking_list?student_id=' + studentId);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_student_tracking', async function (req, res) {
    try {
        await baseDAO.deleteById('student_tracking', req.query.id);
        res.redirect('/student/student_tracking_list?student_id=' + req.query.student_id);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});


router.get('/visit_record_list', async function (req, res) {
    try {
        let studentId = req.query.student_id;
        let student = await baseDAO.getById('student', studentId);
        student = student[0];
        let visitRecords = await visitRecordDAO.getVisitRecordBySId(studentId);
        let receptionists = await baseDAO.getAll('user');
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        res.render('student/visit_record_list', {
            student: student,
            visitRecords: visitRecords,
            receptionistMap: commonUtil.toMap(receptionists),
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_visit_record', async function (req, res) {
    try {
        res.render('student/new_visit_record', {student_id: req.query.student_id});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_visit_record', async function (req, res) {
    try {
        let studentId = req.body.student_id;
        await visitRecordDAO.saveVisitRecord(studentId, req.body.arrive_time, req.body.leave_time, req.body.possibility, req.body.content, req.session.user[0].id);
        res.redirect('/student/visit_record_list?student_id=' + studentId);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_visit_record', async function (req, res) {
    try {
        let visitRecord = await baseDAO.getById('visit_record', req.query.id);
        res.render('student/edit_visit_record', {
            visitRecord: visitRecord[0],
            student_id: req.query.student_id,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_visit_record', async function (req, res) {
    try {
        let studentId = req.body.student_id;
        await visitRecordDAO.updateVisitRecord(req.body.id, req.body.arrive_time, req.body.leave_time, req.body.possibility, req.body.content);
        res.redirect('/student/visit_record_list?student_id=' + studentId);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_visit_record', async function (req, res) {
    try {
        await baseDAO.deleteById('visit_record', req.query.id);
        res.redirect('/student/visit_record_list?student_id=' + req.query.student_id);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status = req.query.status;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_student', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        let howKnows = await baseDAO.getAll('how_know');
        res.render('student/edit_student', {
            student: student[0],
            grades: grades,
            sources: sources,
            howKnows: howKnows,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_student', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.body.id);
        student = student[0];
        student.id = req.body.id;
        student.name = req.body.name;
        student.gender = req.body.gender;
        student.grade_id = req.body.grade_id;
        student.contact = req.body.contact;
        student.appointment_time = req.body.appointment_time;
        student.source_id = (req.body.source_id&&req.body.source_id!='')?req.body.source_id:null;
        student.how_know_id = (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null;
        student.note = (req.body.note&&req.body.note!='')?req.body.note:null;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
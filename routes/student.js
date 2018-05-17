const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const studentDAO = require('../dao/studentDAO');
const contractDAO = require('../dao/contractDAO');
const visitRecordDAO = require('../dao/visitRecordDAO');
const studentTrackingDAO = require('../dao/studentTrackingDAO');
const revisitRecordDAO = require('../dao/revisitRecordDAO');
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
        let student = {};
        student.name = req.body.name;
        student.gender = req.body.gender;
        student.grade_id = req.body.grade_id;
        student.contact = req.body.contact;
        student.appointment_time = req.body.appointment_time;
        student.source_id = req.body.source_id;
        student.how_know_id = (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null;
        student.note = (req.body.note&&req.body.note!='')?req.body.note:null;
        await studentDAO.saveStudent(student);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/arrive_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status_id = req.query.status_id!=null?req.query.status_id:'01';
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        condition.audit_status_id = '02';//审核通过的客户
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let status = await baseDAO.getAll('student_status');
        res.render('student/arrive_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            status: status,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            statusMap: commonUtil.toMap(status),
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
        student.status_id = '02';
        student.arrive_time = new Date();
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
        condition.status_id = req.query.status_id;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        condition.audit_status_id = '02';//审核通过的客户
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let status = await baseDAO.getAll('student_status');
        res.render('student/assign_adviser_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            status: status,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            statusMap: commonUtil.toMap(status),
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
        condition.audit_status_id = req.query.audit_status_id!=null?req.query.audit_status_id:'01';
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let auditStatus = await baseDAO.getAll('student_audit_status');
        res.render('student/audit_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            auditStatus: auditStatus,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            auditStatusMap: commonUtil.toMap(auditStatus),
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
        student.audit_status_id = req.query.audit_status_id;
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
        condition.audit_status_id = '02';//审核通过的客户
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let status = await baseDAO.getAll('student_status');
        res.render('student/follow_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            statusMap: commonUtil.toMap(status),
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
        let possibilities = await baseDAO.getAll('possibility');
        let channels = await baseDAO.getAll('student_tracking_channel');
        let results = await baseDAO.getAll('student_tracking_result');
        res.render('student/student_tracking_list', {
            student: student,
            studentTrackings: studentTrackings,
            trackerMap: commonUtil.toMap(trackers),
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            possibilityMap: commonUtil.toMap(possibilities),
            channelMap: commonUtil.toMap(channels),
            resultMap: commonUtil.toMap(results),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_student_tracking', async function (req, res) {
    try {
        let possibilities = await baseDAO.getAll('possibility');
        let channels = await baseDAO.getAll('student_tracking_channel');
        let results = await baseDAO.getAll('student_tracking_result');
        res.render('student/new_student_tracking', {
            student_id: req.query.student_id,
            possibilities: possibilities,
            channels: channels,
            results: results
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_student_tracking', async function (req, res) {
    try {
        let studentTracking = {};
        studentTracking.student_id = req.body.student_id;
        studentTracking.track_date = req.body.track_date;
        studentTracking.channel_id = req.body.channel_id;
        studentTracking.result_id = req.body.result_id;
        studentTracking.possibility_id = req.body.possibility_id;
        studentTracking.next_track_date = (req.body.next_track_date && req.body.next_track_date != '') ? req.body.next_track_date : null;
        studentTracking.content = req.body.content;
        studentTracking.tracker_id = req.session.user[0].id;
        await studentTrackingDAO.saveStudentTracking(studentTracking);
        res.redirect('/student/student_tracking_list?student_id=' + studentTracking.student_id);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_student_tracking', async function (req, res) {
    try {
        let studentTracking = await baseDAO.getById('student_tracking', req.query.id);
        let possibilities = await baseDAO.getAll('possibility');
        let channels = await baseDAO.getAll('student_tracking_channel');
        let results = await baseDAO.getAll('student_tracking_result');
        res.render('student/edit_student_tracking', {
            studentTracking: studentTracking[0],
            student_id: req.query.student_id,
            possibilities: possibilities,
            channels: channels,
            results: results,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_student_tracking', async function (req, res) {
    try {
        let studentTracking = {};
        studentTracking.id = req.body.id;
        studentTracking.track_date = req.body.track_date;
        studentTracking.channel_id = req.body.channel_id;
        studentTracking.result_id = req.body.result_id;
        studentTracking.possibility_id = req.body.possibility_id;
        studentTracking.next_track_date = (req.body.next_track_date && req.body.next_track_date != '') ? req.body.next_track_date : null;
        studentTracking.content = req.body.content;
        await studentTrackingDAO.updateStudentTracking(studentTracking);
        res.redirect('/student/student_tracking_list?student_id=' + req.body.student_id);
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
        let possibilities = await baseDAO.getAll('possibility');
        res.render('student/visit_record_list', {
            student: student,
            visitRecords: visitRecords,
            receptionistMap: commonUtil.toMap(receptionists),
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            possibilityMap: commonUtil.toMap(possibilities),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_visit_record', async function (req, res) {
    try {
        let possibilities = await baseDAO.getAll('possibility');
        res.render('student/new_visit_record', {
            student_id: req.query.student_id,
            possibilities: possibilities
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_visit_record', async function (req, res) {
    try {
        let visitRecord = {};
        visitRecord.student_id = req.body.student_id;
        visitRecord.arrive_time = req.body.arrive_time;
        visitRecord.leave_time = req.body.leave_time;
        visitRecord.possibility_id = req.body.possibility_id;
        visitRecord.content = req.body.content;
        visitRecord.receptionist_id = req.session.user[0].id;
        await visitRecordDAO.saveVisitRecord(visitRecord);
        res.redirect('/student/visit_record_list?student_id=' + visitRecord.student_id);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_visit_record', async function (req, res) {
    try {
        let visitRecord = await baseDAO.getById('visit_record', req.query.id);
        let possibilities = await baseDAO.getAll('possibility');
        res.render('student/edit_visit_record', {
            visitRecord: visitRecord[0],
            student_id: req.query.student_id,
            possibilities: possibilities,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_visit_record', async function (req, res) {
    try {
        let visitRecord = {};
        visitRecord.id = req.body.id;
        visitRecord.arrive_time = req.body.arrive_time;
        visitRecord.leave_time = req.body.leave_time;
        visitRecord.possibility_id = req.body.possibility_id;
        visitRecord.content = req.body.content;
        await visitRecordDAO.updateVisitRecord(visitRecord);
        res.redirect('/student/visit_record_list?student_id=' + req.body.student_id);
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
        condition.status_id = req.query.status_id;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let status = await baseDAO.getAll('student_status');
        res.render('student/student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            status: status,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            statusMap: commonUtil.toMap(status),
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
        student.school = (req.body.school&&req.body.school!='')?req.body.school:null;
        student.birthday = (req.body.birthday&&req.body.birthday!='')?req.body.birthday:null;
        student.contact = req.body.contact;
        student.email = (req.body.email&&req.body.email!='')?req.body.email:null;
        student.parent_name = (req.body.parent_name&&req.body.parent_name!='')?req.body.parent_name:null;
        student.relationship = (req.body.relationship&&req.body.relationship!='')?req.body.relationship:null;
        student.appointment_time = req.body.appointment_time;
        student.source_id = (req.body.source_id&&req.body.source_id!='')?req.body.source_id:null;
        student.how_know_id = (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null;
        student.home_address = (req.body.home_address&&req.body.home_address!='')?req.body.home_address:null;
        student.note = (req.body.note&&req.body.note!='')?req.body.note:null;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/assign_headmaster_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.headmaster_id = req.query.headmaster_id;
        condition.source_id = req.query.source_id;
        condition.adviser_id = req.query.adviser_id;
        condition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let headmasters = await userDAO.getAllHeadmaster();
        let sources = await baseDAO.getAll('source');
        let advisers = await userDAO.getAllAdviser();
        let status = await baseDAO.getAll('student_status');
        res.render('student/assign_headmaster_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            headmasters: headmasters,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            headmasterMap: commonUtil.toMap(headmasters),
            sourceMap: commonUtil.toMap(sources),
            adviserMap: commonUtil.toMap(advisers),
            statusMap: commonUtil.toMap(status),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/assign_headmaster', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let headmasters = await userDAO.getAllHeadmaster();
        let sources = await baseDAO.getAll('source');
        res.render('student/assign_headmaster', {
            student: student[0],
            headmasters: headmasters,
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_assign_headmaster', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.body.id);
        student = student[0];
        student.id = req.body.id;
        student.headmaster_id = req.body.headmaster_id;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/assign_headmaster_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/signed_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.student_no = req.query.student_no;
        condition.school = req.query.school;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.headmaster_id = req.query.headmaster_id;
        condition.source_id = req.query.source_id;
        condition.adviser_id = req.query.adviser_id;
        condition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let headmasters = await userDAO.getAllHeadmaster();
        let sources = await baseDAO.getAll('source');
        let advisers = await userDAO.getAllAdviser();
        let status = await baseDAO.getAll('student_status');
        res.render('student/signed_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            headmasters: headmasters,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            headmasterMap: commonUtil.toMap(headmasters),
            sourceMap: commonUtil.toMap(sources),
            adviserMap: commonUtil.toMap(advisers),
            statusMap: commonUtil.toMap(status),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/student_details', async function (req, res) {
    try {
        //基本信息
        let student = await baseDAO.getById('student', req.query.id);
        student = student[0];
        let howKnows = await baseDAO.getAll('how_know');
        let sources = await baseDAO.getAll('source');
        let users = await baseDAO.getAll('user');

        //排课记录

        //合同
        let contractCondition = {};
        contractCondition.student_id = student.id;
        let contracts = await contractDAO.getContractByCondition('contract', contractCondition);
        let grades = await baseDAO.getAll('grade');
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let contractStatus = await baseDAO.getAll('contract_status');

        res.render('student/student_details', {
            student: student,
            howKnowMap: commonUtil.toMap(howKnows),
            sourceMap: commonUtil.toMap(sources),
            userMap: commonUtil.toMap(users),
            dateUtil: dateUtil,
            contracts: contracts,
            gradeMap: commonUtil.toMap(grades),
            contractAttributeMap: commonUtil.toMap(contractAttributes),
            contractTypeMap: commonUtil.toMap(contractTypes),
            contractStatusMap: commonUtil.toMap(contractStatus),
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/revisit_record_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.grade_id = req.query.grade_id;
        condition.visit_start_date = req.query.visit_start_date;
        condition.visit_end_date = req.query.visit_end_date;
        condition.type_id = req.query.type_id;
        condition.mode_id = req.query.mode_id;
        condition.operator = req.query.operator;
        let revisitRecords = await revisitRecordDAO.getRevisitRecordByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let grades = await baseDAO.getAll('grade');
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/revisit_record_list', {
            revisitRecords: revisitRecords,
            students: students,
            grades: grades,
            modes: modes,
            types: types,
            studentMap: commonUtil.toMap(students),
            modeMap: commonUtil.toMap(modes),
            typeMap: commonUtil.toMap(types),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_revisit_record', async function (req, res) {
    try {
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/new_revisit_record', {
            students: students,
            modes: modes,
            types: types,
            user: req.session.user[0]
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_revisit_record', async function (req, res) {
    try {
        let revisitRecord = {};
        revisitRecord.student_id = req.body.student_id;
        revisitRecord.mode_id = req.body.mode_id;
        revisitRecord.visit_date = req.body.visit_date;
        revisitRecord.target = req.body.target;
        revisitRecord.type_id = req.body.type_id;
        revisitRecord.content = req.body.content;
        revisitRecord.suggestion = req.body.suggestion;
        revisitRecord.operator = req.body.operator;
        await revisitRecordDAO.saveRevisitRecord(revisitRecord);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_revisit_record', async function (req, res) {
    try {
        let revisitRecord = await baseDAO.getById('revisit_record', req.query.id);
        revisitRecord = revisitRecord[0];
        let student = await baseDAO.getById('student', revisitRecord.student_id);
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/edit_revisit_record', {
            revisitRecord: revisitRecord,
            student: student[0],
            modes: modes,
            types: types,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_revisit_record', async function (req, res) {
    try {
        let revisitRecord = await baseDAO.getById('revisit_record', req.body.id);
        revisitRecord = revisitRecord[0];
        revisitRecord.mode_id = req.body.mode_id;
        revisitRecord.visit_date = req.body.visit_date;
        revisitRecord.target = req.body.target;
        revisitRecord.type_id = req.body.type_id;
        revisitRecord.content = req.body.content;
        revisitRecord.suggestion = req.body.suggestion;
        revisitRecord.operator = req.body.operator;
        await revisitRecordDAO.updateRevisitRecord(revisitRecord);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_revisit_record', async function (req, res) {
    try {
        await baseDAO.deleteById('revisit_record', req.query.id);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/parents_meeting_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.grade_id = req.query.grade_id;
        condition.create_start_date = req.query.create_start_date;
        condition.create_end_date = req.query.create_end_date;
        condition.adviser_id = req.query.adviser_id;
        condition.start_date = req.query.start_date;//查询条件为date，实际表中字段datetime
        //todo:写到了这里



        
        let revisitRecords = await revisitRecordDAO.getRevisitRecordByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        sCondition.headmaster_id = req.session.user[0].id;//班主任为当前用户的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let grades = await baseDAO.getAll('grade');
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/parents_meeting_list', {
            revisitRecords: revisitRecords,
            students: students,
            grades: grades,
            modes: modes,
            types: types,
            studentMap: commonUtil.toMap(students),
            modeMap: commonUtil.toMap(modes),
            typeMap: commonUtil.toMap(types),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_revisit_record', async function (req, res) {
    try {
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/new_revisit_record', {
            students: students,
            modes: modes,
            types: types,
            user: req.session.user[0]
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_revisit_record', async function (req, res) {
    try {
        let revisitRecord = {};
        revisitRecord.student_id = req.body.student_id;
        revisitRecord.mode_id = req.body.mode_id;
        revisitRecord.visit_date = req.body.visit_date;
        revisitRecord.target = req.body.target;
        revisitRecord.type_id = req.body.type_id;
        revisitRecord.content = req.body.content;
        revisitRecord.suggestion = req.body.suggestion;
        revisitRecord.operator = req.body.operator;
        await revisitRecordDAO.saveRevisitRecord(revisitRecord);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_revisit_record', async function (req, res) {
    try {
        let revisitRecord = await baseDAO.getById('revisit_record', req.query.id);
        revisitRecord = revisitRecord[0];
        let student = await baseDAO.getById('student', revisitRecord.student_id);
        let modes = await baseDAO.getAll('revisit_record_mode');
        let types = await baseDAO.getAll('revisit_record_type');
        res.render('student/edit_revisit_record', {
            revisitRecord: revisitRecord,
            student: student[0],
            modes: modes,
            types: types,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_revisit_record', async function (req, res) {
    try {
        let revisitRecord = await baseDAO.getById('revisit_record', req.body.id);
        revisitRecord = revisitRecord[0];
        revisitRecord.mode_id = req.body.mode_id;
        revisitRecord.visit_date = req.body.visit_date;
        revisitRecord.target = req.body.target;
        revisitRecord.type_id = req.body.type_id;
        revisitRecord.content = req.body.content;
        revisitRecord.suggestion = req.body.suggestion;
        revisitRecord.operator = req.body.operator;
        await revisitRecordDAO.updateRevisitRecord(revisitRecord);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_revisit_record', async function (req, res) {
    try {
        await baseDAO.deleteById('revisit_record', req.query.id);
        res.redirect('/student/revisit_record_list');
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

module.exports = router;
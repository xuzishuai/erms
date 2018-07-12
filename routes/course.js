const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const classRoomDAO = require('../dao/classRoomDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');
const lessonPeriodDAO = require('../dao/lessonPeriodDAO');
const teacherDAO = require('../dao/teacherDAO');

router.get('/class_room_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.status_id = req.query.status_id;
        let classRooms = await classRoomDAO.getClassRoomByCondition(condition);
        let status = await baseDAO.getAll('class_room_status');
        res.render('course/class_room_list', {
            classRooms: classRooms,
            status: status,
            statusMap: commonUtil.toMap(status),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_class_room', async function (req, res) {
    try {
        let status = await baseDAO.getAll('class_room_status');
        res.render('course/new_class_room', {
            status: status
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_class_room', async function (req, res) {
    try {
        let classRoom = {};
        classRoom.name = req.body.name;
        classRoom.status_id = req.body.status_id;
        await classRoomDAO.saveClassRoom(classRoom);
        res.redirect('/course/class_room_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_class_room', async function (req, res) {
    try {
        let classRoom = await baseDAO.getById('class_room', req.query.id);
        let status = await baseDAO.getAll('class_room_status');
        res.render('course/edit_class_room', {
            classRoom: classRoom[0],
            status: status,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_class_room', async function (req, res) {
    try {
        let classRoom = await baseDAO.getById('class_room', req.body.id);
        classRoom = classRoom[0];
        classRoom.status_id = req.body.status_id;
        await classRoomDAO.updateClassRoom(classRoom);
        res.redirect('/course/class_room_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/lesson_period_list', async function (req, res) {
    try {
        let lessonPeriods = await baseDAO.getAll('lesson_period');
        res.render('course/lesson_period_list', {
            lessonPeriods: lessonPeriods
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_lesson_period', async function (req, res) {
    try {
        res.render('course/new_lesson_period');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_lesson_period_name', async function (req, res) {
    try {
        let lessonPeriod = await lessonPeriodDAO.isLessonPeriodExist(req.body.id, req.body.name);
        if (lessonPeriod && lessonPeriod.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_lesson_period', async function (req, res) {
    try {
        let lessonPeriod = {};
        lessonPeriod.name = req.body.name;
        lessonPeriod.start_time = req.body.start_time;
        lessonPeriod.end_time = req.body.end_time;
        await lessonPeriodDAO.saveLessonPeriod(lessonPeriod);
        res.redirect('/course/lesson_period_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_lesson_period', async function (req, res) {
    try {
        let lessonPeriod = await baseDAO.getById('lesson_period', req.query.id);
        res.render('course/edit_lesson_period', {
            lessonPeriod: lessonPeriod[0]
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_lesson_period', async function (req, res) {
    try {
        let lessonPeriod = await baseDAO.getById('lesson_period', req.body.id);
        lessonPeriod = lessonPeriod[0];
        lessonPeriod.name = req.body.name;
        lessonPeriod.start_time = req.body.start_time;
        lessonPeriod.end_time = req.body.end_time;
        await lessonPeriodDAO.updateLessonPeriod(lessonPeriod);
        res.redirect('/course/lesson_period_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_lesson_period', async function (req, res) {
    try {
        await baseDAO.deleteById('lesson_period', req.query.id);
        res.redirect('/course/lesson_period_list');
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/teacher_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.grade_id = req.query.grade_id;
        condition.sbuject_id = req.query.sbuject_id;
        condition.contact = req.query.contact;
        condition.is_part_time = req.query.is_part_time;
        condition.status = req.query.is_part_time!=null?req.query.is_part_time:'1';//若不填默认搜索在职教师
        let teachers = await teacherDAO.getTeacherByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let subjects = await baseDAO.getAll('subject');
        let gradeMap = commonUtil.toMap(grades);
        if (teachers != null && teachers.length > 0) {
            for (let i = 0; i < teachers.length; i++) {
                let gradeIds = teachers[i].grade_ids.split('#');
                teachers[i].grades = '';
                for (let i = 1; i < gradeIds.length - 1; i++) {
                    if (i === 1) {
                        teachers[i].grades += gradeMap[gradeIds[i]].name;
                    } else {
                        teachers[i].grades += '，' + gradeMap[gradeIds[i]].name;
                    }
                }
            }
        }
        res.render('student/teacher_list', {
            teachers: teachers,
            grades: grades,
            subjects: subjects,
            subjectMap: commonUtil.toMap(subjects),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});
















router.get('/new_test_score', async function (req, res) {
    try {
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let now = new Date();
        let year = parseInt(now.getFullYear());
        let month = parseInt(now.getMonth());
        let school_year_placeholder = "";
        if (month < 8) {
            school_year_placeholder = (year - 1) + '-' + year;
        } else {
            school_year_placeholder = year + '-' + (year + 1);
        }
        let types = await baseDAO.getAll('test_score_type');
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        res.render('student/new_test_score', {
            students: students,
            types: types,
            subjects: subjects,
            grades: grades,
            school_year_placeholder: school_year_placeholder
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_test_score', async function (req, res) {
    try {
        let testScore = {};
        testScore.student_id = req.body.student_id;
        testScore.school_year = req.body.school_year;
        testScore.grade_id = req.body.grade_id;
        testScore.test_date = req.body.test_date;
        testScore.type_id = req.body.type_id;
        testScore.class_size = req.body.class_size;
        testScore.enroll_school = req.body.enroll_school;
        testScore.subject_id = req.body.subject_id;
        testScore.score = req.body.score;
        testScore.total_score = req.body.total_score;
        testScore.class_rank = req.body.class_rank;
        testScore.teacher_assess = req.body.teacher_assess;
        testScore.parents_assess = req.body.parents_assess;
        testScore.headmaster_assess = req.body.headmaster_assess;
        await testScoreDAO.saveTestScore(testScore);
        res.redirect('/student/test_score_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_test_score', async function (req, res) {
    try {
        let testScore = await baseDAO.getById('test_score', req.query.id);
        testScore = testScore[0];
        let student = await baseDAO.getById('student', testScore.student_id);
        let types = await baseDAO.getAll('test_score_type');
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        res.render('student/edit_test_score', {
            testScore: testScore,
            student: student[0],
            types: types,
            subjects: subjects,
            grades: grades,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_test_score', async function (req, res) {
    try {
        let testScore = await baseDAO.getById('test_score', req.body.id);
        testScore = testScore[0];
        testScore.school_year = req.body.school_year;
        testScore.grade_id = req.body.grade_id;
        testScore.test_date = req.body.test_date;
        testScore.type_id = req.body.type_id;
        testScore.class_size = req.body.class_size;
        testScore.enroll_school = req.body.enroll_school;
        testScore.subject_id = req.body.subject_id;
        testScore.score = req.body.score;
        testScore.total_score = req.body.total_score;
        testScore.class_rank = req.body.class_rank;
        testScore.teacher_assess = req.body.teacher_assess;
        testScore.parents_assess = req.body.parents_assess;
        testScore.headmaster_assess = req.body.headmaster_assess;
        await testScoreDAO.updateTestScore(testScore);
        res.redirect('/student/test_score_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_test_score', async function (req, res) {
    try {
        await baseDAO.deleteById('test_score', req.query.id);
        res.redirect('/student/test_score_list');
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

module.exports = router;
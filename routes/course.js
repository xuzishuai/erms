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
        res.render('course/teacher_list', {
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

router.get('/new_teacher', async function (req, res) {
    try {
        let grades = await baseDAO.getAll('grade');
        let subjects = await baseDAO.getAll('subject');
        let lessonPeriods = await baseDAO.getAll('lesson_period');
        res.render('course/new_teacher', {
            subjects: subjects,
            grades: grades,
            lessonPeriods: lessonPeriods
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/add_teacher_free_time_tr', async function (req, res) {
    try {
        let lessonPeriods = await baseDAO.getAll('lesson_period');
        res.render('course/add_teacher_free_time_tr', {
            hideLayout: true,
            lessonPeriods: lessonPeriods,
            free_time_index: req.body.free_time_index
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_teacher', async function (req, res) {
    try {
        let teacher = {};
        teacher.name = req.body.name;
        teacher.gender = req.body.gender;
        teacher.contact = req.body.contact;
        teacher.subject_id = req.body.subject_id;
        teacher.is_part_time = req.body.is_part_time;
        teacher.status = req.body.status;
        teacher.grade_ids = "#";
        let gradeIds = req.body.grade_ids;
        if (gradeIds) {
            if (!Array.isArray(gradeIds)) {
                teacher.grade_ids += gradeIds + "#";
            } else {
                for (let i = 0; i < gradeIds.length; i++) {
                    teacher.grade_ids += gradeIds[i] + "#";
                }
            }
        }
        teacher.grade_ids = teacher.grade_ids=="#"?null:teacher.grade_ids;

        let teacherFreeTime = [];
        for (let key in req.body) {
            let pattFreeDate = new RegExp('^free_date_');
            if (pattFreeDate.test(key)) {
                let freeTime = {};
                freeTime.free_date = req.body[key];
                teacherFreeTime[teacherFreeTime.length] = freeTime;
            }
            let pattLessonPeriodIds = new RegExp('^lesson_period_ids_');
            if (pattLessonPeriodIds.test(key)) {
                teacherFreeTime[teacherFreeTime.length - 1].lesson_period_ids = req.body[key];
            }
        }
        teacher.teacherFreeTime = teacherFreeTime;
        await teacherDAO.saveTeacher(teacher);
        res.redirect('/course/teacher_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_teacher', async function (req, res) {
    try {
        let teacher = await baseDAO.getById('teacher', req.query.id);
        teacher = teacher[0];
        let teacherFreeTimes = await teacherDAO.getFreeTimeByTeacherId(teacher.id);
        let grades = await baseDAO.getAll('grade');
        let subjects = await baseDAO.getAll('subject');
        let lessonPeriods = await baseDAO.getAll('lesson_period');
        res.render('course/edit_teacher', {
            teacher: teacher,
            teacherFreeTimes: teacherFreeTimes,
            grades: grades,
            subjects: subjects,
            lessonPeriods: lessonPeriods,
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
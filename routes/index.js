const express = require('express');
const router = express.Router();
const baseDAO = require('../dao/baseDAO');
const studentDAO = require('../dao/studentDAO');
const teacherDAO = require('../dao/teacherDAO');
const contractDAO = require('../dao/contractDAO');
const courseScheduleDAO = require('../dao/courseScheduleDAO');
const lessonPeriodDAO = require('../dao/lessonPeriodDAO');
const dateUtil = require('../util/dateUtil');
const commonUtil = require('../util/commonUtil');

/* GET home page. */
router.get('/', async function(req, res) {
    let totalStudent = await studentDAO.getSingedStudentCount();
    let totalTeacher = await teacherDAO.getSingedTeacherCount();
    let totalContract = await contractDAO.getSingedContractCount();
    let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
    let classRooms = await baseDAO.getAll('class_room', 'name');
    let condition = {};
    condition.lesson_start_date = dateUtil.dateFormat(new Date());
    condition.lesson_end_date = dateUtil.addDays(condition.lesson_start_date, 1);
    condition.status_ids = ['02', '04'];
    let courseSchedules = await courseScheduleDAO.getCourseScheduleByCondition(condition);
    let courseScheduleMap = {};
    for (let i = 0; i < courseSchedules.length; i++) {
        courseScheduleMap[courseSchedules[i].lesson_period_id+courseSchedules[i].class_room_id] = courseSchedules[i];
    }
    let sCondition = {};
    sCondition.status_id = '03';
    let students = await studentDAO.getStudentByCondition(sCondition);
    let status = await baseDAO.getAll('course_schedule_status');
    let subjects = await baseDAO.getAll('subject');
    res.render('index', {
        totalStudent: totalStudent[0].count,
        totalTeacher: totalTeacher[0].count,
        totalContract: totalContract[0].count,
        courseScheduleMap: courseScheduleMap,
        studentMap: commonUtil.toMap(students),
        classRoomMap: commonUtil.toMap(classRooms),
        statusMap: commonUtil.toMap(status),
        subjectMap: commonUtil.toMap(subjects),
        lessonPeriods: lessonPeriods,
        classRooms: classRooms
    });
});

module.exports = router;

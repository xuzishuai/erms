const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const studentDAO = require('../dao/studentDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');

router.get('/new_student', async function (req, res) {
    try {
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let howKnows = await baseDAO.getAll('how_know');
        res.render('student/new_student', {
            grades: grades,
            advisers: advisers,
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
            (req.body.source_id&&req.body.source_id!='')?req.body.source_id:null, (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null,
            (req.body.note&&req.body.note!='')?req.body.note:null);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/arrive_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.status = 0;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/arrive_student_list', {
            students: students,
            gradeMap: commonUtil.toMap(grades),
            dateUtil: dateUtil,
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources)
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
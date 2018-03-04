const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const studentDAO = require('../dao/studentDAO');

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
            (req.body.adviser_id&&req.body.adviser_id!='')?req.body.adviser_id:null, (req.body.source_id&&req.body.source_id!='')?req.body.source_id:null,
            (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
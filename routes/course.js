const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const classRoomDAO = require('../dao/classRoomDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');
const lessonPeriodDAO = require('../dao/lessonPeriodDAO');

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

module.exports = router;
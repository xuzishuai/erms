const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const classRoomDAO = require('../dao/classRoomDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');

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
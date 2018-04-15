const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');
const contractDAO = require('../dao/contractDAO');

router.get('/new_contract', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        let users = await baseDAO.getAll('user');
        let subjects = await baseDAO.getAll('subject');
        res.render('contract/new_contract', {
            student: student[0],
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            userMap: commonUtil.toMap(users),
            grades: grades,
            users: users,
            subjects: subjects,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_contract_no', async function (req, res) {
    try {
        let contract = await contractDAO.isContractExist(req.body.id, req.body.user_no);
        if (contract && contract.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/add_contract_detail_tr', async function (req, res) {
    try {
        let subjects = await baseDAO.getAll('subject');
        res.render('contract/add_contract_detail_tr', {
            hideLayout: true,
            subjects: subjects,
            detail_index: req.body.detail_index
        });
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_contract', async function (req, res) {
    try {
        let contractDetail = [];
        for (let key in req.body) {
            let pattSubject = new RegExp('^subject_id_');
            if (pattSubject.test(key)) {
                let detail = {};
                detail.subject_id = req.body[key];
                contractDetail[contractDetail.length] = detail;
            }
            let pattLessonPeriod = new RegExp('^lesson_period_');
            if (pattLessonPeriod.test(key)) {
                contractDetail[contractDetail.length - 1].lesson_period = req.body[key];
            }
            let pattType = new RegExp('^type_');
            if (pattType.test(key)) {
                contractDetail[contractDetail.length - 1].type = req.body[key];
            }
            let pattPrice = new RegExp('^price_');
            if (pattPrice.test(key)) {
                contractDetail[contractDetail.length - 1].price = req.body[key];
            }
        }
        res.redirect('/student/student_list');
    } catch (error) {
        res.send(false);
    }
});

module.exports = router;
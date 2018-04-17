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
        let contract = {};
        contract.student_id = req.body.student_id;
        contract.contract_no = req.body.contract_no;
        contract.attribute = req.body.attribute;
        contract.contract_type = req.body.contract_type;
        contract.grade_id = req.body.grade_id;
        contract.total_money = req.body.total_money;
        contract.prepay = req.body.prepay;
        contract.left_money = req.body.left_money;
        contract.total_lesson_period = req.body.total_lesson_period;
        contract.start_date = req.body.start_date;
        contract.is_recommend = req.body.is_recommend;
        contract.recommend_type = (req.body.recommend_type && req.body.recommend_type != '')?req.body.recommend_type:null;
        contract.recommender_id = (req.body.recommender_id && req.body.recommender_id != '')?req.body.recommender_id:null;
        contract.signer_id = req.session.user[0].id;
        contract.possibility = req.body.possibility;
        contract.note = (req.body.note && req.body.note != '')?req.body.note:null;
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
        contract.contractDetail = contractDetail;
        await contractDAO.saveContract(contract);
        res.redirect('/student/student_list');
    } catch (error) {
        res.send(false);
    }
});

router.get('/audit_contract_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.attribute = req.query.attribute!=null?req.query.attribute:0;
        condition.contract_type = req.query.contract_type!=null?req.query.contract_type:0;
        condition.grade_id = req.query.grade_id;
        condition.start_date_from = req.query.start_date_from;
        condition.start_date_to = req.query.start_date_to;
        condition.signer_id = req.query.signer_id;
        condition.status = [0, 3, 4];//查询待确认、修改中和变更中的合同
        let contracts = await contractDAO.getContractByCondition(condition);
        let students = await baseDAO.getAll('student');
        let grades = await baseDAO.getAll('grade');
        let signers = await userDAO.getUserByRole(['03', '04']);
        res.render('contract/audit_contract_list', {
            contracts: contracts,
            students: students,
            grades: grades,
            signers: signers,
            studentMap: commonUtil.toMap(students),
            gradeMap: commonUtil.toMap(grades),
            signerMap: commonUtil.toMap(signers),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');
const contractDAO = require('../dao/contractDAO');
const contractChargeDAO = require('../dao/contractChargeDAO');

router.get('/new_contract', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let sources = await baseDAO.getAll('source');
        let users = await baseDAO.getAll('user');
        let subjects = await baseDAO.getAll('subject');
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let types = await baseDAO.getAll('contract_detail_type');
        res.render('contract/new_contract', {
            student: student[0],
            gradeMap: commonUtil.toMap(grades),
            sourceMap: commonUtil.toMap(sources),
            userMap: commonUtil.toMap(users),
            grades: grades,
            users: users,
            subjects: subjects,
            contractAttributes: contractAttributes,
            contractTypes: contractTypes,
            possibilities: possibilities,
            types: types,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_contract_no', async function (req, res) {
    try {
        let contract = await contractDAO.isContractNoExist(req.body.contract_no);
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
        let types = await baseDAO.getAll('contract_detail_type');
        res.render('contract/add_contract_detail_tr', {
            hideLayout: true,
            subjects: subjects,
            types: types,
            detail_index: req.body.detail_index
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_contract', async function (req, res) {
    try {
        let contract = {};
        contract.student_id = req.body.student_id;
        contract.contract_no = req.body.contract_no;
        contract.attribute_id = req.body.attribute_id;
        contract.contract_type_id = req.body.contract_type_id;
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
        contract.possibility_id = req.body.possibility_id;
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
            let pattType = new RegExp('^type_id_');
            if (pattType.test(key)) {
                contractDetail[contractDetail.length - 1].type_id = req.body[key];
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
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audit_contract_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.attribute_id = req.query.attribute_id;
        condition.contract_type_id = req.query.contract_type_id;
        condition.grade_id = req.query.grade_id;
        condition.start_date_from = req.query.start_date_from;
        condition.start_date_to = req.query.start_date_to;
        condition.signer_id = req.query.signer_id;
        condition.status_id = ['01'];
        let contracts0 = await contractDAO.getContractByCondition('contract', condition);//查询待确认的合同
        condition.status_id = ['04', '05'];
        let contracts1 = await contractDAO.getContractByCondition('contract_temp', condition);//查询修改中和变更中的合同
        let contracts = contracts0.concat(contracts1);
        let students = await baseDAO.getAll('student');
        let grades = await baseDAO.getAll('grade');
        let signers = await userDAO.getUserByRole(['03', '04']);//角色为顾问和班主任
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let contractStatus = await baseDAO.getAll('contract_status');
        res.render('contract/audit_contract_list', {
            contracts: contracts,
            students: students,
            grades: grades,
            signers: signers,
            contractAttributes: contractAttributes,
            contractTypes: contractTypes,
            possibilities: possibilities,
            studentMap: commonUtil.toMap(students),
            gradeMap: commonUtil.toMap(grades),
            signerMap: commonUtil.toMap(signers),
            contractAttributeMap: commonUtil.toMap(contractAttributes),
            contractTypeMap: commonUtil.toMap(contractTypes),
            contractStatusMap: commonUtil.toMap(contractStatus),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audit_contract', async function (req, res) {
    try {
        let id = req.query.id;
        let contractTemp = await baseDAO.getById('contract_temp', id);
        let contract = {};
        if (contractTemp && contractTemp.length > 0) {
            contract = contractTemp[0];
        } else {
            contract = await baseDAO.getById('contract', id);
            contract = contract[0];
        }
        let student = await baseDAO.getById('student', contract.student_id);
        let contractDetails = [];
        if (contract.status_id == '05') {//若是变更合同，则从contract_detail_temp表取详情
            contractDetails = await contractDAO.getDetailTempsByContractId(id);
        } else {
            contractDetails = await contractDAO.getDetailsByContractId(id);
        }
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let attributes = await baseDAO.getAll('contract_attribute');
        let types = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let status = await baseDAO.getAll('contract_status');
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        let detailStatus = await baseDAO.getAll('contract_detail_status');
        res.render('contract/audit_contract', {
            gradeMap: commonUtil.toMap(grades),
            userMap: commonUtil.toMap(users),
            attributeMap: commonUtil.toMap(attributes),
            typeMap: commonUtil.toMap(types),
            possibilityMap: commonUtil.toMap(possibilities),
            statusMap: commonUtil.toMap(status),
            subjectMap: commonUtil.toMap(subjects),
            detailTypeMap: commonUtil.toMap(detailTypes),
            detailStatusMap: commonUtil.toMap(detailStatus),
            contract: contract,
            student: student[0],
            contractDetails: contractDetails,
            dateUtil: dateUtil
        })
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_audit_contract', async function (req, res) {
    try {
        await contractDAO.auditContract(req.body.id, req.body.audit_status);
        res.redirect('/contract/audit_contract_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/my_contract_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.attribute_id = req.query.attribute_id;
        condition.contract_type_id = req.query.contract_type_id;
        condition.grade_id = req.query.grade_id;
        condition.start_date_from = req.query.start_date_from;
        condition.start_date_to = req.query.start_date_to;
        condition.status_id = (req.query.status_id && req.query.status_id != '')?[req.query.status_id]:null;
        condition.signer_id = req.session.user[0].id;
        let contracts = await contractDAO.getContractByCondition('contract', condition);
        let students = await baseDAO.getAll('student');
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let contractStatus = await baseDAO.getAll('contract_status');
        res.render('contract/my_contract_list', {
            contracts: contracts,
            students: students,
            grades: grades,
            contractStatus: contractStatus,
            contractAttributes: contractAttributes,
            contractTypes: contractTypes,
            possibilities: possibilities,
            studentMap: commonUtil.toMap(students),
            gradeMap: commonUtil.toMap(grades),
            userMap: commonUtil.toMap(users),
            contractAttributeMap: commonUtil.toMap(contractAttributes),
            contractTypeMap: commonUtil.toMap(contractTypes),
            contractStatusMap: commonUtil.toMap(contractStatus),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_contract', async function (req, res) {
    try {
        let contract = await baseDAO.getById('contract', req.query.id);
        contract = contract[0];
        let student = await baseDAO.getById('student', contract.student_id);
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let contractStatus = await baseDAO.getAll('contract_status');
        res.render('contract/edit_contract', {
            contract: contract,
            student: student[0],
            grades: grades,
            users: users,
            contractStatus: contractStatus,
            contractAttributes: contractAttributes,
            contractTypes: contractTypes,
            possibilities: possibilities,
            gradeMap: commonUtil.toMap(grades),
            userMap: commonUtil.toMap(users),
            contractAttributeMap: commonUtil.toMap(contractAttributes),
            contractTypeMap: commonUtil.toMap(contractTypes),
            contractStatusMap: commonUtil.toMap(contractStatus),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_edit_contract_no', async function (req, res) {
    try {
        let contract = await contractDAO.isContractNoExist(req.body.contract_no, req.body.id);
        if (contract && contract.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_update_contract', async function (req, res) {
    try {
        let contractTemp = {};
        contractTemp.id = req.body.id;
        let contract = await baseDAO.getById('contract', contractTemp.id);
        contract = contract[0];
        contractTemp.student_id = req.body.student_id;
        contractTemp.contract_no = req.body.contract_no;
        contractTemp.attribute_id = req.body.attribute_id;
        contractTemp.contract_type_id = req.body.contract_type_id;
        contractTemp.grade_id = req.body.grade_id;
        contractTemp.total_money = req.body.total_money;
        contractTemp.prepay = req.body.prepay;
        contractTemp.left_money = req.body.left_money;
        contractTemp.total_lesson_period = req.body.total_lesson_period;
        contractTemp.start_date = req.body.start_date;
        contractTemp.is_recommend = req.body.is_recommend;
        contractTemp.recommend_type = (req.body.recommend_type && req.body.recommend_type != '')?req.body.recommend_type:null;
        contractTemp.recommender_id = (req.body.recommender_id && req.body.recommender_id != '')?req.body.recommender_id:null;
        contractTemp.signer_id = contract.signer_id;
        contractTemp.possibility_id = req.body.possibility_id;
        contractTemp.create_at = contract.create_at;
        contractTemp.note = (req.body.note && req.body.note != '')?req.body.note:null;
        await contractDAO.saveContractTemp(contractTemp);
        res.redirect('/contract/my_contract_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_contract_detail', async function (req, res) {
    try {
        let id = req.query.id;
        let contractTemp = await baseDAO.getById('contract_temp', id);
        let contract = {};
        if (contractTemp && contractTemp.length > 0) {
            contract = contractTemp[0];
        } else {
            contract = await baseDAO.getById('contract', id);
            contract = contract[0];
        }
        let student = await baseDAO.getById('student', contract.student_id);
        let contractDetails = await contractDAO.getDetailsByContractId(id);
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let attributes = await baseDAO.getAll('contract_attribute');
        let types = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let status = await baseDAO.getAll('contract_status');
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        res.render('contract/edit_contract_detail', {
            gradeMap: commonUtil.toMap(grades),
            userMap: commonUtil.toMap(users),
            attributeMap: commonUtil.toMap(attributes),
            typeMap: commonUtil.toMap(types),
            possibilityMap: commonUtil.toMap(possibilities),
            statusMap: commonUtil.toMap(status),
            contract: contract,
            student: student[0],
            contractDetails: contractDetails,
            subjects: subjects,
            detailTypes: detailTypes,
            dateUtil: dateUtil
        })
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_contract_detail', async function (req, res) {
    try {
        let contract_id = req.body.id;
        let oldContractDetail = await contractDAO.getDetailsByContractId(contract_id);
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
            let pattType = new RegExp('^type_id_');
            if (pattType.test(key)) {
                contractDetail[contractDetail.length - 1].type_id = req.body[key];
            }
            let pattPrice = new RegExp('^price_');
            if (pattPrice.test(key)) {
                contractDetail[contractDetail.length - 1].price = req.body[key];
            }
            let pattId = new RegExp('^id_');
            if (pattId.test(key)) {
                contractDetail[contractDetail.length - 1].id = req.body[key];
            }
        }
        for (let i = 0; i < contractDetail.length; i++) {
            for (let j = 0; j < oldContractDetail.length; j++) {
                if (contractDetail[i].id == oldContractDetail[j].id) {
                    contractDetail[i].contract_id = oldContractDetail[j].contract_id;
                    contractDetail[i].grade_id = oldContractDetail[j].grade_id;
                    contractDetail[i].finished_lesson = oldContractDetail[j].finished_lesson;
                    contractDetail[i].status_id = oldContractDetail[j].status_id;
                    contractDetail[i].create_at = oldContractDetail[j].create_at;
                    contractDetail[i].update_at = oldContractDetail[j].update_at;
                }
            }
        }
        await contractDAO.saveContractDetailTemp(contractDetail, contract_id);
        res.redirect('/contract/my_contract_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/contract_view', async function (req, res) {
    try {
        let contract = await baseDAO.getById('contract', req.query.id);
        contract = contract[0];
        let contractDetails = await contractDAO.getDetailsByContractId(contract.id);
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let attributes = await baseDAO.getAll('contract_attribute');
        let types = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let status = await baseDAO.getAll('contract_status');
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        let detailStatus = await baseDAO.getAll('contract_detail_status');
        res.render('contract/contract_view', {
            contract: contract,
            contractDetails: contractDetails,
            gradeMap: commonUtil.toMap(grades),
            userMap: commonUtil.toMap(users),
            attributeMap: commonUtil.toMap(attributes),
            typeMap: commonUtil.toMap(types),
            possibilityMap: commonUtil.toMap(possibilities),
            statusMap: commonUtil.toMap(status),
            subjectMap: commonUtil.toMap(subjects),
            detailTypeMap: commonUtil.toMap(detailTypes),
            detailStatusMap: commonUtil.toMap(detailStatus),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/contract_detail_log', async function (req, res) {
    try {
        let contract = await baseDAO.getById('contract', req.query.id);
        contract = contract[0];
        let details = await contractDAO.getDetailLogsByContractId(contract.id);
        let detailVOs = {};
        for (let i = 0; i < details.length; i++) {
            let dateTime = dateUtil.dateTimeMinuteFormat(details[i].update_at);
            if (!detailVOs[dateTime] || detailVOs[dateTime].length <= 0){
                detailVOs[dateTime] = [];
            }
            detailVOs[dateTime][detailVOs[dateTime].length] = details[i];
        }
        let count = 0;
        for (let key in detailVOs) {
            count += 1;
        }
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        let detailStatus = await baseDAO.getAll('contract_detail_status');
        res.render('contract/contract_detail_log', {
            contract: contract,
            detailVOs: detailVOs,
            count: count,
            subjectMap: commonUtil.toMap(subjects),
            detailTypeMap: commonUtil.toMap(detailTypes),
            detailStatusMap: commonUtil.toMap(detailStatus)
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/contract_charge_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.grade_id = req.query.grade_id;
        condition.mode_id = req.query.mode_id;
        condition.signer_id = req.query.signer_id;
        condition.type_id = req.query.type_id;
        condition.start_date = req.query.start_date;
        condition.end_date = req.query.end_date;
        let contractCharges = await contractChargeDAO.getContractChargeByCondition(condition);
        let students = await baseDAO.getAll('student');
        let grades = await baseDAO.getAll('grade');
        let modes = await baseDAO.getAll('contract_charge_mode');
        let signers = await userDAO.getUserByRole(['03', '04']);//角色为顾问和班主任
        let types = await baseDAO.getAll('contract_charge_type');
        let contracts = await baseDAO.getAll('contract');
        res.render('contract/contract_charge_list', {
            contractCharges: contractCharges,
            students: students,
            grades: grades,
            modes: modes,
            signers: signers,
            types: types,
            studentMap: commonUtil.toMap(students),
            gradeMap: commonUtil.toMap(grades),
            modeMap: commonUtil.toMap(modes),
            signerMap: commonUtil.toMap(signers),
            typeMap: commonUtil.toMap(types),
            contractMap: commonUtil.toMap(contracts),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
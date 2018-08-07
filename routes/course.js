const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const classRoomDAO = require('../dao/classRoomDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');
const lessonPeriodDAO = require('../dao/lessonPeriodDAO');
const teacherDAO = require('../dao/teacherDAO');
const contractDAO = require('../dao/contractDAO');
const courseApplyDAO = require('../dao/courseApplyDAO');
const studentDAO = require('../dao/studentDAO');
const userDAO = require('../dao/userDAO');
const fileUtil = require('../util/fileUtil');
const uuid = require('node-uuid');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: '../ermsFiles',
    filename: function (req, file, cb) {
        let fileFormat =(file.originalname).split(".");
        cb(null, uuid.v1() + "." + fileFormat[fileFormat.length - 1]);
    }
});
const upload = multer({ storage: storage });

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
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
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
                for (let j = 1; j < gradeIds.length - 1; j++) {
                    if (j === 1) {
                        teachers[i].grades += gradeMap[gradeIds[j]].name;
                    } else {
                        teachers[i].grades += '，' + gradeMap[gradeIds[j]].name;
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

router.get('/teacher_view', async function (req, res) {
    try {
        let teacher = await baseDAO.getById('teacher', req.query.id);
        teacher = teacher[0];
        let grades = await baseDAO.getAll('grade');
        let subjects = await baseDAO.getAll('subject');
        let gradeMap = commonUtil.toMap(grades);
        let gradeIds = teacher.grade_ids.split('#');
        teacher.grades = '';
        for (let i = 1; i < gradeIds.length - 1; i++) {
            if (i === 1) {
                teacher.grades += gradeMap[gradeIds[i]].name;
            } else {
                teacher.grades += '，' + gradeMap[gradeIds[i]].name;
            }
        }
        let freeTimes = await teacherDAO.getFreeTimeByTeacherId(teacher.id);
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let lessonPeriodMap = commonUtil.toMap(lessonPeriods);
        if (freeTimes != null && freeTimes.length > 0) {
            for (let i = 0; i < freeTimes.length; i++) {
                let lessonPeriodIds = freeTimes[i].lesson_period_ids.split('#');
                freeTimes[i].lessonPeriods = '';
                for (let j = 1; j < lessonPeriodIds.length - 1; j++) {
                    if (j === 1) {
                        freeTimes[i].lessonPeriods += lessonPeriodMap[lessonPeriodIds[j]].name;
                    } else {
                        freeTimes[i].lessonPeriods += '，' + lessonPeriodMap[lessonPeriodIds[j]].name;
                    }
                }
            }
        }
        res.render('course/teacher_view', {
            teacher: teacher,
            subjectMap: commonUtil.toMap(subjects),
            freeTimes: freeTimes,
            backUrl: req.query.back_url,
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
        res.render('course/new_teacher', {
            subjects: subjects,
            grades: grades
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/add_teacher_free_time_tr', async function (req, res) {
    try {
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
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
                let lesson_period_ids = "#";
                let lessonPeriodIds = req.body[key];
                if (lessonPeriodIds) {
                    if (!Array.isArray(lessonPeriodIds)) {
                        lesson_period_ids += lessonPeriodIds + "#";
                    } else {
                        for (let i = 0; i < lessonPeriodIds.length; i++) {
                            lesson_period_ids += lessonPeriodIds[i] + "#";
                        }
                    }
                }
                teacherFreeTime[teacherFreeTime.length - 1].lesson_period_ids = lesson_period_ids=="#"?null:lesson_period_ids;
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
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
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

router.post('/do_update_teacher', async function (req, res) {
    try {
        let teacher = await baseDAO.getById('teacher', req.body.id);
        teacher = teacher[0];
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
                let lesson_period_ids = "#";
                let lessonPeriodIds = req.body[key];
                if (lessonPeriodIds) {
                    if (!Array.isArray(lessonPeriodIds)) {
                        lesson_period_ids += lessonPeriodIds + "#";
                    } else {
                        for (let i = 0; i < lessonPeriodIds.length; i++) {
                            lesson_period_ids += lessonPeriodIds[i] + "#";
                        }
                    }
                }
                teacherFreeTime[teacherFreeTime.length - 1].lesson_period_ids = lesson_period_ids=="#"?null:lesson_period_ids;
            }
        }
        teacher.teacherFreeTime = teacherFreeTime;
        await teacherDAO.updateTeacher(teacher);
        res.redirect('/course/teacher_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/teacher_search', async function (req, res) {
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
                for (let j = 1; j < gradeIds.length - 1; j++) {
                    if (j === 1) {
                        teachers[i].grades += gradeMap[gradeIds[j]].name;
                    } else {
                        teachers[i].grades += '，' + gradeMap[gradeIds[j]].name;
                    }
                }
            }
        }
        res.render('course/teacher_search', {
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

router.get('/new_course_apply', async function (req, res) {
    try {
        let contract = await baseDAO.getById('contract', req.query.contract_id);
        contract = contract[0];
        let contractDetails = await contractDAO.getDetailsByContractId(contract.id);
        let contractCharges = await contractDAO.getContractChargesByContractId(contract.id);
        let chargeTypes = await baseDAO.getAll('contract_charge_type');
        let chargeModes = await baseDAO.getAll('contract_charge_mode');
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let attributes = await baseDAO.getAll('contract_attribute');
        let types = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let status = await baseDAO.getAll('contract_status');
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        let detailStatus = await baseDAO.getAll('contract_detail_status');
        res.render('course/new_course_apply', {
            contract: contract,
            contractDetails: contractDetails,
            contractCharges: contractCharges,
            chargeTypeMap: commonUtil.toMap(chargeTypes),
            chargeModeMap: commonUtil.toMap(chargeModes),
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

router.post('/do_create_course_apply', upload.single('file_path'), async function (req, res) {
    try {
        let courseApply = {};
        courseApply.contract_id = req.body.contract_id;
        courseApply.name = req.file.originalname;
        courseApply.path = req.file.filename;
        courseApply.operator_id = req.session.user[0].id;
        await courseApplyDAO.saveCourseApply(courseApply);
        res.redirect('/contract/my_contract_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/my_course_apply_list', async function (req, res) {
    try {
        let currentUser = req.session.user[0];
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.status_id = req.query.status_id;
        condition.operator_id = currentUser.id;
        let courseApplies = await courseApplyDAO.getCourseApplyByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let cCondition = {};
        cCondition.status_id = '02';//查询执行中的合同
        let contracts = await contractDAO.getContractByCondition('contract', cCondition);
        let status = await baseDAO.getAll('course_apply_status');
        let appliers = [currentUser];//申请人只可选自己
        res.render('course/my_course_apply_list', {
            courseApplies: courseApplies,
            students: students,
            status: status,
            appliers: appliers,
            studentMap: commonUtil.toMap(students),
            contractMap: commonUtil.toMap(contracts),
            statusMap: commonUtil.toMap(status),
            appliersMap: commonUtil.toMap(appliers),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_course_apply', async function (req, res) {
    try {
        let courseApply = await baseDAO.getById('course_apply', req.query.id);
        courseApply = courseApply[0];
        let contract = await baseDAO.getById('contract', courseApply.contract_id);
        contract = contract[0];
        let contractDetails = await contractDAO.getDetailsByContractId(contract.id);
        let contractCharges = await contractDAO.getContractChargesByContractId(contract.id);
        let chargeTypes = await baseDAO.getAll('contract_charge_type');
        let chargeModes = await baseDAO.getAll('contract_charge_mode');
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let attributes = await baseDAO.getAll('contract_attribute');
        let types = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let status = await baseDAO.getAll('contract_status');
        let subjects = await baseDAO.getAll('subject');
        let detailTypes = await baseDAO.getAll('contract_detail_type');
        let detailStatus = await baseDAO.getAll('contract_detail_status');
        res.render('course/edit_course_apply', {
            courseApply: courseApply,
            contract: contract,
            contractDetails: contractDetails,
            contractCharges: contractCharges,
            chargeTypeMap: commonUtil.toMap(chargeTypes),
            chargeModeMap: commonUtil.toMap(chargeModes),
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

router.post('/do_update_course_apply', upload.single('file_path'), async function (req, res) {
    try {
        let courseApply = await baseDAO.getById('course_apply', req.body.id);
        courseApply = courseApply[0];
        if (req.file) {
            await fileUtil.deleteFile('../ermsFiles/'+courseApply.path);
            courseApply.name = req.file.originalname;
            courseApply.path = req.file.filename;
        }
        courseApply.status_id = '01';//修改后变为待审核
        await courseApplyDAO.updateCourseApply(courseApply);
        res.redirect('/course/my_course_apply_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_course_apply', async function (req, res) {
    try {
        let courseApply = await baseDAO.getById('course_apply', req.query.id);
        courseApply = courseApply[0];
        await fileUtil.deleteFile('../ermsFiles/'+courseApply.path);
        await baseDAO.deleteById('course_apply', courseApply.id);
        res.redirect(req.query.back_url);
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/audit_course_apply_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.status_id = '01';//值查询待审核的申请
        condition.operator_id = req.query.operator_id;
        let courseApplies = await courseApplyDAO.getCourseApplyByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let cCondition = {};
        cCondition.status_id = '02';//查询执行中的合同
        let contracts = await contractDAO.getContractByCondition('contract', cCondition);
        let status = await baseDAO.getById('course_apply_status', '01');
        let appliers = await userDAO.getAllAdviser();
        res.render('course/audit_course_apply_list', {
            courseApplies: courseApplies,
            students: students,
            status: status,
            appliers: appliers,
            studentMap: commonUtil.toMap(students),
            contractMap: commonUtil.toMap(contracts),
            statusMap: commonUtil.toMap(status),
            appliersMap: commonUtil.toMap(appliers),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_audit_course_apply', async function (req, res) {
    try {
        let courseApply = await baseDAO.getById('course_apply', req.query.id);
        courseApply = courseApply[0];
        courseApply.status_id = req.query.status_id;
        await courseApplyDAO.updateCourseApply(courseApply);
        res.redirect('/course/audit_course_apply_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audited_course_apply_list', async function (req, res) {
    try {
        let currentUser = req.session.user[0];
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.status_id = '02';//值查询已审核通过的申请
        condition.operator_id = req.query.operator_id;
        condition.headmaster_id = currentUser.id;//当前用户作为班主任条件，查询学员，进而查询合同，最终查出排课申请（班主任用户只能看到自己学员相关的排课申请）
        let courseApplies = await courseApplyDAO.getCourseApplyByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        sCondition.headmaster_id = currentUser.id;//只显示班主任是当前用户的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let cCondition = {};
        cCondition.status_id = '02';//查询执行中的合同
        let contracts = await contractDAO.getContractByCondition('contract', cCondition);
        let status = await baseDAO.getById('course_apply_status', '02');
        let appliers = await userDAO.getAllAdviser();
        res.render('course/audited_course_apply_list', {
            courseApplies: courseApplies,
            students: students,
            status: status,
            appliers: appliers,
            studentMap: commonUtil.toMap(students),
            contractMap: commonUtil.toMap(contracts),
            statusMap: commonUtil.toMap(status),
            appliersMap: commonUtil.toMap(appliers),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

//todo:排课表逐条新增编辑和审核，
//todo:在合同管理list页面对每一条合同数据加个按钮——当用户为班主任时，搜索自己的学生的合同，对于已排课时小于总课时且状态为"执行中"的合同显示"排课"按钮，
//todo:点击"排课"按钮后上面显示合同信息和合同明细，在已排课时（查询和此明细id相关的排课表数据条数，所有状态都算上）小于此明细总课时的后面显示"排课"按钮，点击后进入新增一条排课数据的form表单
//todo:form表单显示不可编辑的合同信息以及当前选中的合同明细信息（显示合同编号，隐藏合同id和明细id的input，显示明细中的科目和年级），剩下待确定字段可编辑（教师，教室，日期，课时，在编辑排课信息时也只能编辑这四个字段），
//todo:上课日期默认今天，课时默认选择第一个，可选教室和教师动态变化，根据上课日期和课时来查询空闲的教室和教师，
//todo:提交后返回上一界面，即显示合同信息和合同明细的界面
//todo:提交后状态为"待审核"，可被审核通过为"未上课"或审核不通过为"未通过"，若为"未通过"，班主任可以编辑，其他状态不可编辑，编辑后变为"待审核"，"未通过"状态时也可以删除
//todo:排课管理list列表查询当前用户班主任的学生的相关数据，在"未上课"状态且上课日期小于或等于今天的的排课数据后面增加操作按钮"已上课"，点击后改变此条数据状态为"已上课"，并在对应的合同明细的"已完成课时数"中加1

module.exports = router;
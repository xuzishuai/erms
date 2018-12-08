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
const courseScheduleDAO = require('../dao/courseScheduleDAO');
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
        condition.subject_id = req.query.subject_id;
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
        let freeTimes = await teacherDAO.getFreeTimeByCondition({teacher_id: teacher.id});
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
        let teacherFreeTimes = await teacherDAO.getFreeTimeByCondition({teacher_id: teacher.id});
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
        condition.subject_id = req.query.subject_id;
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
//todo:点击"排课"按钮后上面显示合同信息和合同明细，在已排课时（查询和此明细id相关的排课表数据条数，所有状态都算上）小于此明细总课时的后面显示"排课"按钮，点击后进入新增一条排课数据的form表单
//todo:form表单显示不可编辑的合同信息以及当前选中的合同明细信息（显示合同编号，隐藏合同id和明细id的input，显示明细中的科目和年级），剩下待确定字段可编辑（教师，教室，日期，课时，在编辑排课信息时也只能编辑这四个字段），
//todo:上课日期默认今天，课时默认选择第一个，课时随日期变化（查出空闲课时，查询原则见代码注释），可选教室和教师动态变化，根据上课日期和课时来查询空闲的教室和教师，
//todo:提交后返回上一界面，即显示合同信息和合同明细的界面
//todo:提交后状态为"待审核"，可被审核通过为"未上课"或审核不通过为"未通过"，若为"未通过"，班主任可以编辑，其他状态不可编辑，编辑后变为"待审核"，"未通过"状态时也可以删除
//todo:排课管理list列表查询当前用户班主任的学生的相关数据，在"未上课"状态且上课日期小于或等于今天的的排课数据后面增加操作按钮"已上课"，点击后改变此条数据状态为"已上课"，并在对应的合同明细的"已完成课时数"中加1

router.get('/new_course_schedule_contract_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.attribute_id = req.query.attribute_id;
        condition.contract_type_id = req.query.contract_type_id;
        condition.grade_id = req.query.grade_id;
        condition.start_date_from = req.query.start_date_from;
        condition.start_date_to = req.query.start_date_to;
        condition.status_id = '02';//查询执行中的合同
        condition.headmaster_id = req.session.user[0].id;//查询当前用户（班主任）的学生的合同
        let contracts = await contractDAO.getContractByCondition('contract', condition);
        //去除课时使用完的合同
        let contractVOs = [];
        for (let i = 0; i < contracts.length; i++) {
            let lesson_periods = await courseScheduleDAO.getCountByContractId(contracts[i].id);
            contracts[i].lesson_periods = lesson_periods[0].lesson_periods;
            if (contracts[i].lesson_periods < contracts[i].total_lesson_period) {
                contractVOs[contractVOs.length] = contracts[i];
            }
        }
        let students = await baseDAO.getAll('student');
        let grades = await baseDAO.getAll('grade');
        let users = await baseDAO.getAll('user');
        let contractAttributes = await baseDAO.getAll('contract_attribute');
        let contractTypes = await baseDAO.getAll('contract_type');
        let possibilities = await baseDAO.getAll('possibility');
        let contractStatus = await baseDAO.getAll('contract_status');
        res.render('course/new_course_schedule_contract_list', {
            contracts: contractVOs,
            students: students,
            grades: grades,
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

router.get('/new_course_schedule_contract_view', async function (req, res) {
    try {
        let contract = await baseDAO.getById('contract', req.query.contract_id);
        contract = contract[0];
        let contractDetails = await contractDAO.getDetailsByContractId(contract.id);
        //查询此条合同明细是否能新增排课
        for (let i = 0; i < contractDetails.length; i++) {
            let lesson_periods = await courseScheduleDAO.getCountByContractDetailId(contractDetails[i].id);
            if (lesson_periods[0].lesson_periods < contractDetails[i].lesson_period) {
                contractDetails[i].enable_course_schedule = true;
            }
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
        res.render('course/new_course_schedule_contract_view', {
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

router.get('/new_course_schedule', async function (req, res) {
    try {
        let contractDetail = await baseDAO.getById('contract_detail', req.query.contract_detail_id);
        contractDetail = contractDetail[0];
        let contract = await baseDAO.getById('contract', contractDetail.contract_id);
        contract = contract[0];
        let student = await baseDAO.getById('student', contract.student_id);
        student = student[0];
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        let classRooms = await baseDAO.getAll('class_room');
        let today = dateUtil.dateFormat(new Date());
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let lessonPeriodVOs = [];
        //根据日期去除已使用的课时
        for (let i = 0; i < lessonPeriods.length; i++) {
            let lCondition = {};
            lCondition.student_id = student.id;
            lCondition.lesson_date = today;
            lCondition.lesson_period_id = lessonPeriods[i].id;
            let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(lCondition);
            if (!courseSchedule || courseSchedule.length <= 0) {
                lessonPeriodVOs[lessonPeriodVOs.length] = lessonPeriods[i];
            }
        }
        let tCondition = {};
        tCondition.grade_id = contractDetail.grade_id;
        tCondition.subject_id = contractDetail.subject_id;
        let teachers = await teacherDAO.getTeacherByCondition(tCondition);
        let teacherVOs = [];
        let isFree = true;//学生在此日期的此档期是否有空
        let sCondition = {};
        sCondition.student_id = student.id;
        sCondition.lesson_date = today;
        sCondition.lesson_period_id = lessonPeriodVOs[0].id;//默认第一个课时
        let courseScheduleForStudent = await courseScheduleDAO.getCourseScheduleByCondition(sCondition);
        if (courseScheduleForStudent && courseScheduleForStudent.length > 0) {
            isFree = false;//如果这个学生在这个日期的这个档期有课，那么不用查教师和教室了
        }
        let classRoomVOs = [];
        if (isFree) {
            //根据日期和默认第一个课时去除有课的教师
            for (let i = 0; i < teachers.length; i++) {
                let tCondition = {};
                tCondition.lesson_date = today;
                tCondition.lesson_period_id = lessonPeriodVOs[0].id;//默认第一个课时
                tCondition.teacher_id = teachers[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(tCondition);
                if (!courseSchedule || courseSchedule.length <= 0) {
                    teacherVOs[teacherVOs.length] = teachers[i];
                }
            }
            //根据日期和默认第一个课时去除有课的教室
            for (let i = 0; i < classRooms.length; i++) {
                let cCondition = {};
                cCondition.lesson_date = today;
                cCondition.lesson_period_id = lessonPeriodVOs[0].id;//默认第一个课时
                cCondition.class_room_id = classRooms[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(cCondition);
                if (!courseSchedule || courseSchedule.length <= 0) {
                    classRoomVOs.push(classRooms[i]);
                }
            }
        }
        res.render('course/new_course_schedule', {
            contract: contract,
            contractDetail: contractDetail,
            subjectMap: commonUtil.toMap(subjects),
            gradeMap: commonUtil.toMap(grades),
            lessonPeriod: lessonPeriodVOs,
            teachers: teacherVOs,
            classRooms: classRoomVOs,
            student: student,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/course_schedule_select_change', async function (req, res) {
    try {
        let id = req.body.id;
        let today = req.body.lesson_date;
        let student_id = req.body.student_id;
        let lessonPeriodVOs = [];
        let classRooms = await baseDAO.getAll('class_room');
        if (req.body.select_name == 'lesson_date') {
            let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
            //根据日期去除已使用的课时
            for (let i = 0; i < lessonPeriods.length; i++) {
                let lCondition = {};
                lCondition.student_id = student_id;
                lCondition.lesson_date = today;
                lCondition.lesson_period_id = lessonPeriods[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(lCondition);
                //id不为空时表示编辑页面，这条记录的课时也要加进去
                let enabled = false;
                if (id && id != '' && courseSchedule && courseSchedule.length >= 1) {
                    for (let j = 0; j < courseSchedule.length; j++) {
                        if (courseSchedule[j].id == id) {
                            enabled = true;
                            break;
                        }
                    }
                }
                if (!courseSchedule || courseSchedule.length <= 0 || enabled) {//此学生此日期此课时没有排课，表示此课时可用；或是是编辑界面，且其中有一条是本数据，则此课时可用
                    lessonPeriodVOs[lessonPeriodVOs.length] = lessonPeriods[i];
                }
            }
        }
        let tCondition = {};
        tCondition.grade_id = req.body.grade_id;
        tCondition.subject_id = req.body.subject_id;
        let teachers = await teacherDAO.getTeacherByCondition(tCondition);
        let lesson_period_id = '';
        if (req.body.select_name == 'lesson_date') {
            lesson_period_id = lessonPeriodVOs[0].id;//默认第一个课时
        } else {
            lesson_period_id = req.body.lesson_period_id;//通过传过来的课时查询
        }
        let isFree = true;//学生在此日期的此档期是否有空
        let sCondition = {};
        sCondition.student_id = student_id;
        sCondition.lesson_date = today;
        sCondition.lesson_period_id = lesson_period_id;
        let courseScheduleForStudent = await courseScheduleDAO.getCourseScheduleByCondition(sCondition);
        if (courseScheduleForStudent && courseScheduleForStudent.length > 0) {
            isFree = false;//如果这个学生在这个日期的这个档期有课，那么不用查教师和教室了
        }
        let teacherVOs = [];
        let classRoomVOs = [];

        if (isFree) {
            //根据日期和默认第一个课时去除有课的教师
            for (let i = 0; i < teachers.length; i++) {
                let tCondition = {};
                tCondition.lesson_date = today;
                tCondition.lesson_period_id = lesson_period_id;
                tCondition.teacher_id = teachers[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(tCondition);
                //id不为空时表示编辑页面，这条记录的教师也要加进去
                if (!courseSchedule || courseSchedule.length <= 0 || (id && id != '' && courseSchedule && courseSchedule.length > 0 && courseSchedule[0].id == id)) {
                    teacherVOs[teacherVOs.length] = teachers[i];
                }
            }
            //根据日期和默认第一个课时去除有课的教室
            for (let i = 0; i < classRooms.length; i++) {
                let cCondition = {};
                cCondition.lesson_date = today;
                cCondition.lesson_period_id = lesson_period_id;
                cCondition.class_room_id = classRooms[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(cCondition);
                //id不为空时表示编辑页面，这条记录的教室也要加进去
                if (!courseSchedule || courseSchedule.length <= 0 || (id && id != '' && courseSchedule && courseSchedule.length > 0 && courseSchedule[0].id == id)) {
                    classRoomVOs.push(classRooms[i]);
                }
            }
        }
        res.send({
            lessonPeriods: lessonPeriodVOs,
            teachers: teacherVOs,
            classRooms: classRoomVOs
        });
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.post('/do_create_course_schedule', async function (req, res) {
    try {
        let courseSchedule = {};
        courseSchedule.contract_id = req.body.contract_id;
        courseSchedule.contract_detail_id = req.body.contract_detail_id;
        courseSchedule.subject_id = req.body.subject_id;
        courseSchedule.grade_id = req.body.grade_id;
        courseSchedule.lesson_date = req.body.lesson_date;
        courseSchedule.lesson_period_id = req.body.lesson_period_id;
        courseSchedule.class_room_id = req.body.class_room_id;
        courseSchedule.teacher_id = req.body.teacher_id;
        courseSchedule.operator_id = req.session.user[0].id;
        let contract = await baseDAO.getById('contract', courseSchedule.contract_id);
        courseSchedule.student_id = contract[0].student_id;
        await courseScheduleDAO.saveCourseSchedule(courseSchedule);
        res.redirect('/course/new_course_schedule_contract_view?contract_id=' + courseSchedule.contract_id);
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audit_course_schedule_list', async function (req, res) {
    try {
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.subject_id = req.query.subject_id;
        condition.grade_id = req.query.grade_id;
        condition.teacher_id = req.query.teacher_id;
        condition.lesson_date = req.query.lesson_date;
        condition.lesson_period_id = req.query.lesson_period_id;
        condition.class_room_id = req.query.class_room_id;
        condition.operator_id = req.query.headmaster_id;//班主任就是操作人
        condition.status_id = '01';//查询待审核的数据
        let courseSchedules = await courseScheduleDAO.getCourseScheduleByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        let students = await studentDAO.getStudentByCondition(sCondition);
        let cCondition = {};
        cCondition.status_id = '02';//查询执行中的合同
        let contracts = await contractDAO.getContractByCondition('contract', cCondition);
        let headmasters = await userDAO.getAllHeadmaster();
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        let teachers = await baseDAO.getAll('teacher');
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let classRooms = await baseDAO.getAll('class_room');
        let status = await baseDAO.getAll('course_schedule_status');
        res.render('course/audit_course_schedule_list', {
            courseSchedules: courseSchedules,
            students: students,
            contracts: contracts,
            subjects: subjects,
            grades: grades,
            teachers: teachers,
            lessonPeriods: lessonPeriods,
            classRooms: classRooms,
            headmasters: headmasters,
            studentMap: commonUtil.toMap(students),
            contractMap: commonUtil.toMap(contracts),
            subjectMap: commonUtil.toMap(subjects),
            gradeMap: commonUtil.toMap(grades),
            teacherMap: commonUtil.toMap(teachers),
            lessonPeriodMap: commonUtil.toMap(lessonPeriods),
            statusMap: commonUtil.toMap(status),
            headmasterMap: commonUtil.toMap(headmasters),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_audit_course_schedule', async function (req, res) {
    try {
        let courseSchedule = await baseDAO.getById('course_schedule', req.query.id);
        courseSchedule = courseSchedule[0];
        courseSchedule.status_id = req.query.status_id;
        await courseScheduleDAO.updateCourseSchedule(courseSchedule);
        res.redirect('/course/audit_course_schedule_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/course_schedule_list', async function (req, res) {
    try {
        let headmaster_id = req.session.user[0].id;
        let condition = {};
        condition.student_id = req.query.student_id;
        condition.contract_no = req.query.contract_no;
        condition.subject_id = req.query.subject_id;
        condition.grade_id = req.query.grade_id;
        condition.teacher_id = req.query.teacher_id;
        condition.lesson_date = req.query.lesson_date;
        condition.lesson_period_id = req.query.lesson_period_id;
        condition.class_room_id = req.query.class_room_id;
        condition.status_id = req.query.status_id;
        condition.operator_id = headmaster_id;//查询当前用户（班主任）创建的排课信息
        let courseSchedules = await courseScheduleDAO.getCourseScheduleByCondition(condition);
        let sCondition = {};
        sCondition.status_id = '03';//只显示已签约的学员
        sCondition.headmaster_id = headmaster_id;//查询当前用户（班主任）的学生
        let students = await studentDAO.getStudentByCondition(sCondition);
        let cCondition = {};
        cCondition.status_id = '02';//查询执行中的合同
        cCondition.headmaster_id = headmaster_id;//查询当前用户（班主任）的学生的合同
        let contracts = await contractDAO.getContractByCondition('contract', cCondition);
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        let teachers = await baseDAO.getAll('teacher');
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let classRooms = await baseDAO.getAll('class_room');
        let status = await baseDAO.getAll('course_schedule_status');
        res.render('course/course_schedule_list', {
            courseSchedules: courseSchedules,
            students: students,
            contracts: contracts,
            subjects: subjects,
            grades: grades,
            teachers: teachers,
            lessonPeriods: lessonPeriods,
            classRooms: classRooms,
            status: status,
            studentMap: commonUtil.toMap(students),
            contractMap: commonUtil.toMap(contracts),
            subjectMap: commonUtil.toMap(subjects),
            gradeMap: commonUtil.toMap(grades),
            teacherMap: commonUtil.toMap(teachers),
            lessonPeriodMap: commonUtil.toMap(lessonPeriods),
            statusMap: commonUtil.toMap(status),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_course_schedule', async function (req, res) {
    try {
        let courseScheduleObj = await baseDAO.getById('course_schedule', req.query.id);
        courseScheduleObj = courseScheduleObj[0];
        let contractDetail = await baseDAO.getById('contract_detail', courseScheduleObj.contract_detail_id);
        contractDetail = contractDetail[0];
        let contract = await baseDAO.getById('contract', courseScheduleObj.contract_id);
        contract = contract[0];
        let student = await baseDAO.getById('student', contract.student_id);
        student = student[0];
        let subjects = await baseDAO.getAll('subject');
        let grades = await baseDAO.getAll('grade');
        let classRooms = await baseDAO.getAll('class_room');
        let today = dateUtil.dateFormat(courseScheduleObj.lesson_date);
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let lessonPeriodVOs = [];
        //根据日期去除已使用的课时
        for (let i = 0; i < lessonPeriods.length; i++) {
            let lCondition = {};
            lCondition.student_id = student.id;
            lCondition.lesson_date = today;
            lCondition.lesson_period_id = lessonPeriods[i].id;
            let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(lCondition);
            //编辑页面，这条记录的课时也要加进去
            let enabled = false;
            if (courseSchedule && courseSchedule.length >= 1) {
                for (let j = 0; j < courseSchedule.length; j++) {
                    if (courseSchedule[j].id == courseScheduleObj.id) {
                        enabled = true;
                        break;
                    }
                }
            }
            if (!courseSchedule || courseSchedule.length <= 0 || enabled) {//此学生此日期此课时没有排课，表示此课时可用；或是是编辑界面，且其中有一条是本数据，则此课时可用
                lessonPeriodVOs[lessonPeriodVOs.length] = lessonPeriods[i];
            }
        }
        let tCondition = {};
        tCondition.grade_id = contractDetail.grade_id;
        tCondition.subject_id = contractDetail.subject_id;
        let teachers = await teacherDAO.getTeacherByCondition(tCondition);
        let isFree = true;//学生在此日期的此档期是否有空
        let sCondition = {};
        sCondition.student_id = student.id;
        sCondition.lesson_date = today;
        sCondition.lesson_period_id = courseScheduleObj.lesson_period_id;
        let courseScheduleForStudent = await courseScheduleDAO.getCourseScheduleByCondition(sCondition);
        if (courseScheduleForStudent && courseScheduleForStudent.length > 0) {
            isFree = false;//如果这个学生在这个日期的这个档期有课，那么不用查教师和教室了
        }
        let teacherVOs = [];
        let classRoomVOs = [];
        if (isFree) {
            //根据日期和默认第一个课时去除有课的教师
            for (let i = 0; i < teachers.length; i++) {
                let tCondition = {};
                tCondition.lesson_date = today;
                tCondition.lesson_period_id = courseScheduleObj.lesson_period_id;
                tCondition.teacher_id = teachers[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(tCondition);
                if (!courseSchedule || courseSchedule.length <= 0 || (courseSchedule && courseSchedule.length > 0 && courseSchedule[0].id == courseScheduleObj.id)) {
                    teacherVOs[teacherVOs.length] = teachers[i];
                }
            }
            //根据日期和默认第一个课时去除有课的教室
            for (let i = 0; i < classRooms.length; i++) {
                let cCondition = {};
                cCondition.lesson_date = today;
                cCondition.lesson_period_id = courseScheduleObj.lesson_period_id;
                cCondition.class_room_id = classRooms[i].id;
                let courseSchedule = await courseScheduleDAO.getCourseScheduleByCondition(cCondition);
                if (!courseSchedule || courseSchedule.length <= 0 || (courseSchedule && courseSchedule.length > 0 && courseSchedule[0].id == courseScheduleObj.id)) {
                    classRoomVOs[classRoomVOs.length] = classRooms[i];
                }
            }
        }
        res.render('course/edit_course_schedule', {
            courseScheduleObj: courseScheduleObj,
            contract: contract,
            contractDetail: contractDetail,
            subjectMap: commonUtil.toMap(subjects),
            gradeMap: commonUtil.toMap(grades),
            lessonPeriod: lessonPeriodVOs,
            teachers: teacherVOs,
            classRooms: classRoomVOs,
            student: student,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_course_schedule', async function (req, res) {
    try {
        let courseSchedule = {};
        courseSchedule.id = req.body.id;
        courseSchedule.lesson_date = req.body.lesson_date;
        courseSchedule.lesson_period_id = req.body.lesson_period_id;
        courseSchedule.class_room_id = req.body.class_room_id;
        courseSchedule.teacher_id = req.body.teacher_id;
        courseSchedule.status_id = '01';
        await courseScheduleDAO.updateCourseSchedule(courseSchedule);
        res.redirect('/course/course_schedule_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_finish_course_schedule', async function (req, res) {
    try {
        let courseSchedule = await baseDAO.getById('course_schedule', req.query.csId);
        courseSchedule = courseSchedule[0];
        courseSchedule.status_id = '04';
        await courseScheduleDAO.doFinishCourseSchedule(courseSchedule);
        res.redirect('/course/course_schedule_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_course_schedule', async function (req, res) {
    try {
        await baseDAO.deleteById('course_schedule', req.query.id);
        res.redirect('/course/course_schedule_list');
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/course_timetable', async function (req, res) {
    try {
        let condition = {};
        condition.teacher_id = req.query.teacher_id;
        condition.lesson_start_date = req.query.lesson_start_date?req.query.lesson_start_date:dateUtil.dateFormat(new Date());
        condition.lesson_end_date = dateUtil.addDays(condition.lesson_start_date, 7);
        condition.status_ids = ['02', '04'];
        let courseSchedules = await courseScheduleDAO.getCourseScheduleByCondition(condition);
        let teachers = await baseDAO.getAll('teacher');
        let teacherMap = commonUtil.toMap(teachers);
        let courseScheduleMap = {};
        let teacherVOs = [];
        for (let i = 0; i < courseSchedules.length; i++) {
            courseScheduleMap[courseSchedules[i].teacher_id+dateUtil.dateFormat(courseSchedules[i].lesson_date)+courseSchedules[i].lesson_period_id] = courseSchedules[i];
            let isExist = teacherVOs.some(item=>{
                if(item.id == courseSchedules[i].teacher_id){
                    return true;
                }
            });
            if (!isExist) {
                teacherVOs[teacherVOs.length] = teacherMap[courseSchedules[i].teacher_id];
            }
        }
        let lessonPeriods = await lessonPeriodDAO.getLessonPeriod();
        let days = [];
        days.push(condition.lesson_start_date);
        days.push(dateUtil.addDays(condition.lesson_start_date, 1));
        days.push(dateUtil.addDays(condition.lesson_start_date, 2));
        days.push(dateUtil.addDays(condition.lesson_start_date, 3));
        days.push(dateUtil.addDays(condition.lesson_start_date, 4));
        days.push(dateUtil.addDays(condition.lesson_start_date, 5));
        days.push(dateUtil.addDays(condition.lesson_start_date, 6));
        let sCondition = {};
        sCondition.status_id = '03';
        let students = await studentDAO.getStudentByCondition(sCondition);
        let classRooms = await baseDAO.getAll('class_room');
        let status = await baseDAO.getAll('course_schedule_status');
        let preWeek = dateUtil.addDays(condition.lesson_start_date, -7);
        let nextWeek = dateUtil.addDays(condition.lesson_start_date, 7);
        let subjects = await baseDAO.getAll('subject');
        res.render('course/course_timetable', {
            courseScheduleMap: courseScheduleMap,
            teachers: teacherVOs,
            teacherMap: teacherMap,
            lessonPeriods: lessonPeriods,
            days: days,
            studentMap: commonUtil.toMap(students),
            classRoomMap: commonUtil.toMap(classRooms),
            statusMap: commonUtil.toMap(status),
            subjectMap: commonUtil.toMap(subjects),
            preWeek: preWeek,
            nextWeek: nextWeek,
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

module.exports = router;
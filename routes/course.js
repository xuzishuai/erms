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
        console.log(req.file.originalname)
        /*if (req.body.id && req.body.id != '') {
            let img = await baseDAO.getById('product_img', req.body.id);
            let img_path = req.file?req.file.filename:null;
            let old_img_path = req.body.old_img_path;
            if (!(img_path == null && old_img_path != '')) {
                await fileUtil.deleteFile('../linenFiles/'+img[0].img_path);
            }
            if (req.file) {
                let img = {};
                img.filename = req.file.filename;
                img.id = req.body.id;
                await productDAO.updateProductImgs(img);
            } else {
                if (!(img_path == null && old_img_path != '')) {
                    await baseDAO.deleteById('product_img', req.body.id);
                }
            }
        } else {
            if (req.file) {
                let img = {};
                img.img_type = req.body.img_type;
                img.type_id = type.id;
                img.img_path = req.file.filename;
                await productDAO.saveProductImgs(img);
            }
        }
        res.redirect('/product/product_upload_img?id='+type.id+'&img_type='+req.body.img_type);*/
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
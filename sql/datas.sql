-- ----------------------------
-- Records of menu,插入菜单数据
-- ----------------------------
INSERT INTO menu VALUES ('1', '用户', null, null, '#2#3#', 'icon-user', null, 2);
INSERT INTO menu VALUES ('2', '账号管理', '1', '/user/user_list', null, null,'#/user/user_list#/user/new_user#/user/validate_user_no#/user/do_create_user#/user/edit_user#/user/do_update_user#/user/delete_user#', null);
INSERT INTO menu VALUES ('3', '角色管理', '1', '/user/role_list', null, null, '#/user/role_list#/user/new_role#/user/validate_role_name#/user/do_create_role#/user/edit_role#/user/do_update_role#/user/delete_role#', null);
INSERT INTO menu VALUES ('4', '客户', null, null, '#5#6#7#8#9#10#', 'icon-briefcase', null, 1);
INSERT INTO menu VALUES ('5', '客户登记', '4', '/student/new_student', null, null, '#/student/new_student#/student/do_create_student#', null);
INSERT INTO menu VALUES ('6', '上门确认', '4', '/student/arrive_student_list', null, null, '#/student/arrive_student_list#/student/student_arrive#/student/do_student_arrive#', null);
INSERT INTO menu VALUES ('7', '客户分配', '4', '/student/assign_adviser_student_list', null, null, '#/student/assign_adviser_student_list#/student/assign_adviser#/student/do_assign_adviser#', null);
INSERT INTO menu VALUES ('8', '客户审核', '4', '/student/audit_student_list', null, null, '#/student/audit_student_list#', null);
INSERT INTO menu VALUES ('9', '客户追踪', '4', '/student/follow_student_list', null, null, '#/student/follow_student_list#/student/student_tracking_list#/student/new_student_tracking#' +
'/student/edit_student_tracking#/student/delete_student_tracking#/student/do_create_student_tracking#/student/do_update_student_tracking#/student/visit_record_list#/student/new_visit_record#' +
'/student/edit_visit_record#/student/delete_visit_record#/student/do_create_visit_record#/student/do_update_visit_record#', null);
INSERT INTO menu VALUES ('10', '客户管理', '4', '/student/student_list', null, null, '#/student/student_list#/student/edit_student#/student/do_update_student#', null);

-- ----------------------------
-- Records of user,插入超级管理员用户
-- ----------------------------
INSERT INTO `user` VALUES ('1cbb1360-d57d-11e7-9634-4d058774421e', 'ermsAdmin', '超级管理员', 'Xzs_825197298?', null, false);

-- ----------------------------
-- Records of grade
-- ----------------------------
INSERT INTO grade VALUES ('01', '高四');
INSERT INTO grade VALUES ('02', '高三');
INSERT INTO grade VALUES ('03', '高二');
INSERT INTO grade VALUES ('04', '高一');
INSERT INTO grade VALUES ('05', '初三');
INSERT INTO grade VALUES ('06', '初二');
INSERT INTO grade VALUES ('07', '初一');
INSERT INTO grade VALUES ('08', '小六');
INSERT INTO grade VALUES ('09', '小五');
INSERT INTO grade VALUES ('10', '小四');
INSERT INTO grade VALUES ('11', '小三');
INSERT INTO grade VALUES ('12', '小二');
INSERT INTO grade VALUES ('13', '小一');
INSERT INTO grade VALUES ('14', '小学奥数');
INSERT INTO grade VALUES ('15', '初中奥数');
INSERT INTO grade VALUES ('16', '自主招生');
INSERT INTO grade VALUES ('17', '其他');

-- ----------------------------
-- Records of source
-- ----------------------------
INSERT INTO source VALUES ('01', '呼叫中心上门');
INSERT INTO source VALUES ('02', 'CC预约上门');

-- ----------------------------
-- Records of how_know
-- ----------------------------
INSERT INTO how_know VALUES ('01', '学员推荐');
INSERT INTO how_know VALUES ('02', '合作伙伴推荐');
INSERT INTO how_know VALUES ('03', '百度');
INSERT INTO how_know VALUES ('04', '电子邮件EDM');
INSERT INTO how_know VALUES ('05', '网络媒体');
INSERT INTO how_know VALUES ('06', '电视广告');
INSERT INTO how_know VALUES ('07', '平面媒体');
INSERT INTO how_know VALUES ('08', '设点宣传/派单');
INSERT INTO how_know VALUES ('09', '学校渠道活动');
INSERT INTO how_know VALUES ('10', '手机短信');
INSERT INTO how_know VALUES ('11', '中心门头或招牌');
INSERT INTO how_know VALUES ('12', '报刊亭');
INSERT INTO how_know VALUES ('13', '其他');

-- ----------------------------
-- Records of subject
-- ----------------------------
INSERT INTO subject VALUES ('01', '语文');
INSERT INTO subject VALUES ('02', '数学');
INSERT INTO subject VALUES ('03', '英语');
INSERT INTO subject VALUES ('04', '物理');
INSERT INTO subject VALUES ('05', '化学');
INSERT INTO subject VALUES ('06', '生物');
INSERT INTO subject VALUES ('07', '历史');
INSERT INTO subject VALUES ('08', '政治');
INSERT INTO subject VALUES ('09', '地理');
INSERT INTO subject VALUES ('10', '心理');
INSERT INTO subject VALUES ('11', '家教');
INSERT INTO subject VALUES ('12', '志愿');
INSERT INTO subject VALUES ('13', '奥数');
INSERT INTO subject VALUES ('14', '综合');
INSERT INTO subject VALUES ('15', '其他');
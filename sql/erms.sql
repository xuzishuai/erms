/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2018/1/28 周日 下午 01:22:08                  */
/*==============================================================*/


/*==============================================================*/
/* Table: menu                                                  */
/*==============================================================*/
create table menu
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '菜单名',
   parent_id            varchar(36) comment '上级菜单id',
   path                 varchar(200) comment '菜单路径',
   children_ids         varchar(200) comment '子菜单id，用#隔开，并用#开头和结束，只包含最底层有链接的子菜单',
   icon                 varchar(20) comment '图标',
   auth_path            varchar(500) comment '授权路径',
   priority             int(20) comment '优先级，菜单排序用',
   primary key (id)
);

alter table menu comment '菜单表，手动插入数据';

/*==============================================================*/
/* Table: role                                                  */
/*==============================================================*/
create table role
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '角色名',
   menu_ids             varchar(200) comment '菜单id，用#隔开，并以#开头和结束，只包含最底层有链接的子菜单',
   primary key (id)
);

alter table role comment '角色表';

/*==============================================================*/
/* Table: user                                                  */
/*==============================================================*/
create table user
(
   id                   varchar(36) not null,
   user_no              varchar(10) not null comment '工号',
   name                 varchar(50) not null comment '用户名',
   password             varchar(64) not null comment '密码',
   role_id              varchar(36) comment '角色id',
   primary key (id)
);

alter table user comment '用户表';

/*==============================================================*/
/* Table: grade                                                 */
/*==============================================================*/
create table grade
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '年级名称',
   primary key (id)
);

alter table grade comment '年级表';

/*==============================================================*/
/* Table: source                                                */
/*==============================================================*/
create table source
(
   id                   varchar(36) not null,
   name                 varchar(200) not null comment '客户途径',
   primary key (id)
);

alter table source comment '途径表';

/*==============================================================*/
/* Table: how_know                                              */
/*==============================================================*/
create table how_know
(
   id                   varchar(36) not null,
   name                 varchar(200) not null comment '从何得知补习机构',
   primary key (id)
);

alter table how_know comment '从何得知表';

/*==============================================================*/
/* Table: student_audit_status                                  */
/*==============================================================*/
create table student_audit_status
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '客户审核状态',
   primary key (id)
);

alter table student_audit_status comment '客户审核状态表';

/*==============================================================*/
/* Table: student_status                                        */
/*==============================================================*/
create table student_status
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '客户状态',
   primary key (id)
);

alter table student_status comment '客户状态表';

/*==============================================================*/
/* Table: student                                               */
/*==============================================================*/
create table student
(
   id                   varchar(36) not null,
   student_no           varchar(100) not null comment '学生编号',
   name                 varchar(50) not null comment '学生姓名',
   gender               tinyint(2) not null comment '性别，0男，1女',
   grade_id             varchar(36) not null comment '年级id',
   school               varchar(100) comment '就读学校',
   birthday             date comment '出生日期',
   contact              varchar(20) not null comment '联系电话',
   email                varchar(100) comment '电子邮件',
   parent_name          varchar(50) comment '家长姓名',
   relationship         varchar(50) comment '家长关系',
   appointment_time     datetime not null comment '预约上门时间',
   adviser_id           varchar(36) comment '顾问id，来源于user表',
   source_id            varchar(36) not null comment '途径id',
   how_know_id          varchar(36) comment '从何得知id',
   status_id            varchar(36) not null comment '客户状态id',
   home_address         varchar(200) comment '家庭住址',
   note                 varchar(500) comment '备注',
   arrive_time          datetime comment '上门时间',
   audit_status_id      varchar(36) not null comment '客户审核状态id',
   create_at            datetime not null comment '登记时间',
   update_at            datetime not null comment '更新时间',
   primary key (id)
);

alter table student comment '学生表';

/*==============================================================*/
/* Table: student_tracking_channel                              */
/*==============================================================*/
create table student_tracking_channel
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '追踪方式',
   primary key (id)
);

alter table student_tracking_channel comment '学生追踪方式表';

/*==============================================================*/
/* Table: student_tracking_result                               */
/*==============================================================*/
create table student_tracking_result
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '追踪结果',
   primary key (id)
);

alter table student_tracking_result comment '学生追踪结果表';

/*==============================================================*/
/* Table: student_tracking                                     */
/*==============================================================*/
create table student_tracking
(
   id                   varchar(36) not null,
   student_id           varchar(36) not null comment '学生id',
   track_date           date not null comment '追踪日期',
   channel_id           varchar(36) not null comment '追踪方式id',
   content              varchar(500) not null comment '追踪记录',
   result_id            varchar(36) not null comment '追踪结果id',
   possibility_id       varchar(36) not null comment '签约可能性id',
   next_track_date      date comment '下次追踪日期',
   tracker_id           varchar(36) not null comment '追踪人id',
   create_at            datetime not null comment '创建时间',
   update_at            datetime not null comment '更新时间',
   primary key (id)
);

alter table student_tracking comment '学生追踪记录表';

/*==============================================================*/
/* Table: visit_record                                          */
/*==============================================================*/
create table visit_record
(
   id                   varchar(36) not null,
   student_id           varchar(36) not null comment '学生id',
   arrive_time          datetime not null comment '到访时间',
   leave_time           datetime not null comment '离开时间',
   possibility_id       varchar(36) not null comment '签约可能性id',
   content              varchar(500) not null comment '到访记录',
   receptionist_id      varchar(36) not null comment '接待人id',
   create_at            datetime not null comment '创建时间',
   update_at            datetime not null comment '更新时间',
   primary key (id)
);

alter table visit_record comment '到访记录表';

/*==============================================================*/
/* Table: subject                                               */
/*==============================================================*/
create table subject
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '科目名称',
   primary key (id)
);

alter table subject comment '科目表';

/*==============================================================*/
/* Table: contract_attribute                                    */
/*==============================================================*/
create table contract_attribute
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '合同属性',
   primary key (id)
);

alter table contract_attribute comment '合同属性表';

/*==============================================================*/
/* Table: contract_type                                         */
/*==============================================================*/
create table contract_type
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '合同类型',
   primary key (id)
);

alter table contract_type comment '合同类型表';

/*==============================================================*/
/* Table: possibility                                           */
/*==============================================================*/
create table possibility
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '可能性',
   primary key (id)
);

alter table possibility comment '可能性表';

/*==============================================================*/
/* Table: contract_status                                       */
/*==============================================================*/
create table contract_status
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '合同状态',
   primary key (id)
);

alter table contract_status comment '合同状态表';

/*==============================================================*/
/* Table: contract                                              */
/*==============================================================*/
create table contract
(
   id                   varchar(36) not null,
   student_id           varchar(36) not null comment '学生id',
   contract_no          varchar(100) not null comment '合同编号',
   attribute_id         varchar(36) not null comment '合同属性id',
   contract_type_id     varchar(36) not null comment '合同类型id',
   grade_id             varchar(36) not null comment '年级id',
   total_money          double not null comment '合同金额',
   prepay               double not null comment '已付款',
   left_money           double not null comment '未付款',
   total_lesson_period  int not null comment '总课时数',
   start_date           date not null comment '合同开始日期',
   is_recommend         tinyint(2) not null comment '是否被推荐，0否，1是',
   recommend_type       varchar(50) comment '推荐方式',
   recommender_id       varchar(36) comment '推荐人id',
   signer_id            varchar(36) not null comment '签约人id',
   possibility_id       varchar(36) not null comment '续费可能性id',
   status_id            varchar(36) not null comment '合同状态id',
   create_at            datetime not null comment '签约时间',
   update_at            datetime not null comment '更新时间',
   note                 varchar(500) comment '备注',
   primary key (id)
);

alter table contract comment '合同表';

/*==============================================================*/
/* Table: contract_temp                                         */
/*==============================================================*/
create table contract_temp
(
   id                   varchar(36) not null,
   student_id           varchar(36) not null comment '学生id',
   contract_no          varchar(100) not null comment '合同编号',
   attribute_id         varchar(36) not null comment '合同属性id',
   contract_type_id     varchar(36) not null comment '合同类型id',
   grade_id             varchar(36) not null comment '年级id',
   total_money          double not null comment '合同金额',
   prepay               double not null comment '已付款',
   left_money           double not null comment '未付款',
   total_lesson_period  int not null comment '总课时数',
   start_date           date not null comment '合同开始日期',
   is_recommend         tinyint(2) not null comment '是否被推荐，0否，1是',
   recommend_type       varchar(50) comment '推荐方式',
   recommender_id       varchar(36) comment '推荐人id',
   signer_id            varchar(36) not null comment '签约人id',
   possibility_id       varchar(36) not null comment '续费可能性id',
   status_id            varchar(36) not null comment '合同状态id',
   create_at            datetime not null comment '签约时间',
   update_at            datetime not null comment '更新时间',
   note                 varchar(500) comment '备注',
   primary key (id)
);

alter table contract_temp comment '合同临时表，修改合同用';

/*==============================================================*/
/* Table: contract_detail_status                                */
/*==============================================================*/
create table contract_detail_status
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '合同明细状态',
   primary key (id)
);

alter table contract_detail_status comment '合同明细状态表';

/*==============================================================*/
/* Table: contract_detail_type                                  */
/*==============================================================*/
create table contract_detail_type
(
   id                   varchar(36) not null,
   name                 varchar(50) not null comment '合同明细类型',
   primary key (id)
);

alter table contract_detail_type comment '合同明细类型表';

/*==============================================================*/
/* Table: contract_detail                                       */
/*==============================================================*/
create table contract_detail
(
   id                   varchar(36) not null,
   contract_id          varchar(36) not null comment '合同id',
   subject_id           varchar(36) not null comment '科目id',
   grade_id             varchar(36) not null comment '年级id',
   lesson_period        int not null comment '课时数',
   finished_lesson      int not null comment '已完成课时数',
   type_id              varchar(36) not null comment '类型id',
   price                double not null comment '单价',
   status_id            varchar(36) not null comment '状态id',
   create_at            datetime not null comment '创建时间',
   update_at            datetime not null comment '更新时间，变更申请提交后，审核通过的时间',
   primary key (id)
);

alter table contract_detail comment '合同明细表';

/*==============================================================*/
/* Table: contract_detail_log                                   */
/*==============================================================*/
create table contract_detail_log
(
   id                   varchar(36) not null,
   contract_id          varchar(36) not null comment '合同id',
   subject_id           varchar(36) not null comment '科目id',
   grade_id             varchar(36) not null comment '年级id',
   lesson_period        int not null comment '课时数',
   finished_lesson      int not null comment '已完成课时数',
   type_id              varchar(36) not null comment '类型id',
   price                double not null comment '单价',
   status_id            varchar(36) not null comment '状态id',
   update_at            datetime not null comment '更新时间，变更申请提交后，审核通过的时间，同一合同的不同明细更新时间要完全一致',
   primary key (id)
);

alter table contract_detail_log comment '合同明细更新记录表';

alter table menu add constraint FK_Reference_2 foreign key (parent_id)
      references menu (id) on delete restrict on update restrict;

alter table user add constraint FK_Reference_1 foreign key (role_id)
      references role (id) on delete restrict on update restrict;

alter table student add constraint FK_Reference_3 foreign key (grade_id)
      references grade (id) on delete restrict on update restrict;

alter table student add constraint FK_Reference_4 foreign key (adviser_id)
      references user (id) on delete restrict on update restrict;

alter table student add constraint FK_Reference_5 foreign key (source_id)
      references source (id) on delete restrict on update restrict;

alter table student_tracking add constraint FK_Reference_6 foreign key (student_id)
      references student (id) on delete restrict on update restrict;

alter table student_tracking add constraint FK_Reference_7 foreign key (tracker_id)
      references user (id) on delete restrict on update restrict;

alter table visit_record add constraint FK_Reference_8 foreign key (student_id)
      references student (id) on delete restrict on update restrict;

alter table visit_record add constraint FK_Reference_9 foreign key (receptionist_id)
      references user (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_10 foreign key (student_id)
      references student (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_11 foreign key (grade_id)
      references grade (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_12 foreign key (recommender_id)
      references user (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_13 foreign key (signer_id)
      references user (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_21 foreign key (attribute_id)
      references contract_attribute (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_22 foreign key (contract_type_id)
      references contract_type (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_23 foreign key (possibility_id)
      references possibility (id) on delete restrict on update restrict;

alter table contract add constraint FK_Reference_26 foreign key (status_id)
      references contract_status (id) on delete restrict on update restrict;

alter table contract_detail add constraint FK_Reference_14 foreign key (contract_id)
      references contract (id) on delete restrict on update restrict;

alter table contract_detail add constraint FK_Reference_15 foreign key (subject_id)
      references subject (id) on delete restrict on update restrict;

alter table contract_detail add constraint FK_Reference_16 foreign key (grade_id)
      references grade (id) on delete restrict on update restrict;

alter table contract_detail_log add constraint FK_Reference_17 foreign key (contract_id)
      references contract (id) on delete restrict on update restrict;

alter table contract_detail_log add constraint FK_Reference_18 foreign key (subject_id)
      references subject (id) on delete restrict on update restrict;

alter table contract_detail_log add constraint FK_Reference_19 foreign key (grade_id)
      references grade (id) on delete restrict on update restrict;

alter table student_tracking add constraint FK_Reference_24 foreign key (possibility_id)
      references possibility (id) on delete restrict on update restrict;

alter table visit_record add constraint FK_Reference_25 foreign key (possibility_id)
      references possibility (id) on delete restrict on update restrict;

alter table contract_detail add constraint FK_Reference_27 foreign key (status_id)
      references contract_detail_status (id) on delete restrict on update restrict;

alter table contract_detail_log add constraint FK_Reference_28 foreign key (status_id)
      references contract_detail_status (id) on delete restrict on update restrict;

alter table contract_detail add constraint FK_Reference_29 foreign key (type_id)
      references contract_detail_type (id) on delete restrict on update restrict;

alter table contract_detail_log add constraint FK_Reference_30 foreign key (type_id)
      references contract_detail_type (id) on delete restrict on update restrict;

alter table student_tracking add constraint FK_Reference_31 foreign key (channel_id)
      references student_tracking_channel (id) on delete restrict on update restrict;

alter table student_tracking add constraint FK_Reference_32 foreign key (result_id)
      references student_tracking_result (id) on delete restrict on update restrict;

alter table student add constraint FK_Reference_33 foreign key (audit_status_id)
      references student_audit_status (id) on delete restrict on update restrict;

alter table student add constraint FK_Reference_20 foreign key (status_id)
      references student_status (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_34 foreign key (student_id)
      references student (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_35 foreign key (grade_id)
      references grade (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_36 foreign key (recommender_id)
      references user (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_37 foreign key (signer_id)
      references user (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_38 foreign key (attribute_id)
      references contract_attribute (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_39 foreign key (contract_type_id)
      references contract_type (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_40 foreign key (possibility_id)
      references possibility (id) on delete restrict on update restrict;

alter table contract_temp add constraint FK_Reference_41 foreign key (status_id)
      references contract_status (id) on delete restrict on update restrict;
/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2018/1/28 周日 下午 01:22:08                  */
/*==============================================================*/


drop table if exists menu;

drop table if exists role;

drop table if exists user;

drop table if exists grade;

drop table if exists source;

drop table if exists how_know;

drop table if exists student;

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
   is_adviser           tinyint(1) not null comment '是否顾问',
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
/* Table: student                                               */
/*==============================================================*/
create table student
(
   id                   varchar(36) not null,
   student_no           varchar(100) not null,
   name                 varchar(50) not null comment '学生姓名',
   gender               tinyint(2) not null comment '性别，0男，1女',
   grade_id             varchar(36) not null comment '年级id',
   contact              varchar(20) not null comment '联系电话',
   appointment_time     datetime not null comment '预约上门时间',
   adviser_id           varchar(36) comment '顾问id，来源于user表',
   source_id            varchar(36) not null comment '途径id',
   how_know_id          varchar(36) comment '从何得知id',
   status               tinyint(4) not null comment '客户状态，0未上门，1已上门，2已签约',
   create_at            datetime not null comment '登记日期',
   note                 varchar(500) comment '备注',
   arrive_time          datetime comment '上门时间',
   audit_status         tinyint(4) not null comment '客户审核状态，0未审核，1已通过，2未通过',
   primary key (id)
);

alter table student comment '学生表';

/*==============================================================*/
/* Table: student_tracking                                     */
/*==============================================================*/
create table student_tracking
(
   id                   varchar(36) not null,
   student_id           varchar(36) not null comment '学生id',
   track_date           date not null comment '追踪日期',
   channel              tinyint(4) not null comment '追踪方式，0电话',
   content              varchar(500) not null comment '追踪记录',
   result               tinyint(4) not null comment '追踪结果，0继续电话',
   possibility          tinyint(4) not null comment '签约可能性，0大,1一般,2小',
   next_track_date      date comment '下次追踪日期',
   tracker_id           varchar(36) not null comment '追踪人id',
   primary key (id)
);

alter table student_tracking comment '学生追踪记录表';

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


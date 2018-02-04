/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2018/1/28 周日 下午 01:22:08                     */
/*==============================================================*/


drop table if exists menu;

drop table if exists role;

drop table if exists user;

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
   primary key (id)
);

alter table menu comment '菜单表，手动插入数据';

-- ----------------------------
-- Records of menu,插入菜单数据
-- ----------------------------
INSERT INTO menu VALUES ('1', '设置', null, null, '#2#3#');
INSERT INTO menu VALUES ('2', '用户管理', '1', '/user/user_list', null);
INSERT INTO menu VALUES ('3', '角色管理', '1', '/user/role_list', null);

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

-- ----------------------------
-- Records of user,插入超级管理员用户
-- ----------------------------
INSERT INTO `user` VALUES ('1cbb1360-d57d-11e7-9634-4d058774421e', 'ermsAdmin', '超级管理员', 'Xzs_825197298?', null);

alter table menu add constraint FK_Reference_2 foreign key (parent_id)
      references menu (id) on delete restrict on update restrict;

alter table user add constraint FK_Reference_1 foreign key (role_id)
      references role (id) on delete restrict on update restrict;


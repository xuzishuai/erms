const express = require('express');
const router = express.Router();
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const menuDAO = require('../dao/menuDAO');
const roleDAO = require('../dao/roleDAO');
const exceptionHelper = require("../helper/exceptionHelper");

router.get('/login', function (req, res) {
    res.render('user/login', {hideLayout: true});
});

router.post('/do_login', async function (req, res) {
    try {
        let user = await userDAO.login(req.body.user_no, req.body.password);
        if (!user || user.length == 0) {
            throw '工号或密码错误';
        }
        req.session.user = user;
        if (user[0].id == '1cbb1360-d57d-11e7-9634-4d058774421e') {
            let parentMenus = await menuDAO.getParentMenu();
            let subMenuMap = {};
            for (let i = 0; i < parentMenus.length; i++) {
                subMenuMap[parentMenus[i].id] = await menuDAO.getSubMenuByPId(parentMenus[i].id);
            }
            let subMenus = await menuDAO.getSubMenu();
            let menuMap = {};
            for (let i = 0; i < subMenus.length; i++) {
                menuMap[subMenus[i].id] = await menuDAO.getChildrenMenu(subMenus[i].children_ids.split('#'));
            }
            req.session.parentMenus = parentMenus;
            req.session.subMenuMap = subMenuMap;
            req.session.menuMap = menuMap;
        } else {
            let role = await baseDAO.getById('role', user[0].role_id);
            let childrenIds = role[0].menu_ids.split('#');
            let parentMenus = await menuDAO.getParentMenuByCIds(childrenIds);
            let subMenuMap = {};
            for (let i = 0; i < parentMenus.length; i++) {
                subMenuMap[parentMenus[i].id] = await menuDAO.getSubMenuByPIdCId(parentMenus[i].id, childrenIds);
            }
            let subMenus = await menuDAO.getSubMenuByCid(childrenIds);
            let menuMap = {};
            for (let i = 0; i < subMenus.length; i++) {
                menuMap[subMenus[i].id] = await menuDAO.getChildrenMenuByIds(subMenus[i].children_ids.split('#'), childrenIds);
            }
            req.session.parentMenus = parentMenus;
            req.session.subMenuMap = subMenuMap;
            req.session.menuMap = menuMap;
            req.session.childrenMenus = await menuDAO.getChildrenMenu(childrenIds);
        }
        res.redirect('/');
    } catch (errorMessage) {
        res.render('user/login', {
            hideLayout: true,
            errorMessage: errorMessage,
            user_no: req.body.user_no
        });
    }
});

router.get('/logout', function (req, res) {
    req.session.user = false;
    res.redirect('/user/login');
});

router.get('/user_list', async function (req, res) {
    try {
        let users = await userDAO.getAllUser();
        let roles = await baseDAO.getAll('role');
        let roleMap = {};
        for (let i = 0; i < roles.length; i++) {
            roleMap[roles[i].id] = roles[i];
        }
        res.render('user/user_list', {
            users: users,
            roleMap: roleMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_user', async function (req, res) {
    try {
        let roles = await baseDAO.getAll('role');
        res.render('user/new_user', {roles: roles});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_user_no', async function (req, res) {
    try {
        let user = await userDAO.isUserExist(req.body.id, req.body.user_no);
        if (user && user.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_user', async function (req, res) {
    try {
        await userDAO.saveUser(req.body.user_no, req.body.name, req.body.password, req.body.role_id);
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_user', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.query.id);
        let roles = await baseDAO.getAll('role');
        res.render('user/edit_user', {
            user: user[0],
            roles: roles
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_user', async function (req, res) {
    try {
        await userDAO.updateUser(req.body.id, req.body.user_no, req.body.name, req.body.password, req.body.role_id);
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_user', async function (req, res) {
    try {
        await baseDAO.deleteById('user', req.query.id);
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/role_list', async function (req, res) {
    try {
        let roles = await baseDAO.getAll('role');
        let roleMap = {};
        for (let i = 0; i < roles.length; i++) {
            roleMap[roles[i].id] = roles[i];
        }
        res.render('user/role_list', {
            roles: roles,
            roleMap: roleMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_role', async function (req, res) {
    try {
        let parentMenus = await menuDAO.getParentMenu();
        let menuMap = {};
        for (let i = 0; i < parentMenus.length; i++) {
            menuMap[parentMenus[i].id] = await menuDAO.getChildrenMenu(parentMenus[i].children_ids.split('#'));
        }
        res.render('user/new_role', {
            parentMenus: parentMenus,
            menuMap: menuMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_role_name', async function (req, res) {
    try {
        let role = await roleDAO.isRoleExist(req.body.id, req.body.name);
        if (role && role.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_role', async function (req, res) {
    try {
        let menuIds = req.body.menu_ids;
        let menu_ids = "#";
        if (menuIds) {
            for (let i = 0; i < menuIds.length; i++) {
                menu_ids += menuIds[i] + "#";
            }
        }
        await roleDAO.saveRole(req.body.name, menu_ids=="#"?null:menu_ids);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_role', async function (req, res) {
    try {
        let role = await baseDAO.getById('role', req.query.id);
        let parentMenus = await menuDAO.getParentMenu();
        let menuMap = {};
        for (let i = 0; i < parentMenus.length; i++) {
            menuMap[parentMenus[i].id] = await menuDAO.getChildrenMenu(parentMenus[i].children_ids.split('#'));
        }
        res.render('user/edit_role', {
            role: role[0],
            parentMenus: parentMenus,
            menuMap: menuMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_role', async function (req, res) {
    try {
        let menuIds = req.body.menu_ids;
        let menu_ids = "#";
        if (menuIds) {
            for (let i = 0; i < menuIds.length; i++) {
                menu_ids += menuIds[i] + "#";
            }
        }
        await roleDAO.updateRole(req.body.id, req.body.name, menu_ids);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_role', async function (req, res) {
    try {
        await baseDAO.deleteById('role', req.query.id);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
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

module.exports = router;
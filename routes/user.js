const express = require('express');
const router = express.Router();
const dataPool = require('../util/dataPool');
const exceptionHelper = require("../helper/exceptionHelper");

router.get('/login', function (req, res) {
    res.render('user/login', {hideLayout: true});
});

router.post('/do_login', async function (req, res) {
    try {
        let user = await dataPool.query('select * from user where user_no=? and password=? limit 1', [req.body.user_no, req.body.password]);
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
        let users = await dataPool.query('select * from user where id<>"1cbb1360-d57d-11e7-9634-4d058774421e"');
        let roles = await dataPool.getAll('role');
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
        let roles = await dataPool.getAll('role');
        res.render('user/new_user', {roles: roles});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/create_user', async function (req, res) {
    try {
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;

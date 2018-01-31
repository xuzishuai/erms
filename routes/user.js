const express = require('express');
const router = express.Router();
const dataPool = require('../util/dataPool');

router.get('/login', function (req, res) {
    res.render('user/login', {hideLayout: true});
});

router.post('/do_login', async function (req, res) {
    try {
        let user = await dataPool.query('select * from user where user_no=? and password=? limit 1', [req.body.user_no, req.body.password]);
        if (!user || user.length == 0) {
            throw '工号或密码错误';
        }
        req.session.user = user[0];
        res.redirect('/');
    } catch (errorMessage) {
        res.render('user/login', {
            hideLayout: true,
            errorMessage: errorMessage,
            user_no: req.body.user_no
        });
    }
});

module.exports = router;

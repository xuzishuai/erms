const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const schedule = require('node-schedule');
const menuDAO = require('./dao/menuDAO');
const teacherDAO = require('./dao/teacherDAO');
const baseDAO = require('./dao/baseDAO');

const index = require('./routes/index');
const user = require('./routes/user');
const student = require('./routes/student');
const contract = require('./routes/contract');
const course = require('./routes/course');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(favicon(path.join(__dirname, 'public/plugins/metronic/image', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'erms',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*3600*24 }
}));

//定时器方法
function scheduleFunc(){
    //每天的1点0分1秒执行
    schedule.scheduleJob('1 0 1 * * *', async function(){
        let condition = {};
        condition.free_end_date = new Date();//今天以前的教师空闲时间
        let freeTimes = await teacherDAO.getFreeTimeByCondition(condition);
        //删除过期的教师空余时间
        for (let i = 0; i < freeTimes.length; i++) {
            await baseDAO.deleteById(freeTimes[i].id);
        }
    });
}

//启动项目后即调用定时器方法
scheduleFunc();

//拦截器
app.all('/*', async function(req, res, next){
    let publicPattern=/^\/public/;
    let filePattern=/^\/ermsFiles/;
    let url=req.path;
    if(publicPattern.test(url) || filePattern.test(url) || url == '/user/login' || url == '/user/do_login' || url == '/error'){
        next();
        return;
    }
    let user = req.session.user;
    if (user && user.length > 0) {
        res.locals.localsUser = user[0];
        res.locals.localsParentMenus = req.session.parentMenus;
        res.locals.localsSubMenuMap = req.session.subMenuMap;
        res.locals.localsMenuMap = req.session.menuMap;
        let menu = await menuDAO.getMenuByPath(url);
        res.locals.localsMenu = menu[0];

        let access = false;
        //登陆后若为超级管理员或者链接为首页、退出登录、个人资料及更改密码相关的都允许访问
        if (user[0].id == '1cbb1360-d57d-11e7-9634-4d058774421e' || url == '/' || url == '/user/logout' || url == '/user/personal_profile' || url == '/user/validate_old_password' || url == '/user/do_change_password') {
            access = true;
        } else {
            let childrenMenus = req.session.childrenMenus;
            for (let i = 0; i < childrenMenus.length; i++) {
                if (childrenMenus[i].auth_path.indexOf('#' + url + '#') >= 0) {
                    access = true;
                    break;
                }
            }
        }
        if (access) {
            next();
        } else {
            res.render('error', {
                hideLayout: true,
                error: {status: 403, stack: '抱歉，你没有权限访问此页面'},
                message: '没有权限'
            })
        }
    }
    else{
        res.redirect('/user/login');
    }
});

// routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/ermsFiles', express.static(path.join(__dirname, '../ermsFiles')));
app.use('/', index);
app.use('/user', user);
app.use('/student', student);
app.use('/contract', contract);
app.use('/course', course);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {hideLayout: true});
});

module.exports = app;

const moment = require('moment');

exports.dateFormat = function (date) {
    return moment(date).format("YYYY-MM-DD");
};

exports.dateTimeFormat = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

exports.dateTimeMinuteFormat = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm");
};

exports.addDays = function (date, days) {
    let day = moment(date).add(days, 'days').calendar();
    return moment(day).format("YYYY-MM-DD");
};